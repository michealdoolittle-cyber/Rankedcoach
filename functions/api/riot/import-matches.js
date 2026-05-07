import { importRiotMatches, jsonResponse } from "../../_lib/riot.js";

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    }
  });
}

export async function onRequestPost(context) {
  if (!context.env.RIOT_API_KEY) {
    return jsonResponse(
      { error: "Riot sync is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const body = await context.request.json().catch(() => ({}));
    const riotId = String(body?.riotId || "").trim();

    if (!riotId) {
      return jsonResponse({ error: "Missing Riot ID" }, { status: 400 });
    }

    const payload = await importRiotMatches({
      apiKey: String(context.env.RIOT_API_KEY || "").trim(),
      riotId,
      region: body?.region,
      count: body?.count
    });

    return jsonResponse(payload, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return jsonResponse(
      { error: error?.message || "Failed to import Riot matches" },
      { status: 500 }
    );
  }
}
