import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPetPageBySlug, highlightFor, type PetPageRead } from '@/api/petPages';
import { PageHead } from '@/components/PageHead';
import { ShareButtons } from '@/components/ShareButtons';

// A single photo in a fixed aspect-ratio frame — defined height + overflow-hidden
// so object-cover crops cleanly and nothing spills onto the next section.
function Photo({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`overflow-hidden border border-warm-200 ${className}`}>
      <img src={src} alt={alt} className="block w-full h-full object-cover" />
    </div>
  );
}

// Compact, content-dense photo gallery (1 big + thumbnail grid), inspired by
// sitter-profile layouts. Adapts to 1, 2 or 3+ photos.
function Gallery({ photos, name }: { photos: string[]; name: string }) {
  if (photos.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <span className="text-7xl" aria-hidden="true">🐶</span>
      </div>
    );
  }
  if (photos.length === 1) {
    return <Photo src={photos[0]} alt={name} className="rounded-2xl aspect-[16/10]" />;
  }
  const [cover, ...rest] = photos;
  return (
    <div className="grid grid-cols-2 gap-2 items-start">
      <Photo src={cover} alt={name} className="rounded-2xl aspect-square" />
      <div className={`grid gap-2 ${rest.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {rest.slice(0, 4).map((src, i) => (
          <Photo key={i} src={src} alt="" className="rounded-xl aspect-square" />
        ))}
      </div>
    </div>
  );
}

function Body({ page }: { page: PetPageRead }) {
  const highlights = page.highlights.map(highlightFor).filter(Boolean);

  return (
    <>
      {/* Header: name + eyebrow + share */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-500 uppercase">
            A HiSpike Pet Story
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-warm-900">
            {page.name}
          </h1>
        </div>
        <div className="shrink-0 mt-1">
          <ShareButtons name={`${page.name}'s page`} url={`/pet/${page.slug}`} variant="compact" />
        </div>
      </div>

      <Gallery photos={page.photos} name={page.name} />

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-warm-900 mb-4">Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {highlights.map((h) => (
              <div key={h!.key} className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-lg shrink-0"
                  aria-hidden="true"
                >
                  {h!.emoji}
                </span>
                <span className="text-sm font-medium text-warm-800">{h!.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About / story */}
      <section className="mt-8 pt-8 border-t border-warm-200">
        <h2 className="text-lg font-bold text-warm-900 mb-3">About {page.name}</h2>
        <p className="whitespace-pre-wrap text-warm-700 leading-relaxed text-[15px]">
          {page.memories}
        </p>
      </section>

      {/* Soft CTA so every shared page seeds the next owner */}
      <div className="mt-10 rounded-2xl border border-primary-100 bg-primary-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm font-medium text-warm-700">Have a pet of your own?</p>
        <Link
          to="/pet-stories"
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow whitespace-nowrap"
        >
          Create their HiSpike page — free
        </Link>
      </div>
    </>
  );
}

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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-warm-50 to-warm-50">
      <PageHead
        title={`${page.name}'s Page`}
        description={preview || `${page.name}'s photos and story, shared on HiSpike.`}
        path={`/pet/${page.slug}`}
        image={page.photos[0]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-5 sm:p-8">
          <Body page={page} />
        </div>
      </div>
    </div>
  );
}
