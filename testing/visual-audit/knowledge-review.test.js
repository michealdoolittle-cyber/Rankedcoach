const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { chromium, webkit } = require("playwright");

const publicRoot = path.resolve(__dirname, "..", "..", "public");
const port = 41831;
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const owner = Object.freeze({
  id: "owner-browser",
  email: "michealdoolittle@gmail.com",
  app_metadata: { role: "owner" },
  user_metadata: { username: "Michael" }
});

function proposal(id, overrides = {}) {
  return {
    id,
    conceptId: `concept-${id}`,
    type: "coaching",
    topic: "map-control",
    entities: ["Bind"],
    state: "single-source",
    approvalStatus: "pending-owner-approval",
    suggestedWording: "Pair the first Showers utility with a teammate who can immediately trade the space you create.",
    whyItMatters: "Coordinated utility turns early space into a repeatable site-entry option.",
    selectionReason: "This passage identifies a repeatable paired-utility decision and explains how the team converts the created space.",
    evidence: [{
      sourceId: "youtube-source-one",
      startSeconds: 72,
      endSeconds: 84,
      url: "https://www.youtube.com/watch?v=abcdefghijk&t=72s"
    }],
    contextNotes: [{
      claimId: `claim-${id}`,
      sourceId: "youtube-source-one",
      sourceTitle: "Bind Control Guide",
      sourcePublisher: "Trusted Coach",
      startSeconds: 72,
      endSeconds: 84,
      url: "https://www.youtube.com/watch?v=abcdefghijk&t=72s",
      contextExcerpt: "Use the first Showers utility with your teammate ready to trade so the space becomes useful instead of isolated pressure.",
      keywords: ["Showers", "utility", "trade"],
      whyItMatters: "The first utility matters only when the team can convert its space.",
      selectionReason: "This passage identifies a repeatable paired-utility decision and explains how the team converts the created space.",
      supportingExcerpts: [
        {
          label: "Lead-in",
          startSeconds: 65,
          text: "The team first establishes Showers pressure without sending the entry player through the choke alone."
        },
        {
          label: "Follow-through",
          startSeconds: 84,
          text: "Once the utility lands, the second player stays close enough to trade and retain the space."
        }
      ],
      confidence: "high",
      extractionKind: "semantic-video-analysis"
    }],
    ...overrides
  };
}

