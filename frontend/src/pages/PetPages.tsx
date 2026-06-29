import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkSlugAvailable,
  countWords,
  createPetPage,
  deletePetPage,
  isSlugWellFormed,
  listMyPetPages,
  MAX_MEMORY_WORDS,
  MAX_PHOTOS,
  PET_HIGHLIGHTS,
  slugify,
  updatePetPage,
  type PetPageRead,
} from '@/api/petPages';
import { ImageUpload } from '@/components/ImageUpload';
import { ShareButtons } from '@/components/ShareButtons';
import { HeroPaws } from '@/components/HeroPaws';
import { PageHead } from '@/components/PageHead';
import { PetPageView } from '@/components/PetPageView';
import { toast } from '@/store/toastStore';

type SlugStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'invalid';

const SITE_HOST = 'hispike.in';

export function PetPages() {
  const qc = useQueryClient();
  const { data: pages, isLoading } = useQuery({
    queryKey: ['my-pet-pages'],
    queryFn: listMyPetPages,
  });

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [memories, setMemories] = useState('');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [showPreview, setShowPreview] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const words = countWords(memories);
  const overLimit = words > MAX_MEMORY_WORDS;

  // Auto-derive the slug from the name until the owner edits it by hand.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  // Debounced live availability check.
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle');
      return;
    }
    if (!isSlugWellFormed(slug)) {
      setSlugStatus('invalid');
      return;
    }
    setSlugStatus('checking');
    const handle = window.setTimeout(async () => {
      try {
        const ok = await checkSlugAvailable(slug, editingId ?? undefined);
        setSlugStatus(ok ? 'ok' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 350);
    return () => window.clearTimeout(handle);
  }, [slug, editingId]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setSlugTouched(false);
    setPhotos([]);
    setHighlights([]);
    setMemories('');
    setSlugStatus('idle');
  };

  const startEdit = (page: PetPageRead) => {
    setEditingId(page.id);
    setName(page.name);
    setSlug(page.slug);
    setSlugTouched(true);
    setPhotos(page.photos);
    setHighlights(page.highlights);
    setMemories(page.memories);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onFileSelect = (file: File) => {
    // In mock/dev we inline the image as a data URL so it persists and renders
    // without a backend. Stage 2 swaps this for the /pet-pages/{id}/photo upload.
    const reader = new FileReader();
    reader.onloadend = () =>
      setPhotos((prev) => (prev.length >= MAX_PHOTOS ? prev : [...prev, reader.result as string]));
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  // Promote a photo to the front — photos[0] is the cover used everywhere.
  const setCover = (idx: number) =>
    setPhotos((prev) => {
      if (idx <= 0 || idx >= prev.length) return prev;
      const next = [...prev];
      const [pick] = next.splice(idx, 1);
      next.unshift(pick);
      return next;
    });

  const toggleHighlight = (key: string) =>
    setHighlights((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { slug, name, photos, highlights, memories };
      return editingId ? updatePetPage(editingId, payload) : createPetPage(payload);
    },
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: ['my-pet-pages'] });
      qc.invalidateQueries({ queryKey: ['pet-page', page.slug] });
      toast.success(
        editingId ? 'Page updated.' : `Published at ${SITE_HOST}/pet/${page.slug}`,
      );
      resetForm();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Could not save the page.');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deletePetPage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-pet-pages'] });
      toast.success('Page deleted.');
    },
    onError: () => toast.error('Could not delete the page.'),
  });

  const canSubmit =
    name.trim().length > 0 &&
    slugStatus === 'ok' &&
    words > 0 &&
    !overLimit &&
    !saveMut.isPending;

  const slugHint = useMemo(() => {
    switch (slugStatus) {
      case 'checking':
        return { text: 'Checking availability…', cls: 'text-warm-500' };
      case 'ok':
        return { text: '✓ Available', cls: 'text-green-600' };
      case 'taken':
        return { text: '✗ Already taken', cls: 'text-red-600' };
      case 'invalid':
        return { text: 'Use 2–60 letters, numbers and dashes only', cls: 'text-red-600' };
      default:
        return null;
    }
  }, [slugStatus]);

  return (
    <div className="bg-warm-50 min-h-screen">
      <PageHead
        title="Your Pet Stories"
        description="Create a free shareable page for your pet — name, photo and story — at hispike.in/pet/your-pet."
        path="/pet-stories"
      />

      {/* Branded hero band — same primary gradient + gold accent + animated
          scattered paws as the homepage hero, via the shared HeroPaws. */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <HeroPaws />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
            Pet Stories · Bangalore
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Your Pet Stories
          </h1>
          <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
          <p className="mt-3 text-sm text-primary-100/90 max-w-2xl">
            Give your pet their own page — a photo and your favourite memories — and share the
            link with anyone. It lives at <span className="font-mono text-white">{SITE_HOST}/pet/your-pet</span>.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Create / edit form */}
        <div ref={formRef} className="rounded-2xl border border-warm-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-warm-900 mb-4">
            {editingId ? 'Edit page' : 'Create a new page'}
          </h2>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-warm-800 mb-1.5">Pet's name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Coco"
                maxLength={60}
                className="w-full px-3 py-2.5 border border-warm-300 rounded-lg outline-none focus:border-primary-500 text-sm"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-warm-800 mb-1.5">Page link</label>
              <div className="flex items-center rounded-lg border border-warm-300 focus-within:border-primary-500 overflow-hidden">
                <span className="pl-3 py-2.5 text-sm text-warm-400 select-none whitespace-nowrap">
                  {SITE_HOST}/pet/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="coco"
                  className="flex-1 pl-0 pr-3 py-2.5 outline-none text-sm font-medium text-warm-900"
                />
              </div>
              {slugHint && <p className={`mt-1.5 text-xs ${slugHint.cls}`}>{slugHint.text}</p>}
            </div>

            {/* Photos — gallery */}
            <div>
              <label className="block text-sm font-semibold text-warm-800 mb-1.5">
                Photos <span className="font-normal text-warm-400">({photos.length}/{MAX_PHOTOS})</span>
              </label>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {photos.map((src, i) => (
                    <div
                      key={i}
                      className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                        i === 0 ? 'border-primary-500' : 'border-warm-200'
                      }`}
                    >
                      {/* Click the image to make it the cover */}
                      <button
                        type="button"
                        onClick={() => setCover(i)}
                        aria-label={i === 0 ? 'Cover photo' : 'Set as cover photo'}
                        className="block w-full h-full"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                      {i === 0 ? (
                        <span className="absolute top-1 left-1 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none">
                          Cover
                        </span>
                      ) : (
                        <span className="absolute bottom-1 inset-x-1 text-center bg-black/60 text-white text-[9px] font-semibold py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Set as cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photos.length < MAX_PHOTOS ? (
                // key resets the dropzone's internal preview after each add
                <ImageUpload key={photos.length} onFileSelect={onFileSelect} />
              ) : (
                <p className="text-xs text-warm-500">Maximum {MAX_PHOTOS} photos reached.</p>
              )}
              <p className="mt-1.5 text-xs text-warm-400">Click a photo to make it the cover.</p>
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-sm font-semibold text-warm-800 mb-1.5">
                Highlights <span className="font-normal text-warm-400">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PET_HIGHLIGHTS.map((h) => {
                  const active = highlights.includes(h.key);
                  return (
                    <button
                      key={h.key}
                      type="button"
                      onClick={() => toggleHighlight(h.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-warm-300 text-warm-600 hover:border-warm-400'
                      }`}
                    >
                      <span aria-hidden="true">{h.emoji}</span>
                      {h.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Memories */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-warm-800">About your pet</label>
                <span className={`text-xs ${overLimit ? 'text-red-600 font-semibold' : 'text-warm-500'}`}>
                  {words} / {MAX_MEMORY_WORDS} words
                </span>
              </div>
              <textarea
                value={memories}
                onChange={(e) => setMemories(e.target.value)}
                rows={8}
                placeholder="Tell their story — how they joined your family, their quirks, the walks, the joy…"
                className={`w-full px-3 py-2.5 border rounded-lg outline-none text-sm leading-relaxed resize-y ${
                  overLimit ? 'border-red-400 focus:border-red-500' : 'border-warm-300 focus:border-primary-500'
                }`}
              />
              {overLimit && (
                <p className="mt-1.5 text-xs text-red-600">
                  That's {words - MAX_MEMORY_WORDS} word(s) over the {MAX_MEMORY_WORDS}-word limit.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => saveMut.mutate()}
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saveMut.isPending
                  ? 'Saving…'
                  : editingId
                    ? 'Save changes'
                    : 'Publish page'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-warm-600 hover:text-warm-900"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Existing pages */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-warm-900 mb-4">Your stories</h2>
          {isLoading ? (
            <p className="text-sm text-warm-500">Loading…</p>
          ) : !pages || pages.length === 0 ? (
            <p className="text-sm text-warm-500">No pages yet — create your first one above.</p>
          ) : (
            <ul className="space-y-3">
              {pages.map((page) => (
                <li
                  key={page.id}
                  className="flex items-center gap-4 rounded-xl border border-warm-200 bg-white p-3"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-warm-100 flex items-center justify-center shrink-0">
                    {page.photos[0] ? (
                      <img src={page.photos[0]} alt={page.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl" aria-hidden="true">🐶</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-warm-900 truncate">{page.name}</p>
                    <Link
                      to={`/pet/${page.slug}`}
                      className="text-xs text-primary-600 hover:underline font-mono"
                    >
                      {SITE_HOST}/pet/{page.slug}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ShareButtons name={`${page.name}'s page`} url={`/pet/${page.slug}`} variant="compact" />
                    <button
                      type="button"
                      onClick={() => startEdit(page)}
                      className="text-xs font-semibold text-warm-700 hover:text-warm-900 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete ${page.name}'s page? This can't be undone.`)) {
                          deleteMut.mutate(page.id);
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
