import { Head } from 'vite-react-ssg';

const SITE_URL = 'https://hispike.in';

type ArticleSchemaProps = {
  headline: string;
  description: string;
  path: string; // e.g. /blog/top-vet-hospitals-bengaluru
  datePublished: string; // ISO
  dateModified?: string;
  image?: string;
};

// Emits invisible JSON-LD BlogPosting schema so Google can treat the page as a
// dated article (richer SERP treatment, author/publisher attribution). Lands in
// the pre-rendered HTML via vite-react-ssg's <Head>.
export function ArticleSchema({ headline, description, path, datePublished, dateModified, image }: ArticleSchemaProps) {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    image: image ?? `${SITE_URL}/og-image.png`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'HiSpike', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'HiSpike',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  };
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(payload)}</script>
    </Head>
  );
}
