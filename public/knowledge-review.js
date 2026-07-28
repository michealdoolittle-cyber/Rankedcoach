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
    category: saved.category ?? proposal.approvedCategory ?? proposal.publishedCategory ?? inferCategory(proposal),
    entity: saved.entity ?? proposal.approvedEntity ?? proposal.publishedEntity ?? proposal.entities?.[0] ?? "",
    confirmed: saved.confirmed === true
  };
}

function captureProposalDraft(card = document.querySelector("[data-knowledge-active-review] [data-knowledge-proposal]")) {
  const proposalId = card?.dataset.knowledgeProposal;
  if (!proposalId) return;
  proposalFormDrafts.set(proposalId, {
    wording: card.querySelector("[data-knowledge-wording]")?.value ?? "",
    category: card.querySelector("[data-knowledge-category]")?.value ?? "general",
    entity: card.querySelector("[data-knowledge-entity]")?.value ?? "",
    confirmed: card.querySelector("[data-knowledge-original]")?.checked === true
  });
}

function ensureActiveProposal(proposals = []) {
  const requestedId = activeProposalIds[activeProposalBucket];
  const active = proposals.find(proposal => proposal.id === requestedId) || proposals[0] || null;
  activeProposalIds[activeProposalBucket] = active?.id || "";
  return active;
}

