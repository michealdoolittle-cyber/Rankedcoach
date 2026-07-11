(function registerWarmupCorrelation(global) {
  "use strict";

  const MIN_DAYS_PER_GROUP = 7;
  const MIN_MATCHES_PER_GROUP = 10;

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function dateKey(value) {
    const date = value instanceof Date ? value : new Date(value || 0);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function matchDate(match = {}) {
    return dateKey(
      match?.matchRecord?.playedAt
      || match?.matchRecord?.createdAt
      || match?.metadata?.playedAt
      || match?.createdAt
    );
  }

  function matchResult(match = {}) {
    return String(match?.matchRecord?.result || match?.metadata?.result || match?.result || "").toLowerCase();
  }

  function matchAcs(match = {}) {
    return number(
      match?.matchRecord?.stats?.acs,
      number(match?.segments?.[0]?.stats?.scorePerRound?.value, number(match?.acs, NaN))
    );
  }

  function matchKast(match = {}) {
    return number(
      match?.roundMetrics?.overall?.percentage,
      number(match?.matchRecord?.advanced?.overallKast, NaN)
    );
  }

  function isWarmupComplete(record = {}) {
    if (record?.dmTdmAutoVerified === true) return true;
    return record?.skipped !== true && (
      record?.status === "completed"
      || record?.dmTdmSelfReported === true
      || (Array.isArray(record?.drillsSelected) && record.drillsSelected.length > 0)
    );
  }

  function summarize(matches = [], days = []) {
    const daySet = new Set(days);
    const scoped = matches.filter(match => daySet.has(matchDate(match)));
    const acsValues = scoped.map(matchAcs).filter(Number.isFinite);
    const kastValues = scoped.map(matchKast).filter(value => Number.isFinite(value) && value > 0);
    const wins = scoped.filter(match => matchResult(match) === "win").length;
    return {
      days: daySet.size,
      matches: scoped.length,
      wins,
      winRate: scoped.length ? (wins / scoped.length) * 100 : 0,
      acs: acsValues.length ? acsValues.reduce((sum, value) => sum + value, 0) / acsValues.length : null,
      kast: kastValues.length ? kastValues.reduce((sum, value) => sum + value, 0) / kastValues.length : null
    };
  }

  function compute({ warmupLog = [], matches = [] } = {}) {
    const records = (Array.isArray(warmupLog) ? warmupLog : [])
      .filter(record => /^\d{4}-\d{2}-\d{2}$/.test(String(record?.date || "")))
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    const competitiveMatches = (Array.isArray(matches) ? matches : []).filter(match => matchDate(match));
    if (!records.length) {
      return {
        ready: false,
        status: "no-warmup-days",
        requiredDaysPerGroup: MIN_DAYS_PER_GROUP,
        requiredMatchesPerGroup: MIN_MATCHES_PER_GROUP
      };
    }

    const studyStart = records[0].date;
    const recordByDate = new Map(records.map(record => [record.date, record]));
    const playedDates = [...new Set(competitiveMatches.map(matchDate))].filter(date => date >= studyStart);
    const warmDays = playedDates.filter(date => isWarmupComplete(recordByDate.get(date)));
    const comparisonDays = playedDates.filter(date => !isWarmupComplete(recordByDate.get(date)));
    const warm = summarize(competitiveMatches, warmDays);
    const comparison = summarize(competitiveMatches, comparisonDays);
    const ready = warm.days >= MIN_DAYS_PER_GROUP
      && comparison.days >= MIN_DAYS_PER_GROUP
      && warm.matches >= MIN_MATCHES_PER_GROUP
      && comparison.matches >= MIN_MATCHES_PER_GROUP;

    const result = {
      ready,
      status: ready ? "ready" : "building-sample",
      requiredDaysPerGroup: MIN_DAYS_PER_GROUP,
      requiredMatchesPerGroup: MIN_MATCHES_PER_GROUP,
      warm,
      comparison
    };
    if (!ready) return result;

    result.delta = {
      winRate: warm.winRate - comparison.winRate,
      acs: Number.isFinite(warm.acs) && Number.isFinite(comparison.acs) ? warm.acs - comparison.acs : null,
      kast: Number.isFinite(warm.kast) && Number.isFinite(comparison.kast) ? warm.kast - comparison.kast : null
    };
    result.direction = result.delta.winRate >= 4 || number(result.delta.kast) >= 2
      ? "positive"
      : result.delta.winRate <= -4 || number(result.delta.kast) <= -2
        ? "negative"
        : "neutral";
    result.confidence = warm.days >= 12 && comparison.days >= 12 ? "Healthy Sample" : "Developing Sample";
    return result;
  }

  global.RankedCoachWarmupCorrelation = Object.freeze({
    MIN_DAYS_PER_GROUP,
    MIN_MATCHES_PER_GROUP,
    compute,
    isWarmupComplete
  });
})(globalThis);
