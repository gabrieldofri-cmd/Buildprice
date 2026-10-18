# BuildPrice Live Starter

This starter adds a server-side PricesAPI search endpoint and an admin setup-check endpoint to the BuildPrice UI.

## What works after deployment/configuration
- Responsive product-comparison frontend.
- Search endpoint calling PricesAPI for the US market.
- PricesAPI key stays on the server in a Cloudflare secret.
- `/admin.html` password-protected setup check.

## Important limitations
- This is not deployed to the public internet from this ZIP.
- No real admin password is included. Set your own secret in Cloudflare.
- The admin page only checks configuration; it does not yet manage a persistent product catalogue or scheduled refresh jobs.
- No affiliate account or tracking IDs are configured.
- PricesAPI responses can be incomplete or stale; check the retailer before purchase.
- Search requests can take a long time on cold cache and cost credits when offers are returned.
- `database.sql` is an optional schema for a later version; current live search does not save results into Supabase.

## Deploy on Cloudflare Pages (no build command)
1. Create a GitHub account and a new private repository called `buildprice`.
2. Upload the contents of this folder to the repository. `public/index.html` must be at the root of the deployed static output; easiest: move the contents of `public/` into the repository root and keep `functions/` beside `index.html`. (Alternatively use Cloudflare Pages output directory `public`.)
3. In Cloudflare Dashboard, go to Workers & Pages → Create → Pages → Connect to Git.
4. Select the repository. Framework preset: None. Build command: leave blank. Build output directory: `public`.
5. In Pages project Settings → Functions → Environment variables / Secrets, add:
   - `PRICESAPI_KEY` = your PricesAPI API key (secret)
   - `ADMIN_PASSWORD` = a unique password with at least 16 characters (secret)
6. Deploy. Test the site URL, then `/api/search?q=RTX%205070`.
7. Open `/admin.html` and enter the admin password to check whether the API secret is configured.
8. Do not paste API keys or admin password into chat, GitHub files, or frontend code.

## API endpoint
GET `/api/search?q=RTX%205070`
Calls `https://api.pricesapi.io/api/v1/products/search?q=...&market=us&limit=3&offers_limit=15`
using the server-side `PRICESAPI_KEY`.

## Security and business checklist before public launch
- Set secrets in Cloudflare dashboard, not in code.
- Add privacy policy, terms, and affiliate disclosure.
- Join affiliate programmes and only use approved tracking links.
- Verify product variants, shipping, taxes, stock and timestamps.
- Add rate limiting / abuse protection before sharing the API endpoint widely.
- Build saved products and scheduled refresh only after proving the search works.
