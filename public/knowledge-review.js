const OWNER_EMAILS = new Set(["michealdoolittle@gmail.com"]);
const OWNER_ROLES = new Set(["owner", "admin"]);
let dashboard = null;
let loading = false;
let activeProposalBucket = "review";
let loadController = null;
let loadSequence = 0;

function researchPageLimits() {
  const compact = document.documentElement.classList.contains("is-mobile-layout")
    || document.body?.classList.contains("is-mobile-layout")
    || window.matchMedia?.("(max-width: 760px), (pointer: coarse) and (max-width: 900px)")?.matches;
  return compact
    ? { proposalLimit: 10, sourceLimit: 20 }
    : { proposalLimit: 50, sourceLimit: 100 };
}

function resetResearchScroll() {
  const modal = document.getElementById("accountSupportModal");
  [
    modal,
    modal?.querySelector(".lens-modal"),
    modal?.querySelector(".account-support-modal-body"),
    modal?.querySelector(".account-support-panels"),
    modal?.querySelector("#knowledgeResearchPanel")
  ].filter(Boolean).forEach(element => {
    element.scrollTop = 0;
  });
}

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
      Evidence ${index + 1} · ${formatTimestamp(item.startSeconds)}
    </a>
  `).join("");
}

function formatTimestamp(seconds = 0) {
  const value = Math.max(0, Math.floor(Number(seconds || 0)));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const remainder = String(value % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
}

function highlightedContext(text = "", keywords = []) {
  const terms = [...new Set(keywords.map(value => String(value).trim()).filter(value => value.length > 2))]
    .sort((left, right) => right.length - left.length);
  if (!terms.length) return escapeHtml(text);
  const pattern = new RegExp(`(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return String(text).split(pattern).map((part, index) => (
    index % 2 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)
  )).join("");
}

