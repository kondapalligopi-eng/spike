import { Link } from 'react-router-dom';
import { highlightFor } from '@/api/petPages';
import { ShareButtons } from '@/components/ShareButtons';

export type PetPageViewData = {
  name: string;
  slug: string;
  photos: string[];
  highlights: string[];
  memories: string;
};

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
// sitter-profile layouts. Adapts to 0, 1, 2 or 3+ photos.
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

// The presentational body of a pet page — shared by the public /pet/<slug> route
// and the create-form preview. In `preview` mode the share buttons and "create
// your own" CTA are hidden (the page doesn't exist publicly yet).
export function PetPageView({ data, preview = false }: { data: PetPageViewData; preview?: boolean }) {
  const highlights = data.highlights.map(highlightFor).filter(Boolean);

  return (
    <>
      {/* Header: name + eyebrow + share */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-500 uppercase">
            A HiSpike Pet Story
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-warm-900">
            {data.name || 'Your pet’s name'}
          </h1>
        </div>
        {!preview && (
          <div className="shrink-0 mt-1">
            <ShareButtons name={`${data.name}'s page`} url={`/pet/${data.slug}`} variant="compact" />
          </div>
        )}
      </div>

      <Gallery photos={data.photos} name={data.name} />

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
        <h2 className="text-lg font-bold text-warm-900 mb-3">About {data.name || 'your pet'}</h2>
        {data.memories ? (
          <p className="whitespace-pre-wrap text-warm-700 leading-relaxed text-[15px]">{data.memories}</p>
        ) : (
          <p className="italic text-warm-400">Your pet’s story will appear here…</p>
        )}
      </section>

      {/* Soft CTA so every shared page seeds the next owner */}
      {!preview && (
        <div className="mt-10 rounded-2xl border border-primary-100 bg-primary-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-medium text-warm-700">Have a pet of your own?</p>
          <Link
            to="/pet-stories"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow whitespace-nowrap"
          >
            Create their HiSpike page — free
          </Link>
        </div>
      )}
    </>
  );
}
