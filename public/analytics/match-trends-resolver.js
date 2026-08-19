(function () {
  "use strict";

  const SOURCE_VERSION = "2026-08-18";
  const MAX_CARDS = 6;
  const RECENT_WINDOW = 5;

  const METRICS = Object.freeze({
    winRate: Object.freeze({ label: "Win Rate", shortLabel: "WR", format: "percent", highGood: true, threshold: 8 }),
    kd: Object.freeze({ label: "K/D", shortLabel: "K/D", format: "ratio", highGood: true, threshold: 0.08 }),
    acs: Object.freeze({ label: "ACS", shortLabel: "ACS", format: "number", highGood: true, threshold: 12 }),
    hsPercent: Object.freeze({ label: "HS%", shortLabel: "HS%", format: "percent", highGood: true, threshold: 4 }),
    adr: Object.freeze({ label: "ADR", shortLabel: "ADR", format: "number", highGood: true, threshold: 10 }),
    assistsPerMatch: Object.freeze({ label: "Assists / Match", shortLabel: "AST", format: "decimal", highGood: true, threshold: 0.75 }),
    deathsPerMatch: Object.freeze({ label: "Deaths / Match", shortLabel: "DTH", format: "decimal", highGood: false, threshold: 0.7 })
  });

  const SLICE_META = Object.freeze({
    agent: Object.freeze({ label: "agent", display: "Agent", specificity: 4, mediaType: "agent", category: "agents" }),
    map: Object.freeze({ label: "map", display: "Map", specificity: 3, mediaType: "map", category: "maps" }),
    role: Object.freeze({ label: "role", display: "Role", specificity: 2, mediaType: "role", category: "agents" }),
    economy: Object.freeze({ label: "economy", display: "Economy", specificity: 2, mediaType: "weapon", category: "teamwork" }),
    overall: Object.freeze({ label: "overall", display: "Overall", specificity: 1, mediaType: "trend", category: "teamwork" })
  });

  function number(value, fallback = NaN) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function finite(value) {
    return Number.isFinite(Number(value));
  }

  function safeDivide(numerator, denominator) {
    const top = number(numerator, 0);
    const bottom = number(denominator, 0);
    return bottom ? top / bottom : 0;
  }

  function normalizeKey(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function readable(value = "") {
    const clean = String(value || "").trim();
    if (!clean) return "";
    return clean
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function activeRuleMin(category = "", fallback = 6) {
    const rules = globalThis.RankedCoachCoachingRules?.RULES || [];
    const matches = rules
      .filter(rule => rule?.status === "active" && normalizeKey(rule?.category) === normalizeKey(category))
      .map(rule => number(rule?.minMatches))
      .filter(Number.isFinite);
    return matches.length ? Math.min(...matches) : fallback;
  }

  function formatValue(metricKey, value) {
    const metric = METRICS[metricKey] || {};
    const numeric = number(value);
    if (!Number.isFinite(numeric)) return "--";
    if (metric.format === "percent") return `${Math.round(numeric)}%`;
    if (metric.format === "ratio") return numeric.toFixed(2);
    if (metric.format === "decimal") return numeric.toFixed(1);
    return `${Math.round(numeric)}`;
  }

  function formatDelta(metricKey, delta) {
    const metric = METRICS[metricKey] || {};
    const numeric = Math.abs(number(delta, 0));
    if (metric.format === "percent") return `${Math.round(numeric)}%`;
    const unit = metric.shortLabel || metric.label || "";
    if (metric.format === "ratio") return `${numeric.toFixed(2)} ${unit}`.trim();
    if (metric.format === "decimal") return `${numeric.toFixed(1)} ${unit}`.trim();
    return `${Math.round(numeric)} ${unit}`.trim();
  }

  function summarizeMatches(matchEntries = []) {
    const matches = (Array.isArray(matchEntries) ? matchEntries : []).filter(Boolean);
    const matchesWon = matches.filter(match => normalizeKey(match?.result) === "win").length;
    const matchesLost = matches.filter(match => normalizeKey(match?.result) === "loss").length;
    const kills = matches.reduce((sum, match) => sum + number(match?.kills, 0), 0);
    const deaths = matches.reduce((sum, match) => sum + number(match?.deaths, 0), 0);
    const assists = matches.reduce((sum, match) => sum + number(match?.assists, 0), 0);
    const acsValues = matches.map(match => number(match?.acs)).filter(Number.isFinite);
    const adrValues = matches.map(match => number(match?.adr)).filter(Number.isFinite);
    const hsValues = matches.map(match => number(match?.hs)).filter(Number.isFinite);

    return {
      matchesPlayed: matches.length,
      matchesWon,
      matchesLost,
      winRate: safeDivide(matchesWon * 100, matches.length),
      kd: deaths ? kills / deaths : kills,
      acs: acsValues.length ? acsValues.reduce((sum, value) => sum + value, 0) / acsValues.length : NaN,
      adr: adrValues.length ? adrValues.reduce((sum, value) => sum + value, 0) / adrValues.length : NaN,
      hsPercent: hsValues.length ? hsValues.reduce((sum, value) => sum + value, 0) / hsValues.length : NaN,
      assistsPerMatch: safeDivide(assists, matches.length),
      deathsPerMatch: safeDivide(deaths, matches.length)
    };
  }

  function metricFromSummary(summary = {}, metricKey = "") {
    if (metricKey === "winRate") return number(summary.winRate);
    if (metricKey === "kd") return number(summary.kd);
    if (metricKey === "acs") return number(summary.acs);
    if (metricKey === "hsPercent") return number(summary.hsPercent);
    if (metricKey === "adr") return number(summary.adr);
    if (metricKey === "assistsPerMatch") return number(summary.assistsPerMatch);
    if (metricKey === "deathsPerMatch") return number(summary.deathsPerMatch);
    return NaN;
  }

  function metricFromAggregate(entry = {}, metricKey = "") {
    if (metricKey === "winRate") return firstFinite(entry?.winrate, entry?.winRate);
    if (metricKey === "kd") return number(entry?.kd);
    if (metricKey === "acs") return number(entry?.acs);
    if (metricKey === "hsPercent") return number(entry?.hs);
    if (metricKey === "adr") return number(entry?.adr);
    if (metricKey === "assistsPerMatch") return safeDivide(number(entry?.assists, NaN), number(entry?.matchesPlayed, NaN));
    if (metricKey === "deathsPerMatch") return safeDivide(number(entry?.deaths, NaN), number(entry?.matchesPlayed, NaN));
    return NaN;
  }

  function firstFinite(...values) {
    for (const value of values) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return NaN;
  }

  function splitTrendWindow(matches = []) {
    const usable = (Array.isArray(matches) ? matches : []).filter(Boolean);
    if (usable.length < 6) return null;
    const recentCount = Math.min(RECENT_WINDOW, Math.max(3, Math.floor(usable.length / 2)));
    const recentMatches = usable.slice(-recentCount);
    const earlierMatches = usable.slice(0, usable.length - recentCount);
    if (recentMatches.length < 2 || earlierMatches.length < 2) return null;
    return {
      recent: summarizeMatches(recentMatches),
      earlier: summarizeMatches(earlierMatches),
      recentMatches,
      earlierMatches
    };
  }

  function formatMatchReference(match = {}) {
    const pieces = [];
    const index = Number(match?.matchIndex);
    if (Number.isFinite(index) && index > 0) pieces.push(`Match ${index}`);
    const agent = String(match?.agent || "").trim();
    const map = String(match?.map || "").trim();
    if (agent) pieces.push(agent);
    if (map) pieces.push(map);
    return pieces.filter(Boolean).join(", ") || "tracked match";
  }

  function formatMatchRange(matches = []) {
    const usable = (Array.isArray(matches) ? matches : []).filter(Boolean);
    if (!usable.length) return "No recorded matches.";
    const refs = usable.slice(-3).map(formatMatchReference).filter(Boolean);
    const extra = usable.length > refs.length ? ` + ${usable.length - refs.length} earlier` : "";
    return `${refs.join(" | ")}${extra}`;
  }

  function entityMatches(context = {}, sliceType = "", entityName = "") {
    const key = normalizeKey(entityName);
    return (Array.isArray(context?.matches) ? context.matches : []).filter((match) => {
      if (sliceType === "agent") return normalizeKey(match?.agent) === key;
      if (sliceType === "map") return normalizeKey(match?.map) === key;
      if (sliceType === "role") return normalizeKey(match?.role) === key;
      return false;
    });
  }

  function proofItem(label, stat, formula) {
    return { label, stat, formula };
  }

  function directionCopy(metricKey, improvement) {
    if (metricKey === "deathsPerMatch") return improvement ? "lower" : "higher";
    return improvement ? "above" : "below";
  }

  function actionFor(sliceType, entityLabel, metricKey, improvement) {
    const target = entityLabel || "this window";
    if (metricKey === "winRate") {
      return improvement
        ? `Write down the round plan that kept ${target} stable, then see if the next match repeats that same conversion.`
        : `Pick one lost-round pattern from ${target}, then play the next queue block with one simpler opening and one clearer regroup call.`;
    }
    if (metricKey === "kd" || metricKey === "acs" || metricKey === "adr" || metricKey === "hsPercent") {
      return improvement
        ? "Keep the same fight rule for one more block and review whether it is winning rounds, not just producing numbers."
        : "Use the next match to test one controlled fight habit: cleaner first contact, faster trade spacing, or a safer exit after value.";
    }
    if (metricKey === "assistsPerMatch") {
      return improvement
        ? "Keep pairing utility or spacing with a teammate so the team value stays repeatable."
        : "Before contact, call the teammate you are enabling and stay close enough for the trade or follow-up.";
    }
    if (sliceType === "economy") {
      return improvement
        ? "Protect the buy that is converting and avoid chasing an extra fight after the first advantage."
        : "Before the next buy, decide the safest opening lane and the exit path before spending the credits.";
    }
    return "Use the next match to test one repeatable round habit, then compare it against the next imported result.";
  }

  function makeSelfHistoryCard({ sliceType, entityLabel, metricKey, current, baseline, recentMatches, earlierMatches, recentMatchRefs = [], mediaValue }) {
    const metric = METRICS[metricKey];
    const meta = SLICE_META[sliceType] || SLICE_META.overall;
    if (!metric || !Number.isFinite(current) || !Number.isFinite(baseline)) return null;
    const rawDelta = current - baseline;
    const improvement = metric.highGood ? rawDelta > 0 : rawDelta < 0;
    const adjustedDelta = metric.highGood ? rawDelta : -rawDelta;
    if (Math.abs(adjustedDelta) < metric.threshold) return null;

    const tone = improvement ? "up" : "down";
    const deltaLabel = formatDelta(metricKey, rawDelta);
    const currentLabel = formatValue(metricKey, current);
    const baselineLabel = formatValue(metricKey, baseline);
    const direction = directionCopy(metricKey, improvement);
    const subject = entityLabel || readable(sliceType);
    const sliceLabel = meta.label;
    const reference = `your earlier ${subject} ${sliceLabel} baseline`;
    const detail = `Recorded matches: ${formatMatchRange(recentMatchRefs)}.`;
    const read = improvement
      ? `${subject} is moving in the right direction against its own earlier ${sliceLabel} games.`
      : `${subject} is slipping against its own earlier ${sliceLabel} games, so this stays visible.`;

    return {
      id: `match-trend-${sliceType}-${metricKey}-${normalizeKey(subject).replace(/[^a-z0-9]+/g, "-")}`,
      type: improvement ? "good" : "bad",
      title: `${subject} ${metric.label}`,
      preview: `${currentLabel} vs ${baselineLabel} earlier — anchored to ${reference}.`,
      what: `${subject} ${metric.label} is at ${currentLabel} in the latest ${recentMatches} matching games.`,
      why: `The latest ${recentMatches} ${subject} games moved away from the earlier ${earlierMatches}-game baseline for the same ${sliceLabel}.`,
      action: actionFor(sliceType, subject, metricKey, improvement),
      sources: ["Henrik match history", "RankedCoach trend resolver"],
      focus: metricKey === "winRate" ? "Map Awareness" : metricKey === "assistsPerMatch" ? "Teamwork" : "Discipline",
      category: "performance",
      priority: Math.round(65 + Math.min(30, Math.abs(adjustedDelta) * (metric.format === "ratio" ? 80 : 1))),
      selectionScore: 65 + Math.min(30, Math.abs(adjustedDelta) * (metric.format === "ratio" ? 80 : 1)) + meta.specificity,
      sliceType,
      metricKey,
      anchorType: "self-history",
      tone,
      deltaLabel,
      direction,
      label: `${subject} ${metric.label}`,
      kicker: meta.display,
      value: `${currentLabel} vs ${baselineLabel} earlier`,
      detail,
      read,
      sourceLabel: `Latest ${recentMatches} ${subject} ${sliceLabel} games compared with the previous ${earlierMatches}.`,
      formula: `${metric.shortLabel}: ${currentLabel} recent vs ${baselineLabel} earlier = ${deltaLabel} ${direction}.`,
      benchmark: `Anchored to ${reference}.`,
      mediaType: meta.mediaType,
      mediaValue: mediaValue || entityLabel,
      proofItems: [
        proofItem("Current", currentLabel, `Latest ${recentMatches} ${subject} ${sliceLabel} games.`),
        proofItem("Earlier Baseline", baselineLabel, `Previous ${earlierMatches} ${subject} ${sliceLabel} games.`),
        proofItem("Anchor", "Own baseline", `This card is shown because it has ${reference}.`),
        proofItem("Direction", tone === "up" ? "Strength" : "Needs work", detail)
      ]
    };
  }

  function makeRankAnchorCard({ sliceType = "overall", label, metricKey = "winRate", current, rankMetric, sampleLabel = "" }) {
    const metric = METRICS[metricKey];
    const meta = SLICE_META[sliceType] || SLICE_META.overall;
    const benchmark = number(rankMetric?.benchmark);
    if (!metric || !Number.isFinite(current) || !Number.isFinite(benchmark)) return null;
    const rawDelta = current - benchmark;
    const improvement = metric.highGood ? rawDelta > 0 : rawDelta < 0;
    const adjustedDelta = metric.highGood ? rawDelta : -rawDelta;
    if (Math.abs(adjustedDelta) < metric.threshold) return null;

    const tone = improvement ? "up" : "down";
    const currentLabel = formatValue(metricKey, current);
    const benchmarkLabel = formatValue(metricKey, benchmark);
    const deltaLabel = formatDelta(metricKey, rawDelta);
    const direction = directionCopy(metricKey, improvement);
    const subject = label || meta.display;
    const subjectLower = String(subject || "").toLowerCase();
    const metricLabelLower = String(metric.label || "").toLowerCase();
    const metricShortLower = String(metric.shortLabel || "").toLowerCase();
    const alreadyNamed = Boolean(
      metricLabelLower && subjectLower.includes(metricLabelLower)
    ) || Boolean(
      metricShortLower && subjectLower.includes(metricShortLower)
    );
    const displayTitle = alreadyNamed ? subject : `${subject} ${metric.label}`;
    const detail = sampleLabel
      ? `Recorded matches: ${sampleLabel}`
      : `${displayTitle} is ${deltaLabel} ${direction} your rank's average.`;

    return {
      id: `match-trend-${sliceType}-${metricKey}-${normalizeKey(subject).replace(/[^a-z0-9]+/g, "-")}`,
      type: improvement ? "good" : "bad",
      title: displayTitle,
      preview: `${currentLabel} vs ${benchmarkLabel} for your rank's average.`,
      what: `${displayTitle} is at ${currentLabel}.`,
      why: sampleLabel || `This stat is far enough from your rank's average to be useful in the current match window.`,
      action: actionFor(sliceType, subject, metricKey, improvement),
      sources: ["Henrik match history", "Rank baseline"],
      focus: sliceType === "economy" ? "Credit/Ult Economy" : metricKey === "winRate" ? "Map Awareness" : "Discipline",
      category: "performance",
      priority: Math.round(62 + Math.min(28, Math.abs(adjustedDelta) * (metric.format === "ratio" ? 80 : 1))),
      selectionScore: 62 + Math.min(28, Math.abs(adjustedDelta) * (metric.format === "ratio" ? 80 : 1)) + meta.specificity,
      sliceType,
      metricKey,
      anchorType: "rank",
      tone,
      deltaLabel,
      direction,
      label: displayTitle,
      kicker: meta.display,
      value: `${currentLabel} vs ${benchmarkLabel} rank average`,
      detail,
      read: improvement
        ? (metricKey === "postPistolWinRate"
          ? "Continue what you're doing — it's working in your favor."
          : `${displayTitle} is beating the rank reference; keep the repeatable part of the round plan.`)
        : (metricKey === "postPistolWinRate"
          ? "The round after pistol is slipping; keep the second-round plan simpler."
          : `${displayTitle} is behind the rank reference; fix one controllable habit before broad changes.`),
      sourceLabel: sampleLabel || "Current imported match window compared with your rank's average.",
      formula: `${metric.shortLabel}: ${currentLabel} current vs ${benchmarkLabel} rank average = ${deltaLabel} ${direction}.`,
      benchmark: "Anchored to your rank's average.",
      mediaType: meta.mediaType,
      mediaValue: sliceType === "economy" ? "rifle" : "",
      proofItems: [
        proofItem("Current", currentLabel, sampleLabel || "Current imported match window."),
        proofItem("Rank Average", benchmarkLabel, "Rank baseline table captured from the current aggregate source."),
        proofItem("Anchor", "Rank average", "This card is shown because a rank benchmark exists for this stat."),
        proofItem("Direction", tone === "up" ? "Strength" : "Needs work", detail)
      ]
    };
  }

  function buildSliceCards(context = {}) {
    const cards = [];
    const sliceConfigs = [
      { type: "agent", entries: context?.agents || [], nameField: "agent", metrics: ["winRate", "kd", "acs", "hsPercent", "assistsPerMatch"] },
      { type: "map", entries: context?.maps || [], nameField: "map", metrics: ["winRate", "kd", "acs", "adr"] },
      { type: "role", entries: context?.roles || [], nameField: "role", metrics: ["winRate", "kd", "acs", "hsPercent", "assistsPerMatch", "deathsPerMatch"] }
    ];

    sliceConfigs.forEach((config) => {
      const meta = SLICE_META[config.type] || SLICE_META.overall;
      const minMatches = activeRuleMin(meta.category, 6);
      (Array.isArray(config.entries) ? config.entries : []).forEach((entry) => {
        const entity = String(entry?.[config.nameField] || entry?.label || "").trim();
        if (!entity || number(entry?.matchesPlayed, 0) < minMatches) return;
        const selected = entityMatches(context, config.type, entity);
        if (selected.length < minMatches) return;
        const windows = splitTrendWindow(selected);
        if (!windows) return;

        config.metrics.forEach((metricKey) => {
          if (!Number.isFinite(metricFromAggregate(entry, metricKey)) && !Number.isFinite(metricFromSummary(windows.recent, metricKey))) return;
          const card = makeSelfHistoryCard({
            sliceType: config.type,
            entityLabel: readable(entity),
            metricKey,
            current: metricFromSummary(windows.recent, metricKey),
            baseline: metricFromSummary(windows.earlier, metricKey),
            recentMatches: windows.recent.matchesPlayed,
            earlierMatches: windows.earlier.matchesPlayed,
            recentMatchRefs: windows.recentMatches,
            mediaValue: entity
          });
          if (card) cards.push(card);
        });
      });
    });

    return cards;
  }

  function buildEconomyCards(context = {}) {
    const cards = [];
    const overview = context?.overview || {};
    const economy = context?.economy || {};
    const matchCount = number(overview?.matchesPlayed, 0);
    const minMatches = activeRuleMin("teamwork", 6);
    if (matchCount < minMatches) return cards;
    const rankWinRate = context?.rankComparison?.metrics?.winRate || null;

    [
      { key: "fullBuyWinRate", label: "Full-Buy Conversion", value: overview.fullBuyWinRate },
      { key: "lightBuyWinRate", label: "Light-Buy Conversion", value: overview.lightBuyWinRate },
      { key: "ecoWinRate", label: "Eco Conversion", value: overview.ecoWinRate },
      { key: "pistolWinRate", label: "Pistol Conversion", value: economy.pistolWinRate, sample: `${number(economy.pistolOpportunities, 0)} pistol rounds checked.` },
      { key: "postPistolWinRate", label: "Post-Pistol Conversion", value: economy.postPistolWinRate, sample: `${number(economy.postPistolOpportunities, 0)} post-pistol rounds checked.` }
    ].forEach((bucket) => {
      if (!finite(bucket.value)) return;
      const card = makeRankAnchorCard({
        sliceType: "economy",
        label: bucket.label,
        metricKey: "winRate",
        current: number(bucket.value),
        rankMetric: rankWinRate,
        sampleLabel: bucket.sample || `${matchCount} imported matches with economy conversion data.`
      });
      if (card) {
        card.id = `match-trend-economy-${bucket.key}`;
        card.mediaValue = "rifle";
        if (bucket.key === "postPistolWinRate") {
          const improvement = card.tone === "up";
          card.title = "Round After Pistol";
          card.label = "Round After Pistol";
          card.read = improvement
            ? "Continue what you're doing — it's working in your favor."
            : "The round after pistol is slipping; keep the second-round plan simpler.";
          card.action = improvement
            ? "Keep the same second-round buy discipline and avoid giving back the first advantage."
            : "After pistol, call the buy quickly and protect the weapon advantage instead of forcing solo fights.";
        }
        cards.push(card);
      }
    });

    return cards;
  }

  function buildOverallRankCards(context = {}) {
    const cards = [];
    const overview = context?.overview || {};
    const rankMetrics = context?.rankComparison?.metrics || {};
    const matchCount = number(overview.matchesPlayed, 0);
    if (matchCount < 3) return cards;
    [
      { metricKey: "winRate", value: overview.winrate || overview.winRate, rank: rankMetrics.winRate, label: "Overall Win Rate" },
      { metricKey: "kd", value: overview.kd, rank: rankMetrics.kd, label: "Overall K/D" },
      { metricKey: "acs", value: overview.acs, rank: rankMetrics.acs, label: "Overall ACS" },
      { metricKey: "hsPercent", value: overview.hs, rank: rankMetrics.hsPercent, label: "Overall HS%" }
    ].forEach((entry) => {
      const card = makeRankAnchorCard({
        sliceType: "overall",
        label: entry.label,
        metricKey: entry.metricKey,
        current: number(entry.value),
        rankMetric: entry.rank,
        sampleLabel: `${matchCount} imported matches in the current selected window.`
      });
      if (card) cards.push(card);
    });
    return cards;
  }

  function dedupeBySpecificity(cards = []) {
    const sorted = (Array.isArray(cards) ? cards : [])
      .filter(card => card && card.anchorType && card.value && card.benchmark)
      .sort((a, b) => {
        const aSpecificity = SLICE_META[a.sliceType]?.specificity || 0;
        const bSpecificity = SLICE_META[b.sliceType]?.specificity || 0;
        return (bSpecificity - aSpecificity) || (number(b.selectionScore, 0) - number(a.selectionScore, 0));
      });

    const kept = [];
    const coveredAgentMetric = new Set();
    const coveredSliceMetric = new Set();

    sorted.forEach((card) => {
      const metricKey = normalizeKey(card.metricKey);
      const sliceType = normalizeKey(card.sliceType);
      const tone = normalizeKey(card.tone);
      const generalKey = `${metricKey}:${tone}`;
      const exactKey = `${sliceType}:${metricKey}:${normalizeKey(card.mediaValue || card.label)}:${tone}`;

      if (coveredSliceMetric.has(exactKey)) return;
      if (sliceType === "role" && coveredAgentMetric.has(generalKey)) return;
      if (sliceType === "overall" && kept.some(existing => normalizeKey(existing.metricKey) === metricKey && normalizeKey(existing.tone) === tone && existing.sliceType !== "overall")) return;

      kept.push(card);
      coveredSliceMetric.add(exactKey);
      if (sliceType === "agent") coveredAgentMetric.add(generalKey);
    });

    const ranked = kept
      .sort((a, b) => number(b.selectionScore ?? b.priority, 0) - number(a.selectionScore ?? a.priority, 0));
    const diversified = [];
    ["agent", "map", "economy", "role", "overall"].forEach((sliceType) => {
      const candidate = ranked.find(card => normalizeKey(card.sliceType) === sliceType && !diversified.includes(card));
      if (candidate && diversified.length < MAX_CARDS) diversified.push(candidate);
    });
    ranked.forEach((card) => {
      if (diversified.length >= MAX_CARDS || diversified.includes(card)) return;
      diversified.push(card);
    });
    return diversified;
  }

  function resolveMatchTrends(context = {}) {
    const candidateCards = [
      ...buildSliceCards(context),
      ...buildEconomyCards(context),
      ...buildOverallRankCards(context)
    ];
    return dedupeBySpecificity(candidateCards);
  }

  globalThis.RankedCoachMatchTrendsResolver = Object.freeze({
    SOURCE_VERSION,
    resolveMatchTrends
  });
})();
