import {
  approveKnowledgeProposal,
  clearRejectedKnowledgeProposals,
  discardApprovedKnowledge,
  getKnowledgeOwnerDashboard,
  getPublishedKnowledge,
  ingestTimestampedKnowledgeTranscript,
  publishAllApprovedKnowledge,
  publishApprovedKnowledge,
  queueKnowledgeSourceRetry,
  rejectKnowledgeProposal,
  runKnowledgePipeline,
  saveApprovedKnowledgeTarget,
  saveKnowledgeProposalDraft,
  unpublishKnowledge
} from "./knowledge-pipeline.mjs";

const DEFAULT_SUPABASE_URL = "https://jqrsjaaxtdxfmpbtrupj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcnNqYWF4dGR4Zm1wYnRydXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTIxNzUsImV4cCI6MjA5MDM4ODE3NX0.1wKi5VOBCvGJeVDIgHBO503MBj1tSp4GE775l0dpjOQ";
const DEFAULT_OWNER_EMAILS = ["michealdoolittle@gmail.com"];
const OWNER_ROLES = new Set(["owner", "admin"]);

function json(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(payload), { ...init, headers });
}

function ownerEmails(env = {}) {
  return String(env.KNOWLEDGE_OWNER_EMAILS || DEFAULT_OWNER_EMAILS.join(","))
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function authenticateKnowledgeOwner(request, env = {}, fetchImpl = fetch) {
  const authorization = String(request.headers.get("Authorization") || "");
  if (!authorization.startsWith("Bearer ")) throw new Error("Authentication required.");
  const token = authorization.slice(7).trim();
  if (!token) throw new Error("Authentication required.");
  const supabaseUrl = String(env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, "");
  const anonKey = String(env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY);
  const response = await fetchImpl(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`
    },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error("Authentication could not be verified.");
  const user = await response.json();
  const email = String(user?.email || "").trim().toLowerCase();
  const role = String(user?.app_metadata?.role || "").trim().toLowerCase();
  if (!OWNER_ROLES.has(role) && !ownerEmails(env).includes(email)) {
    throw new Error("Owner access required.");
  }
  return Object.freeze({
    id: String(user?.id || ""),
    email,
    displayName: String(user?.user_metadata?.username || user?.user_metadata?.display_name || email || "RankedCoach owner")
  });
}

function requireSameOrigin(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) throw new Error("Cross-origin knowledge requests are not allowed.");
}

async function readJson(request) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 2_000_000) throw new Error("Transcript import is too large.");
  return request.json();
}

export async function handlePublicKnowledgeRequest(env) {
  if (!env.CONTENT_AUTOMATION) return json({ updatedAt: null, items: [] });
  return json(await getPublishedKnowledge(env.CONTENT_AUTOMATION), {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" }
  });
}

export async function handleKnowledgeOwnerRequest(request, env, options = {}) {
  requireSameOrigin(request);
  const owner = await authenticateKnowledgeOwner(request, env, options.fetchImpl || fetch);
  const kv = env.CONTENT_AUTOMATION;
  if (!kv) throw new Error("Knowledge storage is unavailable.");
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/api/knowledge/review") {
    return json(await getKnowledgeOwnerDashboard(kv, {
      proposalOffset: url.searchParams.get("proposalOffset"),
      proposalLimit: url.searchParams.get("proposalLimit"),
      proposalBucket: url.searchParams.get("proposalBucket"),
      sourceOffset: url.searchParams.get("sourceOffset"),
      sourceLimit: url.searchParams.get("sourceLimit")
    }));
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const body = await readJson(request);
  if (url.pathname === "/api/knowledge/transcripts") {
    const ingestion = await ingestTimestampedKnowledgeTranscript(kv, body, {
      libraryAudit: options.libraryAudit,
      libraryKnowledgeIndex: options.libraryKnowledgeIndex
    });
    // Owner-submitted Research videos are public Playlist candidates now. Drop
    // the short-lived Playlist cache before refreshing so the submitted source
    // appears immediately without exposing its private transcript or claims.
    await kv.delete?.("playlist:featured");
    if (typeof options.refreshPlaylist === "function") {
      try {
        await options.refreshPlaylist();
      } catch (error) {
        console.warn("Playlist refresh skipped after owner transcript import", error?.message || error);
      }
    }
    return json(ingestion, { status: 201 });
  }
  if (url.pathname === "/api/knowledge/run") {
    if (typeof options.refreshPlaylist === "function") {
      try {
        await options.refreshPlaylist();
      } catch (error) {
        console.warn("Playlist refresh skipped before owner knowledge processing", error?.message || error);
      }
    }
    return json(await runKnowledgePipeline(env, {
      sources: options.sources || [],
      batchSize: Number(body.batchSize || 24),
      libraryAudit: options.libraryAudit,
      libraryKnowledgeIndex: options.libraryKnowledgeIndex,
      notify: false
    }));
  }
  if (url.pathname === "/api/knowledge/retry") {
    return json(await queueKnowledgeSourceRetry(kv, body));
  }
  if (url.pathname === "/api/knowledge/draft") {
    return json(await saveKnowledgeProposalDraft(kv, {
      ...body,
      owner: owner.displayName
    }));
  }
  if (url.pathname === "/api/knowledge/reject") {
    return json(await rejectKnowledgeProposal(kv, {
      ...body,
      owner: owner.displayName
    }));
  }
  if (url.pathname === "/api/knowledge/discard") {
    return json(await discardApprovedKnowledge(kv, {
      ...body,
      owner: owner.displayName
    }));
  }
  if (url.pathname === "/api/knowledge/clear-rejected") {
    return json(await clearRejectedKnowledgeProposals(kv));
  }
  if (url.pathname === "/api/knowledge/approve") {
    return json(await approveKnowledgeProposal(kv, {
      ...body,
      owner: owner.displayName
    }));
  }
  if (url.pathname === "/api/knowledge/approved-target") {
    return json(await saveApprovedKnowledgeTarget(kv, {
      ...body,
      owner: owner.displayName
    }));
  }
  if (url.pathname === "/api/knowledge/publish") {
    return json(await publishApprovedKnowledge(kv, {
      ...body,
      owner: owner.displayName
    }));
  }
  if (url.pathname === "/api/knowledge/publish-approved") {
    return json(await publishAllApprovedKnowledge(kv, {
      ...body,
      owner: owner.displayName
    }));
  }
  if (url.pathname === "/api/knowledge/unpublish") {
    return json(await unpublishKnowledge(kv, body));
  }
  return json({ error: "Knowledge route not found" }, { status: 404 });
}

export function knowledgeApiErrorResponse(error) {
  const message = String(error?.message || "Knowledge request failed.");
  const status = /Authentication required|verified/.test(message)
    ? 401
    : /Owner access required/.test(message)
      ? 403
      : /required|valid|large|Cross-origin|Rewrite|must confirm|corroboration|conflict before publication|owner-approved|before (?:approval|rejecting)|Remove .*before|Discard .*before|Rejected insights|Only approved insights/.test(message)
        ? 400
        : 500;
  return json({ error: message }, { status });
}
