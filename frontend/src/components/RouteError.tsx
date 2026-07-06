import { useEffect, useState } from 'react';
import { useRouteError } from 'react-router-dom';

const AUTO_RETRY_KEY = 'hispike_route_autoretried';

/**
 * Friendly, self-recovering error screen — the route tree's `errorElement`.
 *
 * Replaces React Router's raw "Unexpected Application Error!" default. Most
 * errors we see in the wild are transient: the Render free-tier backend was
 * asleep and a first hit choked on its cold-start proxy HTML. Because a plain
 * reload clears it once the backend is awake, we auto-reload ONCE per browser
 * session (guarded so a genuinely-broken page can't loop), then fall back to a
 * manual "Try again" button.
 */
export function RouteError() {
  const error = useRouteError();
  const [autoRetrying, setAutoRetrying] = useState(false);

  useEffect(() => {
    let alreadyRetried = true;
    try {
      alreadyRetried = sessionStorage.getItem(AUTO_RETRY_KEY) === '1';
    } catch {
      // ignore
    }
    if (alreadyRetried) return;
    try {
      sessionStorage.setItem(AUTO_RETRY_KEY, '1');
    } catch {
      // ignore
    }
    setAutoRetrying(true);
    const id = window.setTimeout(() => {
      window.location.reload();
    }, 2500);
    return () => window.clearTimeout(id);
  }, []);

  // Log for debugging without ever showing users a raw parser message.
  useEffect(() => {
    if (error) console.error('[RouteError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🐾</div>
        <h1 className="text-2xl font-extrabold text-warm-900 mb-2">
          Just a moment…
        </h1>
        <p className="text-warm-600 mb-1">
          {autoRetrying
            ? 'Our servers may be waking up — reloading for you now.'
            : 'Something hiccuped on our end. A quick refresh usually sorts it out.'}
        </p>
        <p className="text-warm-400 text-sm mb-8">
          This is usually temporary and clears in a few seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary-700 hover:bg-primary-800 text-white font-semibold transition-colors"
          >
            {autoRetrying ? 'Reloading…' : 'Try again'}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white ring-1 ring-warm-300 text-warm-700 font-semibold hover:bg-warm-100 transition-colors"
          >
            Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
