const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sourcePath = path.resolve(__dirname, "..", "..", "public", "library", "gamesense-reference.js");
const source = fs.readFileSync(sourcePath, "utf8");
const context = vm.createContext({});

vm.runInContext(source, context, { filename: sourcePath });

const sidearms = context.RankedCoachGamesenseReference.weapons
  .find(group => group.id === "sidearms")
  .weapons;
const byId = Object.fromEntries(sidearms.map(weapon => [weapon.id, weapon]));

assert.equal(sidearms.map(weapon => weapon.id).join(","), "classic,frenzy,ghost,sheriff");

assert.match(byId.classic.focus, /do not sleep on the alt-fire/i);
assert.match(byId.classic.whenToUse[0], /close, sudden right-click fight/i);
assert.match(byId.classic.howToUse[0], /let recoil settle before the next shot/i);
assert.match(byId.classic.howToUse[1], /full three-shot burst.*headshot plus one body shot.*inside 30 meters/i);
assert.doesNotMatch(`${byId.classic.focus} ${byId.classic.howToUse.join(" ")}`, /pellet/i);

assert.match(byId.frenzy.howToUse[0], /crouch.*first three bullets/i);
assert.match(byId.frenzy.howToUse[1], /pre-fire the corner/i);
assert.match(byId.ghost.howToUse[0], /straight line through the first two or three bullets/i);
assert.match(byId.sheriff.focus, /stop-and-shoot weapon, not a flick gun/i);
assert.match(byId.sheriff.howToUse[0], /hold your crosshair at head height/i);
assert.match(byId.sheriff.howToUse[1], /two body shots.*low-percentage headshot/i);

assert.equal(byId.classic.patchHistory.length, 2);
assert.equal(byId.frenzy.patchHistory.length, 3);
assert.equal(byId.ghost.patchHistory.length, 2);
assert.equal(byId.sheriff.patchHistory.length, 2);

console.log("Gamesense Sidearms content assertions passed.");
