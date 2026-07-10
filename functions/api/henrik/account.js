import {
  getHenrikAccount,
  henrikErrorResponse,
  jsonResponse,
  optionsResponse
} from "../../_lib/henrik.js";

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const payload = await getHenrikAccount(context.env, body?.riotId);
    return jsonResponse(payload);
  } catch (error) {
    return henrikErrorResponse(error);
  }
}

export function onRequestOptions() {
  return optionsResponse();
}
