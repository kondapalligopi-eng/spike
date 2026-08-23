import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listGalleryPetPages, type PetPageRead } from '@/api/petPages';
import { HeroPaws } from '@/components/HeroPaws';
import { PageHead } from '@/components/PageHead';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Every page here is one whose owner ticked "show in the public gallery".
// Pages left unlisted never reach this endpoint — see show_in_gallery in
// backend/app/models/pet_page.py.
const GALLERY_LIMIT = 60;

function StoryCard({ page }: { page: PetPageRead }) {
  const cover = page.photos?.[0];
  return (
    <Link
      to={`/pet/${page.slug}`}
      className="group block rounded-2xl border border-warm-200 bg-white overflow-hidden hover:border-primary-300 hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-warm-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={page.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" aria-hidden="true">
            🐾
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="font-bold text-warm-900 leading-tight truncate">{page.name}</h2>
        <p className="mt-0.5 text-xs font-mono text-primary-700 truncate">
          hispike.in/pet/{page.slug}
        </p>
        {page.memories && (
          <p className="mt-2 text-sm text-warm-600 line-clamp-2 leading-snug">{page.memories}</p>
        )}
      </div>
    </Link>
  );
}

export function PetStoriesGallery() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['pet-pages-gallery', GALLERY_LIMIT],
    queryFn: () => listGalleryPetPages(GALLERY_LIMIT),
    // Same treatment as the login showcase: retry a few times with backoff so a
    // dropped request or a waking backend heals itself instead of showing an
    // empty gallery that looks like nobody has made a page.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    staleTime: 5 * 60 * 1000,
  });
  const pages = data ?? [];

  return (
    <div className="bg-warm-50 min-h-screen">
      <PageHead
        title="Pet Stories from Bengaluru Dog Parents — HiSpike"
        description="Browse pet pages created by dog parents across Bengaluru — photos, highlights and the stories behind them. Make one free for your own pet at hispike.in."
        path="/pet-stories"
      />

      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <HeroPaws />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
            Pet Stories · Bangalore
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Stories from Bengaluru dog parents
          </h1>
          <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
          <p className="mt-3 text-sm text-primary-100/90 max-w-2xl">
            Every page here was made by an owner who chose to share it publicly. Make a free
            one for your own pet — photos, highlights and their story, at your own link.
          </p>
          <Link
            to="/pet-stories/create"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
          >
            Create your pet's page
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          // An error must never masquerade as "nobody has made a page yet".
          <div className="max-w-md mx-auto rounded-2xl border border-dashed border-warm-300 p-8 text-center text-sm text-warm-500">
            Couldn&rsquo;t load the gallery just now.{' '}
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="font-semibold text-primary-600 hover:underline disabled:opacity-50"
            >
              {isFetching ? 'Retrying…' : 'Try again'}
            </button>
          </div>
        ) : pages.length === 0 ? (
          <div className="max-w-md mx-auto rounded-2xl border border-dashed border-warm-300 bg-white p-8 text-center">
            <div className="text-4xl mb-3" aria-hidden="true">🐾</div>
            <h2 className="font-bold text-warm-900">No public stories yet</h2>
            <p className="mt-2 text-sm text-warm-600">
              Pages are listed here only when their owner opts in. Be the first to share yours.
            </p>
            <Link
              to="/pet-stories/create"
              className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold transition-colors"
            >
              Create a page
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-warm-600">
              {pages.length} {pages.length === 1 ? 'story' : 'stories'} shared so far 🐾
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pages.map((page) => (
                <StoryCard key={page.id} page={page} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
