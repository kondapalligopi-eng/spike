# Rich link previews for Pet Stories (Cloudflare Worker)

Pet Stories pages (`hispike.in/pet/<slug>`) render client-side, so link-preview
crawlers — which don't run JavaScript — see only the generic app shell. This
Worker serves crawlers a server-rendered Open Graph page (the pet's name +
cover photo) from the backend, while real visitors get the normal app.

**Cost: free.** Cloudflare Workers' free plan allows 100,000 requests/day; only
`/pet/*` requests hit the worker, and only crawler requests reach the backend.

## Prerequisites (already met)
- `hispike.in` is proxied through Cloudflare (confirmed: responses carry
  `Server: cloudflare`).
- The backend OG endpoint is live:
  `https://petdogs-backend.onrender.com/api/v1/pet-pages/og/<slug>`
  (deployed with the Pet Stories backend — verify after the next backend deploy).

## Deploy (Cloudflare dashboard, ~3 min)
1. Cloudflare dashboard → **Workers & Pages** → **Create application** →
   **Create Worker**. Name it e.g. `hispike-og`. Click **Deploy** (creates a
   stub), then **Edit code**.
2. Replace the stub with the contents of [`cloudflare-og-worker.js`](./cloudflare-og-worker.js)
   and **Deploy**.
3. Add the route so the worker runs on pet pages:
   - Open the **hispike.in** zone → **Workers Routes** → **Add route**
     (or Worker → **Settings → Domains & Routes → Add route**).
   - Route: `hispike.in/pet/*`  → Worker: `hispike-og`.
   - If you also serve `www.hispike.in`, add `www.hispike.in/pet/*` too.

That's it. If the backend host ever changes, update `BACKEND_OG_BASE` at the top
of the worker.

## Test
```bash
# As a crawler → should return HTML containing og:image = the pet's photo:
curl -A "facebookexternalhit/1.1" https://hispike.in/pet/coco | grep -i 'og:image\|og:title'

# As a human → should return the normal app shell (no per-pet og tags):
curl -A "Mozilla/5.0" https://hispike.in/pet/coco | grep -i '<title>'
```
Then validate the real preview with:
- **Facebook Sharing Debugger** — https://developers.facebook.com/tools/debug/
  (paste the URL, click **Scrape Again** to refresh the cache).
- **X Card Validator**, or simply paste the link into a WhatsApp chat to yourself.

> Note: each platform caches previews. After changing a page's photo/name, use
> the platform's debugger to force a re-scrape — the link itself updates, but
> cached cards don't until refreshed.
