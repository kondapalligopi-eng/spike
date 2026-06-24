import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPetPageBySlug } from '@/api/petPages';
import { PageHead } from '@/components/PageHead';
import { HeroPaws } from '@/components/HeroPaws';
import { ShareButtons } from '@/components/ShareButtons';

// Public, shareable dog page at hispike.in/pet/<slug>. Rendered client-side
// (the slug isn't known at build time), so it fetches by slug on mount.
export function PetPage() {
  const { slug = '' } = useParams();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['pet-page', slug],
    queryFn: () => getPetPageBySlug(slug),
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-2xl font-extrabold text-warm-900">This page isn't here</h1>
        <p className="mt-2 text-warm-600 max-w-md">
          We couldn't find a pet page at <span className="font-mono text-warm-800">/pet/{slug}</span>.
          It may have been removed, or the link is mistyped.
        </p>
        <Link
          to="/pet-stories"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
        >
          Create your pet's page
        </Link>
      </div>
    );
  }

  // First ~155 chars of the memories make a natural meta description / preview.
  const preview = page.memories.replace(/\s+/g, ' ').trim().slice(0, 155);

  return (
    <div className="bg-white">
      <PageHead
        title={`${page.name}'s Page`}
        description={preview || `${page.name}'s photos and memories, shared on HiSpike.`}
        path={`/pet/${page.slug}`}
        image={page.photo_url ?? undefined}
      />

      {/* Hero: photo + name */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center text-center">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-warm-100 flex items-center justify-center">
            {page.photo_url ? (
              <img src={page.photo_url} alt={page.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl" aria-hidden="true">🐶</span>
            )}
          </div>
          <p className="mt-6 text-[11px] font-semibold tracking-[0.3em] text-accent-500 uppercase">
            A HiSpike Pet Story
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-warm-900">
            {page.name}
          </h1>
          <div className="mt-3">
            <ShareButtons name={`${page.name}'s page`} url={`/pet/${page.slug}`} context="see the photos & memories 🐾" />
          </div>
        </div>
      </section>

      {/* Memories */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-warm-500 mb-4">
          About {page.name}
        </h2>
        <div className="prose prose-warm max-w-none">
          <p className="whitespace-pre-wrap text-warm-800 leading-relaxed text-[15px]">
            {page.memories}
          </p>
        </div>

        {/* Soft CTA so every shared page seeds the next owner */}
        <div className="mt-12 rounded-2xl border border-warm-200 bg-warm-50 p-6 text-center">
          <p className="text-sm text-warm-700">
            Have a pet of your own?
          </p>
          <Link
            to="/pet-stories"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
          >
            Create their HiSpike page — free
          </Link>
        </div>
      </section>
    </div>
  );
}
