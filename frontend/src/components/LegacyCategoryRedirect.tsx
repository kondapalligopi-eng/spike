import { Navigate, useParams } from 'react-router-dom';
import { PageHead } from './PageHead';
import { DEFAULT_CITY } from '@/lib/cities';

/**
 * The pre-multi-city category URLs: /hospital, /park, /swimming, /grooming.
 *
 * Render answers these with a 301 in front of the app, so in normal operation
 * nothing here ever runs. This is what happens when a request reaches the SPA
 * anyway — an old bookmark, an internal link we missed, or the dashboard rule
 * not being in place yet.
 *
 * It carries a head as well as a redirect on purpose. Without one the
 * pre-rendered file at this path is an untitled shell, and a crawler that
 * reaches it before the 301 exists would have no idea the listings moved. The
 * canonical points at the city page and noindex keeps the old URL from being
 * filed as a second copy of it.
 */
export function LegacyCategoryRedirect({ segment }: { segment: string }) {
  const to = `/${DEFAULT_CITY.slug}/${segment}`;
  return (
    <>
      <PageHead
        title="HiSpike"
        description={`This directory now lives at ${to}.`}
        path={to}
        noindex
      />
      <Navigate to={to} replace />
    </>
  );
}

/**
 * Salon detail pages were shared as /grooming/<slug> before cities existed, and
 * those links are out in the world — in WhatsApp threads, on salon websites.
 * Without this the new :city/grooming/:slug route would leave every one of them
 * on a 404. Sends them into the default city, keeping the slug.
 */
export function LegacySalonRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const to = `/${DEFAULT_CITY.slug}/grooming/${slug ?? ''}`;
  return (
    <>
      <PageHead
        title="HiSpike"
        description={`This salon page now lives at ${to}.`}
        path={to}
        noindex
      />
      <Navigate to={to} replace />
    </>
  );
}
