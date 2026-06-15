# RankedCoach Voice Guide

RankedCoach should sound like a real Valorant coach reading the player’s stats, logs, role, and habits. The app should not sound like a dashboard explaining a model.

## Core Standard

Every meaningful coaching read should answer:

1. What is happening?
2. Why does it matter in Valorant?
3. What should the player try next?

Stop when the guidance is clear. Do not add a trailing explanation just because it sounds complete.

## Copy Layers

### Raw Stats

Purpose: show the number cleanly.

Use short labels and minimal explanation.

Examples:

- `KD 1.23`
- `Win Rate 46%`
- `Rifle WR 41%`
- `Controller 56% WR`

Do not add coaching language here unless the card has room for a short supporting line.

### Light Stat Reads

Purpose: explain what the number means in one useful sentence.

Good:

- `Your rifle rounds are where matches are slipping away.`
- `Your damage is high, but the rounds are still not turning into wins.`
- `Your controller games are winning even without flashy K/D.`

Avoid:

- `Your full-buy conversion is underperforming due to role-impact instability.`
- `This signal indicates an unstable combat profile.`

### Impact Pill

Purpose: post-match role check.

It should answer:

- Did the player do their role’s job?
- Did that role impact matter?
- What broke if the match was lost?

Examples:

- `You found early fights, but the round fell apart after the first pick.`
- `Your smokes helped the team take space, but you died too early to control the retake.`
- `Your setup created info, but you stayed too locked to site when the round needed movement.`

### Weekly Focus

Purpose: name the biggest issue that deserves attention this week.

It should combine:

- match stats
- logs
- behavior
- role
- compass pillars
- repeated negative patterns

Good:

- `Your biggest issue this week is crosshair discipline. Your logs mention panic spraying, and your recent fights show the same pattern. Slow the first shot down and play for cleaner fights.`

Avoid:

- `Biggest focus gap: Crosshair Discipline.`
- `This weekly signal is derived from behavior and combat baselines.`

### Priority Insights

Purpose: deep reads for urgent pain areas, negative trends, and major issues.

These can be longer, but still direct.

Good:

- `Split is your highest win rate map right now at 22%, but that is still far below where it needs to be. This is not a strong map yet. Your map pool needs review before it can support a climb.`
- `You are getting kills, but the rounds are not turning into wins. That usually means the value is happening away from the team, too late in the round, or without a teammate close enough to trade.`

Avoid:

- `Split is one of your stronger repeated map environments.`
- `Your role-impact conversion is unstable across the selected sample.`

### General Insights

Purpose: supporting evidence for the deeper reads.

Groups:

- match trends
- log trends
- role trends
- consistency trends

These should explain what RankedCoach noticed without making every card sound like the main weekly focus.

Good:

- `Your logs keep mentioning tilt after close losses. Your stats are still solid, but the frustration may be carrying into the next queue.`
- `Your controller games are winning more often than your duelist games. If you want the fastest climb, controller is the safer path right now.`

### Ask Coach

Purpose: answer like a coach, not a search result.

Use the player’s actual context. Keep the answer practical.

Good:

- `Next game, keep it simple. Stay close enough to a teammate that one of you can trade the other. Do not turn the round into five separate 1v1s.`

Avoid:

- `Use the next ranked block to test a spacing correction.`

## Tone Rules

- Be direct.
- Use normal player language.
- Give one clear next action.
- Explain the reason only when it helps.
- Do not over-explain after the advice is already clear.
- Do not fake positivity when the stat is bad.
- Do not shame the player.
- Do not blame teammates as the final answer.
- Bring the focus back to what the player can control.

## Words To Prefer

- round
- fight
- trade
- spacing
- entry
- retake
- site hit
- rotate
- flank
- setup
- info
- utility
- smoke
- flash
- reveal
- lurk
- timing
- first pick
- man advantage
- full-buy
- eco
- pistol
- bonus
- reset
- comfort pick
- map pool
- playstyle

