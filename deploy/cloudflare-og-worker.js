// Cloudflare Worker — rich link previews for HiSpike "Pet Stories" pages.
//
// Why: pages at hispike.in/pet/<slug> are rendered client-side, so link-preview
// crawlers (WhatsApp, Facebook, X, LinkedIn, …) — which do NOT run JavaScript —
// only ever see the generic SPA shell. This worker detects those crawlers and
// serves them a server-rendered Open Graph page from the backend (the pet's
// name + photo), while real human visitors pass straight through to the app.
//
// Deploy: see cloudflare-og-worker.md. In short — create a Worker with this
// code and add a route `hispike.in/pet/*` to it.

// Backend endpoint that returns the OG/meta HTML for a slug.
// Update this if the backend host ever changes.
const BACKEND_OG_BASE = "https://petdogs-backend.onrender.com/api/v1/pet-pages/og";

// Known link-preview / social crawlers (matched case-insensitively).
const CRAWLER_UA =
  /(facebookexternalhit|facebot|twitterbot|whatsapp|slackbot|slack-imgproxy|linkedinbot|telegrambot|discordbot|pinterest|redditbot|embedly|quora link preview|bitlybot|skypeuripreview|nuzzel|vkshare|w3c_validator|applebot|googlebot|bingbot|yandex|mastodon|line-podcast)/i;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const ua = request.headers.get("user-agent") || "";
    // Match only /pet/<slug> (not /pet-stories, /pet-supplies, etc.).
    const match = url.pathname.match(/^\/pet\/([^/]+)\/?$/);

    if (match && CRAWLER_UA.test(ua)) {
      const slug = match[1];
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const ogResp = await fetch(`${BACKEND_OG_BASE}/${encodeURIComponent(slug)}`, {
          headers: { "user-agent": ua },
          signal: controller.signal,
          // Cache the OG HTML at the edge so repeat crawls don't wake the
          // free-tier backend on every request.
          cf: { cacheTtl: 300, cacheEverything: true },
        });
        clearTimeout(timeout);
        if (ogResp.ok) {
          return new Response(await ogResp.text(), {
            status: 200,
            headers: {
              "content-type": "text/html; charset=utf-8",
              "cache-control": "public, max-age=300",
            },
          });
        }
      } catch (_e) {
        // Backend slow/unreachable → fall through to the normal page so the
        // crawler at least gets a generic preview rather than an error.
      }
    }

    // Everyone else (and any failure above) → the real app at the origin.
    return fetch(request);
  },
};
