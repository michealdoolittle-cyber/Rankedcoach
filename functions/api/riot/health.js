import { jsonResponse } from "../../_lib/riot.js";

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

export function onRequestGet(context) {
  return jsonResponse({
    ok: true,
    configured: Boolean(context.env.RIOT_API_KEY)
  });
}