## Words To Avoid In Main Cards

These can exist in hidden calculation text, but should not appear in normal coaching reads.

- model
- signal
- baseline
- scoped
- derived
- entity
- weighted
- cumulative
- profile model
- selected window
- role-impact conversion
- unstable environment

## Win Rate Rules

- `60%+`: clear strength.
- `55-59%`: working well.
- `50-54%`: barely positive.
- `45-49%`: close, but not winning enough.
- `<45%`: problem area.
- `<35%`: major concern.

Never call a map, role, agent, or weapon strong if it is below `50% WR`.

If the best option is still below `50% WR`, say that clearly.

Good:

- `Split is your highest win rate map right now, but 22% is still far below the target.`

Bad:

- `Split is one of your stronger repeated map environments.`

## Role Rules

### Duelist

Judge:

- first fights
- entry attempts
- space taken
- tradeability
- survival after first contact
- whether kills become round wins

Good read:

- `You are finding early fights, but the team is not keeping the advantage after that. Once you get the pick, slow it down and group up.`

### Initiator

Judge:

- info value
- flash/reveal timing
- teammate setup
- assists
- whether utility starts a useful fight

Good read:

- `Your K/D is fine, but your utility is not creating enough easy fights. Before using it, ask who can act on the info.`

### Controller

Judge:

- smoke timing
- survival
- central positioning
- safe rotates
- post-plant value
- whether utility makes fights easier

Good read:

- `Your controller games are winning because your utility is helping rounds, even if your K/D is not flashy.`

### Sentinel

Judge:

- site hold
- flank coverage
- setup value
- information
- flexibility when the team does not rotate

Good read:

- `Your setup is giving info, but your current style is too locked to one site. If the team is slow to rotate, your setup needs to be more flexible.`

### Fill

Judge:

- role consistency
- strongest role
- weakest role
- preferred playstyle
- whether filling is hurting the climb

Good read:

- `You prefer aggressive play, but duelist is not winning for you right now. If the goal is climbing, controller gives you a better path while still letting you make plays.`

## Behavior Rules

Logs matter because they explain why a stat may be happening.

Examples:

- Tilt after close games can carry into the next queue.
- Panic spraying can show up as a crosshair discipline issue.
- “Team never rotates” may still require the player to adjust their own setup.
- Good stats with bad mood means the player may be performing well but burning out.

Good:

- `Your stats are solid, but your logs show frustration carrying through the session. Take a short reset before queueing again.`

Avoid:

- `Negative mood signal detected.`

## Sample Size Rules

When there is not enough data, explain what is missing.

Good:

- `RankedCoach needs more matches before calling this a real pattern. One game can point us in a direction, but it is not enough to judge your agent or map pool yet.`

Avoid:

- `Waiting for data.`
- `No model confidence.`

## Rewrite Examples

### Bad Best Map Read

Before:

`Split is one of your stronger repeated map environments.`

After:

`Split is your highest win rate map right now at 22%, but that is still far below where it needs to be. This is not a strong map yet.`

### Good K/D, Bad Win Rate

Before:

`Duel conversion is strong, but match conversion is unstable.`

After:

`You are getting kills, but the rounds are not turning into wins. The value may be happening too far from the team or too late in the round.`

### Controller With Low K/D

Before:

`Controller currently fits your decision profile.`

After:

`Your controller games are winning because your utility is helping rounds, even if your K/D is not flashy.`

### Sentinel Blaming Rotates

Before:

`This role is where your in-game decisions are frequently leading to poor outcomes.`

After:

`Your current Sentinel style is not leading to wins. If the team is slow to rotate, your setup needs to be flexible enough to react.`

### Crosshair Discipline

Before:

`Biggest focus gap: Crosshair Discipline.`

After:

`Your lowest rated focus is crosshair discipline. Your logs mention panic spraying, so start with cleaner first shots instead of trying to fix everything at once.`
