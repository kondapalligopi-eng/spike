import { Head } from 'vite-react-ssg';

export type FaqItem = { q: string; a: string };

type FaqSchemaProps = {
  /** 3–8 real questions per page. Don't keyword-stuff — Google penalises
   *  spammy FAQ markup. Each answer should genuinely help a reader. */
  faqs: FaqItem[];
};

// Emits an invisible JSON-LD FAQPage schema in the document head. Renders
// nothing visible — used purely for Google's "People also ask" eligibility on
// the service category pages. Hooks into vite-react-ssg's <Head> so the
// schema lands in the pre-rendered HTML that crawlers see.
export function FaqSchema({ faqs }: FaqSchemaProps) {
  if (!faqs.length) return null;
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(payload)}</script>
    </Head>
  );
}