function contextNotesMarkup(proposal = {}) {
  const notes = proposal.contextNotes || [];
  if (!notes.length) return `<div class="knowledge-evidence-list">${evidenceMarkup(proposal.evidence)}</div>`;
  return `
    <div class="knowledge-context-notes">
      ${notes.map(note => `
        <article>
          <div class="knowledge-context-note-head">
            <div>
              <span>Private transcript context</span>
              <strong>${escapeHtml(note.sourceTitle)}</strong>
              <small>${escapeHtml(note.sourcePublisher)}</small>
            </div>
            <a href="${escapeHtml(note.url)}" target="_blank" rel="noopener noreferrer">${formatTimestamp(note.startSeconds)}</a>
          </div>
          <blockquote>${highlightedContext(note.contextExcerpt, note.keywords)}</blockquote>
          ${(note.supportingExcerpts || []).length ? `
            <div class="knowledge-supporting-context">
              ${note.supportingExcerpts.map(excerpt => `
                <div>
                  <span>${escapeHtml(excerpt.label)} · ${formatTimestamp(excerpt.startSeconds)}</span>
                  <blockquote>${escapeHtml(excerpt.text)}</blockquote>
                </div>
              `).join("")}
            </div>
          ` : ""}
          <div class="knowledge-selection-rationale">
            <strong>Why this passage was selected</strong>
            <span>${escapeHtml(note.selectionReason || proposal.selectionReason || "It contains a repeatable in-round decision with a clear coaching application.")}</span>
          </div>
          ${note.whyItMatters ? `<p><b>Why it matters:</b> ${escapeHtml(note.whyItMatters)}</p>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function inferCategory(proposal = {}) {
  const entity = String(proposal.entities?.[0] || "");
  const maps = new Set(["Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Summit", "Sunset"]);
  const weapons = new Set(["Ares", "Bandit", "Bucky", "Bulldog", "Classic", "Frenzy", "Ghost", "Guardian", "Judge", "Marshal", "Odin", "Operator", "Outlaw", "Phantom", "Sheriff", "Shorty", "Spectre", "Stinger", "Vandal"]);
  if (maps.has(entity)) return "map";
  if (weapons.has(entity)) return "weapon";
  return entity ? "agent" : "general";
}

function proposalBucketForStatus(status = "") {
  if (status === "rejected") return "rejected";
  if (status === "published" || status === "approved") return "approved";
  return "review";
}

function renderSummary() {
  const root = document.getElementById("knowledgeResearchSummary");
  if (!root) return;
  const sources = dashboard?.sources || [];
  const summary = dashboard?.review?.summary || {};
  const acquired = sources.filter(source => source.transcriptStatus === "acquired-private").length;
  const waiting = sources.filter(source => ![
    "acquired-private",
    "registered-non-educational",
    "no-actionable-insights",
    "video-unavailable"
  ].includes(source.transcriptStatus)).length;
  root.innerHTML = `
    <div><span>Sources</span><strong>${dashboard?.sourceSummary?.total ?? dashboard?.sourcePage?.total ?? sources.length}</strong></div>
    <div><span>Transcript highlights processed</span><strong>${dashboard?.sourceSummary?.processed ?? acquired}</strong></div>
    <div><span>Waiting for transcript</span><strong>${dashboard?.sourceSummary?.waiting ?? waiting}</strong></div>
    <div><span>Review proposals</span><strong>${dashboard?.review?.page?.total ?? dashboard?.review?.proposals?.length ?? 0}</strong></div>
    <div><span>Corroborated principles</span><strong>${Number(summary.corroborated || 0)}</strong></div>
    <div><span>Published updates</span><strong>${dashboard?.published?.items?.length || 0}</strong></div>
    <details class="knowledge-source-queue">
      <summary>Registered research sources</summary>
      <div>${sources.filter(source => source.transcriptStatus !== "registered-non-educational").map(source => `
        <article>
          <div><strong>${escapeHtml(source.title)}</strong><span>${escapeHtml(source.publisher)} · ${escapeHtml(source.transcriptStatus)}</span></div>
          <div class="knowledge-source-actions">
            ${source.transcriptStatus === "acquired-private" ? `<b>${source.cueCount} cues · ${source.claimCount} notes</b>` : `
              <button class="pd-item" type="button" data-knowledge-source-retry data-source-id="${escapeHtml(source.id)}">Retry automatically</button>
              <button class="pd-item" type="button" data-knowledge-source-prefill data-source-url="${escapeHtml(source.url)}" data-source-title="${escapeHtml(source.title)}" data-source-publisher="${escapeHtml(source.publisher)}">Manual recovery</button>
            `}
          </div>
        </article>
      `).join("") || `<p>No educational sources registered yet.</p>`}
      ${dashboard?.sourcePage?.hasMore ? `<button class="pd-item" type="button" data-knowledge-load-sources>Load more sources</button>` : ""}
      </div>
    </details>
  `;
}

function renderProposalBins() {
  const root = document.getElementById("knowledgeReviewBins");
  if (!root) return;
  const counts = dashboard?.review?.page?.bucketCounts || {};
  const labels = {
    review: "To Review",
    approved: "Approved",
    rejected: "Rejected"
  };
  root.innerHTML = Object.entries(labels).map(([bucket, label]) => `
    <button class="pd-item${activeProposalBucket === bucket ? " is-active" : ""}" type="button" data-knowledge-bucket="${bucket}" aria-pressed="${activeProposalBucket === bucket}">
      <span>${label}</span>
      <b>${Number(counts[bucket] || 0)}</b>
    </button>
  `).join("");
}

function renderProposals() {
  const root = document.getElementById("knowledgeProposalList");
  if (!root) return;
  const proposals = (dashboard?.review?.proposals || [])
    .filter(proposal => proposalBucketForStatus(proposal.approvalStatus) === activeProposalBucket);
  if (!proposals.length) {
    const messages = {
      review: "No transcript-derived proposals are waiting for review. Process the Playlist queue now, or use manual recovery for a video without accessible captions.",
      approved: "No approved insights are in this bin yet.",
      rejected: "No rejected insights are in this bin yet."
    };
    root.innerHTML = `<div class="knowledge-empty-state">${messages[activeProposalBucket]}</div>`;
    return;
  }
  root.innerHTML = proposals.map(proposal => {
    const published = proposal.approvalStatus === "published";
    const rejected = proposal.approvalStatus === "rejected";
    const libraryRelationship = proposal.libraryComparison?.relationship || "new-opportunity";
    const publishBlocked = proposal.state === "conflicted" || libraryRelationship === "conflicts-with-library";
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
        <div class="knowledge-proposal-analysis">
          <span>Consensus: ${escapeHtml((proposal.state || "single-source").replaceAll("-", " "))}</span>
          <span>Confidence: ${escapeHtml((proposal.confidenceBand || "limited").replaceAll("-", " "))}</span>
          <span>Library: ${escapeHtml(libraryRelationship.replaceAll("-", " "))}</span>
        </div>
        ${(proposal.contradictions || []).length ? `
          <div class="knowledge-conflict-note">
            <strong>Conflict requires resolution</strong>
            <span>${escapeHtml([...new Set(proposal.contradictions.map(item => item.reason || "conflicting source guidance"))].join("; "))}</span>
          </div>
        ` : ""}
        ${proposal.publicationNeedsReview ? `<div class="knowledge-conflict-note"><strong>Published guidance needs review</strong><span>New evidence now conflicts with this item. Review it before leaving it in the Library.</span></div>` : ""}
        ${contextNotesMarkup(proposal)}
        <label class="auth-field">
          <span>Editable RankedCoach insight</span>
          <textarea data-knowledge-wording rows="3" ${published ? "readonly" : ""} placeholder="Write the player-facing coaching guidance in RankedCoach's voice.">${escapeHtml(proposal.rankedCoachWording || proposal.suggestedWording || "")}</textarea>
        </label>
        ${published ? `
          <div class="knowledge-publication-targets">
            <label class="auth-field">
              <span>Library location</span>
              <select data-knowledge-category disabled>
                ${["general", "map", "agent", "weapon"].map(value => `<option value="${value}" ${category === value ? "selected" : ""}>${value[0].toUpperCase()}${value.slice(1)}</option>`).join("")}
              </select>
            </label>
            <label class="auth-field">
              <span>Map, agent, or weapon</span>
              <input data-knowledge-entity value="${escapeHtml(entity)}" readonly placeholder="Bind" />
            </label>
          </div>
          <button class="pd-item knowledge-unpublish" type="button" data-knowledge-action="unpublish">Remove from Library</button>
        ` : `
          <div class="knowledge-publication-targets">
            <label class="auth-field">
              <span>Library location</span>
              <select data-knowledge-category>
                ${["general", "map", "agent", "weapon"].map(value => `<option value="${value}" ${category === value ? "selected" : ""}>${value[0].toUpperCase()}${value.slice(1)}</option>`).join("")}
              </select>
            </label>
            <label class="auth-field">
              <span>Map, agent, or weapon</span>
              <input data-knowledge-entity value="${escapeHtml(entity)}" placeholder="Bind" />
            </label>
          </div>
          <label class="knowledge-original-confirm">
            <input type="checkbox" data-knowledge-original />
            <span>I reviewed this as original RankedCoach wording, not copied transcript text.</span>
          </label>
          ${rejected ? `<p class="knowledge-rejection-reason">Rejected: ${escapeHtml(proposal.rejectionReason || "Not selected for publication.")}</p>` : ""}
          <div class="knowledge-proposal-actions">
            <button class="pd-item" type="button" data-knowledge-action="draft">Save Draft</button>
            <button class="pd-item auth-main-btn" type="button" data-knowledge-action="publish" ${publishBlocked ? `disabled title="Resolve the evidence conflict before publication."` : ""}>Publish to Library</button>
            <button class="pd-item knowledge-reject" type="button" data-knowledge-action="reject">Reject</button>
          </div>
        `}
      </article>
    `;
  }).join("") + (dashboard?.review?.page?.hasMore
    ? `<button class="pd-item knowledge-load-more" type="button" data-knowledge-load-proposals>Load more review proposals</button>`
    : "");
}

