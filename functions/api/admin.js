export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return Response.json({ error: "Admin password is not configured." }, { status: 503 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const supplied = String(body.password || "");
  if (supplied.length !== env.ADMIN_PASSWORD.length) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  let mismatch = 0;
  for (let i = 0; i < supplied.length; i++) mismatch |= supplied.charCodeAt(i) ^ env.ADMIN_PASSWORD.charCodeAt(i);
  if (mismatch !== 0) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (body.action === "status") {
    return Response.json({
      ok: true,
      priceApiConfigured: Boolean(env.PRICESAPI_KEY),
      cacheConfigured: Boolean(env.PRODUCT_CACHE),
      message: "Admin authentication succeeded. This starter has not yet added saved products or automated refresh jobs."
    });
  }
  return Response.json({ error: "Unknown admin action." }, { status: 400 });
}
