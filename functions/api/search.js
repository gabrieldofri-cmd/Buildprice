export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2 || q.length > 100) {
    return Response.json({ error: "Enter a product name between 2 and 100 characters." }, { status: 400 });
  }
  if (!env.PRICESAPI_KEY) {
    return Response.json({ error: "Live price search is not configured yet. The site owner must add the PricesAPI key in Cloudflare secrets." }, { status: 503 });
  }
  const endpoint = new URL("https://api.pricesapi.io/api/v1/products/search");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("market", "us");
  endpoint.searchParams.set("limit", "3");
  endpoint.searchParams.set("offers_limit", "15");
  try {
    const response = await fetch(endpoint.toString(), {
      headers: { Authorization: `Bearer ${env.PRICESAPI_KEY}` },
      signal: AbortSignal.timeout(95000)
    });
    const body = await response.json();
    if (!response.ok) {
      return Response.json({ error: body?.error?.message || `Price provider returned HTTP ${response.status}` }, { status: response.status === 429 ? 429 : 502 });
    }
    // Keep the provider response public, but never expose the API key.
    return Response.json(body, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=900",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    return Response.json({ error: "Price provider timed out or could not be reached. Please retry." }, { status: 502 });
  }
}