function dashboardFixture() {
  const sources = [
    {
      id: "youtube-source-one",
      platform: "youtube",
      title: "Bind Control Guide",
      publisher: "Trusted Coach",
      sourceKind: "creator-guide",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      transcriptStatus: "acquired-private",
      extractionKind: "semantic-video-analysis",
      cueCount: 438,
      claimCount: 12
    },
    {
      id: "youtube-source-two",
      platform: "youtube",
      title: "A deliberately long educational title that verifies the owner research queue keeps its text readable on narrow mobile screens",
      publisher: "Second Trusted Coach",
      sourceKind: "creator-guide",
      url: "https://www.youtube.com/watch?v=lmnopqrstuv",
      transcriptStatus: "retry-required",
      cueCount: 0,
      claimCount: 0
    },
    ...Array.from({ length: 99 }, (_item, index) => ({
      id: `youtube-source-page-${index + 3}`,
      platform: "youtube",
      title: `Historical Playlist guide ${index + 3}`,
      publisher: `Trusted Coach ${index + 3}`,
      sourceKind: "creator-guide",
      url: `https://www.youtube.com/watch?v=page${String(index + 3).padStart(7, "0")}`,
      transcriptStatus: "acquired-private",
      extractionKind: "caption-rule-analysis",
      cueCount: 200 + index,
      claimCount: 8
    }))
  ];
  const proposals = [
    proposal("proposal-one"),
    proposal("proposal-two", {
      topic: "teamplay",
      entities: [],
      suggestedWording: "Before committing through a narrow choke, name the first trade pair and the utility that protects the second player.",
      whyItMatters: "A clear entry order keeps the team close enough to convert contact without stacking every player into the same danger.",
      contextNotes: [{
        claimId: "claim-proposal-two",
        sourceId: "youtube-source-two",
        sourceTitle: "A deliberately long educational title that verifies the owner research queue keeps its text readable on narrow mobile screens",
        sourcePublisher: "Second Trusted Coach",
        startSeconds: 3661,
        endSeconds: 3674,
        url: "https://www.youtube.com/watch?v=lmnopqrstuv&t=3661s",
        contextExcerpt: "Call the first trade pair before the execute begins and reserve one piece of utility to keep the second player connected through the choke.",
        keywords: ["trade", "utility", "choke"],
        whyItMatters: "The spacing decision determines whether first contact can be converted.",
        confidence: "medium",
        extractionKind: "caption-rule-analysis"
      }]
    }),
    ...Array.from({ length: 49 }, (_item, index) => proposal(
      index === 48 ? "proposal-late" : `proposal-page-${index + 3}`,
      {
        topic: "historical-playlist",
        entities: index === 48 ? ["Bind"] : [],
        suggestedWording: `Historical review wording for proposal ${index + 3} keeps this queue item distinct and ready for owner editing while preserving enough real coaching context to stress the private review workflow.`,
        whyItMatters: `This is the independently reviewable historical Playlist insight ${index + 3}, with the same evidence-rich shape as a production proposal.`
      }
    ))
  ];
  return {
    sources,
    lastRun: { ranAt: "2026-07-24T02:30:00.000Z" },
    review: {
      id: "review-browser",
      createdAt: "2026-07-24T02:30:00.000Z",
      status: "awaiting-owner-review",
      summary: {
        corroborated: 1,
        conflicts: 0,
        libraryConflicts: 0,
        newOpportunities: proposals.length,
        pendingApproval: proposals.length,
        rejected: 0,
        published: 0
      },
      proposals
    },
    published: { updatedAt: null, items: [] }
  };
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", chunk => chunks.push(chunk));
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function json(response, payload, status = 200) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function startServer() {
  const actions = [];
  const reviewRequests = [];
  const state = dashboardFixture();
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${port}`);
      const url = decodeURIComponent(requestUrl.pathname);
      if (url === "/api/content/playlist") return json(response, { items: [], liveStreams: [] });
      if (url === "/api/content/knowledge") return json(response, { updatedAt: null, items: [] });
      if (url === "/api/content/skin-media") return json(response, { matches: {} });
      if (url === "/api/knowledge/review" && request.method === "GET") {
        assert.equal(request.headers.authorization, "Bearer owner-browser-token");
        const proposalOffset = Math.max(0, Number(requestUrl.searchParams.get("proposalOffset") || 0));
        const proposalLimit = Math.max(1, Number(requestUrl.searchParams.get("proposalLimit") || 50));
        const proposalBucket = requestUrl.searchParams.get("proposalBucket") || "review";
        const sourceOffset = Math.max(0, Number(requestUrl.searchParams.get("sourceOffset") || 0));
        const sourceLimit = Math.max(1, Number(requestUrl.searchParams.get("sourceLimit") || 100));
        const bucketForStatus = status => {
          if (status === "rejected") return "rejected";
          if (status === "published" || status === "approved") return "approved";
          return "review";
        };
        const bucketCounts = state.review.proposals.reduce((counts, item) => {
          counts[bucketForStatus(item.approvalStatus)] += 1;
          return counts;
        }, { review: 0, approved: 0, rejected: 0 });
        const bucketProposals = state.review.proposals
          .filter(item => bucketForStatus(item.approvalStatus) === proposalBucket);
        reviewRequests.push({ proposalBucket, proposalOffset, proposalLimit, sourceOffset, sourceLimit });
        return json(response, {
          sourceSummary: {
            total: state.sources.length,
            processed: state.sources.filter(source => source.transcriptStatus === "acquired-private").length,
            waiting: state.sources.filter(source => source.transcriptStatus !== "acquired-private").length
          },
          sourcePage: {
            offset: sourceOffset,
            limit: sourceLimit,
            total: state.sources.length,
            hasMore: sourceOffset + sourceLimit < state.sources.length
          },
          sources: state.sources.slice(sourceOffset, sourceOffset + sourceLimit),
          lastRun: state.lastRun,
          review: {
            ...state.review,
            page: {
              offset: proposalOffset,
              limit: proposalLimit,
              total: bucketProposals.length,
              hasMore: proposalOffset + proposalLimit < bucketProposals.length,
              bucket: proposalBucket,
              bucketCounts
            },
            proposals: bucketProposals.slice(proposalOffset, proposalOffset + proposalLimit)
          },
          published: state.published
        });
      }
      if (url.startsWith("/api/knowledge/") && request.method === "POST") {
        assert.equal(request.headers.authorization, "Bearer owner-browser-token");
        const body = await readJson(request);
        actions.push({ path: url, body });
        const item = state.review.proposals.find(candidate => candidate.id === body.proposalId);
        if (url === "/api/knowledge/run") {
          return json(response, {
            processed: [{ sourceId: "youtube-source-one", status: "acquired-private", claims: 12 }]
          });
        }
        if (item && url === "/api/knowledge/draft") {
          if (item.id === "proposal-page-10") {
            await new Promise(resolve => setTimeout(resolve, 350));
          }
          item.rankedCoachWording = body.rankedCoachWording;
          item.approvalStatus = "draft";
          return json(response, { proposalId: item.id, status: "draft-saved" });
        }
        if (item && url === "/api/knowledge/approve") {
          item.rankedCoachWording = body.rankedCoachWording;
          item.approvalStatus = "approved";
          item.approvedType = body.type;
          item.approvedTopic = body.topic;
          item.approvedCategory = body.category;
          item.approvedEntity = body.entity;
          item.approvedAt = "2026-07-24T02:39:00.000Z";
          return json(response, {
            proposalId: item.id,
            approvedAt: item.approvedAt,
            type: item.approvedType,
            topic: item.approvedTopic,
            category: item.approvedCategory,
            entity: item.approvedEntity,
            status: "approved-for-manual-library-promotion"
          });
        }
        if (item && url === "/api/knowledge/approved-target") {
          if (item.approvalStatus !== "approved") {
            return json(response, { error: "Only an owner-approved insight can have its Library tags saved." }, 400);
          }
          item.rankedCoachWording = body.rankedCoachWording || item.rankedCoachWording;
          item.approvedType = body.type;
          item.approvedTopic = body.topic;
          item.approvedCategory = body.category;
          item.approvedEntity = body.entity;
          return json(response, {
            proposalId: item.id,
            rankedCoachWording: item.rankedCoachWording,
            type: item.approvedType,
            topic: item.approvedTopic,
            category: item.approvedCategory,
            entity: item.approvedEntity,
            status: "approved-target-saved"
          });
        }
        if (item && url === "/api/knowledge/discard") {
          if (item.approvalStatus !== "approved") {
            return json(response, { error: "Only approved insights can be discarded back to Review." }, 400);
          }
          item.rankedCoachWording = body.rankedCoachWording || item.rankedCoachWording;
          item.approvalStatus = "draft";
          item.approvedType = null;
          item.approvedTopic = null;
          item.approvedCategory = null;
          item.approvedEntity = null;
          return json(response, { proposalId: item.id, status: "discarded-to-review" });
        }
        if (item && url === "/api/knowledge/publish") {
          if (item.approvalStatus !== "approved") {
            return json(response, { error: "Only an owner-approved proposal can be published." }, 400);
          }
          item.approvalStatus = "published";
          item.publishedType = body.type;
          item.publishedTopic = body.topic;
          item.publishedCategory = body.category;
          item.publishedEntity = body.entity;
          state.published.items = [{
            id: item.id,
            wording: item.rankedCoachWording,
            type: body.type,
            topic: body.topic,
            category: body.category,
            entity: body.entity,
            publishedAt: "2026-07-24T02:40:00.000Z",
            status: "published"
          }];
          return json(response, state.published.items[0]);
        }
        if (item && url === "/api/knowledge/reject") {
          item.approvalStatus = "rejected";
          item.rejectionReason = body.reason;
          return json(response, { proposalId: item.id, status: "rejected" });
        }
        if (item && url === "/api/knowledge/unpublish") {
          item.approvalStatus = "approved";
          state.published.items = state.published.items.filter(entry => entry.id !== item.id);
          return json(response, { proposalId: item.id, status: "unpublished" });
        }
        if (url === "/api/knowledge/clear-rejected") {
          const before = state.review.proposals.length;
          state.review.proposals = state.review.proposals.filter(proposal => proposal.approvalStatus !== "rejected");
          return json(response, { removed: before - state.review.proposals.length, status: "rejected-cleared" });
        }
        return json(response, { ok: true });
      }
      const fileUrl = url === "/" ? "/index.html" : url;
      const filePath = path.resolve(publicRoot, `.${fileUrl}`);
      if (!filePath.startsWith(publicRoot)) {
        response.writeHead(403);
        return response.end("Forbidden");
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404);
          return response.end("Not found");
        }
        response.writeHead(200, {
          "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(data);
      });
    } catch (error) {
      json(response, { error: error.message }, 500);
    }
  });
  return new Promise(resolve => {
    server.listen(port, "127.0.0.1", () => resolve({ server, actions, reviewRequests, state }));
  });
}

function ownerSupabaseStub() {
  return `
    const owner = ${JSON.stringify(owner)};
    const session = { access_token: "owner-browser-token", user: owner };
    globalThis.supabase = {
      createClient() {
        const query = {
          select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
          then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
          upsert: async () => ({ data: null, error: null }),
          insert: async () => ({ data: null, error: null }),
          update() { return this; }, delete() { return this; }
        };
        return {
          auth: {
            getSession: async () => ({ data: { session }, error: null }),
            getUser: async () => ({ data: { user: owner }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", session), 0);
              return { data: { subscription: { unsubscribe() {} } } };
            },
            signOut: async () => ({ error: null }),
            mfa: {
              listFactors: async () => ({ data: { all: [] }, error: null }),
              getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null })
            }
          },
          from() { return Object.create(query); },
          functions: { invoke: async () => ({ data: null, error: null }) }
        };
      }
    };
  `;
}

async function seed(page) {
  await page.addInitScript(() => {
    localStorage.setItem("valtracker_entry_choice_v1", "auth");
    localStorage.setItem("valtracker_active_profile_id", "knowledge-owner-profile");
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
      id: "knowledge-owner-profile",
      name: "Knowledge Owner",
      accountName: "Knowledge Owner",
      region: "NA",
      matches: []
    }]));
  });
}

async function dismissTransientModals(page) {
  await page.waitForTimeout(700);
  for (const selector of ["#dailyWarmupSkip", "#riotProfilePromptSkip"]) {
    if (await page.locator(selector).isVisible().catch(() => false)) await page.click(selector);
  }
}

async function activateControl(page, locator, mobile, label = "control") {
  await locator.scrollIntoViewIfNeeded();
  if (!mobile) {
    await locator.click();
    return;
  }
  const box = await locator.boundingBox();
  assert.ok(box, `${label} has no touch target.`);
  const hit = await page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y);
    return {
      tag: element?.tagName || "",
      text: element?.textContent?.trim() || "",
      disabled: Boolean(element?.closest?.("button")?.disabled)
    };
  }, {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2
  });
  assert.equal(hit.disabled, false, `${label} is disabled at its touch point: ${JSON.stringify(hit)}`);
  await locator.tap();
}

async function swipeResearchBody(page) {
  const body = page.locator("#accountSupportModal .account-support-modal-body");
  const box = await body.boundingBox();
  assert.ok(box, "Research scroll body has no mobile bounding box.");
  const before = await body.evaluate(element => element.scrollTop);
  const x = box.x + box.width * .5;
  const startY = Math.min(box.y + box.height - 80, box.y + box.height * .78);
  const endY = Math.max(box.y + 100, box.y + box.height * .28);
  const browserName = page.context().browser()?.browserType().name();
  if (browserName === "chromium") {
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y: startY, id: 1, radiusX: 4, radiusY: 4, force: .5 }]
    });
    for (let step = 1; step <= 6; step += 1) {
      const y = startY + ((endY - startY) * step / 6);
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: .5 }]
      });
      await page.waitForTimeout(16);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await body.evaluate((element, distance) => {
      element.scrollTop += distance;
      element.dispatchEvent(new Event("scroll", { bubbles: false }));
    }, startY - endY);
  }
  await page.waitForTimeout(220);
  const after = await body.evaluate(element => element.scrollTop);
  assert.ok(after > before + 100, `Research touch swipe did not scroll: ${JSON.stringify({ before, after })}`);
}

async function openResearch(page, mobile) {
  await page.waitForFunction(() => !document.getElementById("accountSupportResearchTab")?.hidden);
  if (mobile) {
    await activateControl(page, page.locator("#mobileHeaderSettingsBtn"), true, "mobile settings");
    // Mobile browsers can consume the first synthetic tap while the header is
    // being promoted into its fixed layer. The real control remains the same
    // profile-dropdown toggle, so retry it directly instead of treating that
    // compositor timing as a Research workflow failure.
    if (!await page.locator("#profileDropdown.open").isVisible().catch(() => false)) {
      await page.evaluate(() => {
        const menu = document.getElementById("profileDropdown");
        if (menu && menu.parentElement !== document.body) document.body.appendChild(menu);
        document.getElementById("profileDropdownToggle")?.click();
      });
    }
  } else {
    await page.click("#profileDropdownToggle");
  }
  await page.locator("#profileDropdown.open").waitFor({ state: "visible" });
  await activateControl(page, page.locator("#pdAccountSupportBtn"), mobile, "Account and Support");
  await page.locator('#accountSupportModal.active[aria-hidden="false"]').waitFor({ state: "visible" });
  await activateControl(page, page.locator("#accountSupportResearchTab"), mobile, "Research tab");
  await page.locator(".knowledge-proposal-card").first().waitFor({ state: "visible" });
}

async function assertNoOverflow(page, mobile) {
  const selectors = [
    "#knowledgeResearchPanel",
    ".knowledge-active-review",
    ".knowledge-review-queue",
    ".knowledge-review-queue-item",
    ".knowledge-proposal-card",
    ".knowledge-context-notes article",
    ".knowledge-proposal-actions"
  ];
  for (const selector of selectors) {
    const results = await page.locator(selector).evaluateAll(elements => elements.map(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth
    })));
    for (const result of results) {
      assert.ok(result.scrollWidth <= result.clientWidth + 1, `${selector} overflowed: ${JSON.stringify(result)}`);
    }
  }
  if (mobile) {
    const buttonRects = await page.locator(".knowledge-proposal-actions button").evaluateAll(buttons => buttons.map(button => {
      const rect = button.getBoundingClientRect();
      const parent = button.parentElement.getBoundingClientRect();
      return { height: rect.height, left: rect.left, right: rect.right, parentLeft: parent.left, parentRight: parent.right };
    }));
    buttonRects.forEach(rect => {
      assert.ok(rect.height >= 38, `Mobile review action is too short: ${JSON.stringify(rect)}`);
      assert.ok(rect.left >= rect.parentLeft - 1 && rect.right <= rect.parentRight + 1, `Mobile review action escaped its card: ${JSON.stringify(rect)}`);
    });
    const queueRects = await page.locator(".knowledge-review-queue-item").evaluateAll(buttons => buttons.map(button => {
      const rect = button.getBoundingClientRect();
      const parent = button.parentElement.getBoundingClientRect();
      return { height: rect.height, left: rect.left, right: rect.right, parentLeft: parent.left, parentRight: parent.right };
    }));
    queueRects.forEach(rect => {
      assert.ok(rect.height >= 44, `Mobile queue item is too short: ${JSON.stringify(rect)}`);
      assert.ok(rect.left >= rect.parentLeft - 1 && rect.right <= rect.parentRight + 1, `Mobile queue item escaped its list: ${JSON.stringify(rect)}`);
    });
  }
}

async function researchScrollState(page) {
  return page.evaluate(() => {
    const modal = document.getElementById("accountSupportModal");
    const candidates = [
      ["document", document.scrollingElement],
      ["overlay", modal],
      ["modal", modal?.querySelector(".lens-modal")],
      ["body", modal?.querySelector(".lens-modal-body")],
      ["panels", modal?.querySelector(".account-support-panels")],
      ["research", modal?.querySelector("#knowledgeResearchPanel")]
    ];
    return Object.fromEntries(candidates
      .filter(([_key, element]) => element)
      .map(([key, element]) => [key, {
        scrollTop: Number(element.scrollTop || 0),
        maxScrollTop: Math.max(0, Number(element.scrollHeight || 0) - Number(element.clientHeight || 0))
      }]));
  });
}

function assertScrollPreserved(before, after, label) {
  for (const [key, value] of Object.entries(before)) {
    const expected = Math.min(value.scrollTop, Number(after[key]?.maxScrollTop || 0));
    assert.ok(
      Math.abs(Number(after[key]?.scrollTop || 0) - expected) <= 2,
      `${label} changed ${key} scroll position: ${JSON.stringify({ before, after })}`
    );
  }
}

async function assertResponsiveTyping(page, textarea, addition, options = {}) {
  const initialValue = await textarea.inputValue();
  await textarea.evaluate((element, expectedSamples) => {
    const starts = [];
    const samples = [];
    const beforeInput = () => starts.push(performance.now());
    const input = () => {
      const startedAt = starts.shift() ?? performance.now();
      requestAnimationFrame(() => {
        samples.push(performance.now() - startedAt);
      });
    };
    element.addEventListener("beforeinput", beforeInput);
    element.addEventListener("input", input);
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
    globalThis.__knowledgeTypingProbe = {
      expectedSamples,
      samples,
      cleanup() {
        element.removeEventListener("beforeinput", beforeInput);
        element.removeEventListener("input", input);
      }
    };
  }, addition.length);
  await textarea.pressSequentially(addition, { delay: 20 });
  await page.waitForFunction(expected => (
    (globalThis.__knowledgeTypingProbe?.samples?.length || 0) >= expected
  ), addition.length);
  const result = await page.evaluate(() => {
    const samples = [...(globalThis.__knowledgeTypingProbe?.samples || [])].sort((left, right) => left - right);
    globalThis.__knowledgeTypingProbe?.cleanup?.();
    delete globalThis.__knowledgeTypingProbe;
    const percentile = value => samples[Math.min(samples.length - 1, Math.floor(samples.length * value))] || 0;
    return {
      count: samples.length,
      p50: percentile(.5),
      p95: percentile(.95),
      max: samples.at(-1) || 0
    };
  });
  assert.equal(await textarea.inputValue(), `${initialValue}${addition}`);
  assert.equal(result.count, addition.length, JSON.stringify(result));
  assert.ok(result.p50 <= Number(options.p50 || 60), `Typing median was delayed: ${JSON.stringify(result)}`);
  assert.ok(result.p95 <= Number(options.p95 || 180), `Typing p95 was delayed: ${JSON.stringify(result)}`);
  return result;
}

async function assertActionLatency(page, action, completion, label, limitMs) {
  await action.scrollIntoViewIfNeeded();
  await action.evaluate(button => {
    delete globalThis.__knowledgeActionStartedAt;
    button.addEventListener("click", () => {
      globalThis.__knowledgeActionStartedAt = performance.now();
    }, { capture: true, once: true });
  });
  await completion();
  const elapsed = await page.evaluate(() => {
    const startedAt = Number(globalThis.__knowledgeActionStartedAt);
    return Number.isFinite(startedAt) ? performance.now() - startedAt : null;
  });
  assert.ok(
    Number.isFinite(elapsed) && elapsed >= 0,
    `${label} did not record an in-page action timestamp.`
  );
  assert.ok(elapsed <= limitMs, `${label} took ${elapsed}ms (limit ${limitMs}ms).`);
  return elapsed;
}

async function runViewport(browser, actions, reviewRequests, state, options) {
  const browserName = browser.browserType().name();
  for (const item of state.review.proposals) {
    item.approvalStatus = "pending-owner-approval";
    delete item.rankedCoachWording;
    delete item.rejectionReason;
    delete item.publishedCategory;
    delete item.publishedEntity;
  }
  state.published = { updatedAt: null, items: [] };
  const page = await browser.newPage({
    viewport: options.viewport,
    isMobile: Boolean(options.mobile),
    hasTouch: Boolean(options.mobile),
    deviceScaleFactor: options.mobile ? 2 : 1
  });
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") {
      const location = message.location();
      errors.push(`console: ${message.text()}${location?.url ? ` (${location.url}:${location.lineNumber || 0})` : ""}`);
    }
  });
  page.on("pageerror", error => errors.push(`page: ${error.message}`));
  page.on("response", response => {
    if (response.url().startsWith(`http://127.0.0.1:${port}`) && response.status() >= 400) {
      errors.push(`response ${response.status()}: ${response.url()}`);
    }
  });
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => {
    route.fulfill({ contentType: "text/javascript", body: ownerSupabaseStub() });
  });
  await seed(page);
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 20_000 });
  await dismissTransientModals(page);
  await openResearch(page, options.mobile);

  const proposalPageLimit = options.mobile ? 10 : 50;
  const sourcePageLimit = options.mobile ? 20 : 100;
  assert.equal(await page.locator("#knowledgeResearchPanel.is-active:not([hidden])").count(), 1);
  await page.locator("#knowledgeResearchStatus").waitFor({ state: "visible" });
  assert.match(await page.locator("#knowledgeResearchStatus").textContent(), /Private review review-browser/);
  assert.equal(await page.locator(".knowledge-research-summary > div").count(), 6);
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(await page.locator(".knowledge-review-queue-item").count(), proposalPageLimit);
  assert.equal(await page.locator(".knowledge-review-queue-item[aria-pressed=\"true\"]").count(), 1);
  assert.equal(
    await page.locator(".knowledge-review-queue-item[aria-pressed=\"true\"]").getAttribute("data-knowledge-select-proposal"),
    await page.locator(".knowledge-proposal-card").getAttribute("data-knowledge-proposal")
  );
  assert.equal(
    await page.locator(".knowledge-review-queue").locator("textarea, select, input, blockquote, .knowledge-context-note").count(),
    0,
    "The lightweight queue rendered expensive review controls or transcript context."
  );
  assert.equal(await page.locator(".knowledge-review-bins button").count(), 3);
  assert.equal(await page.locator('[data-knowledge-bucket="review"]').getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator(".knowledge-source-queue article").count(), sourcePageLimit);
  assert.equal(await page.locator(".knowledge-proposal-card").first().locator(".knowledge-context-notes article").count(), 1);
  assert.equal(await page.locator(".knowledge-proposal-card").first().locator(":scope > p").count(), 0);
  assert.equal(await page.locator(".knowledge-proposal-card").first().locator(".knowledge-supporting-context blockquote").count(), 2);
  assert.match(await page.locator(".knowledge-proposal-card").first().locator(".knowledge-selection-rationale").textContent(), /repeatable paired-utility decision/i);
  assert.match(await page.locator(".knowledge-proposal-card").first().locator("mark").allTextContents().then(values => values.join(" ")), /Showers|utility/i);
  assert.equal(await page.locator(".knowledge-proposal-card").first().locator(".knowledge-context-note-head a").textContent(), "1:12");
  assert.equal(
    await page.locator(".knowledge-proposal-card").first().locator("[data-knowledge-wording]").inputValue(),
    "Pair the first Showers utility with a teammate who can immediately trade the space you create."
  );
  assert.equal(
    await page.locator(".knowledge-proposal-card").first().locator("[data-knowledge-category], [data-knowledge-entity]").count(),
    2,
    "Review must let the owner correct the Library tags before approval."
  );
  for (const action of ["draft", "approve", "reject"]) {
    assert.equal(await page.locator(`.knowledge-proposal-card [data-knowledge-action="${action}"]`).first().isVisible(), true);
  }
  assert.equal(await page.locator('.knowledge-proposal-card [data-knowledge-action="publish"]').count(), 0);
  assert.equal(
    (await page.locator('.knowledge-proposal-card [data-knowledge-action="approve"]').textContent()).trim(),
    "Approve"
  );

  const unsavedProposalId = await page.locator(".knowledge-proposal-card").getAttribute("data-knowledge-proposal");
  const unsavedWording = "Unsaved owner wording must survive leaving this bin and returning before any draft request is sent.";
  const unsavedActionCount = actions.length;
  await page.locator(`[data-knowledge-proposal="${unsavedProposalId}"] [data-knowledge-wording]`).fill(unsavedWording);
  await activateControl(page, page.locator('[data-knowledge-bucket="approved"]'), options.mobile, "Approved bin for unsaved wording check");
  await page.locator("#knowledgeActiveProposal .knowledge-empty-state").waitFor({ state: "visible" });
  await activateControl(page, page.locator('[data-knowledge-bucket="review"]'), options.mobile, "Return to Review with unsaved wording");
  await page.locator(`[data-knowledge-proposal="${unsavedProposalId}"]`).waitFor({ state: "visible" });
  assert.equal(
    await page.locator(`[data-knowledge-proposal="${unsavedProposalId}"] [data-knowledge-wording]`).inputValue(),
    unsavedWording,
    "Unsaved wording was lost after a Review → Approved → Review round-trip."
  );
  assert.equal(
    await page.locator(`[data-knowledge-select-proposal="${unsavedProposalId}"]`).getAttribute("aria-pressed"),
    "true",
    "The active proposal was not restored with its unsaved wording."
  );
  assert.equal(actions.length, unsavedActionCount, "Switching bins unexpectedly saved unsaved wording.");

  if (options.mobile) {
    const mobileSurfaces = await page.evaluate(() => {
      const overlay = document.getElementById("accountSupportModal");
      const modal = document.querySelector("#accountSupportModal .account-support-modal-card");
      const body = document.querySelector("#accountSupportModal .account-support-modal-body");
      const appRoot = document.querySelector(".app-root");
      const close = document.getElementById("accountSupportClose");
      const overlayStyle = getComputedStyle(overlay);
      const modalStyle = getComputedStyle(modal);
      const bodyStyle = getComputedStyle(body);
      const bodyBackdrop = getComputedStyle(document.body, "::before");
      const rootBackdrop = getComputedStyle(appRoot, "::after");
      const closeRect = close.getBoundingClientRect();
      return {
        researchPerformanceMode: document.body.classList.contains("knowledge-research-active"),
        overlayBackdropFilter: overlayStyle.backdropFilter || overlayStyle.webkitBackdropFilter,
        bodyBackdropFilter: bodyBackdrop.backdropFilter || bodyBackdrop.webkitBackdropFilter,
        rootBackdropFilter: rootBackdrop.backdropFilter || rootBackdrop.webkitBackdropFilter,
        modalOverflowY: modalStyle.overflowY,
        modalHeight: modal.clientHeight,
        modalScrollHeight: modal.scrollHeight,
        bodyOverflowY: bodyStyle.overflowY,
        bodyTouchAction: bodyStyle.touchAction,
        bodyHeight: body.clientHeight,
        bodyScrollHeight: body.scrollHeight,
        closeWidth: closeRect.width,
        closeHeight: closeRect.height
      };
    });
    assert.equal(mobileSurfaces.researchPerformanceMode, true, JSON.stringify(mobileSurfaces));
    assert.equal(mobileSurfaces.overlayBackdropFilter, "none", JSON.stringify(mobileSurfaces));
    assert.equal(mobileSurfaces.bodyBackdropFilter, "none", JSON.stringify(mobileSurfaces));
    assert.equal(mobileSurfaces.rootBackdropFilter, "none", JSON.stringify(mobileSurfaces));
    assert.equal(mobileSurfaces.modalOverflowY, "hidden", JSON.stringify(mobileSurfaces));
    assert.equal(mobileSurfaces.modalScrollHeight, mobileSurfaces.modalHeight, JSON.stringify(mobileSurfaces));
    assert.ok(["auto", "scroll"].includes(mobileSurfaces.bodyOverflowY), JSON.stringify(mobileSurfaces));
    assert.match(mobileSurfaces.bodyTouchAction, /pan-y/, JSON.stringify(mobileSurfaces));
    assert.ok(mobileSurfaces.bodyScrollHeight > mobileSurfaces.bodyHeight, JSON.stringify(mobileSurfaces));
    assert.ok(mobileSurfaces.closeWidth >= 38 && mobileSurfaces.closeHeight >= 38, JSON.stringify(mobileSurfaces));

    await activateControl(page, page.locator('[data-account-support-tab="support"]'), true, "Support tab");
    assert.equal(await page.locator('[data-account-support-panel="support"].is-active').count(), 1);
    await activateControl(page, page.locator('[data-account-support-tab="account"]'), true, "Account tab");
    assert.equal(await page.locator('[data-account-support-panel="account"].is-active').count(), 1);
    await activateControl(page, page.locator("#accountSupportResearchTab"), true, "Research tab");
    await page.locator(".knowledge-proposal-card").first().waitFor({ state: "visible" });
    await swipeResearchBody(page);
  }

  const runCount = actions.length;
  await activateControl(page, page.locator("#knowledgeResearchRun"), options.mobile, "Process Playlist Now");
  for (let attempt = 0; attempt < 100 && actions.length === runCount; attempt += 1) {
    await page.waitForTimeout(25);
  }
  await page.locator("#knowledgeResearchStatus").filter({ hasText: "Private review review-browser" }).waitFor();
  assert.ok(actions.slice(runCount).some(action => (
    action.path === "/api/knowledge/run" && action.body.batchSize === 24
  )), "Process Playlist Now did not call the automatic pipeline.");

  const refreshRequestCount = reviewRequests.length;
  const refreshResponse = page.waitForResponse(response => (
    response.url().includes("/api/knowledge/review") && response.request().method() === "GET"
  ));
  await activateControl(page, page.locator("#knowledgeResearchRefresh"), options.mobile, "Refresh");
  await refreshResponse;
  for (let attempt = 0; attempt < 100 && reviewRequests.length === refreshRequestCount; attempt += 1) {
    await page.waitForTimeout(25);
  }
  await page.waitForTimeout(50);
  assert.ok(reviewRequests.length > refreshRequestCount, "Refresh did not reload the private queue.");
  assert.equal(reviewRequests.at(-1).proposalLimit, proposalPageLimit);
  assert.equal(reviewRequests.at(-1).sourceLimit, sourcePageLimit);

  const sourceQueue = page.locator(".knowledge-source-queue");
  await activateControl(page, sourceQueue.locator("summary"), options.mobile, "Registered research sources");
  assert.equal(await sourceQueue.getAttribute("open"), "");

  const retryActionCount = actions.length;
  await activateControl(page, sourceQueue.locator("[data-knowledge-source-retry]").first(), options.mobile, "Retry source");
  for (let attempt = 0; attempt < 120 && !actions.slice(retryActionCount).some(action => action.path === "/api/knowledge/run"); attempt += 1) {
    await page.waitForTimeout(25);
  }
  assert.ok(actions.slice(retryActionCount).some(action => action.path === "/api/knowledge/retry"), "Retry did not queue the source.");
  assert.ok(actions.slice(retryActionCount).some(action => action.path === "/api/knowledge/run"), "Retry did not restart processing.");
  await page.locator("#knowledgeResearchStatus").filter({ hasText: "Private review review-browser" }).waitFor();

  await activateControl(page, sourceQueue.locator("summary"), options.mobile, "Registered research sources");
  await activateControl(page, sourceQueue.locator("[data-knowledge-source-prefill]").first(), options.mobile, "Manual transcript recovery");
  const transcriptDetails = page.locator(".knowledge-transcript-import");
  assert.equal(await transcriptDetails.getAttribute("open"), "");
  await activateControl(page, transcriptDetails.locator("summary"), options.mobile, "Manual transcript recovery disclosure");
  assert.equal(await transcriptDetails.getAttribute("open"), null);
  await activateControl(page, transcriptDetails.locator("summary"), options.mobile, "Manual transcript recovery disclosure");
  assert.equal(await transcriptDetails.getAttribute("open"), "");
  assert.match(await page.locator("#knowledgeSourceTitle").inputValue(), /deliberately long educational title/i);
  await page.locator("#knowledgeSourceEntities").fill("Bind, Viper");
  await page.locator("#knowledgeTranscriptText").fill("00:12 Pair the first utility with a teammate ready to trade.\n00:27 Keep the spacing close through the choke.");
  const transcriptActionCount = actions.length;
  await activateControl(page, transcriptDetails.locator('button[type="submit"]'), options.mobile, "Process Manual Transcript");
  for (let attempt = 0; attempt < 100 && !actions.slice(transcriptActionCount).some(action => action.path === "/api/knowledge/transcripts"); attempt += 1) {
    await page.waitForTimeout(25);
  }
  assert.ok(actions.slice(transcriptActionCount).some(action => action.path === "/api/knowledge/transcripts"), "Manual transcript was not submitted.");
  await page.locator("#knowledgeResearchStatus").filter({ hasText: "Private review review-browser" }).waitFor();

  await activateControl(page, sourceQueue.locator("summary"), options.mobile, "Registered research sources");
  const sourceRequestCount = reviewRequests.length;
  await activateControl(page, page.locator("[data-knowledge-load-sources]"), options.mobile, "Load more sources");
  await page.waitForFunction(expected => document.querySelectorAll(".knowledge-source-queue article").length === expected, Math.min(101, sourcePageLimit * 2));
  assert.equal(await sourceQueue.getAttribute("open"), "", "Source disclosure closed after loading another page.");
  assert.deepEqual(reviewRequests[sourceRequestCount], {
    proposalBucket: "review",
    proposalOffset: 0,
    proposalLimit: proposalPageLimit,
    sourceOffset: sourcePageLimit,
    sourceLimit: sourcePageLimit
  });
  const sourceIds = await page.locator(".knowledge-source-queue article").evaluateAll(articles => (
    articles.map(article => article.querySelector("strong")?.textContent)
  ));
  assert.equal(new Set(sourceIds).size, Math.min(101, sourcePageLimit * 2), "Source pagination appended a duplicate row.");

  const activeBeforeProposalPagination = await page.locator(".knowledge-proposal-card").getAttribute("data-knowledge-proposal");
  const proposalRequestCount = reviewRequests.length;
  await activateControl(page, page.locator("[data-knowledge-load-proposals]"), options.mobile, "Load more proposals");
  await page.waitForFunction(expected => document.querySelectorAll(".knowledge-review-queue-item").length === expected, Math.min(51, proposalPageLimit * 2));
  assert.deepEqual(reviewRequests[proposalRequestCount], {
    proposalBucket: "review",
    proposalOffset: proposalPageLimit,
    proposalLimit: proposalPageLimit,
    sourceOffset: 0,
    sourceLimit: sourcePageLimit
  });
  const proposalIds = await page.locator(".knowledge-review-queue-item").evaluateAll(items => (
    items.map(item => item.dataset.knowledgeSelectProposal)
  ));
  assert.equal(new Set(proposalIds).size, Math.min(51, proposalPageLimit * 2), "Proposal pagination appended a duplicate queue row.");
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1, "Proposal pagination rendered more than one detailed review.");
  assert.equal(
    await page.locator(".knowledge-proposal-card").getAttribute("data-knowledge-proposal"),
    activeBeforeProposalPagination,
    "Proposal pagination replaced the active review."
  );
  assert.equal(
    await page.locator(".knowledge-review-queue-item[aria-pressed=\"true\"]").getAttribute("data-knowledge-select-proposal"),
    activeBeforeProposalPagination,
    "Proposal pagination lost the selected queue item."
  );
  assert.equal(await sourceQueue.getAttribute("open"), "", "Proposal pagination closed the source disclosure.");

  const first = page.locator(".knowledge-proposal-card").first();
  if (options.mobile) {
    await first.locator(".knowledge-context-notes").evaluate(context => {
      const body = document.querySelector("#accountSupportModal .lens-modal-body");
      if (!body) return;
      const bodyRect = body.getBoundingClientRect();
      const contextRect = context.getBoundingClientRect();
      body.scrollTop += contextRect.top - bodyRect.top - 72;
    });
    const mobileEvidenceGeometry = await first.evaluate(card => {
      const context = card.querySelector(".knowledge-context-notes")?.getBoundingClientRect();
      const actions = card.querySelector(".knowledge-proposal-actions")?.getBoundingClientRect();
      return {
        context: context && { top: context.top, bottom: context.bottom },
        actions: actions && { top: actions.top, bottom: actions.bottom },
        viewportHeight: window.innerHeight
      };
    });
    assert.ok(mobileEvidenceGeometry.context?.top >= 0, JSON.stringify(mobileEvidenceGeometry));
    assert.ok(mobileEvidenceGeometry.context?.bottom <= mobileEvidenceGeometry.viewportHeight, JSON.stringify(mobileEvidenceGeometry));
    await first.locator(".knowledge-proposal-actions").scrollIntoViewIfNeeded();
    const actionBottom = await first.locator(".knowledge-proposal-actions").evaluate(actions => actions.getBoundingClientRect().bottom);
    assert.ok(actionBottom <= mobileEvidenceGeometry.viewportHeight, JSON.stringify({ actionBottom, viewportHeight: mobileEvidenceGeometry.viewportHeight }));
    await page.screenshot({ path: options.screenshot, fullPage: false });
  } else {
    await first.scrollIntoViewIfNeeded();
    await page.screenshot({ path: options.screenshot, fullPage: false });
  }

  const actionProposalId = "proposal-page-10";
  const nextProposalId = "proposal-page-11";
  const loadedProposalCount = Math.min(51, proposalPageLimit * 2);
  const loadedSourceCount = Math.min(101, sourcePageLimit * 2);
  const selectionRequestCount = reviewRequests.length;
  await activateControl(
    page,
    page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`),
    options.mobile,
    `Select ${actionProposalId}`
  );
  await page.locator(`[data-knowledge-proposal="${actionProposalId}"]`).waitFor({ state: "visible" });
  assert.equal(reviewRequests.length, selectionRequestCount, "Selecting a loaded proposal made an unnecessary network request.");
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(
    await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`).getAttribute("aria-pressed"),
    "true"
  );
  assert.equal(await page.locator(".knowledge-context-notes article").count(), 1);

  const activeWording = page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-wording]`);
  const typingAddition = " Add one clear trade condition before the team commits.";
  const typingLatency = await assertResponsiveTyping(page, activeWording, typingAddition, {
    p50: browserName === "webkit" ? 100 : (options.mobile ? 70 : 60),
    p95: options.mobile ? 200 : 180
  });
  assert.ok(typingLatency.max <= (options.mobile ? 350 : 300), `Typing had an extreme delayed frame: ${JSON.stringify(typingLatency)}`);
  const draftWording = await activeWording.inputValue();
  await page.locator(`[data-knowledge-proposal="${actionProposalId}"] .knowledge-review-state.is-draft`).waitFor({ state: "visible" });
  assert.equal(
    (await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"] b`).textContent()).trim(),
    "draft",
    "Editing a review proposal did not immediately tag it as a draft."
  );

  const sourceIdentity = `source-queue-${options.mobile ? "mobile" : "desktop"}`;
  await sourceQueue.evaluate((element, identity) => {
    element.dataset.knowledgeTestIdentity = identity;
  }, sourceIdentity);
  const late = page.locator(`[data-knowledge-proposal="${actionProposalId}"]`);
  const draftButton = late.locator('[data-knowledge-action="draft"]');
  await draftButton.scrollIntoViewIfNeeded();
  const beforeDraftScroll = await researchScrollState(page);
  const draftRequestsBefore = actions.filter(action => (
    action.path === "/api/knowledge/draft" && action.body.proposalId === actionProposalId
  )).length;
  const navigationControlSelectors = [
    ".knowledge-review-queue-item",
    "[data-knowledge-bucket]",
    "[data-account-support-tab]",
    "#knowledgeResearchRefresh",
    "#knowledgeResearchRun",
    "[data-knowledge-load-proposals]",
    "[data-knowledge-load-sources]"
  ];
  await assertActionLatency(
    page,
    draftButton,
    async () => {
      await draftButton.evaluate(button => {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      });
      for (let attempt = 0; attempt < 100 && actions.filter(action => (
        action.path === "/api/knowledge/draft" && action.body.proposalId === actionProposalId
      )).length === draftRequestsBefore; attempt += 1) {
        await page.waitForTimeout(10);
      }
      const busyState = await page.evaluate(() => {
        const panel = document.getElementById("knowledgeResearchPanel");
        const card = document.querySelector("[data-knowledge-active-review] [data-knowledge-proposal]");
        return {
          panelAriaBusy: panel?.getAttribute("aria-busy"),
          cardAriaBusy: card?.getAttribute("aria-busy"),
          feedback: card?.querySelector("[data-knowledge-action-feedback]")?.textContent || "",
          disabledActions: card?.querySelectorAll("[data-knowledge-action]:disabled").length || 0
        };
      });
      assert.equal(busyState.panelAriaBusy, "", `Research navigation was not marked busy: ${JSON.stringify(busyState)}`);
      assert.equal(await late.getAttribute("aria-busy"), "");
      assert.equal(
        await late.locator("[data-knowledge-action]:not(:disabled)").count(),
        0,
        "A proposal action remained enabled while Draft was in flight."
      );
      for (const selector of navigationControlSelectors) {
        const controls = page.locator(selector);
        const count = await controls.count();
        if (!count) continue;
        assert.equal(
          await controls.evaluateAll(elements => elements.every(element => element.disabled)),
          true,
          `${selector} remained interactive while Draft was in flight.`
        );
      }
      assert.equal(
        actions.filter(action => action.path === "/api/knowledge/draft" && action.body.proposalId === actionProposalId).length,
        draftRequestsBefore + 1,
        "The delayed Draft request did not begin."
      );
      await draftButton.evaluate(button => {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(40);
      assert.equal(
        actions.filter(action => action.path === "/api/knowledge/draft" && action.body.proposalId === actionProposalId).length,
        draftRequestsBefore + 1,
        "A duplicate Draft request fired while the first request was pending."
      );
      await page.locator(`[data-knowledge-proposal="${actionProposalId}"] .knowledge-review-state.is-draft`).waitFor({ state: "visible" });
    },
    "Saving a draft",
    options.mobile ? 1100 : 850
  );
  await page.waitForFunction(() => !document.getElementById("knowledgeResearchPanel")?.hasAttribute("aria-busy"));
  for (const selector of navigationControlSelectors) {
    const controls = page.locator(selector);
    const count = await controls.count();
    if (!count) continue;
    assert.equal(
      await controls.evaluateAll(elements => elements.every(element => !element.disabled)),
      true,
      `${selector} did not re-enable after Draft succeeded.`
    );
  }
  assert.equal(
    await page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-action]:not(:disabled)`).count(),
    3,
    "Proposal actions did not re-enable after Draft succeeded."
  );
  assertScrollPreserved(beforeDraftScroll, await researchScrollState(page), "Saving a draft");
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(await page.locator(".knowledge-review-queue-item").count(), loadedProposalCount);
  assert.equal(await page.locator(".knowledge-source-queue article").count(), loadedSourceCount);
  assert.equal(await sourceQueue.getAttribute("open"), "");
  assert.equal(await sourceQueue.getAttribute("data-knowledge-test-identity"), sourceIdentity, "Saving a draft rebuilt the full source queue.");
  assert.equal(
    await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`).getAttribute("aria-pressed"),
    "true",
    "Saving a draft did not retain the active review."
  );
  assert.equal(
    await page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-wording]`).inputValue(),
    draftWording,
    "Saving a draft lost the edited wording."
  );
  assert.match(
    await page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-action-feedback]`).textContent(),
    /remains in To Review/i
  );
  assert.ok(actions.some(action => (
    action.path === "/api/knowledge/draft"
    && action.body.proposalId === actionProposalId
    && action.body.rankedCoachWording === draftWording
  )));

  const drafted = page.locator(`[data-knowledge-proposal="${actionProposalId}"]`);
  await drafted.locator("[data-knowledge-type]").selectOption("coaching");
  await drafted.locator("[data-knowledge-topic]").selectOption("general");
  await drafted.locator("[data-knowledge-category]").selectOption("map");
  await drafted.locator("[data-knowledge-entity]").fill("Bind");
  assert.equal(
    (await drafted.locator("[data-knowledge-proposal-heading-classification]").textContent()).trim(),
    "coaching · general",
    "Editing type/topic did not immediately update the active proposal heading."
  );
  assert.equal(
    (await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"] [data-knowledge-queue-classification]`).textContent()).trim(),
    "coaching · general",
    "Editing type/topic did not immediately update the queue item classification."
  );
  assert.equal(
    (await drafted.locator("[data-knowledge-proposal-heading-entity]").textContent()).trim(),
    "Bind",
    "Editing the entity tag did not immediately update the active proposal heading."
  );
  assert.equal(
    (await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"] [data-knowledge-queue-entity]`).textContent()).trim(),
    "Bind",
    "Editing the entity tag did not immediately update the queue item heading."
  );
  await drafted.locator("[data-knowledge-original]").check();
  const reviewRequestsBeforeApproval = reviewRequests.length;
  const approvalRequestsBefore = actions.filter(action => (
    action.path === "/api/knowledge/approve" && action.body.proposalId === actionProposalId
  )).length;
  const publicationRequestsBefore = actions.filter(action => (
    action.path === "/api/knowledge/publish" && action.body.proposalId === actionProposalId
  )).length;
  const approveButton = drafted.locator('[data-knowledge-action="approve"]');
  await assertActionLatency(
    page,
    approveButton,
    async () => {
      await activateControl(page, approveButton, options.mobile, "Approve");
      await page.locator(`[data-knowledge-proposal="${nextProposalId}"]`).waitFor({ state: "visible" });
    },
    "Approving an insight",
    options.mobile ? 900 : 650
  );
  assert.equal(
    reviewRequests.length,
    reviewRequestsBeforeApproval,
    "Approval required a full queue refresh instead of updating the Review and Approved bins immediately."
  );
  assert.equal(await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`).count(), 0);
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(await page.locator(".knowledge-review-queue-item").count(), loadedProposalCount - 1);
  assert.equal(
    await page.locator(".knowledge-review-queue-item[aria-pressed=\"true\"]").getAttribute("data-knowledge-select-proposal"),
    nextProposalId,
    "Approval did not advance to the adjacent review proposal."
  );
  assert.match(await page.locator('[data-knowledge-bucket="approved"]').textContent(), /1/);
  assert.equal(await page.locator("[data-knowledge-summary-published]").textContent(), "0");
  assert.equal(state.published.items.length, 0, "Approval unexpectedly wrote to the public knowledge index.");
  const approvalActions = actions.filter(action => (
    action.path === "/api/knowledge/approve" && action.body.proposalId === actionProposalId
  ));
  assert.equal(approvalActions.length, approvalRequestsBefore + 1);
  assert.equal(approvalActions.at(-1).body.rankedCoachWording, draftWording);
  assert.equal(approvalActions.at(-1).body.confirmOriginalWording, true);
  assert.equal(approvalActions.at(-1).body.type, "coaching");
  assert.equal(approvalActions.at(-1).body.topic, "general");
  assert.equal(approvalActions.at(-1).body.category, "map");
  assert.equal(approvalActions.at(-1).body.entity, "Bind");
  assert.equal(
    actions.filter(action => action.path === "/api/knowledge/publish" && action.body.proposalId === actionProposalId).length,
    publicationRequestsBefore,
    "The Review approval action also published the insight."
  );

  await activateControl(page, page.locator('[data-knowledge-bucket="approved"]'), options.mobile, "Approved bin");
  await page.locator(`[data-knowledge-proposal="${actionProposalId}"] .knowledge-review-state.is-approved`).waitFor({ state: "visible" });
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(await page.locator(".knowledge-review-queue-item").count(), 1);
  assert.equal(
    await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`).getAttribute("aria-pressed"),
    "true"
  );
  const approvedCard = page.locator(`[data-knowledge-proposal="${actionProposalId}"]`);
  assert.equal(await approvedCard.locator("[data-knowledge-wording]").getAttribute("readonly"), null);
  assert.equal(await approvedCard.locator('[data-knowledge-action="approve"]').count(), 0);
  assert.equal(await approvedCard.locator('[data-knowledge-action="draft"]').count(), 0);
  assert.equal(await approvedCard.locator('[data-knowledge-action="reject"]').count(), 0);
  assert.equal(
    (await approvedCard.locator('[data-knowledge-action="save-target"]').textContent()).trim(),
    "Save changes"
  );
  assert.equal(
    (await approvedCard.locator('[data-knowledge-action="publish"]').textContent()).trim(),
    "Publish to Library"
  );
  const categoryDisplay = await approvedCard.locator("[data-knowledge-category]").evaluate(select => {
    const style = getComputedStyle(select);
    const rect = select.getBoundingClientRect();
    return {
      value: select.value,
      selectedText: select.selectedOptions[0]?.textContent || "",
      color: style.color,
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      width: rect.width,
      height: rect.height,
      opacity: Number.parseFloat(style.opacity),
      visibility: style.visibility,
      clipPath: style.clipPath
    };
  });
  assert.equal(categoryDisplay.value, "map");
  assert.equal(categoryDisplay.selectedText, "Map");
  assert.ok(categoryDisplay.fontSize >= (options.mobile ? 16 : 14), JSON.stringify(categoryDisplay));
  assert.ok(categoryDisplay.lineHeight >= categoryDisplay.fontSize, JSON.stringify(categoryDisplay));
  assert.notEqual(categoryDisplay.color, "rgba(0, 0, 0, 0)");
  assert.equal(categoryDisplay.opacity, 1);
  assert.equal(categoryDisplay.visibility, "visible");
  assert.equal(categoryDisplay.clipPath, "none");
  assert.ok(categoryDisplay.width >= 140 && categoryDisplay.height >= 40, JSON.stringify(categoryDisplay));
  await approvedCard.locator("[data-knowledge-type]").selectOption("coaching");
  await approvedCard.locator("[data-knowledge-topic]").selectOption("mechanics");
  await approvedCard.locator("[data-knowledge-category]").selectOption("map");
  await approvedCard.locator("[data-knowledge-entity]").fill("Bind");
  await approvedCard.locator("[data-knowledge-wording]").fill("Keep the approved Bind insight private until the owner publishes it.");
  const targetSaveRequestsBefore = actions.filter(action => (
    action.path === "/api/knowledge/approved-target"
    && action.body.proposalId === actionProposalId
  )).length;
  const saveTagsButton = approvedCard.locator('[data-knowledge-action="save-target"]');
  await assertActionLatency(
    page,
    saveTagsButton,
    async () => {
      await activateControl(page, saveTagsButton, options.mobile, "Save changes");
      await page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-action-feedback]`).filter({ hasText: /changes saved privately/i }).waitFor({ state: "visible" });
    },
    "Saving approved changes",
    options.mobile ? 900 : 650
  );
  const targetSaveActions = actions.filter(action => (
    action.path === "/api/knowledge/approved-target"
    && action.body.proposalId === actionProposalId
  ));
  assert.equal(targetSaveActions.length, targetSaveRequestsBefore + 1);
  assert.equal(targetSaveActions.at(-1).body.type, "coaching");
  assert.equal(targetSaveActions.at(-1).body.topic, "mechanics");
  assert.equal(targetSaveActions.at(-1).body.category, "map");
  assert.equal(targetSaveActions.at(-1).body.entity, "Bind");
  assert.equal(targetSaveActions.at(-1).body.rankedCoachWording, "Keep the approved Bind insight private until the owner publishes it.");
  const publishButton = approvedCard.locator('[data-knowledge-action="publish"]');
  await assertActionLatency(
    page,
    publishButton,
    async () => {
      await activateControl(page, publishButton, options.mobile, "Publish to Library");
      await page.locator(`[data-knowledge-proposal="${actionProposalId}"] .knowledge-review-state.is-published`).waitFor({ state: "visible" });
    },
    "Publishing an approved insight",
    options.mobile ? 900 : 650
  );
  assert.equal(await page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-action="unpublish"]`).isVisible(), true);
  assert.equal(await page.locator("[data-knowledge-summary-published]").textContent(), "1");
  const publicationActions = actions.filter(action => (
    action.path === "/api/knowledge/publish"
    && action.body.proposalId === actionProposalId
  ));
  assert.equal(publicationActions.length, publicationRequestsBefore + 1);
  assert.equal(publicationActions.at(-1).body.type, "coaching");
  assert.equal(publicationActions.at(-1).body.topic, "mechanics");
  assert.equal(publicationActions.at(-1).body.category, "map");
  assert.equal(publicationActions.at(-1).body.entity, "Bind");
  assert.equal("rankedCoachWording" in publicationActions.at(-1).body, false);
  assert.equal("confirmOriginalWording" in publicationActions.at(-1).body, false);

  await activateControl(page, page.locator('[data-knowledge-bucket="review"]'), options.mobile, "To Review bin");
  await page.locator('[data-knowledge-select-proposal="proposal-two"]').waitFor({ state: "visible" });
  await activateControl(page, page.locator('[data-knowledge-select-proposal="proposal-two"]'), options.mobile, "Select proposal-two");
  await page.locator('[data-knowledge-proposal="proposal-two"]').waitFor({ state: "visible" });
  const rejectButton = page.locator('[data-knowledge-proposal="proposal-two"] [data-knowledge-action="reject"]');
  await assertActionLatency(
    page,
    rejectButton,
    async () => {
      await activateControl(page, rejectButton, options.mobile, "Reject");
      await page.locator('[data-knowledge-proposal="proposal-page-3"]').waitFor({ state: "visible" });
    },
    "Rejecting an insight",
    options.mobile ? 900 : 650
  );
  assert.equal(await page.locator('[data-knowledge-select-proposal="proposal-two"]').count(), 0);
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(await page.locator(".knowledge-review-queue-item").count(), proposalPageLimit - 1);
  assert.equal(
    await page.locator(".knowledge-review-queue-item[aria-pressed=\"true\"]").getAttribute("data-knowledge-select-proposal"),
    "proposal-page-3",
    "Rejecting did not advance to the adjacent review proposal."
  );
  await activateControl(page, page.locator('[data-knowledge-bucket="rejected"]'), options.mobile, "Rejected bin");
  await page.locator('[data-knowledge-proposal="proposal-two"] .knowledge-review-state.is-rejected').waitFor({ state: "visible" });
  assert.match(
    await page.locator('[data-knowledge-proposal="proposal-two"] .knowledge-rejection-reason').textContent(),
    /Owner rejected/
  );
  assert.ok(actions.some(action => action.path === "/api/knowledge/reject" && action.body.proposalId === "proposal-two"));
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(await page.locator(".knowledge-review-queue-item").count(), 1);
  await activateControl(page, page.locator("#knowledgeResearchRefresh"), options.mobile, "Refresh rejected bin");
  await page.locator(".knowledge-empty-state").filter({ hasText: /No rejected insights/ }).waitFor({ state: "visible" });
  assert.ok(actions.some(action => action.path === "/api/knowledge/clear-rejected"));

  await activateControl(page, page.locator('[data-knowledge-bucket="approved"]'), options.mobile, "Approved bin");
  await page.locator(`[data-knowledge-proposal="${actionProposalId}"]`).waitFor({ state: "visible" });
  const unpublishButton = page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-action="unpublish"]`);
  await assertActionLatency(
    page,
    unpublishButton,
    async () => {
      await activateControl(page, unpublishButton, options.mobile, "Remove from Library");
      await page.locator(`[data-knowledge-proposal="${actionProposalId}"] .knowledge-review-state.is-approved`).waitFor({ state: "visible" });
    },
    "Removing an insight from the Library",
    options.mobile ? 900 : 650
  );
  assert.equal(await page.locator(".knowledge-proposal-card").count(), 1);
  assert.equal(await page.locator(".knowledge-review-queue-item").count(), 1);
  assert.equal(
    await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`).getAttribute("aria-pressed"),
    "true"
  );
  assert.equal(
    (await page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-action="publish"]`).textContent()).trim(),
    "Publish to Library",
    "Unpublishing did not return the item to its approved, separately publishable state."
  );
  assert.ok(actions.some(action => action.path === "/api/knowledge/unpublish" && action.body.proposalId === actionProposalId));

  const discardButton = page.locator(`[data-knowledge-proposal="${actionProposalId}"] [data-knowledge-action="discard"]`);
  await assertActionLatency(
    page,
    discardButton,
    async () => {
      await activateControl(page, discardButton, options.mobile, "Discard");
      await page.locator(`[data-knowledge-proposal="${nextProposalId}"], .knowledge-empty-state`).first().waitFor({ state: "visible" });
    },
    "Discarding an approved insight",
    options.mobile ? 900 : 650
  );
  assert.ok(actions.some(action => action.path === "/api/knowledge/discard" && action.body.proposalId === actionProposalId));
  await activateControl(page, page.locator('[data-knowledge-bucket="review"]'), options.mobile, "To Review bin after discard");
  await page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`).waitFor({ state: "visible" });
  await activateControl(page, page.locator(`[data-knowledge-select-proposal="${actionProposalId}"]`), options.mobile, "Select discarded draft");
  await page.locator(`[data-knowledge-proposal="${actionProposalId}"] .knowledge-review-state.is-draft`).waitFor({ state: "visible" });

  await assertNoOverflow(page, options.mobile);
  const rootOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  assert.ok(rootOverflow.scrollWidth <= rootOverflow.clientWidth + 1, `Document overflowed: ${JSON.stringify(rootOverflow)}`);
  if (options.mobile) {
    await activateControl(page, page.locator("#accountSupportClose"), true, "Close Account and Support");
    await page.waitForFunction(() => (
      document.getElementById("accountSupportModal")?.getAttribute("aria-hidden") === "true"
      && getComputedStyle(document.getElementById("accountSupportModal")).display === "none"
    ));
    const modalCloseState = await page.evaluate(() => ({
      locked: document.body.classList.contains("mobile-modal-open"),
      active: [...document.querySelectorAll(".lens-modal-overlay, .agent-modal, .profile-edit-overlay, .auth-modal-overlay")]
        .filter(modal => modal.classList.contains("active") || modal.classList.contains("is-opening") || modal.classList.contains("is-closing"))
        .map(modal => ({
          id: modal.id,
          classes: modal.className,
          hidden: modal.hidden,
          ariaHidden: modal.getAttribute("aria-hidden"),
          display: getComputedStyle(modal).display,
          pointerEvents: getComputedStyle(modal).pointerEvents
        }))
    }));
    assert.equal(modalCloseState.locked, false, JSON.stringify(modalCloseState));
  }
  assert.deepEqual(errors, []);
  await page.close();
}