function captureResearchView() {
  const modal = document.getElementById("accountSupportModal");
  const scrollPositions = [
    document.scrollingElement,
    modal,
    modal?.querySelector(".lens-modal"),
    modal?.querySelector(".lens-modal-body"),
    modal?.querySelector(".account-support-panels"),
    modal?.querySelector("#knowledgeResearchPanel")
  ].filter((element, index, elements) => element && elements.indexOf(element) === index)
    .map(element => ({ element, scrollTop: Number(element.scrollTop || 0) }));
  return {
    scrollPositions,
    sourceQueueOpen: Boolean(document.querySelector(".knowledge-source-queue")?.open)
  };
}

function restoreResearchView(view = {}) {
  const queue = document.querySelector(".knowledge-source-queue");
  if (queue && view.sourceQueueOpen) queue.open = true;
  for (const position of view.scrollPositions || []) {
    if (position.element?.isConnected) position.element.scrollTop = Number(position.scrollTop || 0);
  }
}

function render(options = {}) {
  const view = options.preserveView ? captureResearchView() : null;
  renderSummary();
  renderProposalBins();
  renderProposals();
  const createdAt = dashboard?.review?.createdAt;
  setStatus(createdAt
    ? `Private review ${dashboard.review.id} · updated ${new Date(createdAt).toLocaleString()}`
    : "The source registry is ready. Process the Playlist to retrieve transcript highlights automatically.", "ready");
  if (view) restoreResearchView(view);
}

