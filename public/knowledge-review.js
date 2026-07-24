const OWNER_EMAILS = new Set(["michealdoolittle@gmail.com"]);
const OWNER_ROLES = new Set(["owner", "admin"]);
let dashboard = null;
let loading = false;

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isOwner(user) {
  const email = String(user?.email || "").trim().toLowerCase();
  const role = String(user?.app_metadata?.role || "").trim().toLowerCase();
  return OWNER_ROLES.has(role) || OWNER_EMAILS.has(email);
}

function setStatus(message, tone = "") {
  const target = document.getElementById("knowledgeResearchStatus");
  if (!target) return;
  target.textContent = message;
  target.dataset.tone = tone;
}

async function accessToken() {
  const client = globalThis.RankedCoachAuthBridge?.getClient?.();
  const { data: { session } = {} } = await client?.auth?.getSession?.() || {};
  if (!session?.access_token) throw new Error("Sign in again before opening the research queue.");
  return session.access_token;
}

async function request(path, options = {}) {
  const token = await accessToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Research request failed (${response.status}).`);
  return payload;
}

function evidenceMarkup(items = []) {
  if (!items.length) return `<span>No timestamped evidence attached.</span>`;
  return items.map((item, index) => `
    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
      Evidence ${index + 1} · ${Math.floor(Number(item.startSeconds || 0) / 60)}:${String(Math.floor(Number(item.startSeconds || 0) % 60)).padStart(2, "0")}
    </a>
  `).join("");
}

function inferCategory(proposal = {}) {
  const entity = String(proposal.entities?.[0] || "");
  const maps = new Set(["Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Summit", "Sunset"]);
  const weapons = new Set(["Ares", "Bandit", "Bucky", "Bulldog", "Classic", "Frenzy", "Ghost", "Guardian", "Judge", "Marshal", "Odin", "Operator", "Outlaw", "Phantom", "Sheriff", "Shorty", "Spectre", "Stinger", "Vandal"]);
  if (maps.has(entity)) return "map";
  if (weapons.has(entity)) return "weapon";
  return entity ? "agent" : "general";
}

function renderSummary() {
  const root = document.getElementById("knowledgeResearchSummary");
  if (!root) return;
  const sources = dashboard?.sources || [];
  const summary = dashboard?.review?.summary || {};
  const acquired = sources.filter(source => source.transcriptStatus === "acquired-private").length;
  const waiting = sources.filter(source => !["acquired-private", "registered-non-educational"].includes(source.transcriptStatus)).length;
  root.innerHTML = `
    <div><span>Sources</span><strong>${sources.length}</strong></div>
    <div><span>Transcripts processed</span><strong>${acquired}</strong></div>
    <div><span>Waiting for transcript</span><strong>${waiting}</strong></div>
    <div><span>Review proposals</span><strong>${dashboard?.review?.proposals?.length || 0}</strong></div>
    <div><span>Corroborated principles</span><strong>${Number(summary.corroborated || 0)}</strong></div>
    <div><span>Published updates</span><strong>${dashboard?.published?.items?.length || 0}</strong></div>
    <details class="knowledge-source-queue">
      <summary>Registered research sources</summary>
      <div>${sources.filter(source => source.transcriptStatus !== "registered-non-educational").map(source => `
        <article>
          <div><strong>${escapeHtml(source.title)}</strong><span>${escapeHtml(source.publisher)} · ${escapeHtml(source.transcriptStatus)}</span></div>
          ${source.transcriptStatus === "acquired-private" ? `<b>${source.cueCount} cues · ${source.claimCount} claims</b>` : `
            <button class="pd-item" type="button" data-knowledge-source-prefill data-source-url="${escapeHtml(source.url)}" data-source-title="${escapeHtml(source.title)}" data-source-publisher="${escapeHtml(source.publisher)}">Add transcript</button>
          `}
        </article>
      `).join("") || `<p>No educational sources registered yet.</p>`}</div>
    </details>
  `;
}

function renderProposals() {
  const root = document.getElementById("knowledgeProposalList");
  if (!root) return;
  const proposals = dashboard?.review?.proposals || [];
  if (!proposals.length) {
    root.innerHTML = `<div class="knowledge-empty-state">No transcript-derived proposals yet. Import a timestamped transcript to create the first private review queue.</div>`;
    return;
  }
  root.innerHTML = proposals.map(proposal => {
    const approved = ["approved", "published"].includes(proposal.approvalStatus);
    const published = proposal.approvalStatus === "published";
    const entity = String(proposal.publishedEntity || proposal.entities?.[0] || "");
    const category = String(proposal.publishedCategory || inferCategory(proposal));
    return `
      <article class="knowledge-proposal-card" data-knowledge-proposal="${escapeHtml(proposal.id)}">
        <div class="knowledge-proposal-heading">
          <div>
            <span>${escapeHtml(proposal.type || "coaching")} · ${escapeHtml(proposal.topic || "general")}</span>
            <strong>${escapeHtml((proposal.entities || []).join(", ") || "General coaching")}</strong>
          </div>
          <span class="knowledge-review-state is-${escapeHtml(proposal.approvalStatus || "pending")}">${escapeHtml((proposal.approvalStatus || "pending").replaceAll("-", " "))}</span>
        </div>
        <p>${escapeHtml(proposal.recommendation || "Review the evidence and write original RankedCoach guidance.")}</p>
        <div class="knowledge-evidence-list">${evidenceMarkup(proposal.evidence)}</div>
        <label class="auth-field">
          <span>Original RankedCoach wording</span>
          <textarea data-knowledge-wording rows="3" ${approved ? "readonly" : ""} placeholder="Write the player-facing coaching guidance in RankedCoach’s voice.">${escapeHtml(proposal.rankedCoachWording || "")}</textarea>
        </label>
        ${approved ? `
          <div class="knowledge-publication-targets">
            <label class="auth-field">
              <span>Library location</span>
              <select data-knowledge-category ${published ? "disabled" : ""}>
                ${["general", "map", "agent", "weapon"].map(value => `<option value="${value}" ${category === value ? "selected" : ""}>${value[0].toUpperCase()}${value.slice(1)}</option>`).join("")}
              </select>
            </label>
            <label class="auth-field">
              <span>Map, agent, or weapon</span>
              <input data-knowledge-entity value="${escapeHtml(entity)}" ${published ? "readonly" : ""} placeholder="Bind" />
            </label>
          </div>
          <button class="pd-item ${published ? "knowledge-unpublish" : "auth-main-btn"}" type="button" data-knowledge-action="${published ? "unpublish" : "publish"}">
            ${published ? "Remove from Library" : "Publish to Library"}
          </button>
        ` : `
          <label class="knowledge-original-confirm">
            <input type="checkbox" data-knowledge-original />
            <span>I confirm this is original RankedCoach wording, not copied transcript text.</span>
          </label>
          <button class="pd-item auth-main-btn" type="button" data-knowledge-action="approve">Approve Wording</button>
        `}
      </article>
    `;
  }).join("");
}

function render() {
  renderSummary();
  renderProposals();
  const createdAt = dashboard?.review?.createdAt;
  setStatus(createdAt
    ? `Private review ${dashboard.review.id} · updated ${new Date(createdAt).toLocaleString()}`
    : "The source registry is ready. Import a timestamped transcript to begin extracting coaching principles.", "ready");
}

async function load() {
  if (loading) return;
  const user = await globalThis.RankedCoachAuthBridge?.getFreshUser?.();
  if (!isOwner(user)) return;
  loading = true;
  setStatus("Loading the private research queue…");
  try {
    dashboard = await request("/api/knowledge/review");
    render();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    loading = false;
  }
}

function syncAccess(user = globalThis.RankedCoachAuthBridge?.getUser?.()) {
  const allowed = isOwner(user);
  const tab = document.getElementById("accountSupportResearchTab");
  const panel = document.getElementById("knowledgeResearchPanel");
  if (tab) tab.hidden = !allowed;
  if (panel) panel.hidden = !allowed;
  if (!allowed && panel?.classList.contains("is-active")) {
    document.querySelector('[data-account-support-tab="account"]')?.click();
  }
}

async function importTranscript(form) {
  const url = document.getElementById("knowledgeSourceUrl")?.value.trim() || "";
  const platform = /twitch\.tv/i.test(url) ? "twitch" : "youtube";
  setStatus("Processing the transcript privately…");
  await request("/api/knowledge/transcripts", {
    method: "POST",
    body: JSON.stringify({
      source: {
        platform,
        url,
        id: url,
        title: document.getElementById("knowledgeSourceTitle")?.value.trim(),
        publisher: document.getElementById("knowledgeSourcePublisher")?.value.trim(),
        sourceKind: "owner-imported-educational-video",
        entities: (document.getElementById("knowledgeSourceEntities")?.value || "").split(",").map(value => value.trim()).filter(Boolean)
      },
      transcript: document.getElementById("knowledgeTranscriptText")?.value || "",
      language: "en"
    })
  });
  form.reset();
  await load();
}

async function proposalAction(button) {
  const card = button.closest("[data-knowledge-proposal]");
  const proposalId = card?.dataset.knowledgeProposal;
  if (!proposalId) return;
  const action = button.dataset.knowledgeAction;
  button.disabled = true;
  try {
    if (action === "approve") {
      const wording = card.querySelector("[data-knowledge-wording]")?.value.trim() || "";
      const confirmed = card.querySelector("[data-knowledge-original]")?.checked === true;
      await request("/api/knowledge/approve", {
        method: "POST",
        body: JSON.stringify({ proposalId, rankedCoachWording: wording, confirmOriginalWording: confirmed })
      });
      setStatus("Wording approved. Choose its Library location and publish when ready.", "ready");
    } else if (action === "publish") {
      await request("/api/knowledge/publish", {
        method: "POST",
        body: JSON.stringify({
          proposalId,
          category: card.querySelector("[data-knowledge-category]")?.value || "general",
          entity: card.querySelector("[data-knowledge-entity]")?.value.trim() || ""
        })
      });
      setStatus("Approved guidance is now visible in the Library.", "ready");
      globalThis.dispatchEvent(new CustomEvent("rankedcoach:knowledge-updated"));
    } else if (action === "unpublish") {
      await request("/api/knowledge/unpublish", {
        method: "POST",
        body: JSON.stringify({ proposalId })
      });
      setStatus("The guidance was removed from the Library.", "ready");
      globalThis.dispatchEvent(new CustomEvent("rankedcoach:knowledge-updated"));
    }
    loading = false;
    await load();
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

document.getElementById("knowledgeTranscriptForm")?.addEventListener("submit", event => {
  event.preventDefault();
  void importTranscript(event.currentTarget).catch(error => setStatus(error.message, "error"));
});
document.getElementById("knowledgeResearchRefresh")?.addEventListener("click", () => {
  loading = false;
  void load();
});
document.getElementById("knowledgeProposalList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-knowledge-action]");
  if (button) void proposalAction(button);
});
document.getElementById("knowledgeResearchPanel")?.addEventListener("click", event => {
  const button = event.target.closest("[data-knowledge-source-prefill]");
  if (!button) return;
  const write = (id, value) => {
    const input = document.getElementById(id);
    if (input) input.value = value || "";
  };
  write("knowledgeSourceUrl", button.dataset.sourceUrl);
  write("knowledgeSourceTitle", button.dataset.sourceTitle);
  write("knowledgeSourcePublisher", button.dataset.sourcePublisher);
  const details = document.querySelector(".knowledge-transcript-import");
  if (details) details.open = true;
  document.getElementById("knowledgeTranscriptText")?.focus();
});

globalThis.RankedCoachKnowledgeReview = Object.freeze({ load, syncAccess });
syncAccess(globalThis.RankedCoachAuthBridge?.getUser?.());
globalThis.RankedCoachAuthBridge?.getFreshUser?.().then(syncAccess).catch(() => {});
