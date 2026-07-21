(function () {
  "use strict";

  const SOURCE_VERSION = "2026-07-17";
  const SOURCE_PATH = "docs/COACHING-LANGUAGE-RULES.md";

  // First-pass rules are limited to signals the current Henrik and Logging
  // schemas can support. Policy and blocked entries remain explicit so an
  // unavailable signal cannot quietly turn into an inferred coaching claim.
  const RULES = Object.freeze([
    { id: "map-early-leader", sourceRule: 1, category: "maps", status: "active", condition: "map-early-leader", minMatches: 6 },
    { id: "map-pool-conversion", sourceRule: 8, category: "maps", status: "active", condition: "map-pool-conversion", minMatches: 8 },
    { id: "map-tiny-sample", sourceRule: 20, category: "maps", status: "policy", reason: "Suppress map claims below three matches." },
    { id: "map-recent-improvement", sourceRule: 49, category: "maps", status: "active", condition: "map-recent-improvement", minMatches: 8 },
    { id: "map-no-forced-outlier", sourceRule: 50, category: "maps", status: "policy", reason: "Do not manufacture a map read when no useful outlier exists." },

    { id: "duelist-opening-duty", sourceRule: 51, category: "agents", status: "active", condition: "duelist-opening-duty", minMatches: 6 },
    { id: "initiator-assist-balance", sourceRule: 55, category: "agents", status: "active", condition: "initiator-assist-balance", minMatches: 6 },
    { id: "agent-pool-width", sourceRule: 66, category: "agents", status: "active", condition: "agent-pool-width", minMatches: 10 },
    { id: "role-fit-signal", sourceRule: 85, category: "agents", status: "active", condition: "role-fit-signal", minMatches: 10 },
    { id: "duelist-trade-context", sourceRule: 97, category: "agents", status: "active", condition: "duelist-trade-context", minMatches: 6 },

    { id: "weapon-hs-context", sourceRule: 101, category: "weapons", status: "policy", reason: "Use the existing weapon-adjusted headshot weighting." },
    { id: "damage-spike-reliance", sourceRule: 102, category: "weapons", status: "active", condition: "damage-spike-reliance", minMatches: 6 },
    { id: "rifle-rank-hs-gap", sourceRule: 103, category: "weapons", status: "active", condition: "rifle-rank-hs-gap", minMatches: 6 },
    { id: "sniper-buy-conversion", sourceRule: 105, category: "weapons", status: "active", condition: "sniper-buy-conversion", minMatches: 6 },
    { id: "weapon-small-sample", sourceRule: 150, category: "weapons", status: "policy", reason: "Use category coaching until a weapon has enough rounds." },

    { id: "utility-timing", sourceRule: 151, category: "utility", status: "blocked", reason: "Henrik provides cast counts but no cast timestamps." },
    { id: "utility-volume-conversion", sourceRule: 157, category: "utility", status: "active", condition: "utility-volume-conversion", minMatches: 8 },
    { id: "utility-agent-context", sourceRule: 184, category: "utility", status: "policy", reason: "Never compare utility casts across agents as a flat rate." },
    { id: "utility-economy-context", sourceRule: 192, category: "utility", status: "policy", reason: "Do not judge lower cast volume without economy context." },
    { id: "utility-unavailable-copy", sourceRule: 200, category: "utility", status: "policy", reason: "State unavailable timing plainly and never estimate it." },

    { id: "team-trade-efficiency", sourceRule: 201, category: "teamwork", status: "active", condition: "team-trade-efficiency", minMatches: 6 },
    { id: "individual-output-team-gap", sourceRule: 202, category: "teamwork", status: "active", condition: "individual-output-team-gap", minMatches: 8 },
    { id: "post-pistol-conversion", sourceRule: 206, category: "teamwork", status: "active", condition: "post-pistol-conversion", minMatches: 6 },
    { id: "role-aware-trades", sourceRule: 219, category: "teamwork", status: "active", condition: "role-aware-trades", minMatches: 6 },
    { id: "team-confidence-cap", sourceRule: 250, category: "teamwork", status: "policy", reason: "Team reads remain lower confidence than individual evidence." },

    { id: "comms-trade-correlation", sourceRule: 253, category: "communication", status: "active", condition: "comms-trade-correlation", minMatches: 6, minLogs: 4 },
    { id: "tilt-performance-correlation", sourceRule: 258, category: "communication", status: "active", condition: "tilt-performance-correlation", minMatches: 6, minLogs: 5 },
    { id: "comms-kast-correlation", sourceRule: 266, category: "communication", status: "active", condition: "comms-kast-correlation", minMatches: 6, minLogs: 4 },
    { id: "logged-comms-breakdown", sourceRule: 271, category: "communication", status: "active", condition: "logged-comms-breakdown", minMatches: 4, minLogs: 3 },
    { id: "comms-proxy-only", sourceRule: 300, category: "communication", status: "policy", reason: "Use player-authored logs as a proxy; never imply voice-chat access." }
  ]);

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function average(values = []) {
    const usable = values.map(Number).filter(Number.isFinite);
    return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : 0;
  }

  function winrate(matches = []) {
    return matches.length ? (matches.filter(match => match.result === "win").length / matches.length) * 100 : 0;
  }

  function getFamily(context, key) {
    return (context?.weapons?.families || []).find(entry => String(entry?.typeKey || "").toLowerCase() === key) || null;
  }

  function getRepeatedMaps(context) {
    return (context?.maps || []).filter(map => number(map?.matchesPlayed) >= 2);
  }

  function getRole(context, roleName) {
    return (context?.roles || []).find(role => String(role?.role || "").toLowerCase() === roleName) || null;
  }

  function evidenceFor(condition, context) {
    const overview = context?.overview || {};
    const maps = context?.maps || [];
    const agents = context?.agents || [];
    const roles = context?.roles || [];
    const matches = context?.matches || [];
    const logs = context?.logs || {};
    const repeatedMaps = getRepeatedMaps(context);

    if (condition === "map-early-leader") {
      const leader = maps.slice().sort((a, b) => number(b.winrate) - number(a.winrate))[0];
      const comparison = maps.filter(map => map !== leader && number(map.matchesPlayed) >= 2);
      const nextRate = comparison.length ? Math.max(...comparison.map(map => number(map.winrate))) : 0;
      return leader && number(leader.matchesPlayed) >= 3 && number(leader.matchesPlayed) < 10
        && number(leader.winrate) >= 55 && number(leader.winrate) - nextRate >= 15
        ? { leader, nextRate }
        : null;
    }
    if (condition === "map-pool-conversion") {
      return repeatedMaps.length >= 3 && repeatedMaps.every(map => number(map.winrate) < 50)
        ? { repeatedMaps, best: repeatedMaps.slice().sort((a, b) => number(b.winrate) - number(a.winrate))[0] }
        : null;
    }
    if (condition === "map-recent-improvement") {
      for (const map of maps) {
        const mapMatches = matches.filter(match => match.map === map.map);
        if (mapMatches.length < 5) continue;
        const recent = mapMatches.slice(-3);
        const earlier = mapMatches.slice(0, -3);
        if (earlier.length >= 2 && winrate(recent) - winrate(earlier) >= 20) {
          return { map, recentRate: winrate(recent), earlierRate: winrate(earlier) };
        }
      }
      return null;
    }
    if (condition === "duelist-opening-duty") {
      const duelist = getRole(context, "duelist");
      return duelist && number(duelist.matchesPlayed) >= 4 && number(context?.advanced?.firstBloodRoundRate) < 8
        ? { duelist, rate: number(context.advanced.firstBloodRoundRate) }
        : null;
    }
    if (condition === "initiator-assist-balance") {
      const initiators = agents.filter(agent => String(agent?.role || "").toLowerCase() === "initiator" && number(agent.matchesPlayed) >= 4);
      const target = initiators.find(agent => number(agent.assists) / Math.max(1, number(agent.matchesPlayed)) < 3 && number(agent.kd) >= 0.95);
      return target ? { agent: target, assistsPerMatch: number(target.assists) / number(target.matchesPlayed) } : null;
    }
    if (condition === "agent-pool-width") {
      const recent = matches.slice(-10);
      const counts = recent.reduce((result, match) => ({ ...result, [match.agent]: (result[match.agent] || 0) + 1 }), {});
      const highestShare = recent.length ? Math.max(0, ...Object.values(counts)) / recent.length * 100 : 0;
      return Object.keys(counts).filter(Boolean).length >= 5 && highestShare < 40
        ? { agentCount: Object.keys(counts).length, highestShare }
        : null;
    }
    if (condition === "role-fit-signal") {
      const eligible = roles.filter(role => number(role.matchesPlayed) >= 4).sort((a, b) => number(b.winrate) - number(a.winrate));
      return eligible.length >= 2 && number(eligible[0].winrate) - number(eligible.at(-1).winrate) >= 18
        ? { best: eligible[0], weakest: eligible.at(-1) }
        : null;
    }
    if (condition === "duelist-trade-context") {
      const duelist = getRole(context, "duelist");
      const deathsPerMatch = duelist ? number(duelist.deaths) / Math.max(1, number(duelist.matchesPlayed)) : 0;
      return duelist && number(context?.roundSignals?.tradeReceivedOpportunities) >= 10
        && deathsPerMatch >= 13 && number(overview.tradeReceivedRate) >= 30
        ? { duelist, deathsPerMatch, tradeRate: number(overview.tradeReceivedRate) }
        : null;
    }
    if (condition === "damage-spike-reliance") {
      return number(overview.killsPerMatch) >= 15 && number(overview.damageCoefficientOfVariation) >= 0.85
        ? { killsPerMatch: number(overview.killsPerMatch), variation: number(overview.damageCoefficientOfVariation) }
        : null;
    }
    if (condition === "rifle-rank-hs-gap") {
      const rifleShare = number(context?.weapons?.shares?.rifle);
      const hsMetric = context?.rankComparison?.metrics?.hsPercent;
      return rifleShare >= 55 && number(context?.weapons?.rounds) >= 40 && hsMetric?.direction === "below"
        ? { rifleShare, hs: number(overview.hs), benchmark: number(hsMetric.benchmark) }
        : null;
    }
    if (condition === "sniper-buy-conversion") {
      const sniper = getFamily(context, "sniper");
      return sniper && number(sniper.rounds) >= 20 && number(sniper.winrate) < 42
        ? { sniper }
        : null;
    }
    if (condition === "utility-volume-conversion") {
      return number(context?.utility?.knownRounds) >= 80 && number(context?.utility?.castsPerRound) >= 1.5 && number(overview.winrate) < 45
        ? { castsPerRound: number(context.utility.castsPerRound), winrate: number(overview.winrate) }
        : null;
    }
    if (condition === "team-trade-efficiency") {
      return number(context?.roundSignals?.tradeGivenOpportunities) >= 15 && number(overview.tradeGivenRate) < 25
        ? { rate: number(overview.tradeGivenRate), opportunities: number(context.roundSignals.tradeGivenOpportunities) }
        : null;
    }
    if (condition === "individual-output-team-gap") {
      return number(overview.kd) >= 1.1 && number(overview.winrate) < 48 && number(overview.tradeGivenRate) < 30
        ? { kd: number(overview.kd), winrate: number(overview.winrate), tradeRate: number(overview.tradeGivenRate) }
        : null;
    }
    if (condition === "post-pistol-conversion") {
      const economy = context?.economy || {};
      return number(economy.pistolOpportunities) >= 4 && number(economy.pistolWinRate) >= 55
        && number(economy.postPistolOpportunities) >= 3 && number(economy.postPistolWinRate) < 45
        ? economy
        : null;
    }
    if (condition === "role-aware-trades") {
      const supportRole = ["controller", "initiator", "sentinel"].includes(String(context?.currentRole || "").toLowerCase());
      return supportRole && number(context?.roundSignals?.tradeGivenOpportunities) >= 15
        && number(overview.tradeGivenRate) + 12 < number(overview.tradeReceivedRate)
        ? { role: context.currentRole, given: number(overview.tradeGivenRate), received: number(overview.tradeReceivedRate) }
        : null;
    }
    if (condition === "comms-trade-correlation") {
      return number(logs.commsEnabledRate) < 60 && number(overview.tradeGivenRate) < 30
        ? { commsRate: number(logs.commsEnabledRate), tradeRate: number(overview.tradeGivenRate) }
        : null;
    }
    if (condition === "tilt-performance-correlation") {
      return number(logs.negativeMoodRate) >= 20 && number(overview.winrate) < 45
        ? { moodRate: number(logs.negativeMoodRate), winrate: number(overview.winrate) }
        : null;
    }
    if (condition === "comms-kast-correlation") {
      return number(logs.commsEnabledRate) < 60 && number(overview.overallKAST) > 0 && number(overview.overallKAST) < 65
        ? { commsRate: number(logs.commsEnabledRate), kast: number(overview.overallKAST) }
        : null;
    }
    if (condition === "logged-comms-breakdown") {
      return number(logs.communicationMentions) >= 2
        ? { mentions: number(logs.communicationMentions) }
        : null;
    }
    return null;
  }

  function insightFor(rule, evidence, context) {
    const sampleLabel = context?.sample?.label || "Low Confidence";
    const source = `Coaching rule ${rule.sourceRule}`;
    const common = {
      coachingRuleId: rule.id,
      coachingRuleNumber: rule.sourceRule,
      category: rule.category,
      sources: ["Henrik Match History", source],
      sampleNote: context?.sample?.explanation || "",
      confidence: sampleLabel
    };
    const builders = {
      "map-early-leader": () => ({ type: "good", title: "Map Result Is Promising, Not Proven", preview: `${evidence.leader.map} is at ${Math.round(evidence.leader.winrate)}% WR across ${evidence.leader.matchesPlayed} matches.`, what: `${evidence.leader.map} is your best early map result right now.`, why: "A few wins are worth protecting, but fewer than ten games is still too soon to call it a permanent strength.", action: `Keep one repeatable plan for ${evidence.leader.map} and recheck it after ten matches.`, focus: "Map Planning", priority: 72 }),
      "map-pool-conversion": () => ({ type: "warn", title: "Map Pool Needs One Stable Plan", preview: `All ${evidence.repeatedMaps.length} repeated maps are below 50% WR.`, what: "Several repeated maps are losing more than they win, not just one unlucky map.", why: "That usually means the round plan needs to get simpler before the next queue block.", action: `Start with ${evidence.best.map}: use one attack default and one defense fallback for the next block.`, focus: "Map Fundamentals", priority: 93 }),
      "map-recent-improvement": () => ({ type: "good", title: "Recent Map Work Is Moving", preview: `${evidence.map.map} rose from ${Math.round(evidence.earlierRate)}% to ${Math.round(evidence.recentRate)}% WR recently.`, what: `Your latest ${evidence.map.map} games are winning more often than the earlier ones.`, why: "The direction is positive, even if the season-long record still needs more matches.", action: `Repeat the same ${evidence.map.map} preparation for the next three games before changing it.`, focus: "Map Progress", priority: 76 }),
      "duelist-opening-duty": () => ({ type: "warn", title: "Duelist Openings Need More Presence", preview: `Opening kills appear in ${Math.round(evidence.rate)}% of rounds in this scope.`, what: "Your duelist games are not creating enough early advantages yet.", why: "You can make space without getting every first kill, so judge the entry path and support around it too.", action: "Choose one supported entry path and ask for the enabling utility before committing.", focus: "Entry Timing", priority: 86 }),
      "initiator-assist-balance": () => ({ type: "warn", title: "Initiator Value Needs More Follow-Through", preview: `${evidence.agent.agent} is averaging ${evidence.assistsPerMatch.toFixed(1)} assists per match.`, what: `Your ${evidence.agent.agent} fights are competitive, but they are not turning into enough teammate help yet.`, why: "That often means the reveal, flash, or clear is arriving before a teammate is ready to use it.", action: "Call the next piece of utility before using it, then stay close enough to follow the teammate it enables.", focus: "Utility Follow-Through", priority: 79 }),
      "agent-pool-width": () => ({ type: "warn", title: "Agent Pool Is Changing Too Often", preview: `You played ${evidence.agentCount} agents in the last 10 matches, with no pick above ${Math.round(evidence.highestShare)}%.`, what: "You are switching agents too often to repeat one role job.", why: "Frequent switching makes it harder to tell an agent problem from normal adaptation time.", action: "Use a two-agent pool for the next five matches and keep each agent's job simple.", focus: "Agent Pool", priority: 82 }),
      "role-fit-signal": () => ({ type: "good", title: "One Role Is Working More Reliably", preview: `${evidence.best.role} is ${Math.round(evidence.best.winrate)}% WR versus ${evidence.weakest.role} at ${Math.round(evidence.weakest.winrate)}%.`, what: `${evidence.best.role} is giving you the cleanest repeated role result right now.`, why: "Both roles have enough matches to make the difference useful, while future games can still move it.", action: `Keep ${evidence.best.role} as the main role for the next block and give ${evidence.weakest.role} one narrower job when needed.`, focus: "Role Fit", priority: 80 }),
      "duelist-trade-context": () => ({ type: "good", title: "Entry Deaths Are Getting Recovered", preview: `${Math.round(evidence.tradeRate)}% of your deaths were traded in a high-death duelist sample.`, what: "The death count is high, but teammates are recovering a useful share of those entry deaths.", why: "A traded space-taking death is different from an isolated first death, so the role context matters.", action: "Keep entries close enough for the trade while cutting any death that happens outside teammate reach.", focus: "Entry Spacing", priority: 74 }),
      "damage-spike-reliance": () => ({ type: "warn", title: "Damage Is Leaning On A Few Big Rounds", preview: `You average ${evidence.killsPerMatch.toFixed(1)} kills per match, but your round damage changes sharply.`, what: "Your kill volume is healthy, but the damage is arriving unevenly.", why: "A few large rounds can lift the total while too many other rounds start without useful pressure.", action: "Use one repeatable early damage plan so more rounds contribute before the fight becomes chaotic.", focus: "Damage Consistency", priority: 83 }),
      "rifle-rank-hs-gap": () => ({ type: "warn", title: "Rifle Precision Trails The Rank Reference", preview: `${Math.round(evidence.rifleShare)}% rifle usage with ${evidence.hs.toFixed(1)}% HS against a provisional ${evidence.benchmark.toFixed(1)}% reference.`, what: "Headshot accuracy is a relevant gap here because rifles make up most of the weapon sample.", why: "The app only elevates this comparison when weapon mix and the rank reference support it together.", action: "For the next block, hold crosshair height through the first angle instead of correcting after contact.", focus: "Crosshair Placement", priority: 81 }),
      "sniper-buy-conversion": () => ({ type: "warn", title: "Sniper Rounds Are Not Paying Back", preview: `${evidence.sniper.rounds} sniper rounds are winning ${Math.round(evidence.sniper.winrate)}% of the time.`, what: "Your sniper buys are not returning enough round wins yet.", why: "A high-cost weapon has to win the round often enough, not just find one clean pick.", action: "Only take the next sniper buy with a planned opening angle and a safe reposition path.", focus: "Sniper Economy", priority: 84 }),
      "utility-volume-conversion": () => ({ type: "warn", title: "Utility Needs A Clearer Follow-Up", preview: `${evidence.castsPerRound.toFixed(1)} recorded casts per round with ${Math.round(evidence.winrate)}% match wins.`, what: "You are using plenty of utility, but the rounds are not improving beside it yet.", why: "Cast counts show volume only; without timestamps, the app cannot claim the placement or timing was wrong.", action: "Pair one called piece of utility with one teammate action and review whether that sequence wins space.", focus: "Utility Coordination", priority: 78 }),
      "team-trade-efficiency": () => ({ type: "warn", title: "Teammate Deaths Need Faster Answers", preview: `${Math.round(evidence.rate)}% of ${evidence.opportunities} teammate-death rounds were traded by you.`, what: "Too many teammate deaths are going unanswered inside the trade window.", why: "This can come from spacing or different round jobs, so treat it as a coordination issue rather than an aim verdict.", action: "Start the next contact one step closer to the teammate most likely to fight first.", focus: "Trade Spacing", priority: 88 }),
      "individual-output-team-gap": () => ({ type: "warn", title: "Fight Value Is Not Becoming Team Wins", preview: `${evidence.kd.toFixed(2)} K/D with ${Math.round(evidence.winrate)}% WR and ${Math.round(evidence.tradeRate)}% trades given.`, what: "You are winning fights more often than the team is winning games.", why: "The issue is probably what happens after an advantage: spacing, regrouping, or the shared follow-up.", action: "After the first advantage, group with one teammate and make the next fight a trade instead of another solo duel.", focus: "Round Conversion", priority: 91 }),
      "post-pistol-conversion": () => ({ type: "warn", title: "Pistol Wins Need A Cleaner Follow-Up", preview: `${Math.round(evidence.pistolWinRate)}% pistol wins versus ${Math.round(evidence.postPistolWinRate)}% in the following rounds.`, what: "The team is earning pistol advantages but giving too many of them back immediately.", why: "That usually points to an uncoordinated follow-up buy or a round plan that takes unnecessary risks.", action: "After the next pistol win, buy together and use one low-risk anti-eco route.", focus: "Economy Coordination", priority: 87 }),
      "role-aware-trades": () => ({ type: "warn", title: "Support Trades Need To Catch Up", preview: `On ${evidence.role}, you return ${Math.round(evidence.given)}% of available trades while teammates recover ${Math.round(evidence.received)}% of yours.`, what: `Your ${evidence.role} games are being traded more often than you return trades for teammates.`, why: "Controllers, initiators, and sentinels often play from positions where answering the first death is part of their round value.", action: "Hold the next support position close enough to answer the first teammate contact within five seconds.", focus: "Support Spacing", priority: 85 }),
      "comms-trade-correlation": () => ({ type: "warn", title: "Low-Comms Logs Match The Trade Gap", preview: `${Math.round(evidence.commsRate)}% comms-enabled logs alongside ${Math.round(evidence.tradeRate)}% trades given.`, what: "Your logged low comms and the objective trade gap point in the same direction.", why: "The app cannot hear voice chat; this uses your logs as a proxy and checks them against match timing.", action: "Before first contact, call who you are following or who can trade you.", focus: "Communication", priority: 89 }),
      "tilt-performance-correlation": () => ({ type: "warn", title: "Unfavorable Mood Logs Repeat In A Losing Stretch", preview: `${Math.round(evidence.moodRate)}% of your mood logs were unfavorable while this match group won ${Math.round(evidence.winrate)}%.`, what: "Your mood logs and results are both struggling in the same period.", why: "That overlap does not prove mood caused every loss, but at 20% or more it is frequent enough to test a reset plan.", action: "After two tilted rounds, use one breath, one useful call, and one simple position before making another adjustment.", focus: "Mental Reset", priority: 90 }),
      "comms-kast-correlation": () => ({ type: "warn", title: "Low-Comms Logs Match Lower Round Involvement", preview: `${Math.round(evidence.commsRate)}% comms-enabled logs with ${Math.round(evidence.kast)}% KAST.`, what: "Your low-comms logs line up with fewer rounds where you are part of the outcome.", why: "RankedCoach cannot inspect voice chat, so this is a link between your own logs and match stats, not measured call quality.", action: "Make one concise location-and-count call before each planned teammate contact.", focus: "Useful Calls", priority: 86 }),
      "logged-comms-breakdown": () => ({ type: "warn", title: "Communication Breakdowns Keep Appearing In Logs", preview: `${evidence.mentions} recent reflections mention communication problems.`, what: "Communication is repeating in your notes often enough to keep visible.", why: "This comes from your own reflections; the app is not claiming access to team voice chat.", action: "Use one short pre-round plan call, then log whether the team followed it.", focus: "Communication", priority: 77 })
    };
    const built = builders[rule.condition]?.();
    return built ? { ...built, ...common } : null;
  }

  function matchRules(context = {}, options = {}) {
    const maxResults = Math.max(1, number(options.maxResults, 4));
    const matchCount = number(context?.sample?.matchCount ?? context?.overview?.matchesPlayed);
    const logCount = number(context?.sample?.logCount ?? context?.logs?.count);
    const candidates = RULES
      .filter(rule => rule.status === "active")
      .filter(rule => matchCount >= number(rule.minMatches) && logCount >= number(rule.minLogs))
      .map(rule => {
        const evidence = evidenceFor(rule.condition, context);
        return evidence ? insightFor(rule, evidence, context) : null;
      })
      .filter(Boolean)
      .sort((a, b) => number(b.priority) - number(a.priority));

    const seenCategories = new Set();
    const balanced = [];
    candidates.forEach(candidate => {
      if (balanced.length >= maxResults) return;
      if (!seenCategories.has(candidate.category)) {
        seenCategories.add(candidate.category);
        balanced.push(candidate);
      }
    });
    candidates.forEach(candidate => {
      if (balanced.length < maxResults && !balanced.includes(candidate)) balanced.push(candidate);
    });
    return balanced;
  }

  function getCoverage() {
    return RULES.reduce((summary, rule) => {
      summary.total += 1;
      summary[rule.status] = (summary[rule.status] || 0) + 1;
      summary.categories[rule.category] = (summary.categories[rule.category] || 0) + 1;
      return summary;
    }, { total: 0, active: 0, policy: 0, blocked: 0, categories: {} });
  }

  globalThis.RankedCoachCoachingRules = Object.freeze({
    SOURCE_VERSION,
    SOURCE_PATH,
    RULES,
    matchRules,
    getCoverage
  });
})();
