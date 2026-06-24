import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPetPageBySlug } from '@/api/petPages';
import { PageHead } from '@/components/PageHead';
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
    <div className="bg-warm-50 min-h-screen pb-16">
      <PageHead
        title={`${page.name}'s Page`}
        description={preview || `${page.name}'s photos and memories, shared on HiSpike.`}
        path={`/pet/${page.slug}`}
        image={page.photo_url ?? undefined}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Photo-forward header — the pet's portrait is the centrepiece */}
        <div className="flex flex-col items-center text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-500 uppercase">
            A HiSpike Pet Story
          </p>

          <div className="mt-5 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-warm-200 bg-gradient-to-br from-primary-50 to-accent-50 aspect-square flex items-center justify-center">
            {page.photo_url ? (
              <img src={page.photo_url} alt={page.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl" aria-hidden="true">🐶</span>
            )}
          </div>

          <h1 className="mt-7 text-4xl sm:text-5xl font-extrabold tracking-tight text-warm-900">
            {page.name}
          </h1>
          <div className="mt-3 h-0.5 w-12 bg-accent-400 rounded-full" />

          <div className="mt-5">
            <ShareButtons name={`${page.name}'s page`} url={`/pet/${page.slug}`} context="see the photos & memories 🐾" />
          </div>
        </div>

        {/* About card */}
        <section className="mt-10 rounded-2xl border border-warm-200 bg-white shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-warm-500 mb-4 flex items-center gap-2">
            <span className="text-accent-400" aria-hidden="true">🐾</span> About {page.name}
          </h2>
          <p className="whitespace-pre-wrap text-warm-800 leading-relaxed text-[15px]">
            {page.memories}
          </p>
        </section>

        {/* Soft CTA so every shared page seeds the next owner */}
        <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50 p-6 text-center">
          <p className="text-sm font-medium text-warm-700">
            Have a pet of your own?
          </p>
          <Link
            to="/pet-stories"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow"
          >
            Create their HiSpike page — free
          </Link>
        </div>
      </div>
    </div>
  );
}
