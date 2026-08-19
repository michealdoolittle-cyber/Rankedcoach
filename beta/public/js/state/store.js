const STORAGE_KEY = "rankedcoach_beta_phase1_state_v1";
const VIEWED_KEY = "rankedcoach_beta_recent_learn_v1";

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (_error) {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...state,
    savedAt: new Date().toISOString()
  }));
}

export function loadRecentLearn() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export function rememberLearnItem(item) {
  if (!item?.id) return loadRecentLearn();
  const next = [
    { id: item.id, title: item.title, type: item.type, rememberedAt: new Date().toISOString() },
    ...loadRecentLearn().filter(entry => entry.id !== item.id)
  ].slice(0, 8);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(next));
  return next;
}
