import { Head } from 'vite-react-ssg';

const SITE_URL = 'https://hispike.in';

type PageHeadProps = {
  /** Full <title> for the tab/SERP. We append "| HiSpike" only when missing. */
  title: string;
  /** 1–2 sentences. Aim for 140–160 chars to fit Google's snippet. */
  description: string;
  /** Path from site root, like '/hospital'. Used for canonical URL + og:url. */
  path: string;
  /** Optional social-card image (absolute or root-relative). Drives the large
   *  preview thumbnail on WhatsApp/Facebook/X for shareable pages. */
  image?: string;
};

// Per-page SEO + social-card meta. Set on every route via React Helmet so
// vite-react-ssg's SSR captures it into each pre-rendered HTML — that's what
// Google indexes. Without per-page meta, every page would share the site-wide
// homepage <title>, which crushes long-tail ranking.
export function PageHead({ title, description, path, image }: PageHeadProps) {
  const fullTitle = title.includes('HiSpike') ? title : `${title} | HiSpike`;
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  // Resolve a root-relative image to an absolute URL — crawlers require it.
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
    : undefined;
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {imageUrl && <meta name="twitter:card" content="summary_large_image" />}
    </Head>
  );
}