function proposalCardMarkup(proposal) {
  const published = proposal.approvalStatus === "published";
  const approved = proposal.approvalStatus === "approved";
  const rejected = proposal.approvalStatus === "rejected";
  const libraryRelationship = proposal.libraryComparison?.relationship || "new-opportunity";
  const statisticalPublishBlocked = proposal.type === "statistical" && proposal.state !== "corroborated";
  const publishBlocked = proposal.state === "conflicted"
    || libraryRelationship === "conflicts-with-library"
    || statisticalPublishBlocked;
  const publishBlockedTitle = statisticalPublishBlocked
    ? "Statistical insights need corroboration from independent sources before publication."
    : "Resolve the evidence conflict before publication.";
  const primaryAction = approved ? "publish" : "approve";
  const primaryLabel = approved ? "Publish to Library" : "Approve";
  const primaryBlocked = approved && publishBlocked;
  const busy = pendingProposalIds.has(proposal.id);
  const form = proposalFormState(proposal);
  const feedback = proposalFeedback.get(proposal.id);
  return `
    <article class="knowledge-proposal-card" data-knowledge-proposal="${escapeHtml(proposal.id)}" ${busy ? `aria-busy="true"` : ""}>
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
        <span>${published ? "Published RankedCoach insight" : approved ? "Approved RankedCoach insight" : "Editable RankedCoach insight"}</span>
        <textarea data-knowledge-wording rows="3" ${(published || approved) ? "readonly" : ""} placeholder="Write the player-facing coaching guidance in RankedCoach's voice.">${escapeHtml(form.wording)}</textarea>
      </label>
      <div class="knowledge-proposal-feedback" data-knowledge-action-feedback data-tone="${escapeHtml(feedback?.tone || "")}" ${feedback?.message ? "" : "hidden"}>${escapeHtml(feedback?.message || "")}</div>
      ${published ? `
        <div class="knowledge-publication-targets">
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
          <p class="knowledge-target-help">Save tags keeps this approved insight private. Publish remains a separate action.</p>
        ` : `
          <label class="knowledge-original-confirm">
            <input type="checkbox" data-knowledge-original ${form.confirmed ? "checked" : ""} />
            <span>I reviewed this as original RankedCoach wording, not copied transcript text.</span>
          </label>
        `}
        ${rejected ? `<p class="knowledge-rejection-reason">Rejected: ${escapeHtml(proposal.rejectionReason || "Not selected for publication.")}</p>` : ""}
        <div class="knowledge-proposal-actions">
          <button class="pd-item" type="button" data-knowledge-action="draft" ${busy ? `disabled data-knowledge-was-disabled="false"` : ""}>${approved ? "Revise in Review" : "Save Draft"}</button>
          ${approved ? `<button class="pd-item knowledge-save-target" type="button" data-knowledge-action="save-target" ${busy ? `disabled data-knowledge-was-disabled="false"` : ""}>Save tags</button>` : ""}
          <button class="pd-item auth-main-btn" type="button" data-knowledge-action="${primaryAction}" ${(primaryBlocked || busy) ? "disabled" : ""} ${primaryBlocked ? `title="${publishBlockedTitle}"` : ""} ${busy ? `data-knowledge-was-disabled="${primaryBlocked}"` : ""}>${primaryLabel}</button>
          <button class="pd-item knowledge-reject" type="button" data-knowledge-action="reject" ${busy ? `disabled data-knowledge-was-disabled="false"` : ""}>Reject</button>
        </div>
      `}
    </article>
  `;
}

function queueItemMarkup(proposal, activeId) {
  const entity = (proposal.entities || []).join(", ") || "General coaching";
  const status = (proposal.approvalStatus || "pending").replaceAll("-", " ");
  return `
    <button class="pd-item knowledge-review-queue-item${proposal.id === activeId ? " is-active" : ""}" type="button"
      data-knowledge-select-proposal="${escapeHtml(proposal.id)}"
      aria-pressed="${proposal.id === activeId}" ${pendingProposalIds.size ? "disabled" : ""}>
      <span>
        <strong>${escapeHtml(entity)}</strong>
        <small>${escapeHtml(proposal.type || "coaching")} · ${escapeHtml(proposal.topic || "general")}</small>
      </span>
      <b class="is-${escapeHtml(proposal.approvalStatus || "pending")}">${escapeHtml(status)}</b>
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
      help: "Draft keeps this item here. Approve moves it to Approved; Reject moves it to Rejected.",
      empty: "No transcript-derived proposals are waiting for review. Process the Playlist queue now, or use manual recovery for a video without accessible captions."
    },
    approved: {
      active: "Approved insight",
      queue: "Approved archive",
      help: "Approved wording stays private until you separately publish it to the Library.",
      empty: "No approved insights are in this bin yet."
    },
    rejected: {
      active: "Rejected insight",
      queue: "Rejected archive",
      help: "Rejected research stays here for reference and can still be revised later.",
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

async function proposalAction(button) {
  const card = button.closest("[data-knowledge-proposal]");
  const proposalId = card?.dataset.knowledgeProposal;
  if (!proposalId || pendingProposalIds.has(proposalId)) return;
  const action = button.dataset.knowledgeAction;
  captureProposalDraft(card);
  const pendingMessages = {
    draft: "Saving this draft privately…",
    approve: "Moving this insight to Approved…",
    "save-target": "Saving the approved Library tags…",
    publish: "Publishing the reviewed insight…",
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
    const wording = card.querySelector("[data-knowledge-wording]")?.value.trim() || "";
    if (action === "draft") {
      await request("/api/knowledge/draft", {
        method: "POST",
        body: JSON.stringify({ proposalId, rankedCoachWording: wording })
      });
      proposalFeedback.set(proposalId, {
        message: "Draft saved privately. It remains in To Review.",
        tone: "ready"
      });
      const updated = updateLocalProposal(proposalId, {
        rankedCoachWording: wording,
        approvalStatus: "draft",
        rejectionReason: null
      });
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("Draft saved privately. Players cannot see it.", "ready");
    } else if (action === "approve") {
      const confirmed = card.querySelector("[data-knowledge-original]")?.checked === true;
      const category = card.querySelector("[data-knowledge-category]")?.value || "general";
      const entity = card.querySelector("[data-knowledge-entity]")?.value.trim() || "";
      const approvalRecord = await request("/api/knowledge/approve", {
        method: "POST",
        body: JSON.stringify({
          proposalId,
          rankedCoachWording: wording,
          confirmOriginalWording: confirmed,
          category,
          entity
        })
      });
      const updated = updateLocalProposal(proposalId, {
        rankedCoachWording: wording,
        approvalStatus: "approved",
        approvedAt: approvalRecord.approvedAt || new Date().toISOString(),
        approvedCategory: approvalRecord.category || category,
        approvedEntity: approvalRecord.entity ?? entity,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null
      });
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("Insight approved. It is waiting privately in Approved and is not visible to players.", "ready");
    } else if (action === "save-target") {
      const category = card.querySelector("[data-knowledge-category]")?.value || "general";
      const entity = card.querySelector("[data-knowledge-entity]")?.value.trim() || "";
      const targetRecord = await request("/api/knowledge/approved-target", {
        method: "POST",
        body: JSON.stringify({ proposalId, category, entity })
      });
      proposalFeedback.set(proposalId, {
        message: "Approved Library tags saved privately. Publish remains separate.",
        tone: "ready"
      });
      const updated = updateLocalProposal(proposalId, {
        approvedCategory: targetRecord.category || category,
        approvedEntity: targetRecord.entity ?? entity
      });
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("Approved Library tags saved privately. This insight is still not visible to players.", "ready");
    } else if (action === "publish") {
      const category = card.querySelector("[data-knowledge-category]")?.value || "general";
      const entity = card.querySelector("[data-knowledge-entity]")?.value.trim() || "";
      const publishedRecord = await request("/api/knowledge/publish", {
        method: "POST",
        body: JSON.stringify({
          proposalId,
          category,
          entity
        })
      });
      const updated = updateLocalProposal(proposalId, {
        rankedCoachWording: wording,
        approvalStatus: "published",
        publishedAt: publishedRecord.publishedAt || new Date().toISOString(),
        publishedCategory: category,
        publishedEntity: entity
      }, publishedRecord);
      if (!updated) await load({ force: true, allowDuringProposalAction: true });
      setStatus("The reviewed insight is now visible in the Library.", "ready");
      globalThis.dispatchEvent(new CustomEvent("rankedcoach:knowledge-updated"));
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
  captureProposalDraft();
  void load({ force: true, discardDrafts: true });
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
  if (control.matches("[data-knowledge-category]")) draft.category = control.value;
  if (control.matches("[data-knowledge-entity]")) draft.entity = control.value;
  if (control.matches("[data-knowledge-original]")) draft.confirmed = control.checked;
  proposalFormDrafts.set(proposalId, draft);
};
proposalList?.addEventListener("change", rememberProposalFormControl);
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
