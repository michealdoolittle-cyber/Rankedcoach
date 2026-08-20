import { escapeHtml, normalizeKey, readable } from "../model/utils.js";

function firstSentence(text = "", fallback = "") {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  const match = clean.match(/^(.{24,180}?[.!?])\s/);
  return match ? match[1] : clean.slice(0, 190);
}

function lesson(id, type, category, title, summary, body = {}) {
  return {
    id,
    type,
    category,
    title,
    summary,
    overview: body.overview || summary,
    examples: body.examples || [],
    mistakes: body.mistakes || [],
    source: body.source || ""
  };
}

function mapLessons() {
  return (globalThis.RankedCoachGamesenseMaps || []).flatMap(map => {
    const base = [];
    const tips = map.tips || {};
    ["attack", "defense", "teamplay"].forEach(section => {
      (tips[section] || []).forEach((tip, index) => {
        base.push(lesson(
          `map-${normalizeKey(map.label)}-${section}-${index}`,
          "Map",
          "Maps",
          `${map.label}: ${tip.label || readable(section)}`,
          firstSentence(tip.text, `${readable(section)} idea for ${map.label}.`),
          {
            overview: tip.text,
            examples: [`Apply this on ${map.label} when the round slows down or defenders repeat the same response.`],
            mistakes: ["Do not copy the idea blindly; check your team position, spike location, and available utility first."],
            source: map.source || ""
          }
        ));
      });
    });
    return base;
  });
}

function agentLessons() {
  return (globalThis.RankedCoachGamesenseReference?.agents || []).flatMap(agent => {
    const fundamentals = (agent.fundamentals || []).map((text, index) => lesson(
      `agent-${normalizeKey(agent.label)}-fundamental-${index}`,
      "Agent",
      "Agents",
      `${agent.label}: ${index === 0 ? "Core identity" : `Fundamental ${index + 1}`}`,
      firstSentence(text, `${agent.label} role habit.`),
      {
        overview: text,
        examples: [`Use this when playing ${agent.role || "the role"} on ${agent.maps?.[0] || "a comfort map"}.`],
        mistakes: ["Do not spend utility without a teammate, timing cue, or lane you are actually trying to change."]
      }
    ));
    const abilities = (agent.abilities || []).map(ability => lesson(
      `agent-${normalizeKey(agent.label)}-${normalizeKey(ability.name)}`,
      "Ability",
      "Agents",
      `${agent.label}: ${ability.name}`,
      ability.summary || ability.purpose || `${ability.name} usage.`,
      {
        overview: ability.purpose || ability.summary,
        examples: [ability.setup, ability.stats ? Object.entries(ability.stats).map(([key, value]) => `${key}: ${value}`).join(" · ") : ""].filter(Boolean),
        mistakes: ["Do not use the ability as background noise. Pair it with a duel, cross, plant, retake, or clear reason."]
      }
    ));
    return [...fundamentals, ...abilities];
  });
}

function weaponLessons() {
  return (globalThis.RankedCoachGamesenseReference?.weapons || []).flatMap(group => (group.weapons || []).filter(Boolean).map(weapon => lesson(
    `weapon-${normalizeKey(weapon.label)}`,
    "Weapon",
    "Weapons",
    weapon.label,
    firstSentence(weapon.focus, `${weapon.label} fight plan.`),
    {
      overview: weapon.focus,
      examples: [
        `${weapon.cost} credits · ${weapon.magazine} magazine · ${weapon.penetration} penetration`,
        (weapon.damageRanges || []).map(range => `${range.range}: ${range.head}/${range.body}/${range.legs}`).join(" · ")
      ].filter(Boolean),
      mistakes: [`Do not force ${weapon.label} fights outside its real range profile.`]
    }
  )));
}

function conceptLessons() {
  const concepts = [
    ["trading", "Trading", "Trade the first contact instead of watching it happen.", "Stand close enough to punish the enemy while your teammate is still creating pressure."],
    ["crosshair-discipline", "Crosshair Discipline", "Keep the crosshair where the next fight is most likely to appear.", "Reset after movement, clear one height at a time, and stop dragging between random angles."],
    ["clutch-conversion", "Clutch Conversion", "Slow the final fight down when numbers shrink.", "Use spike timing, sound, and off-angles instead of giving a clean isolated duel."],
    ["map-awareness", "Map Awareness", "Read rotations from pressure, utility, and missing defenders.", "When a team over-rotates, punish the empty lane before they reset."]
  ];
  return concepts.map(([id, title, summary, overview]) => lesson(`concept-${id}`, "Concept", "Concepts", title, summary, {
    overview,
    examples: ["Connect this concept to the next match review instead of treating it as a generic tip."],
    mistakes: ["Do not chase the perfect plan. Pick one repeatable cue and execute it cleanly."]
  }));
}

function situationLessons() {
  const situations = [
    ["pistol-rounds", "Pistol Rounds", "Treat pistols as spacing and trade rounds, not solo sheriff auditions.", "Win conditions are clean contact, fast refrags, and using utility to cross the first danger lane without giving a free opener."],
    ["bonus-rounds", "Bonus Rounds", "Use the bonus to damage economy while protecting the rifles you upgraded into.", "Keep the second-round weapons in favorable ranges, stack trades, and avoid donating rifles through isolated peeks."],
    ["full-buy-rounds", "Full Buy Rounds", "Spend the full kit with a clear timing plan.", "A full buy should create a real lane claim: smoke, recon, flash, entry timing, and a second body ready to trade."],
    ["retakes", "Retakes", "Group before the retake breaks open.", "Retakes become winnable when players wait for utility, clear the same slice together, and trade before touching spike."],
    ["clutches", "Clutches", "Slow the final fight down and make the opponent move first.", "Use spike timing, noise discipline, and off-angles to turn a scary 1vX into one fight at a time."],
    ["anti-eco", "Anti-Eco", "Do not give short-range weapons the fight they are praying for.", "Hold safer spacing, clear close corners with utility, and make pistols cross distance before they can burst you."]
  ];
  return situations.map(([id, title, summary, overview]) => lesson(`situation-${id}`, "Situation", "Situations", title, summary, {
    overview,
    examples: ["Use this as a pre-round check when the enemy economy or round state changes the correct risk level."],
    mistakes: ["Do not let the buy state disappear from your decision-making after the barriers drop."]
  }));
}

export function getLearnLibrary() {
  const items = [...mapLessons(), ...agentLessons(), ...weaponLessons(), ...conceptLessons(), ...situationLessons()];
  const byCategory = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});
  return { items, byCategory };
}

export function searchLessons(items = [], query = "", category = "") {
  const q = normalizeKey(query);
  return items
    .filter(item => !category || item.category === category)
    .filter(item => {
      if (!q) return true;
      return [item.title, item.summary, item.overview, item.type].some(value => normalizeKey(value).includes(q));
    });
}

export function renderLessonCard(item) {
  return `
    <button class="topic-card" type="button" data-lesson-id="${escapeHtml(item.id)}">
      <span class="pill">${escapeHtml(item.type)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.summary || "")}</p>
    </button>
  `;
}
