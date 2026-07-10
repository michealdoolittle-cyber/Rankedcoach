import { jsonResponse, optionsResponse } from "../../_lib/henrik.js";

export function onRequestGet(context) {
  return jsonResponse({
    ok: true,
    configured: Boolean(String(context.env.HENRIKDEV_API_KEY || "").trim())
  });
}

export function onRequestOptions() {
  return optionsResponse();
}
