const OWNER_EMAILS = new Set(["michealdoolittle@gmail.com"]);
const OWNER_ROLES = new Set(["owner", "admin"]);
let dashboard = null;
let loading = false;
let activeProposalBucket = "review";
let loadController = null;
let loadSequence = 0;
const activeProposalIds = {
  review: "",
  approved: "",
  rejected: ""
};
const proposalFormDrafts = new Map();
const proposalFeedback = new Map();
const pendingProposalIds = new Set();
const reviewAutosaveTimers = new Map();
const reviewAutosaveRequests = new Map();
const approvedAutosaveTimers = new Map();
const approvedAutosaveRequests = new Map();
const KNOWLEDGE_TYPES = Object.freeze(["coaching", "statistical"]);
const KNOWLEDGE_TOPICS = Object.freeze(["economy", "mechanics", "teamplay", "map-control", "agent", "mentality", "general"]);

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

function publicationCategoryLabel(value = "") {
  return value === "agent-map" ? "Agent + Map" : `${value[0]?.toUpperCase() || ""}${value.slice(1)}`;
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
    <div><span>Review proposals</span><strong data-knowledge-summary-proposals>${dashboard?.review?.page?.total ?? dashboard?.review?.proposals?.length ?? 0}</strong></div>
    <div><span>Corroborated principles</span><strong>${Number(summary.corroborated || 0)}</strong></div>
    <div><span>Published updates</span><strong data-knowledge-summary-published>${dashboard?.published?.items?.length || 0}</strong></div>
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
    <button class="pd-item${activeProposalBucket === bucket ? " is-active" : ""}" type="button" data-knowledge-bucket="${bucket}" aria-pressed="${activeProposalBucket === bucket}" ${pendingProposalIds.size ? "disabled" : ""}>
      <span>${label}</span>
      <b>${Number(counts[bucket] || 0)}</b>
    </button>
  `).join("");
}

function currentBucketProposals() {
  return (dashboard?.review?.proposals || [])
    .filter(proposal => proposalBucketForStatus(proposal.approvalStatus) === activeProposalBucket);
}

function proposalFormState(proposal = {}) {
  const saved = proposalFormDrafts.get(proposal.id) || {};
  return {
    wording: saved.wording ?? proposal.rankedCoachWording ?? proposal.suggestedWording ?? "",
    type: saved.type ?? proposal.approvedType ?? proposal.publishedType ?? proposal.type ?? "coaching",
    topic: saved.topic ?? proposal.approvedTopic ?? proposal.publishedTopic ?? proposal.topic ?? "general",
    category: saved.category ?? proposal.approvedCategory ?? proposal.publishedCategory ?? inferCategory(proposal),
    entity: saved.entity ?? proposal.approvedEntity ?? proposal.publishedEntity ?? proposal.entities?.[0] ?? "",
    confirmed: saved.confirmed === true
  };
}

function isLocallyEditedReviewProposal(proposal = {}) {
  const saved = proposalFormDrafts.get(proposal.id);
  if (!saved?.modified) return false;
  return !["approved", "published", "rejected", "draft"].includes(proposal.approvalStatus || "");
}

function proposalStatusLabel(proposal = {}) {
  const status = isLocallyEditedReviewProposal(proposal)
    ? "draft"
    : proposal.approvalStatus || "pending";
  return {
    status,
    label: status.replaceAll("-", " ")
  };
}

function proposalDisplayEntity(proposal = {}) {
  const form = proposalFormState(proposal);
  return String(form.entity || "").trim() || "General coaching";
}

function syncProposalDraftState(proposalId) {
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  if (!proposal || !isLocallyEditedReviewProposal(proposal)) return;
  const { status, label } = proposalStatusLabel(proposal);
  const cardState = document
    .querySelector(`[data-knowledge-proposal="${proposalId}"] .knowledge-review-state`);
  if (cardState) {
    cardState.className = `knowledge-review-state is-${status}`;
    cardState.textContent = label;
  }
  const queueState = document.querySelector(`[data-knowledge-select-proposal="${proposalId}"] b`);
  if (queueState) {
    queueState.className = `is-${status}`;
    queueState.textContent = label;
  }
}

function syncProposalEntityDisplay(proposalId, entityValue) {
  const display = String(entityValue || "").trim() || "General coaching";
  const card = document.querySelector(`[data-knowledge-proposal="${proposalId}"]`);
  if (card) {
    const heading = card.querySelector("[data-knowledge-proposal-heading-entity]");
    if (heading) heading.textContent = display;
  }
  const queueItem = document.querySelector(`[data-knowledge-select-proposal="${proposalId}"]`);
  if (queueItem) {
    const queueEntity = queueItem.querySelector("[data-knowledge-queue-entity]");
    if (queueEntity) queueEntity.textContent = display;
  }
}

function syncProposalClassificationDisplay(proposalId, typeValue, topicValue) {
  const type = String(typeValue || "coaching").trim() || "coaching";
  const topic = String(topicValue || "general").trim() || "general";
  const display = `${type} · ${topic}`;
  const card = document.querySelector(`[data-knowledge-proposal="${proposalId}"]`);
  if (card) {
    const heading = card.querySelector("[data-knowledge-proposal-heading-classification]");
    if (heading) heading.textContent = display;
  }
  const queueItem = document.querySelector(`[data-knowledge-select-proposal="${proposalId}"]`);
  if (queueItem) {
    const queueClassification = queueItem.querySelector("[data-knowledge-queue-classification]");
    if (queueClassification) queueClassification.textContent = display;
  }
}

function proposalPublishBlockReason(proposal = {}, type = "coaching") {
  if (proposal.state === "conflicted" || proposal.libraryComparison?.relationship === "conflicts-with-library") {
    return "Resolve the evidence conflict before publication.";
  }
  return "";
}

function syncProposalPublishGate(proposalId, typeValue) {
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  const button = document.querySelector(`[data-knowledge-proposal="${proposalId}"] [data-knowledge-action="publish"]`);
  if (!proposal || !button || pendingProposalIds.has(proposalId)) return;
  const blockReason = proposalPublishBlockReason(proposal, String(typeValue || "coaching").trim() || "coaching");
  button.disabled = Boolean(blockReason);
  if (blockReason) button.title = blockReason;
  else button.removeAttribute("title");
}

function captureProposalDraft(card = document.querySelector("[data-knowledge-active-review] [data-knowledge-proposal]")) {
  const proposalId = card?.dataset.knowledgeProposal;
  if (!proposalId) return;
  const previous = proposalFormDrafts.get(proposalId) || {};
  proposalFormDrafts.set(proposalId, {
    wording: card.querySelector("[data-knowledge-wording]")?.value ?? "",
    type: card.querySelector("[data-knowledge-type]")?.value ?? "coaching",
    topic: card.querySelector("[data-knowledge-topic]")?.value ?? "general",
    category: card.querySelector("[data-knowledge-category]")?.value ?? "general",
    entity: card.querySelector("[data-knowledge-entity]")?.value ?? "",
    confirmed: card.querySelector("[data-knowledge-original]")?.checked === true,
    modified: previous.modified === true
  });
}

function ensureActiveProposal(proposals = []) {
  const requestedId = activeProposalIds[activeProposalBucket];
  const active = proposals.find(proposal => proposal.id === requestedId) || proposals[0] || null;
  activeProposalIds[activeProposalBucket] = active?.id || "";
  return active;
}

function proposalCardMarkup(proposal) {
  const form = proposalFormState(proposal);
  const published = proposal.approvalStatus === "published";
  const approved = proposal.approvalStatus === "approved";
  const rejected = proposal.approvalStatus === "rejected";
  const { status, label } = proposalStatusLabel(proposal);
  const libraryRelationship = proposal.libraryComparison?.relationship || "new-opportunity";
  const publishBlockedTitle = proposalPublishBlockReason(proposal, form.type);
  const publishBlocked = Boolean(publishBlockedTitle);
  const busy = pendingProposalIds.has(proposal.id);
  const feedback = proposalFeedback.get(proposal.id);
  return `
    <article class="knowledge-proposal-card" data-knowledge-proposal="${escapeHtml(proposal.id)}" ${busy ? `aria-busy="true"` : ""}>
      <div class="knowledge-proposal-heading">
        <div>
          <span data-knowledge-proposal-heading-classification>${escapeHtml(form.type || "coaching")} · ${escapeHtml(form.topic || "general")}</span>
          <strong data-knowledge-proposal-heading-entity>${escapeHtml(proposalDisplayEntity(proposal))}</strong>
        </div>
        <span class="knowledge-review-state is-${escapeHtml(status)}">${escapeHtml(label)}</span>
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
        <span>${published ? "Published RankedCoach insight" : approved ? "Approved RankedCoach insight" : "Editable RankedCoach insight"}</span>
        <textarea data-knowledge-wording rows="3" ${published ? "readonly" : ""} placeholder="Write the player-facing coaching guidance in RankedCoach's voice.">${escapeHtml(form.wording)}</textarea>
      </label>
      <div class="knowledge-proposal-feedback" data-knowledge-action-feedback data-tone="${escapeHtml(feedback?.tone || "")}" ${feedback?.message ? "" : "hidden"}>${escapeHtml(feedback?.message || "")}</div>
      ${published ? `
        <div class="knowledge-publication-targets">
          <label class="auth-field">
            <span>Insight type</span>
            <select data-knowledge-type disabled>
              ${KNOWLEDGE_TYPES.map(value => `<option value="${value}" ${form.type === value ? "selected" : ""}>${publicationCategoryLabel(value)}</option>`).join("")}
            </select>
          </label>
          <label class="auth-field">
            <span>Coaching topic</span>
            <select data-knowledge-topic disabled>
              ${KNOWLEDGE_TOPICS.map(value => `<option value="${value}" ${form.topic === value ? "selected" : ""}>${publicationCategoryLabel(value)}</option>`).join("")}
            </select>
          </label>
          <label class="auth-field">
            <span>Library location</span>
            <select data-knowledge-category disabled>
              ${["general", "map", "agent", "weapon", "agent-map"].map(value => `<option value="${value}" ${form.category === value ? "selected" : ""}>${publicationCategoryLabel(value)}</option>`).join("")}
            </select>
          </label>
          <label class="auth-field">
            <span>Map, agent, weapon, or agent + map</span>
            <input data-knowledge-entity value="${escapeHtml(form.entity)}" readonly placeholder="Jett · Breeze" />
          </label>
        </div>
        <button class="pd-item knowledge-unpublish" type="button" data-knowledge-action="unpublish" ${busy ? `disabled data-knowledge-was-disabled="false"` : ""}>Remove from Library</button>
      ` : `
        <div class="knowledge-publication-targets">
            <label class="auth-field">
              <span>Insight type</span>
              <select data-knowledge-type>
                ${KNOWLEDGE_TYPES.map(value => `<option value="${value}" ${form.type === value ? "selected" : ""}>${publicationCategoryLabel(value)}</option>`).join("")}
              </select>
            </label>
            <label class="auth-field">
              <span>Coaching topic</span>
              <select data-knowledge-topic>
                ${KNOWLEDGE_TOPICS.map(value => `<option value="${value}" ${form.topic === value ? "selected" : ""}>${publicationCategoryLabel(value)}</option>`).join("")}
              </select>
            </label>
            <label class="auth-field">
              <span>Library location</span>
              <select data-knowledge-category>
                ${["general", "map", "agent", "weapon", "agent-map"].map(value => `<option value="${value}" ${form.category === value ? "selected" : ""}>${publicationCategoryLabel(value)}</option>`).join("")}
              </select>
            </label>
            <label class="auth-field">
              <span>Map, agent, weapon, or agent + map</span>
              <input data-knowledge-entity value="${escapeHtml(form.entity)}" placeholder="Jett · Breeze" />
            </label>
        </div>
        ${approved ? `
          <p class="knowledge-target-help">Changes in Approved auto-save privately. Publish remains a separate action.</p>
        ` : rejected ? "" : `
          <label class="knowledge-original-confirm">
            <input type="checkbox" data-knowledge-original ${form.confirmed ? "checked" : ""} />
            <span>I reviewed this as original RankedCoach wording, not copied transcript text.</span>
          </label>
        `}
        ${rejected ? `<p class="knowledge-rejection-reason">Rejected: ${escapeHtml(proposal.rejectionReason || "Not selected for publication.")}</p>` : ""}
        <div class="knowledge-proposal-actions">
          ${approved ? `
            <button class="pd-item auth-main-btn" type="button" data-knowledge-action="publish" ${(publishBlocked || busy) ? "disabled" : ""} ${publishBlocked ? `title="${publishBlockedTitle}"` : ""} ${busy ? `data-knowledge-was-disabled="${publishBlocked}"` : ""}>Publish to Library</button>
            <button class="pd-item knowledge-discard" type="button" data-knowledge-action="discard" ${busy ? `disabled data-knowledge-was-disabled="false"` : ""}>Discard</button>
          ` : rejected ? "" : `
            <button class="pd-item auth-main-btn" type="button" data-knowledge-action="approve" ${busy ? "disabled" : ""} ${busy ? `data-knowledge-was-disabled="false"` : ""}>Approve</button>
            <button class="pd-item knowledge-reject" type="button" data-knowledge-action="reject" ${busy ? `disabled data-knowledge-was-disabled="false"` : ""}>Reject</button>
          `}
        </div>
      `}
    </article>
  `;
}

function queueItemMarkup(proposal, activeId) {
  const form = proposalFormState(proposal);
  const entity = proposalDisplayEntity(proposal);
  const { status, label } = proposalStatusLabel(proposal);
  return `
    <button class="pd-item knowledge-review-queue-item${proposal.id === activeId ? " is-active" : ""}" type="button"
      data-knowledge-select-proposal="${escapeHtml(proposal.id)}"
      aria-pressed="${proposal.id === activeId}" ${pendingProposalIds.size ? "disabled" : ""}>
      <span>
        <strong data-knowledge-queue-entity>${escapeHtml(entity)}</strong>
        <small data-knowledge-queue-classification>${escapeHtml(form.type || "coaching")} · ${escapeHtml(form.topic || "general")}</small>
      </span>
      <b class="is-${escapeHtml(status)}">${escapeHtml(label)}</b>
    </button>
  `;
}

function ensureProposalWorkspace(root) {
  if (document.getElementById("knowledgeActiveProposal") && document.getElementById("knowledgeProposalQueueList")) return;
  root.innerHTML = `
    <section class="knowledge-active-review" data-knowledge-active-review aria-labelledby="knowledgeActiveProposalLabel">
      <div class="knowledge-review-section-head">
        <div><span id="knowledgeActiveProposalLabel">Active review</span><strong id="knowledgeActiveProposalCount"></strong></div>
        <small id="knowledgeActiveProposalHelp"></small>
      </div>
      <div id="knowledgeActiveProposal"></div>
    </section>
    <section class="knowledge-review-queue" aria-labelledby="knowledgeProposalQueueLabel">
      <div class="knowledge-review-section-head">
        <div><span id="knowledgeProposalQueueLabel">Review queue</span><strong id="knowledgeProposalQueueCount"></strong></div>
        <small>Choose an item to make it the active review.</small>
      </div>
      <div id="knowledgeProposalQueueList" class="knowledge-review-queue-list"></div>
      <div id="knowledgeProposalQueueFooter" class="knowledge-review-queue-footer"></div>
    </section>
  `;
}

function renderProposals(options = {}) {
  const root = document.getElementById("knowledgeProposalList");
  if (!root) return;
  const view = options.preserveView ? captureResearchView() : null;
  ensureProposalWorkspace(root);
  const proposals = currentBucketProposals();
  const active = ensureActiveProposal(proposals);
  const activeHost = document.getElementById("knowledgeActiveProposal");
  const queueHost = document.getElementById("knowledgeProposalQueueList");
  const queueFooter = document.getElementById("knowledgeProposalQueueFooter");
  const activeLabel = document.getElementById("knowledgeActiveProposalLabel");
  const activeCount = document.getElementById("knowledgeActiveProposalCount");
  const activeHelp = document.getElementById("knowledgeActiveProposalHelp");
  const queueLabel = document.getElementById("knowledgeProposalQueueLabel");
  const queueCount = document.getElementById("knowledgeProposalQueueCount");
  const labels = {
    review: {
      active: "Active review",
      queue: "Review queue",
      help: "Edits autosave as Draft. Approve moves it to Approved; Reject moves it to Rejected.",
      empty: "No transcript-derived proposals are waiting for review. Process the Playlist queue now, or use manual recovery for a video without accessible captions."
    },
    approved: {
      active: "Approved insight",
      queue: "Approved archive",
      help: "Edit freely here; changes autosave privately. Publish one insight, or discard it back to Review.",
      empty: "No approved insights are in this bin yet."
    },
    rejected: {
      active: "Rejected insight",
      queue: "Rejected archive",
      help: "Rejected research is a temporary bin for bad outputs. Refresh or Process Playlist clears it.",
      empty: "No rejected insights are in this bin yet."
    }
  }[activeProposalBucket];
  const total = Number(dashboard?.review?.page?.total ?? proposals.length);
  const activeIndex = active ? proposals.findIndex(proposal => proposal.id === active.id) : -1;
  if (activeLabel) activeLabel.textContent = labels.active;
  if (activeCount) activeCount.textContent = active ? `${activeIndex + 1} of ${proposals.length} loaded` : "";
  if (activeHelp) activeHelp.textContent = labels.help;
  if (queueLabel) queueLabel.textContent = labels.queue;
  if (queueCount) queueCount.textContent = `${proposals.length} of ${total} loaded`;
  if (activeHost) {
    activeHost.innerHTML = active
      ? proposalCardMarkup(active)
      : `<div class="knowledge-empty-state">${labels.empty}</div>`;
  }
  if (queueHost) {
    queueHost.innerHTML = proposals.map(proposal => queueItemMarkup(proposal, active?.id || "")).join("");
  }
  if (queueFooter) {
    queueFooter.innerHTML = dashboard?.review?.page?.hasMore
      ? `<button class="pd-item knowledge-load-more" type="button" data-knowledge-load-proposals>Load more ${escapeHtml(labels.queue.toLowerCase())}</button>`
      : "";
  }
  if (view) restoreResearchView(view);
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
  if (!options.skipSummary) renderSummary();
  renderProposalBins();
  renderProposals();
  const createdAt = dashboard?.review?.createdAt;
  setStatus(createdAt
    ? `Private review ${dashboard.review.id} · updated ${new Date(createdAt).toLocaleString()}`
    : "The source registry is ready. Process the Playlist to retrieve transcript highlights automatically.", "ready");
  if (view) restoreResearchView(view);
}

function summaryStatusKey(status = "") {
  if (status === "pending-owner-approval" || status === "draft") return "pendingApproval";
  if (status === "rejected") return "rejected";
  if (status === "published") return "published";
  return "";
}

function updateReviewSummary(previousStatus, nextStatus) {
  const summary = dashboard?.review?.summary;
  if (!summary || previousStatus === nextStatus) return;
  const previousKey = summaryStatusKey(previousStatus);
  const nextKey = summaryStatusKey(nextStatus);
  if (previousKey && previousKey === nextKey) return;
  if (previousKey) summary[previousKey] = Math.max(0, Number(summary[previousKey] || 0) - 1);
  if (nextKey) summary[nextKey] = Number(summary[nextKey] || 0) + 1;
}

function updateSummaryMetrics() {
  const proposals = document.querySelector("[data-knowledge-summary-proposals]");
  const published = document.querySelector("[data-knowledge-summary-published]");
  if (proposals) {
    proposals.textContent = String(dashboard?.review?.page?.total ?? currentBucketProposals().length);
  }
  if (published) {
    published.textContent = String(dashboard?.published?.items?.length || 0);
  }
}

function updateLocalProposal(proposalId, patch = {}, publishedRecord = null) {
  const allProposals = dashboard?.review?.proposals || [];
  const proposalIndex = allProposals.findIndex(item => item.id === proposalId);
  const proposal = allProposals[proposalIndex];
  if (!proposal) return false;
  const previousStatus = proposal.approvalStatus || "pending-owner-approval";
  const previousBucket = proposalBucketForStatus(previousStatus);
  const previousBucketProposals = currentBucketProposals();
  const previousBucketIndex = previousBucketProposals.findIndex(item => item.id === proposalId);
  Object.assign(proposal, patch);
  const nextBucket = proposalBucketForStatus(proposal.approvalStatus);
  const bucketCounts = dashboard?.review?.page?.bucketCounts;
  if (bucketCounts && previousBucket !== nextBucket) {
    bucketCounts[previousBucket] = Math.max(0, Number(bucketCounts[previousBucket] || 0) - 1);
    bucketCounts[nextBucket] = Number(bucketCounts[nextBucket] || 0) + 1;
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
  if (previousBucket !== nextBucket) {
    const nextActive = previousBucketProposals[previousBucketIndex + 1]
      || previousBucketProposals[previousBucketIndex - 1]
      || null;
    if (activeProposalIds[previousBucket] === proposalId) {
      activeProposalIds[previousBucket] = nextActive?.id || "";
    }
    allProposals.splice(proposalIndex, 1);
    proposalFormDrafts.delete(proposalId);
    proposalFeedback.delete(proposalId);
  }
  if (dashboard?.review?.page) {
    const currentLoaded = currentBucketProposals().length;
    const currentTotal = Number(bucketCounts?.[activeProposalBucket] ?? dashboard.review.page.total ?? currentLoaded);
    dashboard.review.page.total = currentTotal;
    dashboard.review.page.hasMore = currentLoaded < currentTotal;
  }
  renderProposalBins();
  renderProposals({ preserveView: true });
  updateSummaryMetrics();
  return true;
}

async function load(options = {}) {
  const force = options.force === true;
  if (pendingProposalIds.size && options.allowDuringProposalAction !== true) return;
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
      const seen = new Set();
      next.review.proposals = [...(dashboard.review.proposals || []), ...(next.review.proposals || [])]
        .filter(proposal => {
          if (!proposal?.id || seen.has(proposal.id)) return false;
          seen.add(proposal.id);
          return true;
        });
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
    } else if (options.discardDrafts) {
      proposalFormDrafts.clear();
      proposalFeedback.clear();
    }
    dashboard = next;
    render({
      preserveView: Boolean(options.appendProposals || options.appendSources),
      skipSummary: Boolean(options.appendProposals)
    });
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
  syncResearchPerformanceMode();
}

function syncResearchPerformanceMode() {
  const modal = document.getElementById("accountSupportModal");
  const panel = document.getElementById("knowledgeResearchPanel");
  const active = Boolean(
    panel?.classList.contains("is-active")
    && (modal?.classList.contains("active") || modal?.classList.contains("is-opening"))
  );
  document.body?.classList.toggle("knowledge-research-active", active);
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

function setProposalActionState(card, message = "", tone = "", busy = false) {
  if (!card) return;
  card.toggleAttribute("aria-busy", busy);
  const proposalId = card.dataset.knowledgeProposal;
  if (proposalId && message) proposalFeedback.set(proposalId, { message, tone });
  const feedback = card.querySelector("[data-knowledge-action-feedback]");
  if (feedback) {
    feedback.textContent = message;
    feedback.dataset.tone = tone;
    feedback.hidden = !message;
  }
  card.querySelectorAll("[data-knowledge-action]").forEach(actionButton => {
    if (busy) {
      actionButton.dataset.knowledgeWasDisabled = actionButton.disabled ? "true" : "false";
      actionButton.disabled = true;
    } else {
      actionButton.disabled = actionButton.dataset.knowledgeWasDisabled === "true";
      delete actionButton.dataset.knowledgeWasDisabled;
    }
  });
}

function setProposalNavigationBusy(busy) {
  const panel = document.getElementById("knowledgeResearchPanel");
  panel?.toggleAttribute("aria-busy", busy);
  document.querySelectorAll(
    "#knowledgeResearchPanel button:not([data-knowledge-action]), #accountSupportModal [data-account-support-tab]"
  ).forEach(control => {
    if (busy) {
      if (control.dataset.knowledgeNavWasDisabled === undefined) {
        control.dataset.knowledgeNavWasDisabled = control.disabled ? "true" : "false";
      }
      control.disabled = true;
    } else {
      control.disabled = control.dataset.knowledgeNavWasDisabled === "true";
      delete control.dataset.knowledgeNavWasDisabled;
    }
  });
}

function proposalTargetPayload(card, proposalId) {
  return {
    proposalId,
    rankedCoachWording: card.querySelector("[data-knowledge-wording]")?.value.trim() || "",
    type: card.querySelector("[data-knowledge-type]")?.value || "coaching",
    topic: card.querySelector("[data-knowledge-topic]")?.value || "general",
    category: card.querySelector("[data-knowledge-category]")?.value || "general",
    entity: card.querySelector("[data-knowledge-entity]")?.value.trim() || ""
  };
}

function clearApprovedAutosave(proposalId = "") {
  if (!proposalId) return;
  const timer = approvedAutosaveTimers.get(proposalId);
  if (timer) window.clearTimeout(timer);
  approvedAutosaveTimers.delete(proposalId);
}

function clearReviewAutosave(proposalId = "") {
  if (!proposalId) return;
  const timer = reviewAutosaveTimers.get(proposalId);
  if (timer) window.clearTimeout(timer);
  reviewAutosaveTimers.delete(proposalId);
}

async function saveReviewProposalDraft(card, options = {}) {
  const proposalId = card?.dataset?.knowledgeProposal || "";
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  if (!proposalId || ["approved", "published", "rejected"].includes(proposal?.approvalStatus || "")) return null;
  const wording = card.querySelector("[data-knowledge-wording]")?.value.trim() || "";
  if (wording.length < 20) return null;

  const priorRequest = reviewAutosaveRequests.get(proposalId);
  if (priorRequest) {
    if (!options.waitForExisting) return priorRequest;
    await priorRequest.catch(() => null);
  }

  const requestPromise = request("/api/knowledge/draft", {
    method: "POST",
    body: JSON.stringify({ proposalId, rankedCoachWording: wording })
  }).then(record => {
    Object.assign(proposal, {
      rankedCoachWording: wording,
      approvalStatus: "draft",
      draftSavedAt: record.savedAt || new Date().toISOString()
    });
    proposalFeedback.set(proposalId, {
      message: "Draft autosaved privately.",
      tone: "ready"
    });
    syncProposalDraftState(proposalId);
    const activeCard = document.querySelector(`[data-knowledge-proposal="${proposalId}"]`);
    const feedback = activeCard?.querySelector("[data-knowledge-action-feedback]");
    if (feedback && activeCard === card) {
      feedback.textContent = "Draft autosaved privately.";
      feedback.dataset.tone = "ready";
      feedback.hidden = false;
    }
    return record;
  }).catch(error => {
    proposalFeedback.set(proposalId, {
      message: error.message,
      tone: "error"
    });
    const activeCard = document.querySelector(`[data-knowledge-proposal="${proposalId}"]`);
    const feedback = activeCard?.querySelector("[data-knowledge-action-feedback]");
    if (feedback && activeCard === card) {
      feedback.textContent = error.message;
      feedback.dataset.tone = "error";
      feedback.hidden = false;
    }
    throw error;
  }).finally(() => {
    if (reviewAutosaveRequests.get(proposalId) === requestPromise) {
      reviewAutosaveRequests.delete(proposalId);
    }
  });
  reviewAutosaveRequests.set(proposalId, requestPromise);
  return requestPromise;
}

function scheduleReviewAutosave(card) {
  const proposalId = card?.dataset?.knowledgeProposal || "";
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  if (!proposalId || ["approved", "published", "rejected"].includes(proposal?.approvalStatus || "")) return;
  clearReviewAutosave(proposalId);
  reviewAutosaveTimers.set(proposalId, window.setTimeout(() => {
    reviewAutosaveTimers.delete(proposalId);
    void saveReviewProposalDraft(card).catch(() => null);
  }, 760));
}

async function saveApprovedProposalTarget(card, options = {}) {
  const proposalId = card?.dataset?.knowledgeProposal || "";
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  if (!proposalId || proposal?.approvalStatus !== "approved") return null;
  const payload = proposalTargetPayload(card, proposalId);
  if (payload.rankedCoachWording.length < 20) return null;
  if (payload.category !== "general" && !payload.entity) return null;

  const priorRequest = approvedAutosaveRequests.get(proposalId);
  if (priorRequest) {
    if (!options.waitForExisting) return priorRequest;
    await priorRequest.catch(() => null);
  }

  const requestPromise = request("/api/knowledge/approved-target", {
    method: "POST",
    body: JSON.stringify(payload)
  }).then(targetRecord => {
    Object.assign(proposal, {
      rankedCoachWording: targetRecord.rankedCoachWording || payload.rankedCoachWording,
      approvedType: targetRecord.type || payload.type,
      approvedTopic: targetRecord.topic || payload.topic,
      approvedCategory: targetRecord.category || payload.category,
      approvedEntity: targetRecord.entity ?? payload.entity,
      approvedTargetSavedAt: targetRecord.savedAt || new Date().toISOString()
    });
    proposalFeedback.set(proposalId, {
      message: "Approved changes autosaved privately.",
      tone: "ready"
    });
    const activeCard = document.querySelector(`[data-knowledge-proposal="${proposalId}"]`);
    const feedback = activeCard?.querySelector("[data-knowledge-action-feedback]");
    if (feedback && activeCard === card) {
      feedback.textContent = "Approved changes autosaved privately.";
      feedback.dataset.tone = "ready";
      feedback.hidden = false;
    }
    return targetRecord;
  }).catch(error => {
    proposalFeedback.set(proposalId, {
      message: error.message,
      tone: "error"
    });
    const activeCard = document.querySelector(`[data-knowledge-proposal="${proposalId}"]`);
    const feedback = activeCard?.querySelector("[data-knowledge-action-feedback]");
    if (feedback && activeCard === card) {
      feedback.textContent = error.message;
      feedback.dataset.tone = "error";
      feedback.hidden = false;
    }
    throw error;
  }).finally(() => {
    if (approvedAutosaveRequests.get(proposalId) === requestPromise) {
      approvedAutosaveRequests.delete(proposalId);
    }
  });
  approvedAutosaveRequests.set(proposalId, requestPromise);
  return requestPromise;
}

function scheduleApprovedAutosave(card) {
  const proposalId = card?.dataset?.knowledgeProposal || "";
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  if (!proposalId || proposal?.approvalStatus !== "approved") return;
  clearApprovedAutosave(proposalId);
  approvedAutosaveTimers.set(proposalId, window.setTimeout(() => {
    approvedAutosaveTimers.delete(proposalId);
    void saveApprovedProposalTarget(card).catch(() => null);
  }, 760));
}

async function proposalAction(button) {
  const card = button.closest("[data-knowledge-proposal]");
  const proposalId = card?.dataset.knowledgeProposal;
  if (!proposalId || pendingProposalIds.has(proposalId)) return;
  const action = button.dataset.knowledgeAction;
  clearReviewAutosave(proposalId);
  clearApprovedAutosave(proposalId);
  captureProposalDraft(card);
  const pendingMessages = {
    approve: "Moving this insight to Approved…",
    publish: "Publishing the reviewed insight…",
    discard: "Discarding this approval back to Review…",
    reject: "Moving this insight to Rejected…",
    unpublish: "Removing this guidance from the Library…"
  };
  if (loadController) {
    loadController.abort();
    loadController = null;
    loadSequence += 1;
    loading = false;
  }
  pendingProposalIds.add(proposalId);
  setProposalNavigationBusy(true);
  setProposalActionState(card, pendingMessages[action] || "Saving…", "pending", true);
  try {
    if (["approve", "reject"].includes(action)) {
      await reviewAutosaveRequests.get(proposalId)?.catch(() => null);
    }
    if (["publish", "discard"].includes(action)) {
      await approvedAutosaveRequests.get(proposalId)?.catch(() => null);
    }
    const wording = card.querySelector("[data-knowledge-wording]")?.value.trim() || "";
    if (action === "approve") {
      const confirmed = card.querySelector("[data-knowledge-original]")?.checked === true;
      const type = card.querySelector("[data-knowledge-type]")?.value || "coaching";
      const topic = card.querySelector("[data-knowledge-topic]")?.value || "general";
      const category = card.querySelector("[data-knowledge-category]")?.value || "general";
      const entity = card.querySelector("[data-knowledge-entity]")?.value.trim() || "";
      const approvalRecord = await request("/api/knowledge/approve", {
        method: "POST",
        body: JSON.stringify({
          proposalId,
          rankedCoachWording: wording,
          confirmOriginalWording: confirmed,
          type,
          topic,
          category,
          entity
        })
      });
      const updated = updateLocalProposal(proposalId, {
        rankedCoachWording: wording,
        approvalStatus: "approved",
        approvedAt: approvalRecord.approvedAt || new Date().toISOString(),
        approvedType: approvalRecord.type || type,
        approvedTopic: approvalRecord.topic || topic,
        approvedCategory: approvalRecord.category || category,
        approvedEntity: approvalRecord.entity ?? entity,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null
      });
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("Insight approved. It is waiting privately in Approved and is not visible to players.", "ready");
    } else if (action === "publish") {
      const targetPayload = proposalTargetPayload(card, proposalId);
      if (targetPayload.rankedCoachWording.length < 20) {
        throw new Error("At least 20 characters of RankedCoach wording are required before publishing.");
      }
      if (targetPayload.category !== "general" && !targetPayload.entity) {
        throw new Error("Choose a valid map, agent, weapon, or agent-map pair before publishing.");
      }
      await saveApprovedProposalTarget(card, { waitForExisting: true });
      const publishedRecord = await request("/api/knowledge/publish", {
        method: "POST",
        body: JSON.stringify({
          proposalId,
          type: targetPayload.type,
          topic: targetPayload.topic,
          category: targetPayload.category,
          entity: targetPayload.entity
        })
      });
      const updated = updateLocalProposal(proposalId, {
        rankedCoachWording: wording,
        approvalStatus: "published",
        publishedAt: publishedRecord.publishedAt || new Date().toISOString(),
        publishedType: publishedRecord.type || targetPayload.type,
        publishedTopic: publishedRecord.topic || targetPayload.topic,
        publishedCategory: targetPayload.category,
        publishedEntity: targetPayload.entity
      }, publishedRecord);
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("The reviewed insight is now visible in the Library.", "ready");
      globalThis.dispatchEvent(new CustomEvent("rankedcoach:knowledge-updated"));
    } else if (action === "discard") {
      await request("/api/knowledge/discard", {
        method: "POST",
        body: JSON.stringify({ proposalId, rankedCoachWording: wording })
      });
      const updated = updateLocalProposal(proposalId, {
        approvalStatus: "draft",
        rankedCoachWording: wording,
        approvedAt: null,
        approvedBy: null,
        approvedType: null,
        approvedTopic: null,
        approvedCategory: null,
        approvedEntity: null,
        approvedTargetSavedAt: null,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null
      });
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("Approved insight discarded back to Review as a draft.", "ready");
    } else if (action === "reject") {
      const rejectionReason = "Owner rejected this transcript-derived insight.";
      await request("/api/knowledge/reject", {
        method: "POST",
        body: JSON.stringify({ proposalId, reason: rejectionReason })
      });
      const updated = updateLocalProposal(proposalId, {
        approvalStatus: "rejected",
        rejectionReason
      });
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("Insight rejected. It will remain out of the Library.", "ready");
    } else if (action === "unpublish") {
      await request("/api/knowledge/unpublish", {
        method: "POST",
        body: JSON.stringify({ proposalId })
      });
      proposalFeedback.set(proposalId, {
        message: "Removed from the Library. This item remains in Approved for reference.",
        tone: "ready"
      });
      const updated = updateLocalProposal(proposalId, {
        approvalStatus: "approved",
        unpublishedAt: new Date().toISOString()
      });
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("The guidance was removed from the Library.", "ready");
      globalThis.dispatchEvent(new CustomEvent("rankedcoach:knowledge-updated"));
    }
  } catch (error) {
    proposalFeedback.set(proposalId, { message: error.message, tone: "error" });
    setProposalActionState(card, error.message, "error", false);
    setStatus(error.message, "error");
  } finally {
    pendingProposalIds.delete(proposalId);
    setProposalNavigationBusy(false);
    const currentCard = document.querySelector("[data-knowledge-active-review] [data-knowledge-proposal]");
    if (currentCard?.dataset.knowledgeProposal === proposalId && currentCard.getAttribute("aria-busy") === "true") {
      setProposalActionState(currentCard, proposalFeedback.get(proposalId)?.message || "", proposalFeedback.get(proposalId)?.tone || "", false);
    }
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
    await request("/api/knowledge/clear-rejected", {
      method: "POST",
      body: JSON.stringify({})
    });
    const publication = await request("/api/knowledge/publish-approved", {
      method: "POST",
      body: JSON.stringify({})
    });
    const published = Number(publication.publishedCount || 0);
    const skipped = Number(publication.skippedCount || 0);
    if (published) {
      globalThis.dispatchEvent?.(new CustomEvent("rankedcoach:knowledge-updated", {
        detail: { publishedCount: published, source: "knowledge-review" }
      }));
    }
    setStatus(
      `Automatic processing finished: ${acquired} video(s) processed${waiting ? `, ${waiting} waiting or unavailable` : ""}; ${published} approved insight(s) published${skipped ? `, ${skipped} held for review` : ""}.`,
      skipped ? "pending" : "ready"
    );
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
  captureProposalDraft();
  void request("/api/knowledge/clear-rejected", {
    method: "POST",
    body: JSON.stringify({})
  })
    .catch(() => null)
    .then(() => load({ force: true, discardDrafts: true }));
});
document.getElementById("knowledgeResearchRun")?.addEventListener("click", event => {
  void runAutomaticProcessing(event.currentTarget);
});
const proposalList = document.getElementById("knowledgeProposalList");
proposalList?.addEventListener("click", event => {
  const selection = event.target.closest("[data-knowledge-select-proposal]");
  if (selection) {
    if (pendingProposalIds.size) return;
    const proposalId = selection.dataset.knowledgeSelectProposal;
    if (!proposalId || proposalId === activeProposalIds[activeProposalBucket]) return;
    captureProposalDraft();
    activeProposalIds[activeProposalBucket] = proposalId;
    renderProposals({ preserveView: true });
    if (researchPageLimits().proposalLimit === 10) {
      requestAnimationFrame(() => {
        document.querySelector("[data-knowledge-active-review]")?.scrollIntoView({
          block: "start",
          behavior: "auto"
        });
      });
    }
    return;
  }
  const button = event.target.closest("[data-knowledge-action]");
  if (button) void proposalAction(button);
});
const rememberProposalFormControl = event => {
  const control = event.target;
  const card = control.closest?.("[data-knowledge-proposal]");
  const proposalId = card?.dataset.knowledgeProposal;
  if (!proposalId) return;
  const proposal = dashboard?.review?.proposals?.find(item => item.id === proposalId);
  if (!proposal) return;
  const draft = proposalFormDrafts.get(proposalId) || proposalFormState(proposal);
  if (control.matches("[data-knowledge-wording]")) draft.wording = control.value;
  if (control.matches("[data-knowledge-type]")) draft.type = control.value;
  if (control.matches("[data-knowledge-topic]")) draft.topic = control.value;
  if (control.matches("[data-knowledge-category]")) draft.category = control.value;
  if (control.matches("[data-knowledge-entity]")) draft.entity = control.value;
  if (control.matches("[data-knowledge-original]")) draft.confirmed = control.checked;
  if (!["approved", "published", "rejected", "draft"].includes(proposal.approvalStatus || "")) {
    draft.modified = true;
  }
  proposalFormDrafts.set(proposalId, draft);
  syncProposalDraftState(proposalId);
  if (control.matches("[data-knowledge-entity]")) syncProposalEntityDisplay(proposalId, control.value);
  if (control.matches("[data-knowledge-type], [data-knowledge-topic]")) {
    syncProposalClassificationDisplay(proposalId, draft.type, draft.topic);
    syncProposalPublishGate(proposalId, draft.type);
  }
  if (proposal.approvalStatus === "approved") {
    scheduleApprovedAutosave(card);
  } else if (!["published", "rejected"].includes(proposal.approvalStatus || "")) {
    scheduleReviewAutosave(card);
  }
};
proposalList?.addEventListener("change", rememberProposalFormControl);
proposalList?.addEventListener("input", rememberProposalFormControl);
document.getElementById("knowledgeResearchPanel")?.addEventListener("click", event => {
  if (pendingProposalIds.size && event.target.closest("button, summary")) return;
  const bucketButton = event.target.closest("[data-knowledge-bucket]");
  if (bucketButton) {
    if (pendingProposalIds.size) return;
    const bucket = bucketButton.dataset.knowledgeBucket;
    if (!["review", "approved", "rejected"].includes(bucket) || bucket === activeProposalBucket) return;
    captureProposalDraft();
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
document.querySelectorAll("[data-account-support-tab]").forEach(tab => {
  tab.addEventListener("click", () => requestAnimationFrame(syncResearchPerformanceMode));
});
const accountSupportModal = document.getElementById("accountSupportModal");
if (accountSupportModal && typeof MutationObserver === "function") {
  new MutationObserver(syncResearchPerformanceMode).observe(accountSupportModal, {
    attributes: true,
    attributeFilter: ["class", "aria-hidden"]
  });
}
syncAccess(globalThis.RankedCoachAuthBridge?.getUser?.());
globalThis.RankedCoachAuthBridge?.getFreshUser?.().then(syncAccess).catch(() => {});
