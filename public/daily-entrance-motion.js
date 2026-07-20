(() => {
  "use strict";

  // v2 deliberately replays the corrected entrance once for users whose v1
  // state may have been marked seen while the launch flow was still hidden.
  const STORAGE_PREFIX = "rankedcoach_daily_entrance_v2";
  const PAGE_IDS = new Set(["home", "logging", "stats", "insights", "library"]);
  const RANK_LABELS = [
    "Iron 1", "Iron 2", "Iron 3",
    "Bronze 1", "Bronze 2", "Bronze 3",
    "Silver 1", "Silver 2", "Silver 3",
    "Gold 1", "Gold 2", "Gold 3",
    "Platinum 1", "Platinum 2", "Platinum 3",
    "Diamond 1", "Diamond 2", "Diamond 3",
    "Ascendant 1", "Ascendant 2", "Ascendant 3",
    "Immortal 1", "Immortal 2", "Immortal 3",
    "Radiant"
  ];
  const RANK_ICON_ROOT = "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/";

  const runtime = {
    prepared: false,
    ready: false,
    identity: "",
    daily: null,
    queuedPage: "home",
    activeRun: null,
    scheduleTimer: 0,
    generation: 0,
    rankIconsWarmed: false,
    pendingPages: new Map()
  };

  function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function normalizeIdentity(value = "") {
    const identity = String(value || "guest").trim().toLowerCase();
    return identity.replace(/[^a-z0-9_.:@-]+/g, "-") || "guest";
  }

  function getStorageKey(identity = runtime.identity) {
    return `${STORAGE_PREFIX}:${normalizeIdentity(identity)}`;
  }

  function createDailyState() {
    return {
      date: getLocalDateKey(),
      skipped: false,
      seenPages: [],
      seenSections: []
    };
  }

  function readDailyState(identity = runtime.identity) {
    const fallback = createDailyState();
    try {
      const parsed = JSON.parse(localStorage.getItem(getStorageKey(identity)) || "null");
      if (!parsed || parsed.date !== fallback.date) return fallback;
      return {
        date: fallback.date,
        skipped: parsed.skipped === true,
        seenPages: Array.isArray(parsed.seenPages) ? [...new Set(parsed.seenPages)] : [],
        seenSections: Array.isArray(parsed.seenSections) ? [...new Set(parsed.seenSections)] : []
      };
    } catch (_error) {
      return fallback;
    }
  }

  function persistDailyState() {
    if (!runtime.identity || !runtime.daily) return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(runtime.daily));
    } catch (_error) {
      // Motion is cosmetic; storage failures should never block the app.
    }
  }

  function ensureCurrentDay() {
    const today = getLocalDateKey();
    if (!runtime.daily || runtime.daily.date !== today) {
      runtime.daily = readDailyState(runtime.identity);
    }
    return runtime.daily;
  }

  function prefersReducedMotion() {
    return Boolean(
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
      || document.body?.classList.contains("access-reduced-motion")
    );
  }

  function getRankIconUrl(label = "Iron 1") {
    if (label === "Radiant") return `${RANK_ICON_ROOT}radiant_rank.png`;
    return `${RANK_ICON_ROOT}${label.toLowerCase().replace(/\s+/g, "_")}_rank.png`;
  }

  function scheduleIdleTask(callback) {
    if (typeof window.requestIdleCallback === "function") {
      return window.requestIdleCallback(callback, { timeout: 1200 });
    }
    return window.setTimeout(() => callback({ didTimeout: true, timeRemaining: () => 0 }), 180);
  }

  function warmRankIcons() {
    if (runtime.rankIconsWarmed) return;
    runtime.rankIconsWarmed = true;
    const pendingLabels = RANK_LABELS.slice();
    const warmBatch = (deadline) => {
      let loaded = 0;
      while (
        pendingLabels.length
        && loaded < 4
        && (deadline.didTimeout || deadline.timeRemaining() > 4)
      ) {
        const image = new Image();
        image.decoding = "async";
        image.src = getRankIconUrl(pendingLabels.shift());
        loaded += 1;
      }
      if (pendingLabels.length) scheduleIdleTask(warmBatch);
    };
    scheduleIdleTask(warmBatch);
  }

  function isMobileLayout() {
    return document.documentElement.classList.contains("is-mobile-layout")
      || document.body?.classList.contains("is-mobile-layout");
  }

  function isRenderable(element) {
    if (!(element instanceof Element) || !element.isConnected || element.closest("[hidden]")) return false;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function uniqueRenderable(elements = []) {
    return [...new Set(elements)].filter(isRenderable);
  }

  function queryAll(root, selector) {
    if (!root || !selector) return [];
    return uniqueRenderable([...root.querySelectorAll(selector)]);
  }

  function holdPendingPage(root) {
    if (!root || runtime.pendingPages.has(root)) return;
    runtime.pendingPages.set(root, {
      value: root.style.getPropertyValue("opacity"),
      priority: root.style.getPropertyPriority("opacity"),
      transitionValue: root.style.getPropertyValue("transition"),
      transitionPriority: root.style.getPropertyPriority("transition"),
      pointerEventsValue: root.style.getPropertyValue("pointer-events"),
      pointerEventsPriority: root.style.getPropertyPriority("pointer-events")
    });
    root.classList.add("daily-entrance-page-pending");
    root.style.setProperty("transition", "none", "important");
    root.style.setProperty("opacity", "0", "important");
    root.style.setProperty("pointer-events", "none", "important");
    // Commit the hidden state while a veil or modal still covers the page.
    void root.offsetWidth;
  }

  function releasePendingPage(root) {
    const held = runtime.pendingPages.get(root);
    if (!held) return;
    if (held.value) root.style.setProperty("opacity", held.value, held.priority);
    else root.style.removeProperty("opacity");
    // Restore the normal page transition only after opacity is visibly settled,
    // otherwise the page itself fades in over the child-card sequence.
    void root.offsetWidth;
    if (held.transitionValue) {
      root.style.setProperty("transition", held.transitionValue, held.transitionPriority);
    } else {
      root.style.removeProperty("transition");
    }
    if (held.pointerEventsValue) {
      root.style.setProperty("pointer-events", held.pointerEventsValue, held.pointerEventsPriority);
    } else {
      root.style.removeProperty("pointer-events");
    }
    root.classList.remove("daily-entrance-page-pending");
    runtime.pendingPages.delete(root);
  }

  function releaseAllPendingPages() {
    [...runtime.pendingPages.keys()].forEach(releasePendingPage);
  }

  function createRun({ pageId, sectionKey = "", sequence }) {
    return {
      pageId,
      sectionKey,
      sequence,
      cancelled: false,
      animations: new Set(),
      timeouts: new Map(),
      finalizers: new Set(),
      holds: new Map()
    };
  }

  function pause(ms, run) {
    if (!ms || run?.cancelled) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        run.timeouts.delete(timer);
        resolve();
      }, ms);
      run.timeouts.set(timer, resolve);
    });
  }

  function holdElements(elements, run) {
    uniqueRenderable(elements).forEach((element) => {
      if (run.holds.has(element)) return;
      run.holds.set(element, {
        value: element.style.getPropertyValue("opacity"),
        priority: element.style.getPropertyPriority("opacity")
      });
      element.style.setProperty("opacity", "0", "important");
    });
  }

  function releaseElement(element, run) {
    const held = run.holds.get(element);
    if (!held) return;
    if (held.value) {
      element.style.setProperty("opacity", held.value, held.priority);
    } else {
      element.style.removeProperty("opacity");
    }
    run.holds.delete(element);
  }

  function releaseAllHolds(run) {
    [...run.holds.keys()].forEach((element) => releaseElement(element, run));
  }

  function getMotionFrames(type = "drop", element = null) {
    if (type === "slide") {
      return [
        { opacity: 0, transform: "translate3d(-24px,0,0)" },
        { opacity: 1, transform: "translate3d(0,0,0)" }
      ];
    }
    if (type === "slide-reverse") {
      return [
        { opacity: 0, transform: "translate3d(24px,0,0)" },
        { opacity: 1, transform: "translate3d(0,0,0)" }
      ];
    }
    if (type === "pop") {
      return [
        { opacity: 0, transform: "translate3d(0,5px,0) scale(.92)" },
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
      ];
    }
    if (type === "compass") {
      return [
        { opacity: 0, transform: "scale(.18) rotate(-9deg)", transformOrigin: "center" },
        { opacity: 1, transform: "scale(1) rotate(0deg)", transformOrigin: "center" }
      ];
    }
    const distance = element?.matches?.(".card") ? -18 : -12;
    return [
      { opacity: 0, transform: `translate3d(0,${distance}px,0)` },
      { opacity: 1, transform: "translate3d(0,0,0)" }
    ];
  }

  function playMotion(element, type, run, options = {}) {
    if (run.cancelled || !isRenderable(element)) {
      releaseElement(element, run);
      return Promise.resolve();
    }
    releaseElement(element, run);
    const animation = element.animate(getMotionFrames(type, element), {
      duration: options.duration || 380,
      easing: options.easing || "cubic-bezier(.2,.82,.24,1)",
      fill: "both"
    });
    animation.id = `rankedcoach-daily-${type}`;
    run.animations.add(animation);
    return animation.finished
      .catch(() => undefined)
      .then(() => {
        run.animations.delete(animation);
        try {
          animation.cancel();
        } catch (_error) {
          // The animation may already have been finalized by the skip controller.
        }
      });
  }

  async function playStagger(elements, type, run, options = {}) {
    const list = uniqueRenderable(elements);
    if (!list.length) return;
    if (options.hold !== false) holdElements(list, run);
    const stagger = Math.max(0, options.stagger ?? 70);
    await Promise.all(list.map(async (element, index) => {
      await pause(index * stagger, run);
      return playMotion(element, type, run, options);
    }));
  }

  function groupElementsByVisualRow(elements = []) {
    const sorted = uniqueRenderable(elements).sort((left, right) => {
      const a = left.getBoundingClientRect();
      const b = right.getBoundingClientRect();
      return Math.abs(a.top - b.top) > 10 ? a.top - b.top : a.left - b.left;
    });
    const rows = [];
    sorted.forEach((element) => {
      const top = element.getBoundingClientRect().top;
      const row = rows.find((entry) => Math.abs(entry.top - top) <= 12);
      if (row) {
        row.elements.push(element);
      } else {
        rows.push({ top, elements: [element] });
      }
    });
    return rows;
  }

  function sortMotionTasksByPosition(tasks = []) {
    return tasks
      .filter((task) => task?.element && isRenderable(task.element))
      .sort((left, right) => {
        const a = left.element.getBoundingClientRect();
        const b = right.element.getBoundingClientRect();
        return Math.abs(a.top - b.top) > 10 ? a.top - b.top : a.left - b.left;
      });
  }

  async function playRows(elements, run, options = {}) {
    const rows = groupElementsByVisualRow(elements);
    const all = rows.flatMap((row) => row.elements);
    holdElements(all, run);
    const rowGap = options.rowGap ?? 72;
    await Promise.all(rows.map(async (row, index) => {
      await pause(index * rowGap, run);
      if (run.cancelled) return;
      await Promise.all(row.elements.map((element) => playMotion(element, options.type || "drop", run, options)));
    }));
  }

  function parseCounterValue(text = "") {
    const trimmed = String(text).trim();
    const match = trimmed.match(/^([+-]?)(\d[\d,]*)(?:\.(\d+))?(.*)$/);
    if (!match) return null;
    const number = Number(`${match[1] === "-" ? "-" : ""}${match[2].replace(/,/g, "")}${match[3] ? `.${match[3]}` : ""}`);
    if (!Number.isFinite(number)) return null;
    return {
      number,
      decimals: match[3]?.length || 0,
      explicitPlus: match[1] === "+",
      useGrouping: match[2].includes(","),
      suffix: match[4] || ""
    };
  }

  function formatCounterValue(value, parsed) {
    const absolute = Math.abs(value);
    let output = parsed.useGrouping
      ? absolute.toLocaleString(undefined, {
          minimumFractionDigits: parsed.decimals,
          maximumFractionDigits: parsed.decimals
        })
      : absolute.toFixed(parsed.decimals);
    if (value < 0) output = `-${output}`;
    else if (parsed.explicitPlus) output = `+${output}`;
    return `${output}${parsed.suffix}`;
  }

  function countElement(element, run, options = {}) {
    if (run.cancelled || !isRenderable(element)) return Promise.resolve();
    const finalText = element.textContent;
    const parsed = parseCounterValue(finalText);
    if (!parsed) return Promise.resolve();
    const duration = Math.max(260, options.duration || 900);
    element.textContent = formatCounterValue(0, parsed);
    return new Promise((resolve) => {
      let frame = 0;
      let settled = false;
      const startedAt = performance.now();
      const finish = () => {
        if (settled) return;
        settled = true;
        if (frame) cancelAnimationFrame(frame);
        element.textContent = finalText;
        run.finalizers.delete(finish);
        resolve();
      };
      run.finalizers.add(finish);
      const tick = (now) => {
        if (run.cancelled) {
          finish();
          return;
        }
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatCounterValue(parsed.number * eased, parsed);
        if (progress >= 1) {
          finish();
        } else {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    });
  }

  function countElements(elements, run, options = {}) {
    return Promise.all(uniqueRenderable(elements).map((element) => countElement(element, run, options)));
  }

  async function countDynamicElements(root, selector, run, options = {}) {
    const counted = new Set();
    const counters = [];
    const discoveryDuration = Math.max(0, options.discoveryDuration ?? 700);
    const startedAt = performance.now();
    do {
      queryAll(root, selector).forEach((element) => {
        if (counted.has(element)) return;
        counted.add(element);
        counters.push(countElement(element, run, options));
      });
      if (run.cancelled || performance.now() - startedAt >= discoveryDuration) break;
      await pause(48, run);
    } while (!run.cancelled);
    await Promise.all(counters);
  }

  function animateRankProgress(root, run) {
    const rankText = root.querySelector("#statsPeakRankText");
    const rankIcon = root.querySelector("#statsPeakRankIcon");
    if (!rankText || !rankIcon || !isRenderable(rankText) || !isRenderable(rankIcon)) return Promise.resolve();
    const finalLabel = String(rankText.textContent || "").trim();
    const finalIndex = RANK_LABELS.findIndex((label) => label.toLowerCase() === finalLabel.toLowerCase());
    if (finalIndex < 0) return Promise.resolve();

    const finalText = rankText.textContent;
    const finalSrc = rankIcon.src;
    const finalAlt = rankIcon.alt;
    const duration = Math.min(4000, Math.max(1200, (finalIndex + 1) * 115));
    rankText.textContent = RANK_LABELS[0];
    rankIcon.src = getRankIconUrl(RANK_LABELS[0]);
    rankIcon.alt = RANK_LABELS[0];

    return new Promise((resolve) => {
      let frame = 0;
      let settled = false;
      const startedAt = performance.now();
      let renderedIndex = -1;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (frame) cancelAnimationFrame(frame);
        rankText.textContent = finalText;
        rankIcon.src = finalSrc;
        rankIcon.alt = finalAlt;
        run.finalizers.delete(finish);
        resolve();
      };
      run.finalizers.add(finish);
      const tick = (now) => {
        if (run.cancelled) {
          finish();
          return;
        }
        const progress = Math.min(1, (now - startedAt) / duration);
        const nextIndex = Math.min(finalIndex, Math.floor(progress * (finalIndex + 1)));
        if (nextIndex !== renderedIndex) {
          renderedIndex = nextIndex;
          const label = RANK_LABELS[nextIndex];
          rankText.textContent = label;
          rankIcon.src = getRankIconUrl(label);
          rankIcon.alt = label;
        }
        if (progress >= 1) {
          finish();
        } else {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    });
  }

  async function animateCompass(root, run) {
    const panel = root.querySelector(".compass-panel");
    if (!panel || !isRenderable(panel)) return;
    const svg = panel.querySelector("#compassSvg");
    const cards = queryAll(panel, ".compass-score-card");
    holdElements([svg, ...cards], run);

    const panelRect = panel.getBoundingClientRect();
    const centerX = panelRect.left + (panelRect.width / 2);
    const centerY = panelRect.top + (panelRect.height / 2);
    const cardAnimations = cards.map(async (card, index) => {
      await pause(index * 46, run);
      if (run.cancelled) return;
      releaseElement(card, run);
      const rect = card.getBoundingClientRect();
      const offsetX = (centerX - (rect.left + rect.width / 2)) * 0.42;
      const offsetY = (centerY - (rect.top + rect.height / 2)) * 0.42;
      const animation = card.animate([
        { opacity: 0, transform: `translate3d(${offsetX}px,${offsetY}px,0) scale(.9)` },
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
      ], {
        duration: 430,
        easing: "cubic-bezier(.16,.86,.24,1)",
        fill: "both"
      });
      animation.id = "rankedcoach-daily-compass-spider";
      run.animations.add(animation);
      await animation.finished.catch(() => undefined);
      run.animations.delete(animation);
      animation.cancel();
    });
    const svgAnimation = svg ? playMotion(svg, "compass", run, { duration: 520 }) : Promise.resolve();
    await Promise.all([svgAnimation, ...cardAnimations]);
  }

  function firstMatchingElements(root, selectors = []) {
    for (const selector of selectors) {
      const elements = queryAll(root, selector);
      if (elements.length) return elements;
    }
    return [];
  }

  function markSectionSeen(key = "") {
    if (!key) return;
    const daily = ensureCurrentDay();
    if (!daily.seenSections.includes(key)) daily.seenSections.push(key);
    persistDailyState();
  }

  async function sequenceHome(run, root) {
    const weekly = root.querySelector(".weekly-focus-card");
    const improvement = root.querySelector(".improvement-card");
    const middleRow = root.querySelector(".home-middle-row");
    const chartCard = root.querySelector(".rr-chart-card");
    const chartTooltip = document.getElementById("chartTooltip");
    const weeklyPills = queryAll(root, "#weeklyFocusSummary > *");
    const improvementPills = queryAll(root, "#timelineGrid > *");
    const compassPanel = root.querySelector(".compass-panel");
    const compassParts = compassPanel
      ? [compassPanel.querySelector("#compassSvg"), ...queryAll(compassPanel, ".compass-score-card")]
      : [];
    holdElements([weekly, improvement, middleRow, chartCard, chartTooltip], run);
    holdElements([...weeklyPills, ...improvementPills], run);
    holdElements(compassParts, run);
    releasePendingPage(root);

    const animateWeekly = async () => {
      if (weekly) await playMotion(weekly, "drop", run, { duration: 420 });
      await playStagger(weeklyPills, "drop", run, { stagger: 72, duration: 320, hold: false });
    };
    const animateImprovement = async () => {
      if (improvement) await playMotion(improvement, "drop", run, { duration: 420 });
      await playStagger(improvementPills, "drop", run, { stagger: 72, duration: 320, hold: false });
    };
    const animateMiddle = async () => {
      if (middleRow) await playMotion(middleRow, "drop", run, { duration: 440 });
      await animateCompass(root, run);
    };
    const animateChart = async () => {
      const chartCounts = countElements(queryAll(root, "#rrKills, #rrDeaths, #rrAssists, #rrACS"), run, { duration: 850 });
      releaseElement(chartTooltip, run);
      if (chartCard) await playMotion(chartCard, "drop", run, { duration: 440 });
      await chartCounts;
    };

    if (isMobileLayout()) {
      const tasks = sortMotionTasksByPosition([
        { element: weekly, play: animateWeekly },
        { element: improvement, play: animateImprovement },
        { element: middleRow, play: animateMiddle },
        { element: chartCard, play: animateChart }
      ]);
      for (const task of tasks) {
        if (run.cancelled) break;
        await task.play();
      }
      return;
    }

    await Promise.all([animateWeekly(), animateImprovement()]);
    await animateMiddle();
    await animateChart();
  }

  function getLoggingCard(root, view) {
    return root.querySelector(view === "feed" ? ".logging-feed-card" : ".logging-card");
  }

  async function animateLoggingView(root, view, run) {
    const sectionKey = `logging:${view}`;
    if (ensureCurrentDay().seenSections.includes(sectionKey)) return;
    const card = getLoggingCard(root, view);
    if (!card || !isRenderable(card)) return;
    const children = view === "feed"
      ? firstMatchingElements(card, [":scope > .card-header, :scope > .logging-session-bar, :scope > .logging-feed"])
      : queryAll(card, ".logging-form > *");
    holdElements(children, run);
    await playMotion(card, "drop", run, { duration: 420 });
    await playStagger(children, "drop", run, { stagger: 62, duration: 330, hold: false });
    markSectionSeen(sectionKey);
  }

  async function sequenceLogging(run, root) {
    const selectedView = root.dataset.mobileLoggingView || "form";
    const views = isMobileLayout() ? [selectedView] : ["form", "feed"];
    views.forEach((view) => {
      const card = getLoggingCard(root, view);
      if (!card || !isRenderable(card)) return;
      const children = view === "feed"
        ? firstMatchingElements(card, [":scope > .card-header, :scope > .logging-session-bar, :scope > .logging-feed"])
        : queryAll(card, ".logging-form > *");
      holdElements([card, ...children], run);
    });
    releasePendingPage(root);
    for (const view of views) {
      if (run.cancelled) break;
      await animateLoggingView(root, view, run);
      await pause(70, run);
    }
  }

  function getStatsSectionConfig(view) {
    const configs = {
      agents: {
        card: ".stats-agents-card",
        children: ["#statsAgentsList .stats-agent-mini-card", "#statsAgentsList .stats-agent-row", "#statsAgentsList > *"]
      },
      maps: {
        card: ".stats-maps-card",
        children: ["#statsMapsList .stats-map-card", "#statsMapsList > *"]
      },
      weapons: {
        card: ".stats-weapons-card",
        children: ["#statsWeaponsList .stats-desktop-weapon-family-row", "#statsWeaponsList .stats-weapon-family-card", "#statsWeaponsList > *"]
      }
    };
    return configs[view] || null;
  }

  async function animateStatsSection(root, view, run) {
    const sectionKey = `stats:${view}`;
    if (ensureCurrentDay().seenSections.includes(sectionKey)) return;
    const config = getStatsSectionConfig(view);
    const card = config ? root.querySelector(config.card) : null;
    if (!card || !isRenderable(card)) return;
    const children = firstMatchingElements(card, config.children);
    holdElements(children, run);
    await playMotion(card, "drop", run, { duration: 420 });
    await playRows(children, run, { duration: 300, rowGap: 54, type: "drop" });
    markSectionSeen(sectionKey);
  }

  async function sequenceStats(run, root) {
    const summary = root.querySelector(".stats-summary-card");
    const leftCounters = queryAll(root, "#statKD, #statWinrate, #statADR, #statHS, #statFirstBloods, #statDamagePerRound");
    const trendCard = root.querySelector(".stats-performance-card");
    const patternCard = root.querySelector(".stats-breakdown-card");
    const trendItems = queryAll(root, "#statsPerformanceChart > *");
    const patternItems = queryAll(root, "#statsBreakdown > *");
    const selectedView = root.dataset.mobileStatsView || "agents";
    const views = isMobileLayout() ? [selectedView] : ["maps", "agents", "weapons"];
    const sectionCards = views.map((view) => ({
      view,
      element: root.querySelector(getStatsSectionConfig(view)?.card || ".daily-entrance-missing")
    }));

    holdElements([summary, trendCard, patternCard, ...sectionCards.map((entry) => entry.element)], run);
    holdElements([...trendItems, ...patternItems], run);
    sectionCards.forEach(({ view, element }) => {
      const config = getStatsSectionConfig(view);
      if (element && config) holdElements(firstMatchingElements(element, config.children), run);
    });
    releasePendingPage(root);

    let rankPromise = Promise.resolve();
    let summaryCounts = Promise.resolve();
    const animateSummary = async () => {
      rankPromise = animateRankProgress(root, run);
      summaryCounts = Promise.all([
        countElements(leftCounters, run, { duration: 900 }),
        countDynamicElements(root, ".stats-role-pill-percent, .stats-role-pill-games > strong", run, {
          duration: 1000,
          discoveryDuration: 760
        }),
        countElements(queryAll(root, "#statsPeakRRText"), run, { duration: 1000 })
      ]);
      if (summary) await playMotion(summary, "drop", run, { duration: 430 });
    };
    const animateTrendPair = async () => {
      await Promise.all([
        trendCard ? playMotion(trendCard, "slide", run, { duration: 420 }) : Promise.resolve(),
        patternCard ? playMotion(patternCard, "slide-reverse", run, { duration: 420 }) : Promise.resolve()
      ]);
      await Promise.all([
        playStagger(trendItems, "slide", run, { stagger: 58, duration: 320, hold: false }),
        playStagger(patternItems, "slide-reverse", run, { stagger: 58, duration: 320, hold: false })
      ]);
    };

    if (isMobileLayout()) {
      const trendAnchor = [trendCard, patternCard]
        .filter((element) => element && isRenderable(element))
        .sort((left, right) => left.getBoundingClientRect().top - right.getBoundingClientRect().top)[0];
      const tasks = sortMotionTasksByPosition([
        { element: summary, play: animateSummary },
        { element: trendAnchor, play: animateTrendPair },
        ...sectionCards.map(({ view, element }) => ({
          element,
          play: () => animateStatsSection(root, view, run)
        }))
      ]);
      for (const task of tasks) {
        if (run.cancelled) break;
        await task.play();
      }
    } else {
      await animateSummary();
      await pause(290, run);
      await animateTrendPair();
      for (const { view } of sectionCards) {
        if (run.cancelled) break;
        await animateStatsSection(root, view, run);
        await pause(62, run);
      }
    }

    await Promise.all([summaryCounts, rankPromise]);
  }

  async function sequenceInsights(run, root) {
    const focusCard = root.querySelector(".insights-action-card");
    const focusDetails = queryAll(root, ".insights-action-card .insight-focus-detail");
    const priorityCard = root.querySelector(".insights-top-card");
    const priorityItems = queryAll(root, "#insightsList > .insight-card");
    const trendsCard = root.querySelector(".insights-trends-card");
    const trendRows = queryAll(root, ".insights-trends-card .insight-trend-row");
    const signalCards = queryAll(root, ".insights-trends-card .trend-signal-card");
    holdElements([focusCard, priorityCard, trendsCard], run);
    holdElements([...focusDetails, ...priorityItems, ...trendRows, ...signalCards], run);
    releasePendingPage(root);

    const tasks = [
      {
        element: focusCard,
        play: async () => {
          await playMotion(focusCard, "drop", run, { duration: 430 });
          await playStagger(focusDetails, "pop", run, { stagger: 80, duration: 330, hold: false });
        }
      },
      {
        element: priorityCard,
        play: async () => {
          await playMotion(priorityCard, "drop", run, { duration: 410 });
          await playStagger(priorityItems, "pop", run, { stagger: 64, duration: 320, hold: false });
        }
      },
      {
        element: trendsCard,
        play: async () => {
          await playMotion(trendsCard, "drop", run, { duration: 410 });
          await playRows(trendRows, run, { duration: 300, rowGap: 50, type: "pop" });
          await playRows(signalCards, run, { duration: 320, rowGap: 54, type: "drop" });
        }
      }
    ];
    const orderedTasks = isMobileLayout() ? sortMotionTasksByPosition(tasks) : tasks;
    for (const task of orderedTasks) {
      if (run.cancelled) break;
      await task.play();
    }
  }

  async function sequenceLibrary(run, root) {
    const hero = root.querySelector(".gamesense-hero");
    const overview = root.querySelector(".gamesense-overview");
    if (!overview) {
      const children = queryAll(root, "#gamesenseLibraryView > *");
      holdElements(children, run);
      releasePendingPage(root);
      await playStagger(children, "drop", run, {
        stagger: 70,
        duration: 340,
        hold: false
      });
      return;
    }

    const scope = overview.querySelector(".gamesense-season-scope");
    const cards = queryAll(overview, ".gamesense-topic-grid > .gamesense-topic-card");
    holdElements([hero, scope, ...cards], run);
    releasePendingPage(root);
    if (hero) await playMotion(hero, "drop", run, { duration: 440 });
    if (scope) await playMotion(scope, "drop", run, { duration: 380 });
    await playStagger(cards, "slide", run, { stagger: 74, duration: 360, hold: false });
  }

  const PAGE_SEQUENCES = {
    home: sequenceHome,
    logging: sequenceLogging,
    stats: sequenceStats,
    insights: sequenceInsights,
    library: sequenceLibrary
  };

  function markRunSeen(run) {
    const daily = ensureCurrentDay();
    if (run.sectionKey) {
      if (!daily.seenSections.includes(run.sectionKey)) daily.seenSections.push(run.sectionKey);
    } else if (!daily.seenPages.includes(run.pageId)) {
      daily.seenPages.push(run.pageId);
    }
    persistDailyState();
  }

  function clearRunPresentation(run) {
    releaseAllHolds(run);
    releasePendingPage(document.getElementById(`page-${run.pageId}`));
    if (runtime.activeRun === run) runtime.activeRun = null;
    document.body?.classList.remove("daily-entrance-motion-active");
    if (document.body?.dataset.dailyEntrancePage === run.pageId) {
      delete document.body.dataset.dailyEntrancePage;
    }
  }

  function finishRun(run, { markSeen = true } = {}) {
    if (!run) return;
    run.cancelled = true;
    run.timeouts.forEach((resolve, timer) => {
      clearTimeout(timer);
      resolve();
    });
    run.timeouts.clear();
    run.animations.forEach((animation) => {
      try {
        animation.finish();
        animation.cancel();
      } catch (_error) {
        // A completed animation may already be detached from its timeline.
      }
    });
    run.animations.clear();
    [...run.finalizers].forEach((finish) => finish());
    if (markSeen) markRunSeen(run);
    clearRunPresentation(run);
  }

  async function executeRun(run) {
    runtime.activeRun = run;
    document.body?.classList.add("daily-entrance-motion-active");
    if (document.body) document.body.dataset.dailyEntrancePage = run.pageId;
    try {
      await run.sequence(run, document.getElementById(`page-${run.pageId}`));
    } catch (error) {
      console.warn("Daily entrance motion could not finish cleanly", error);
    }
    if (run.cancelled || runtime.activeRun !== run) return;
    [...run.finalizers].forEach((finish) => finish());
    markRunSeen(run);
    clearRunPresentation(run);
  }

  function canAnimatePage(pageId) {
    const daily = ensureCurrentDay();
    return runtime.ready
      && PAGE_IDS.has(pageId)
      && !daily.skipped
      && !daily.seenPages.includes(pageId)
      && !prefersReducedMotion();
  }

  function canPreparePage(pageId) {
    const daily = ensureCurrentDay();
    return PAGE_IDS.has(pageId)
      && !daily.skipped
      && !daily.seenPages.includes(pageId)
      && !prefersReducedMotion();
  }

  function isCurrentPage(pageId, page) {
    if (!page) return false;
    if (!isMobileLayout()) return page.classList.contains("active");
    if (page.classList.contains("is-current-page")) return true;
    const mobileNavButton = document.querySelector(`.mobile-bottom-page-btn.active[data-mobile-page="${pageId}"]`);
    if (mobileNavButton) return true;
    const desktopNavButton = document.querySelector(`.nav-btn.active[data-page="${pageId}"]`);
    if (desktopNavButton) return true;
    return page.classList.contains("active") && !document.querySelector(".page.is-current-page");
  }

  function schedulePage(pageId) {
    if (!canAnimatePage(pageId)) {
      releaseAllPendingPages();
      return;
    }
    const root = document.getElementById(`page-${pageId}`);
    if (!root) return;
    if (runtime.activeRun?.pageId === pageId && !runtime.activeRun.sectionKey) return;
    if (runtime.activeRun) finishRun(runtime.activeRun);
    if (runtime.scheduleTimer) clearTimeout(runtime.scheduleTimer);
    [...runtime.pendingPages.keys()]
      .filter((page) => page !== root)
      .forEach(releasePendingPage);
    holdPendingPage(root);
    const generation = ++runtime.generation;
    const delay = isMobileLayout() ? 330 : 255;
    runtime.scheduleTimer = window.setTimeout(() => {
      runtime.scheduleTimer = 0;
      if (generation !== runtime.generation || !canAnimatePage(pageId)) {
        releasePendingPage(root);
        return;
      }
      const page = document.getElementById(`page-${pageId}`);
      if (!isCurrentPage(pageId, page)) {
        releasePendingPage(root);
        return;
      }
      const sequence = PAGE_SEQUENCES[pageId];
      if (sequence) void executeRun(createRun({ pageId, sequence }));
      else releasePendingPage(root);
    }, delay);
  }

  function preparePage(pageId) {
    if (!runtime.prepared || runtime.ready) return;
    if (!canPreparePage(pageId)) {
      releaseAllPendingPages();
      return;
    }
    const root = document.getElementById(`page-${pageId}`);
    if (!root) return;
    [...runtime.pendingPages.keys()]
      .filter((page) => page !== root)
      .forEach(releasePendingPage);
    holdPendingPage(root);
  }

  function prepareSession(context = {}) {
    const identity = normalizeIdentity(context.userId || context.email || "guest");
    if (runtime.identity && runtime.identity !== identity) {
      if (runtime.activeRun) finishRun(runtime.activeRun, { markSeen: false });
      if (runtime.scheduleTimer) clearTimeout(runtime.scheduleTimer);
      runtime.scheduleTimer = 0;
      runtime.generation += 1;
      releaseAllPendingPages();
      runtime.ready = false;
    }

    if (!runtime.prepared || runtime.identity !== identity) {
      runtime.identity = identity;
      runtime.daily = readDailyState(identity);
      runtime.prepared = true;
    } else {
      ensureCurrentDay();
    }

    if (prefersReducedMotion()) {
      runtime.daily.skipped = true;
      releaseAllPendingPages();
      persistDailyState();
      return;
    }
    preparePage(runtime.queuedPage || "home");
  }

  function scheduleSection(pageId, sectionKey, sequence) {
    const daily = ensureCurrentDay();
    if (!runtime.ready || daily.skipped || daily.seenSections.includes(sectionKey) || prefersReducedMotion()) return;
    if (runtime.activeRun) return;
    window.setTimeout(() => {
      if (runtime.activeRun || ensureCurrentDay().skipped || ensureCurrentDay().seenSections.includes(sectionKey)) return;
      void executeRun(createRun({ pageId, sectionKey, sequence }));
    }, 70);
  }

  function activatePage(pageId, context = {}) {
    if (!PAGE_IDS.has(pageId)) return;
    runtime.queuedPage = pageId;
    if (context.userId && !runtime.prepared) prepareSession(context);
    if (!runtime.ready) {
      preparePage(pageId);
      return;
    }
    schedulePage(pageId);
  }

  function setSessionReady(context = {}) {
    const identity = normalizeIdentity(context.userId || context.email || "guest");
    if (runtime.ready && runtime.identity === identity) {
      ensureCurrentDay();
      warmRankIcons();
      if (!runtime.activeRun) schedulePage(runtime.queuedPage || "home");
      return;
    }
    prepareSession({ ...context, userId: identity });
    runtime.ready = true;
    if (prefersReducedMotion()) {
      runtime.daily.skipped = true;
      releaseAllPendingPages();
      persistDailyState();
      return;
    }
    warmRankIcons();
    schedulePage(runtime.queuedPage || "home");
  }

  function skipAll() {
    const daily = ensureCurrentDay();
    daily.skipped = true;
    if (runtime.scheduleTimer) {
      clearTimeout(runtime.scheduleTimer);
      runtime.scheduleTimer = 0;
    }
    releaseAllPendingPages();
    runtime.generation += 1;
    if (runtime.activeRun) finishRun(runtime.activeRun);
    persistDailyState();
  }

  function resetToday({ replay = false } = {}) {
    if (!runtime.identity) return null;
    if (runtime.activeRun) finishRun(runtime.activeRun, { markSeen: false });
    if (runtime.scheduleTimer) clearTimeout(runtime.scheduleTimer);
    runtime.scheduleTimer = 0;
    releaseAllPendingPages();
    localStorage.removeItem(getStorageKey());
    runtime.daily = createDailyState();
    if (replay && runtime.ready) schedulePage(runtime.queuedPage || "home");
    return { ...runtime.daily };
  }

  document.addEventListener("pointerdown", (event) => {
    if (!runtime.ready || !event.isTrusted || (!runtime.activeRun && !runtime.scheduleTimer && !runtime.pendingPages.size)) return;
    skipAll();
  }, true);

  document.addEventListener("click", (event) => {
    const loggingTab = event.target.closest?.("[data-mobile-logging-view]");
    if (loggingTab) {
      const view = loggingTab.dataset.mobileLoggingView || "form";
      scheduleSection("logging", `logging:${view}`, async (run, root) => {
        await animateLoggingView(root, view, run);
      });
      return;
    }
    const statsTab = event.target.closest?.("[data-mobile-stats-view]");
    if (statsTab) {
      const view = statsTab.dataset.mobileStatsView || "agents";
      scheduleSection("stats", `stats:${view}`, async (run, root) => {
        await animateStatsSection(root, view, run);
      });
    }
  });

  window.RankedCoachDailyEntrance = Object.freeze({
    activatePage,
    prepareSession,
    setSessionReady,
    skipAll,
    resetToday,
    getState: () => ({
      prepared: runtime.prepared,
      ready: runtime.ready,
      identity: runtime.identity,
      queuedPage: runtime.queuedPage,
      activePage: runtime.activeRun?.pageId || "",
      pendingPages: runtime.pendingPages.size,
      daily: runtime.daily ? { ...runtime.daily } : null
    })
  });
})();