function summaryStatusKey(status = "") {
  if (status === "pending-owner-approval") return "pendingApproval";
  if (status === "rejected") return "rejected";
  if (status === "published") return "published";
  return "";
}

function updateReviewSummary(previousStatus, nextStatus) {
  const summary = dashboard?.review?.summary;
  if (!summary || previousStatus === nextStatus) return;
  const previousKey = summaryStatusKey(previousStatus);
  const nextKey = summaryStatusKey(nextStatus);
  if (previousKey) summary[previousKey] = Math.max(0, Number(summary[previousKey] || 0) - 1);
  if (nextKey) summary[nextKey] = Number(summary[nextKey] || 0) + 1;
}

function updateLocalProposal(proposalId, patch = {}, publishedRecord = null) {
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  if (!proposal) return false;
  const previousStatus = proposal.approvalStatus || "pending-owner-approval";
  const previousBucket = proposalBucketForStatus(previousStatus);
  Object.assign(proposal, patch);
  const nextBucket = proposalBucketForStatus(proposal.approvalStatus);
  const bucketCounts = dashboard?.review?.page?.bucketCounts;
  if (bucketCounts && previousBucket !== nextBucket) {
    bucketCounts[previousBucket] = Math.max(0, Number(bucketCounts[previousBucket] || 0) - 1);
    bucketCounts[nextBucket] = Number(bucketCounts[nextBucket] || 0) + 1;
    dashboard.review.page.total = Number(bucketCounts[activeProposalBucket] || 0);
  }
  updateReviewSummary(previousStatus, proposal.approvalStatus);
  if (!dashboard.published) dashboard.published = { updatedAt: null, items: [] };
  const publishedItems = Array.isArray(dashboard.published.items) ? dashboard.published.items : [];
  if (proposal.approvalStatus === "published" && publishedRecord) {
    dashboard.published.items = [
      ...publishedItems.filter(item => item.id !== proposalId),
      publishedRecord
    ];
    dashboard.published.updatedAt = publishedRecord.publishedAt || new Date().toISOString();
  } else if (previousStatus === "published" && proposal.approvalStatus !== "published") {
    dashboard.published.items = publishedItems.filter(item => item.id !== proposalId);
    dashboard.published.updatedAt = new Date().toISOString();
  }
  render({ preserveView: true });
  return true;
}

async function load(options = {}) {
  const force = options.force === true;
  if (loading && !force) return;
  const user = await globalThis.RankedCoachAuthBridge?.getFreshUser?.();
  if (!isOwner(user)) return;
  const proposalOffset = Math.max(0, Number(options.proposalOffset || 0));
  const sourceOffset = Math.max(0, Number(options.sourceOffset || 0));
  const { proposalLimit, sourceLimit } = researchPageLimits();
  if (force) loadController?.abort();
  const controller = new AbortController();
  const sequence = ++loadSequence;
  loadController = controller;
  loading = true;
  setStatus("Loading the private research queue…");
  try {
    const next = await request(`/api/knowledge/review?proposalBucket=${encodeURIComponent(activeProposalBucket)}&proposalOffset=${proposalOffset}&proposalLimit=${proposalLimit}&sourceOffset=${sourceOffset}&sourceLimit=${sourceLimit}`, {
      signal: controller.signal
    });
    if (sequence !== loadSequence) return;
    if (options.appendProposals && dashboard?.review && next?.review) {
      next.review.proposals = [...(dashboard.review.proposals || []), ...(next.review.proposals || [])];
      next.review.page = {
        ...(next.review.page || {}),
        offset: 0,
        hasMore: next.review.proposals.length < Number(next.review.page?.total || next.review.proposals.length)
      };
      next.sources = dashboard.sources;
      next.sourcePage = dashboard.sourcePage;
    } else if (options.appendSources && dashboard) {
      next.sources = [...(dashboard.sources || []), ...(next.sources || [])];
      next.sourcePage = {
        ...(next.sourcePage || {}),
        offset: 0,
        hasMore: next.sources.length < Number(next.sourcePage?.total || next.sources.length)
      };
      if (dashboard.review && next.review) {
        next.review.proposals = dashboard.review.proposals;
        next.review.page = dashboard.review.page;
      }
    }
    dashboard = next;
    render({ preserveView: Boolean(options.appendProposals || options.appendSources) });
  } catch (error) {
    if (sequence === loadSequence && error?.name !== "AbortError") {
      setStatus(error.message, "error");
    }
  } finally {
    if (sequence === loadSequence) {
      loading = false;
      loadController = null;
    }
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
    const wording = card.querySelector("[data-knowledge-wording]")?.value.trim() || "";
    if (action === "draft") {
      await request("/api/knowledge/draft", {
        method: "POST",
        body: JSON.stringify({ proposalId, rankedCoachWording: wording })
      });
      updateLocalProposal(proposalId, {
        rankedCoachWording: wording,
        approvalStatus: "draft",
        rejectionReason: null
      });
      setStatus("Draft saved privately. Players cannot see it.", "ready");
    } else if (action === "publish") {
      const confirmed = card.querySelector("[data-knowledge-original]")?.checked === true;
      const category = card.querySelector("[data-knowledge-category]")?.value || "general";
      const entity = card.querySelector("[data-knowledge-entity]")?.value.trim() || "";
      const publishedRecord = await request("/api/knowledge/publish", {
        method: "POST",
        body: JSON.stringify({
          proposalId,
          rankedCoachWording: wording,
          confirmOriginalWording: confirmed,
          category,
          entity
        })
      });
      updateLocalProposal(proposalId, {
        rankedCoachWording: wording,
        approvalStatus: "published",
        publishedAt: publishedRecord.publishedAt || new Date().toISOString(),
        publishedCategory: category,
        publishedEntity: entity
      }, publishedRecord);
      setStatus("The reviewed insight is now visible in the Library.", "ready");
      globalThis.dispatchEvent(new CustomEvent("rankedcoach:knowledge-updated"));
    } else if (action === "reject") {
      const rejectionReason = "Owner rejected this transcript-derived insight.";
      await request("/api/knowledge/reject", {
        method: "POST",
        body: JSON.stringify({ proposalId, reason: rejectionReason })
      });
      updateLocalProposal(proposalId, {
        approvalStatus: "rejected",
        rejectionReason
      });
      setStatus("Insight rejected. It will remain out of the Library.", "ready");
    } else if (action === "unpublish") {
      await request("/api/knowledge/unpublish", {
        method: "POST",
        body: JSON.stringify({ proposalId })
      });
      updateLocalProposal(proposalId, {
        approvalStatus: "approved",
        unpublishedAt: new Date().toISOString()
      });
      setStatus("The guidance was removed from the Library.", "ready");
      globalThis.dispatchEvent(new CustomEvent("rankedcoach:knowledge-updated"));
    }
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    button.disabled = false;
  }
}

