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
        what: "{{agent}} is the comfort pick giving you the cleanest rounds right now.",
        why: "Your utility timing, fight selection, and role decisions are holding together more often on this pick.",
        action: "Keep {{agent}} in the ranked pool and repeat the same map plans before adding another setup."
      },
      {
        preview: "{{agent}} is the pick currently holding up best: {{winrate}}% WR in {{games}} games.",
        what: "Your most repeatable agent rounds are coming on {{agent}}.",
        why: "The pick is giving you a stable role job instead of forcing you to solve every round from scratch.",
        action: "Lock the same role plan on {{agent}}, then review whether the wins come from utility, trades, or opening space."
      },
      {
        preview: "{{agent}} keeps giving this profile playable rounds at {{winrate}}% WR.",
        what: "{{agent}} is the agent you can currently trust most in queue.",
        why: "Comfort is showing up as cleaner timings and fewer forced decisions across {{games}} games.",
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
        what: "Recent games are slipping before the profile has time to stabilize.",
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

  global.RankedCoachValorantVocabulary = Object.freeze({ terms, cardVariants, selectCardVariant, getPromptTerminology });
})(globalThis);
