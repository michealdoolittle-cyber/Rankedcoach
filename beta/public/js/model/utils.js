export function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function finite(value) {
  return Number.isFinite(Number(value));
}

export function percent(value, fallback = "--") {
  return finite(value) ? `${Math.round(Number(value))}%` : fallback;
}

export function ratio(value, fallback = "--") {
  return finite(value) ? Number(value).toFixed(2) : fallback;
}

export function whole(value, fallback = "--") {
  return finite(value) ? `${Math.round(Number(value))}` : fallback;
}

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, number(value, min)));
}

export function normalizeKey(value = "") {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function readable(value = "") {
  const clean = String(value || "").trim();
  if (!clean) return "Unknown";
  return clean.replace(/[_-]+/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

export function formatDate(value = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function average(values = []) {
  const usable = values.map(Number).filter(Number.isFinite);
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : NaN;
}

export function winrate(matches = []) {
  return matches.length ? (matches.filter(match => match.result === "win").length / matches.length) * 100 : 0;
}

export function safeDivide(top, bottom, fallback = 0) {
  const denominator = number(bottom, 0);
  return denominator ? number(top, 0) / denominator : fallback;
}

export function byNewest(a = {}, b = {}) {
  return number(new Date(b.playedAt).getTime(), 0) - number(new Date(a.playedAt).getTime(), 0);
}

export function plural(count, singular, pluralValue = `${singular}s`) {
  return `${count} ${Number(count) === 1 ? singular : pluralValue}`;
}
