async function postJson(route, body) {
  const response = await fetch(route, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }
  return payload;
}

export async function syncHenrikAccount({ riotId, region = "na", pages = 3, pageSize = 10 } = {}, onProgress = () => {}) {
  const cleanRiotId = String(riotId || "").trim();
  if (!cleanRiotId.includes("#")) throw new Error("Enter a Riot ID in Name#Tag format.");
  onProgress("Resolving Riot account...");
  const accountPayload = await postJson("/api/henrik/account", { riotId: cleanRiotId });
  const account = accountPayload?.data || accountPayload;
  const puuid = account?.puuid || account?.account?.puuid;
  if (!puuid) throw new Error("Henrik did not return a PUUID for this Riot ID.");

  const matchPages = [];
  for (let page = 0; page < pages; page += 1) {
    const start = page * pageSize;
    onProgress(`Loading retained competitive matches ${start + 1}-${start + pageSize}...`);
    const payload = await postJson("/api/henrik/matches", {
      puuid,
      region,
      mode: "competitive",
      count: pageSize,
      start
    });
    const matches = Array.isArray(payload?.data) ? payload.data : [];
    matchPages.push(...matches);
    if (matches.length < pageSize) break;
  }

  onProgress("Loading ranked history...");
  const mmrPayload = await postJson("/api/henrik/mmr-history", { puuid, region, size: 100, page: 1 })
    .catch(error => ({ data: [], warning: error.message }));
  const mmrHistory = Array.isArray(mmrPayload?.data) ? mmrPayload.data : [];

  return {
    account,
    puuid,
    region,
    riotId: cleanRiotId,
    rawMatches: matchPages,
    mmrHistory,
    syncedAt: new Date().toISOString()
  };
}
