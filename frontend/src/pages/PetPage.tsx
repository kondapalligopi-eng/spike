import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPetPageBySlug } from '@/api/petPages';
import { PageHead } from '@/components/PageHead';
import { PetPageView } from '@/components/PetPageView';

// Public, shareable pet page at hispike.in/pet/<slug>. Rendered client-side
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

  const preview = page.memories.replace(/\s+/g, ' ').trim().slice(0, 155);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 via-primary-50 to-accent-50">
      <PageHead
        title={`${page.name}'s Page`}
        description={preview || `${page.name}'s photos and story, shared on HiSpike.`}
        path={`/pet/${page.slug}`}
        image={page.photos[0]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-5 sm:p-8">
          <PetPageView data={page} />
        </div>
      </div>
    </div>
  );
}
