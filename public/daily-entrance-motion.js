(() => {
  "use strict";

  // v2 deliberately replays the corrected entrance once for users whose v1
  // state may have been marked seen while the launch flow was still hidden.
  const STORAGE_PREFIX = "rankedcoach_daily_entrance_v2";
  const FORCE_REPLAY_KEY = "rankedcoach_daily_entrance_force_replay";
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
    forceReplay: readForceReplayState(),
    pendingPages: new Map()
  };
  let entranceSkipClickTimer = 0;

  // The pointer that dismisses the entrance can resolve its later synthetic
  // click against the newly revealed page. Consume that one click so skipping
  // the animation never also opens a card underneath it.
  function consumeEntranceSkipClick(event) {
    // Page navigation is an explicit destination choice, so let it both skip
    // and navigate. Other controls may sit underneath the dismissal pointer
    // after the overlay clears, so consume that first synthetic click instead
    // of opening a modal/card by accident.
    const navigationTarget = event.target?.closest?.(
      ".nav-btn[data-page], .mobile-bottom-page-btn[data-mobile-page]"
    );
    if (!navigationTarget) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    document.removeEventListener("click", consumeEntranceSkipClick, true);
    if (entranceSkipClickTimer) {
      window.clearTimeout(entranceSkipClickTimer);
      entranceSkipClickTimer = 0;
    }
  }

  function armEntranceSkipClickGuard() {
    document.removeEventListener("click", consumeEntranceSkipClick, true);
    if (entranceSkipClickTimer) window.clearTimeout(entranceSkipClickTimer);
    document.addEventListener("click", consumeEntranceSkipClick, true);
    entranceSkipClickTimer = window.setTimeout(() => {
      document.removeEventListener("click", consumeEntranceSkipClick, true);
      entranceSkipClickTimer = 0;
    }, 750);
  }

  function readForceReplayState() {
    try {
      return localStorage.getItem(FORCE_REPLAY_KEY) === "1";
    } catch (_error) {
      return false;
    }
  }

  function persistForceReplayState(enabled = false) {
    try {
      if (enabled) localStorage.setItem(FORCE_REPLAY_KEY, "1");
      else localStorage.removeItem(FORCE_REPLAY_KEY);
    } catch (_error) {
      // Debug persistence should never block the production animation flow.
    }
  }

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
    if (type === "settle-pop") {
      return [
        { opacity: 1, transform: "translate3d(0,0,0) scale(.985)" },
        { opacity: 1, transform: "translate3d(0,0,0) scale(1.018)" },
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

  function sortElementsByVisualPosition(elements = []) {
    return uniqueRenderable(elements).sort((left, right) => {
      const a = left.getBoundingClientRect();
      const b = right.getBoundingClientRect();
      return Math.abs(a.top - b.top) > 10 ? a.top - b.top : a.left - b.left;
    });
  }

  function groupElementsByVisualRow(elements = []) {
    const sorted = sortElementsByVisualPosition(elements);
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

  function groupElementsByVisualColumn(elements = []) {
    const sorted = uniqueRenderable(elements).sort((left, right) => {
      const a = left.getBoundingClientRect();
      const b = right.getBoundingClientRect();
      return Math.abs(a.left - b.left) > 12 ? a.left - b.left : a.top - b.top;
    });
    const columns = [];
    sorted.forEach((element) => {
      const left = element.getBoundingClientRect().left;
      const column = columns.find((entry) => Math.abs(entry.left - left) <= 18);
      if (column) {
        column.elements.push(element);
      } else {
        columns.push({ left, elements: [element] });
      }
    });
    return columns.map((column) => ({
      ...column,
      elements: column.elements.sort((left, right) => left.getBoundingClientRect().top - right.getBoundingClientRect().top)
    }));
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

  async function playColumns(elements, run, options = {}) {
    const columns = groupElementsByVisualColumn(elements);
    const all = columns.flatMap((column) => column.elements);
    holdElements(all, run);
    const columnGap = options.columnGap ?? 72;
    await Promise.all(columns.map(async (column, index) => {
      await pause(index * columnGap, run);
      if (run.cancelled) return;
      await Promise.all(column.elements.map((element) => playMotion(element, options.type || "drop", run, options)));
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

  function parseSvgNumber(element, attribute, fallback = 0) {
    const value = Number(element?.getAttribute?.(attribute));
    return Number.isFinite(value) ? value : fallback;
  }

  function parseSvgTextNumber(element) {
    const value = Number(String(element?.textContent || "").trim());
    return Number.isFinite(value) ? value : 0;
  }

  function setCompassNode(node, state = {}) {
    if (!node) return;
    node.setAttribute("cx", `${state.cx}`);
    node.setAttribute("cy", `${state.cy}`);
    node.setAttribute("r", `${state.r}`);
  }

  function buildCompassPoints(states = []) {
    return states.map((state) => `${state.cx},${state.cy}`).join(" ");
  }

  function animateCompassSvgBuild(svg, run) {
    if (run.cancelled || !isRenderable(svg)) return Promise.resolve();
    releaseElement(svg, run);
    const polygon = svg.querySelector("#compassPolygon");
    const nodeEntries = [
      { node: svg.querySelector("#coreNodeAim"), text: svg.querySelector(".percent-aim") },
      { node: svg.querySelector("#coreNodeSense"), text: svg.querySelector(".percent-sense") },
      { node: svg.querySelector("#coreNodeTeam"), text: svg.querySelector(".percent-team") },
      { node: svg.querySelector("#coreNodeDiscipline"), text: svg.querySelector(".percent-discipline") }
    ].filter((entry) => entry.node);
    if (!polygon || !nodeEntries.length) return Promise.resolve();

    const center = { cx: 100, cy: 100, r: 3 };
    const finals = nodeEntries.map(({ node, text }) => ({
      node,
      text,
      cx: parseSvgNumber(node, "cx", center.cx),
      cy: parseSvgNumber(node, "cy", center.cy),
      r: parseSvgNumber(node, "r", 5),
      value: parseSvgTextNumber(text)
    }));
    const duration = 3000;
    const axisDelay = 180;
    const axisDuration = duration - (axisDelay * (finals.length - 1));
    finals.forEach(({ node, text }) => {
      setCompassNode(node, center);
      if (text) text.textContent = "0";
    });
    polygon.setAttribute("points", buildCompassPoints(finals.map(() => center)));

    return new Promise((resolve) => {
      let frame = 0;
      let settled = false;
      const startedAt = performance.now();
      const finish = () => {
        if (settled) return;
        settled = true;
        if (frame) cancelAnimationFrame(frame);
        finals.forEach(({ node, text, cx, cy, r, value }) => {
          setCompassNode(node, { cx, cy, r });
          if (text) text.textContent = `${value}`;
        });
        polygon.setAttribute("points", buildCompassPoints(finals));
        run.finalizers.delete(finish);
        resolve();
      };
      run.finalizers.add(finish);
      const tick = (now) => {
        if (run.cancelled) {
          finish();
          return;
        }
        const elapsed = now - startedAt;
        const currentStates = finals.map((final, index) => {
          const raw = Math.min(1, Math.max(0, (elapsed - (index * axisDelay)) / axisDuration));
          const eased = 1 - Math.pow(1 - raw, 3);
          const state = {
            cx: center.cx + ((final.cx - center.cx) * eased),
            cy: center.cy + ((final.cy - center.cy) * eased),
            r: center.r + ((final.r - center.r) * eased)
          };
          setCompassNode(final.node, state);
          if (final.text) final.text.textContent = `${Math.round(final.value * eased)}`;
          return state;
        });
        polygon.setAttribute("points", buildCompassPoints(currentStates));
        if (elapsed >= duration) {
          finish();
        } else {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    }).then(async () => {
      if (run.cancelled) return;
      await Promise.all(finals.map(async ({ node }, index) => {
        await pause(index * 35, run);
        if (run.cancelled) return;
        const animation = node.animate([
          { transform: "scale(1)", transformOrigin: "center", opacity: 1 },
          { transform: "scale(1.42)", transformOrigin: "center", opacity: 1 },
          { transform: "scale(1)", transformOrigin: "center", opacity: 1 }
        ], {
          duration: 260,
          easing: "cubic-bezier(.16,.86,.24,1)",
          fill: "both"
        });
        animation.id = "rankedcoach-daily-compass-node-pop";
        run.animations.add(animation);
        await animation.finished.catch(() => undefined);
        run.animations.delete(animation);
        try {
          animation.cancel();
        } catch (_error) {
          // The animation may already have been finalized by the skip controller.
        }
      }));
    });
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
    const scoreCounters = queryAll(panel, "#compassScoreAim, #compassScoreSense, #compassScoreTeam, #compassScoreDiscipline");
    holdElements([svg, ...cards], run);
    const countPromise = countElements(scoreCounters, run, { duration: 3000 });

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
    const svgAnimation = svg ? animateCompassSvgBuild(svg, run) : Promise.resolve();
    await Promise.all([svgAnimation, countPromise, ...cardAnimations]);
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
    const loadoutCard = root.querySelector(".loadout-card");
    const rrCard = root.querySelector(".rr-card");
    const chartCard = root.querySelector(".rr-chart-card");
    const chartTooltip = document.getElementById("chartTooltip");
    const chartButtons = queryAll(root, ".rr-chart-card .graph-btn");
    const rrMatchStatParts = queryAll(root, "#rrMatchStats > *");
    const weeklyPills = queryAll(root, "#weeklyFocusSummary > *");
    const improvementPills = queryAll(root, "#timelineGrid > *");
    const compassPanel = root.querySelector(".compass-panel");
    const compassParts = compassPanel
      ? [compassPanel.querySelector("#compassSvg"), ...queryAll(compassPanel, ".compass-score-card")]
      : [];
    const mobile = isMobileLayout();
    holdElements(mobile
      ? [loadoutCard, rrCard, improvement, compassPanel, weekly, chartCard, chartTooltip]
      : [weekly, improvement, middleRow, chartCard, chartTooltip], run);
    holdElements([...weeklyPills, ...improvementPills, ...chartButtons, ...rrMatchStatParts], run);
    holdElements(compassParts, run);
    releasePendingPage(root);

    const animateWeekly = async () => {
      if (weekly) await playMotion(weekly, "drop", run, { duration: 420 });
      await playStagger(weeklyPills, "slide", run, { stagger: 72, duration: 330, hold: false });
    };
    const animateImprovement = async () => {
      if (improvement) await playMotion(improvement, "drop", run, { duration: 420 });
      await playStagger(improvementPills, "slide", run, { stagger: 72, duration: 330, hold: false });
    };
    const animateMiddle = async () => {
      if (middleRow) await playMotion(middleRow, "drop", run, { duration: 440 });
      await animateCompass(root, run);
    };
    const animateMobileCompass = async () => {
      if (compassPanel) await playMotion(compassPanel, "drop", run, { duration: 420 });
      await animateCompass(root, run);
    };
    const animateChart = async () => {
      const chartCounts = countElements(queryAll(root, "#rrKills, #rrDeaths, #rrAssists, #rrACS"), run, { duration: 850 });
      releaseElement(chartTooltip, run);
      if (chartCard) await playMotion(chartCard, "drop", run, { duration: 440 });
      await playStagger(sortElementsByVisualPosition([...chartButtons, ...rrMatchStatParts]), "drop", run, {
        stagger: 52,
        duration: 300,
        hold: false
      });
      await chartCounts;
    };

    if (mobile) {
      const tasks = sortMotionTasksByPosition([
        { element: loadoutCard, play: () => playMotion(loadoutCard, "drop", run, { duration: 420 }) },
        { element: rrCard, play: () => playMotion(rrCard, "drop", run, { duration: 420 }) },
        { element: improvement, play: animateImprovement },
        { element: compassPanel, play: animateMobileCompass },
        { element: weekly, play: animateWeekly },
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
    if (!isMobileLayout() && view !== "weapons") {
      await playColumns(children, run, { duration: 315, columnGap: 66, type: "drop" });
    } else {
      await playRows(children, run, { duration: 300, rowGap: 54, type: "drop" });
    }
    markSectionSeen(sectionKey);
  }

  async function animateStatsSectionsRowByRow(root, sectionCards, run) {
    const entries = sectionCards.map(({ view }) => {
      const sectionKey = `stats:${view}`;
      if (ensureCurrentDay().seenSections.includes(sectionKey)) return null;
      const config = getStatsSectionConfig(view);
      const card = config ? root.querySelector(config.card) : null;
      if (!card || !isRenderable(card)) return null;
      return {
        view,
        sectionKey,
        card,
        children: firstMatchingElements(card, config.children)
      };
    }).filter(Boolean);
    if (!entries.length) return;

    await Promise.all(entries.map(({ card }) => playMotion(card, "drop", run, { duration: 420 })));

    const grouped = entries.map((entry) => ({
      ...entry,
      rows: groupElementsByVisualRow(entry.children)
    }));
    const rowCount = Math.max(0, ...grouped.map((entry) => entry.rows.length));
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      if (run.cancelled) break;
      const rowElements = grouped.flatMap((entry) => entry.rows[rowIndex]?.elements || []);
      if (rowElements.length) {
        await Promise.all(rowElements.map((element) => playMotion(element, "drop", run, {
          duration: 300
        })));
      }
      if (rowIndex < rowCount - 1) await pause(54, run);
    }

    entries.forEach(({ sectionKey }) => markSectionSeen(sectionKey));
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
      if (trendCard) await playMotion(trendCard, "slide", run, { duration: 420 });
      await playStagger(sortElementsByVisualPosition(trendItems), "slide", run, {
        stagger: 58,
        duration: 320,
        hold: false
      });
      if (patternCard) await playMotion(patternCard, "slide-reverse", run, { duration: 420 });
      await playStagger(sortElementsByVisualPosition(patternItems), "slide-reverse", run, {
        stagger: 58,
        duration: 320,
        hold: false
      });
      if (patternCard) {
        await playMotion(patternCard, "settle-pop", run, {
          duration: 260,
          easing: "cubic-bezier(.16,.86,.24,1)"
        });
      }
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
        if (task.element === summary) await Promise.all([summaryCounts, rankPromise]);
      }
    } else {
      await animateSummary();
      await Promise.all([summaryCounts, rankPromise]);
      await pause(170, run);
      await animateTrendPair();
      await animateStatsSectionsRowByRow(root, sectionCards, run);
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
          await playStagger(focusDetails, "drop", run, { stagger: 80, duration: 330, hold: false });
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
          await playStagger(sortElementsByVisualPosition(trendRows), "slide", run, {
            stagger: 66,
            duration: 320,
            hold: false
          });
          await playStagger(sortElementsByVisualPosition(signalCards), "drop", run, {
            stagger: 58,
            duration: 320,
            hold: false
          });
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
    if (runtime.forceReplay) return;
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

  // Background page data is allowed to settle while an entrance plays, but it
  // must not replace the held nodes before their sequence has finished. Pages
  // that need a post-entrance refresh listen for this completion signal rather
  // than guessing at a timeout from their own request lifecycle.
  function announceRunFinished(run) {
    if (!run?.pageId) return;
    window.dispatchEvent(new CustomEvent("rankedcoach:daily-entrance-finished", {
      detail: { pageId: run.pageId, sectionKey: run.sectionKey || "" }
    }));
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
    announceRunFinished(run);
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
    if (run.cancelled || runtime.activeRun !== run) {
      if (!runtime.activeRun) clearRunPresentation(run);
      return;
    }
    [...run.finalizers].forEach((finish) => finish());
    markRunSeen(run);
    clearRunPresentation(run);
    announceRunFinished(run);
  }

  function canAnimatePage(pageId, options = {}) {
    const daily = ensureCurrentDay();
    const forceOnce = options.forceOnce === true;
    return runtime.ready
      && PAGE_IDS.has(pageId)
      && (runtime.forceReplay || (forceOnce && !daily.skipped) || (!daily.skipped && !daily.seenPages.includes(pageId)))
      && !prefersReducedMotion();
  }

  function canPreparePage(pageId, options = {}) {
    const daily = ensureCurrentDay();
    const forceOnce = options.forceOnce === true;
    return PAGE_IDS.has(pageId)
      && (runtime.forceReplay || (forceOnce && !daily.skipped) || (!daily.skipped && !daily.seenPages.includes(pageId)))
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

  function schedulePage(pageId, options = {}) {
    const forceOnce = options.forceOnce === true;
    if (!canAnimatePage(pageId, { forceOnce })) {
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
      if (generation !== runtime.generation || !canAnimatePage(pageId, { forceOnce })) {
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
    if (!runtime.ready || (!runtime.forceReplay && (daily.skipped || daily.seenSections.includes(sectionKey))) || prefersReducedMotion()) return;
    if (runtime.activeRun) return;
    window.setTimeout(() => {
      const currentDaily = ensureCurrentDay();
      if (runtime.activeRun || (!runtime.forceReplay && (currentDaily.skipped || currentDaily.seenSections.includes(sectionKey)))) return;
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

  function setForceReplay(enabled = false) {
    runtime.forceReplay = Boolean(enabled);
    persistForceReplayState(runtime.forceReplay);
    if (runtime.forceReplay && runtime.ready) {
      if (runtime.scheduleTimer) clearTimeout(runtime.scheduleTimer);
      runtime.scheduleTimer = 0;
      runtime.generation += 1;
      if (runtime.activeRun) finishRun(runtime.activeRun, { markSeen: false });
      schedulePage(runtime.queuedPage || "home");
    }
    return runtime.forceReplay;
  }

  function replayPage(pageId = runtime.queuedPage || "home", context = {}) {
    if (!PAGE_IDS.has(pageId) || prefersReducedMotion()) return false;
    if (context.userId && !runtime.prepared) prepareSession(context);
    if (!runtime.ready) return false;
    runtime.queuedPage = pageId;
    if (runtime.scheduleTimer) clearTimeout(runtime.scheduleTimer);
    runtime.scheduleTimer = 0;
    runtime.generation += 1;
    if (runtime.activeRun) finishRun(runtime.activeRun, { markSeen: false });
    schedulePage(pageId, { forceOnce: true });
    return true;
  }

  document.addEventListener("pointerdown", (event) => {
    if (!runtime.ready || !event.isTrusted || (!runtime.activeRun && !runtime.scheduleTimer && !runtime.pendingPages.size)) return;
    // A visible modal owns its own interaction.  In particular, a daily
    // warm-up Skip pointer must not arm the entrance's "consume next click"
    // guard, otherwise the player's next mobile tab tap is silently eaten.
    if (event.target?.closest?.(
      ".lens-modal-overlay.active, .lens-modal-overlay.is-opening, .lens-modal-overlay.is-closing, .agent-modal.active, .profile-edit-overlay.active, .auth-modal-overlay.active"
    )) return;
    armEntranceSkipClickGuard();
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
    replayPage,
    skipAll,
    resetToday,
    setForceReplay,
    getState: () => ({
      prepared: runtime.prepared,
      ready: runtime.ready,
      identity: runtime.identity,
      queuedPage: runtime.queuedPage,
      activePage: runtime.activeRun?.pageId || "",
      pendingPages: runtime.pendingPages.size,
      forceReplay: runtime.forceReplay,
      daily: runtime.daily ? { ...runtime.daily } : null
    })
  });
})();
