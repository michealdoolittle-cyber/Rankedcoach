// Compatibility entry point.
//
// The legacy implementation wrote gamesense-encyclopedia.js directly and
// carried unsourced mapGuides prose in this script. Generated Library content
// must now enter the governed draft/review/promote path instead.
console.warn("The direct encyclopedia generator is retired; generating governed Library drafts instead.");
await import("./generate-library-drafts.mjs");
