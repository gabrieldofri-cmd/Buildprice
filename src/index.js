export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/search") {
      if (request.method !== "GET") {
        return json({ error: "Use GET for product searches." }, 405);
      }

      const q = (url.searchParams.get("q") || "").trim();
      if (q.length < 2 || q.length > 100) {
        return json({ error: "Enter a product name between 2 and 100 characters." }, 400);
      }
      if (!env.PRICESAPI_KEY) {
        return json({ error: "PRICESAPI_KEY is missing in Cloudflare Worker secrets." }, 503);
      }

      const endpoint = new URL("https://api.pricesapi.io/api/v1/products/search");
      endpoint.searchParams.set("q", q);
      endpoint.searchParams.set("market", "us");
      endpoint.searchParams.set("limit", "3");
      endpoint.searchParams.set("offers_limit", "15");

      try {
        const response = await fetch(endpoint.toString(), {
          method: "GET",
          headers: { "x-api-key": env.PRICESAPI_KEY, "Accept": "application/json" },
          signal: AbortSignal.timeout(95000)
        });
        const raw = await response.text();
        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          return json({ error: `PricesAPI returned a non-JSON response (HTTP ${response.status}). Check the API key and provider status.` }, 502);
        }
        if (!response.ok) {
          const detail = body?.error?.message || body?.error || body?.message || `HTTP ${response.status}`;
          return json({ error: `PricesAPI error: ${String(detail)}` }, 502);
        }
        return json(body, 200, { "Cache-Control": "public, max-age=60, s-maxage=300" });
      } catch (err) {
        const message = err?.name === "TimeoutError" ? "PricesAPI timed out. Try again in a moment." : "Could not connect to PricesAPI. Try again shortly.";
        return json({ error: message }, 502);
      }
    }

    // Serve the website files from the public/ folder configured as Worker assets.
    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders }
  });
}
