function buildUnavailableResponse() {
  return Response.json(
    {
      ok: false,
      error: "Theme snapshot storage is disabled on the Cloudflare demo deployment."
    },
    {
      status: 501,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      }
    }
  );
}

export function onRequestGet() {
  return buildUnavailableResponse();
}

export function onRequestPost() {
  return buildUnavailableResponse();
}

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