async function runAutomaticProcessing(button) {
  button.disabled = true;
  setStatus("Refreshing the Playlist and processing transcript highlights…");
  try {
    const result = await request("/api/knowledge/run", {
      method: "POST",
      body: JSON.stringify({ batchSize: 24 })
    });
    const acquired = (result.processed || []).filter(item => item.status === "acquired-private").length;
    const waiting = (result.processed || []).length - acquired;
    setStatus(`Automatic processing finished: ${acquired} video(s) processed${waiting ? `, ${waiting} waiting or unavailable` : ""}.`, "ready");
    await load({ force: true });
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
  void load({ force: true });
});
document.getElementById("knowledgeResearchRun")?.addEventListener("click", event => {
  void runAutomaticProcessing(event.currentTarget);
});
document.getElementById("knowledgeProposalList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-knowledge-action]");
  if (button) void proposalAction(button);
});
document.getElementById("knowledgeResearchPanel")?.addEventListener("click", event => {
  const bucketButton = event.target.closest("[data-knowledge-bucket]");
  if (bucketButton) {
    const bucket = bucketButton.dataset.knowledgeBucket;
    if (!["review", "approved", "rejected"].includes(bucket) || bucket === activeProposalBucket) return;
    activeProposalBucket = bucket;
    resetResearchScroll();
    void load({ force: true });
    return;
  }
  const loadProposalsButton = event.target.closest("[data-knowledge-load-proposals]");
  if (loadProposalsButton) {
    void load({
      proposalOffset: dashboard?.review?.proposals?.length || 0,
      appendProposals: true
    });
    return;
  }
  const loadSourcesButton = event.target.closest("[data-knowledge-load-sources]");
  if (loadSourcesButton) {
    void load({
      sourceOffset: dashboard?.sources?.length || 0,
      appendSources: true
    });
    return;
  }
  const retryButton = event.target.closest("[data-knowledge-source-retry]");
  if (retryButton) {
    retryButton.disabled = true;
    void request("/api/knowledge/retry", {
      method: "POST",
      body: JSON.stringify({ sourceId: retryButton.dataset.sourceId })
    }).then(() => runAutomaticProcessing(retryButton))
      .catch(error => {
        retryButton.disabled = false;
        setStatus(error.message, "error");
      });
    return;
  }
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
