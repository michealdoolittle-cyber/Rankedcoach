export async function onRequestGet(context) {
  const assetUrl = new URL("/data/demo-import.json", context.request.url);
  const assetResponse = await context.env.ASSETS.fetch(assetUrl);

  if (!assetResponse.ok) {
    return Response.json(
      { error: "Demo dataset is unavailable." },
      { status: 500 }
    );
  }

  const payload = await assetResponse.json();
  return Response.json(payload, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Cache-Control": "public, max-age=300"
    }
  });
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
