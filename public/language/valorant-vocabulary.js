(function registerValorantVocabulary(global) {
  "use strict";

  const terms = Object.freeze({
    positioning: ["peek", "hold", "off-angle", "wide swing", "jiggle-peek", "clear angles", "crosshair placement", "reposition"],
    teamwork: ["trade", "entry", "anchor", "lurk", "stack", "rotate", "spacing", "default"],
    roundFlow: ["site-take", "retake", "post-plant", "first contact", "mid-round", "round conversion", "map control"],
    economy: ["eco", "force-buy", "full-buy", "bonus round", "save", "anti-eco"],
    utility: ["smoke", "flash", "molly", "lineup", "execute", "stall", "recon", "utility timing"],
    mechanics: ["pre-fire", "first-bullet accuracy", "burst", "spray transfer", "counter-strafe", "fight selection"]
  });

  const cardVariants = Object.freeze({
    agentStrength: [
      {
        preview: "{{agent}} is converting at {{winrate}}% WR across {{games}} games.",
        what: "Your match record is best on {{agent}} right now.",
        why: "{{games}} games is enough to keep testing the pick, but the record alone does not prove which habit caused the wins.",
        action: "Keep {{agent}} in the ranked pool and repeat the same map plans so you can see what keeps working."
      },
      {
        preview: "{{agent}} is the pick currently holding up best: {{winrate}}% WR in {{games}} games.",
        what: "You are winning most often on {{agent}} in the current match history.",
        why: "The result is repeatable enough to test one stable role job instead of changing several things at once.",
        action: "Lock the same role plan on {{agent}}, then review whether the wins come from utility, trades, or opening space."
      },
      {
        preview: "{{agent}} is your best current agent result at {{winrate}}% WR across {{games}} games.",
        what: "{{agent}} is the pick you can trust most from the results available right now.",
        why: "The match record supports keeping the pick; it does not guess whether comfort, timing, or fight choice caused the result.",
        action: "Use {{agent}} as the default pick when the map fits, and keep one clear job for attack and defense."
      }
    ],
    mapWeakness: [
      {
        preview: "{{map}} keeps costing rounds at {{winrate}}% WR across {{games}} games.",
        what: "{{map}} is the repeated map most worth reviewing in this window.",
        why: "Your default, side plan, or comfort pick is not producing enough clean rounds there.",
        action: "Before the next {{map}} game, lock one attack default and one defense fallback."
      },
      {
        preview: "{{map}} is not converting yet: {{winrate}}% WR in {{games}} games.",
        what: "The same map is staying at the bottom of your repeated sample.",
        why: "That usually means the opening plan breaks before the mid-round, not that every part of the map is bad.",
        action: "Review the first lost gun round on {{map}}, then simplify the setup that led into it."
      },
      {
        preview: "{{map}} is the roughest repeat in the current pool at {{winrate}}% WR.",
        what: "Your {{map}} rounds need a more reliable default before you add new ideas.",
        why: "Unstable rotations, timings, or site holds can make the whole map feel worse than one fixable pattern really is.",
        action: "Choose one site-take and one retake rule for {{map}}, then keep them fixed for the next block."
      }
    ],
    recentLosses: [
      {
        what: "The latest match block is dropping more rounds than your broader sample.",
        why: "Tilt, fatigue, rough maps, or rushed peeks can all turn a small dip into a losing block.",
        action: "Make the next game simple: one agent, one focus, and one reset rule after a bad round."
      },
      {
        what: "Your recent games are slipping before the results have time to stabilize.",
        why: "The issue may be a repeated opening death or weak round conversion, not a need to rebuild everything.",
        action: "Review the first two lost gun rounds, then carry one correction into the next queue."
      },
      {
        what: "This match window is below your usual pace.",
        why: "Changing agents, plans, and mechanics at once makes it harder to see which read is actually failing.",
        action: "Keep the agent pool fixed and stop the first repeat mistake before adding another focus."
      }
    ],
    recentWins: [
      {
        what: "The latest match block is producing more playable rounds than the broader sample.",
        why: "Your current agent pool and round plan are holding up often enough to repeat.",
        action: "Keep the setup stable for the next few games and watch which habit keeps converting."
      },
      {
        what: "Recent games are winning without needing a full reset between queues.",
        why: "The same decisions are creating enough space, trades, or late-round control to stay useful.",
        action: "Repeat the current default and avoid forcing extra peeks after the first advantage."
      },
      {
        what: "This match window is running above your normal pace.",
        why: "A stable plan is making your good rounds easier to reproduce.",
        action: "Keep the agent and focus fixed, then note what happens immediately after your team gets first contact."
      }
    ],
    winStreak: [
      {
        preview: "{{streak}} wins in a row with the current round plan holding up.",
        what: "This match block is converting advantages instead of giving rounds back.",
        why: "Your agent plan, trade spacing, or late-round decisions are repeating well enough to trust for another game.",
        action: "Keep the setup stable and do not turn the first pick into an unnecessary second peek."
      },
      {
        preview: "The current queue block has reached {{streak}} straight wins.",
        what: "Your recent rounds are staying playable from first contact through the close.",
        why: "The same defaults and fight choices are producing enough space, trades, and round conversions to repeat.",
        action: "Queue the same agent plan, but reset after each match so momentum does not become autopilot."
      },
      {
        preview: "{{streak}} consecutive wins are giving you real momentum.",
        what: "The current approach is winning without needing a new fix every round.",
        why: "Stable utility timing and fewer forced peeks are helping advantages survive the mid-round.",
        action: "Keep one clear attack default and defense setup, then stop if focus starts slipping."
      }
    ],
    lossStreak: [
      {
        preview: "{{streak}} losses in a row call for a queue reset before another match.",
        what: "This block is repeating enough lost rounds to review the pattern, not just the final score.",
        why: "A rushed opening fight, weak trade spacing, or the same failed retake can drag several games in the same direction.",
        action: "Review the first lost gun round, then take one fight rule into the next queue."
      },
      {
        preview: "The current match block has reached {{streak}} straight losses.",
        what: "Recent rounds are breaking before the team can settle into a reliable default.",
        why: "Changing agents, plans, and mechanics together makes it harder to find the one read that keeps failing.",
        action: "Take a real break, then return with one agent, one focus, and no solo opening death."
      },
      {
        preview: "{{streak}} consecutive losses mean the next queue needs a smaller plan.",
        what: "The same block is giving away too many playable rounds.",
        why: "Fatigue or tilt can show up as extra peeks, late utility, and spacing that leaves trades unavailable.",
        action: "Reset first, then judge the next game by clean first contact and tradeable positioning instead of the scoreboard alone."
      }
    ],
    weeklyFocus: [
      {
        what: "{{focus}} keeps showing up in your saved reflections this week.",
        why: "A repeated focus usually means the same part of your round plan still feels unstable in real games.",
        action: "Keep {{focus}} active until the next match block improves or the note stops repeating."
      },
      {
        what: "Your own logs keep pulling the review back to {{focus}}.",
        why: "That repetition matters more than one bad stat because you are feeling it across multiple rounds.",
        action: "Give {{focus}} one observable rule for the next game instead of trying to fix the whole category."
      },
      {
        what: "{{focus}} is the clearest repeated concern in this week's notes.",
        why: "The same read returning across sessions suggests it is not just one rough queue.",
        action: "Test one {{focus}} adjustment for two games, then use the next reflection to judge it."
      }
    ]
  });

  const insightToneCopy = Object.freeze({
    firstRender: Object.freeze({
      mainFocusKicker: "Main Focus",
      actionCopy: "Start with the read most likely to help your next ranked block.",
      priorityWaiting: "Waiting on real data",
      confidenceWaiting: "Still checking",
      priorityTrends: "What To Watch First",
      trendGroups: "Supporting Reads",
      trendIntro: "Pick a group to see what backs up the read."
    }),
    filters: Object.freeze({
      all: "All",
      bad: "Needs Work",
      warn: "Watch",
      good: "Strengths"
    }),
    confidence: Object.freeze({
      high: "Strong proof",
      medium: "Some proof",
      low: "Still checking",
      default: "Still checking"
    }),
    priority: Object.freeze({
      immediate: "Fix first",
      high: "High priority",
      moderate: "Worth watching",
      watch: "Keep watching",
      default: "Keep watching"
    }),
    empty: Object.freeze({
      noGroupTitle: "Nothing here yet",
      noDataTitle: "RankedCoach needs more games",
      noGroupPreview: "This group has no reads in the current window.",
      noDataPreview: "This panel fills after you import matches or save reflections.",
      nextMoveLabel: "NEXT MOVE",
      noGroupNextMove: "Open All to see the reads you have, or keep importing matches and logs.",
      noDataNextMove: "Import a few matches or save reflections so RankedCoach can find a real pattern."
    }),
    fallbackRead: Object.freeze({
      title: "Waiting for a read",
      detail: "Import more matches or logs to make this specific.",
      defaultMediaLabel: "Coaching read"
    }),
    trendFallbacks: Object.freeze({
      performance: Object.freeze({
        title: "Match Reads",
        waitingValue: "Need matches",
        activeDetail: "These reads use your imported match results and stat trends.",
        waitingDetail: "Import matches or save logs to unlock K/D, win rate, and map reads."
      }),
      behavior: Object.freeze({
        title: "Log Reads",
        detail: "Your logs connect focus, mood, rating, comms, and notes."
      }),
      role: Object.freeze({
        title: "Role Reads",
        detail: "Role reads compare fights, utility, and round impact."
      }),
      consistency: Object.freeze({
        title: "Repeat Patterns",
        activeValue: "Pattern building",
        waitingValue: "Need more games",
        detail: "These reads look for repeat swings in matches, logs, focus, and form."
      }),
      default: Object.freeze({
        kicker: "Coaching",
        title: "Coaching Read",
        value: "Need more games",
        detail: "This fills as RankedCoach gets more profile context."
      })
    })
  });

  const insightToneSourceLog = Object.freeze({
    directive: "rankedcoach-insights-tone-directive-2026-07-22",
    standards: "rankedcoach-language-standards-riot-lens-2026-07-22",
    lastReviewed: "2026-07-30",
    approvedExcerptCorpus: Object.freeze({
      availableInClientBundle: false,
      status: "gap-flagged",
      note: "Owner-approved transcript excerpts live in the private knowledge pipeline, not in this public wording bundle. This pass uses internal vetted RankedCoach copy as the fallback source and records the gap instead of pretending the approved corpus was available."
    }),
    fallbackSources: Object.freeze([
      Object.freeze({
        id: "home-main-focus-why-how-source",
        approvalStatus: "internal-vetted",
        momentTypes: Object.freeze(["next-action", "why-how-source"]),
        vocabulary: Object.freeze(["what", "why", "action", "next block", "real pattern", "review"])
      }),
      Object.freeze({
        id: "warmup-drill-copy",
        approvalStatus: "internal-vetted",
        momentTypes: Object.freeze(["prep", "simple-action"]),
        vocabulary: Object.freeze(["before playing", "keep", "choose", "ready"])
      }),
      Object.freeze({
        id: "session-debrief-tags",
        approvalStatus: "internal-vetted",
        momentTypes: Object.freeze(["short-tag", "post-game"]),
        vocabulary: Object.freeze(["good", "watch", "needs work", "reset", "saved"])
      })
    ]),
    momentVocabulary: Object.freeze({
      nextAction: Object.freeze(["next block", "next game", "one rule", "keep testing", "reset"]),
      evidence: Object.freeze(["match history", "logs", "rounds", "read", "proof", "still checking"]),
      tactical: Object.freeze(["peek", "trade", "entry", "rotate", "econ", "retake", "post-plant", "default", "execute"]),
      avoid: Object.freeze(["utilize", "facilitate", "optimal", "leverage", "regarding", "additionally", "furthermore", "adjustment", "metric", "indicates", "demonstrates"])
    }),
    rewriteAudit: Object.freeze({
      insightsFirstRender: Object.freeze({
        sourceIds: Object.freeze(["home-main-focus-why-how-source"]),
        sourceStatus: "internal-vetted",
        change: "Replaced formal placeholder copy with direct next-block coaching language."
      }),
      insightMetaPills: Object.freeze({
        sourceIds: Object.freeze(["session-debrief-tags"]),
        sourceStatus: "internal-vetted",
        change: "Replaced status-like Confidence/Priority phrasing with short player-facing read labels."
      }),
      trendFallbacks: Object.freeze({
        sourceIds: Object.freeze(["home-main-focus-why-how-source", "warmup-drill-copy"]),
        sourceStatus: "internal-vetted",
        change: "Kept tactical terms while shortening fallback reads into one idea per sentence."
      })
    }),
    conflictTieBreak: "If approved language sources conflict later, prefer the most recently owner-approved excerpt and log the source id before adapting templates.",
    rollbackTrail: "Visible Insights copy is centralized in insightToneCopy and helper-based render calls so old wording can be restored from one source."
  });

  function getPathValue(source, path) {
    return String(path || "")
      .split(".")
      .filter(Boolean)
      .reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), source);
  }

  function getInsightToneCopy(path, fallback = "") {
    const value = getPathValue(insightToneCopy, path);
    return typeof value === "string" ? value : fallback;
  }

  function getInsightToneAudit(key = "") {
    if (!key) return insightToneSourceLog;
    return getPathValue(insightToneSourceLog.rewriteAudit, key) || null;
  }

  function hash(value) {
    return Array.from(String(value || "")).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
  }

  function fill(template, values) {
    return String(template || "").replace(/\{\{(\w+)\}\}/g, (_match, key) => String(values?.[key] ?? ""));
  }

  function selectCardVariant(key, seed, values = {}) {
    const choices = cardVariants[key] || [];
    if (!choices.length) return null;
    const selected = choices[hash(`${key}:${seed}`) % choices.length];
    return Object.fromEntries(Object.entries(selected).map(([field, value]) => [field, fill(value, values)]));
  }

  function getPromptTerminology() {
    return Object.values(terms).flat().join(", ");
  }

  global.RankedCoachValorantVocabulary = Object.freeze({
    terms,
    cardVariants,
    insightToneCopy,
    insightToneSourceLog,
    selectCardVariant,
    getPromptTerminology,
    getInsightToneCopy,
    getInsightToneAudit
  });
})(globalThis);