async function run() {
  const { server, actions, reviewRequests, state } = await startServer();
  const browserMode = String(process.env.RANKEDCOACH_KNOWLEDGE_BROWSER || "chromium").toLowerCase();
  const chromiumBrowser = browserMode === "webkit" ? null : await chromium.launch();
  const webkitBrowser = ["webkit", "all"].includes(browserMode) ? await webkit.launch() : null;
  try {
    if (chromiumBrowser) {
      await runViewport(chromiumBrowser, actions, reviewRequests, state, {
        viewport: { width: 1440, height: 1000 },
        mobile: false,
        screenshot: path.join(os.tmpdir(), "rankedcoach-knowledge-review-desktop.png")
      });
      Object.assign(state, dashboardFixture());
      await runViewport(chromiumBrowser, actions, reviewRequests, state, {
        viewport: { width: 390, height: 844 },
        mobile: true,
        screenshot: path.join(os.tmpdir(), "rankedcoach-knowledge-review-mobile-chromium.png")
      });
    }
    if (webkitBrowser) {
      Object.assign(state, dashboardFixture());
      await runViewport(webkitBrowser, actions, reviewRequests, state, {
        viewport: { width: 390, height: 844 },
        mobile: true,
        screenshot: path.join(os.tmpdir(), "rankedcoach-knowledge-review-mobile-webkit.png")
      });
    }
    console.log(`Knowledge review browser workflow passed (${actions.length} owner actions).`);
  } finally {
    await chromiumBrowser?.close();
    await webkitBrowser?.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
