import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  resolvePhotosForPublish,
  slugify,
  updatePetPage,
  type PetPageRead,
} from '@/api/petPages';
import { ImageUpload } from '@/components/ImageUpload';
import { ShareButtons } from '@/components/ShareButtons';
import { PageHead } from '@/components/PageHead';
import { PetPageView } from '@/components/PetPageView';
import { toast } from '@/store/toastStore';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { fileToDownscaledDataUrl } from '@/lib/imageResize';

type SlugStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'invalid';

const SITE_HOST = 'hispike.in';

// Draft held in the browser so a not-yet-registered visitor can build their
// page first and sign up only at Publish — the work survives the trip to the
// sign-up screen and back. Photos ride along as (downscaled) data URLs.
const DRAFT_KEY = 'hispike_pet_draft';

type Draft = {
  name: string;
  slug: string;
  slugTouched: boolean;
  photos: string[];
  highlights: string[];
  memories: string;
  showInGallery: boolean;
  pendingPublish?: boolean; // set when an anonymous user tapped Publish
};

function readDraft(): Draft | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(d: Draft): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // Quota overflow (large photos) — the draft simply won't persist across a
    // reload; the in-memory copy still works for this session.
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function PetPages() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Only the signed-in owner has a "my pages" list; skip the (401) call otherwise.
  // The key is scoped to the user id so switching accounts doesn't briefly show
  // the previous user's pages from cache (a hard refresh was needed otherwise).
  const { data: pages, isLoading } = useQuery({
    queryKey: ['my-pet-pages', user?.id],
    queryFn: listMyPetPages,
    enabled: isAuthenticated,
  });

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [memories, setMemories] = useState('');
  // Opt-in, default off. Listing a page is a real privacy step up from
  // link-only sharing, so it has to be something the owner actively chose.
  const [showInGallery, setShowInGallery] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  // The page link is auto-made from the name; the editable field only appears
  // when someone chooses to customise it, so it never looks like a second field
  // they must fill in.
  const [customizingSlug, setCustomizingSlug] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Shows the "Welcome — tap Publish" banner when someone returns from sign-up
  // with a draft they were mid-publish on.
  const [resumed, setResumed] = useState(false);
  const draftLoaded = useRef(false);

  const formRef = useRef<HTMLDivElement>(null);

  const words = countWords(memories);
  const overLimit = words > MAX_MEMORY_WORDS;

  // Restore a saved draft on first mount (once auth has hydrated so we know
  // whether this is a returning-from-signup resume).
  useEffect(() => {
    if (draftLoaded.current || !hasHydrated) return;
    draftLoaded.current = true;
    const d = readDraft();
    if (!d) return;
    // A logged-in user should only see a draft when it's their own pending-publish
    // resume. Any other saved draft belongs to an earlier anonymous session on
    // this browser — don't load someone else's work into their form.
    if (isAuthenticated && !d.pendingPublish) {
      clearDraft();
      return;
    }
    setName(d.name);
    setSlug(d.slug);
    setSlugTouched(d.slugTouched);
    if (d.slugTouched) setCustomizingSlug(true);
    setPhotos(d.photos ?? []);
    setHighlights(d.highlights ?? []);
    setMemories(d.memories);
    setShowInGallery(d.showInGallery === true);
    if (d.pendingPublish && isAuthenticated) {
      setResumed(true);
      // Clear the flag so a later reload doesn't nag, but keep the content.
      writeDraft({ ...d, pendingPublish: false });
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [hasHydrated, isAuthenticated]);

  // Persist the create-form draft as it changes (not while editing an existing
  // page — that's server-backed). Debounced, because the draft carries base64
  // photos and re-serialising ~2 MB of JSON on every keystroke would lag typing.
  // Empty forms clear the draft.
  useEffect(() => {
    if (!draftLoaded.current || editingId !== null) return;
    const hasContent = name.trim() || memories.trim() || photos.length > 0;
    const handle = window.setTimeout(() => {
      if (hasContent) {
        writeDraft({ name, slug, slugTouched, photos, highlights, memories, showInGallery });
      } else {
        clearDraft();
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [name, slug, slugTouched, photos, highlights, memories, showInGallery, editingId]);

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

  // Close the preview overlay on Escape.
  useEffect(() => {
    if (!showPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPreview(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPreview]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setSlugTouched(false);
    setPhotos([]);
    setHighlights([]);
    setMemories('');
    setShowInGallery(false);
    setSlugStatus('idle');
    setCustomizingSlug(false);
    setResumed(false);
    clearDraft();
  };

  const startEdit = (page: PetPageRead) => {
    setEditingId(page.id);
    setName(page.name);
    setSlug(page.slug);
    setSlugTouched(true);
    setPhotos(page.photos);
    setHighlights(page.highlights);
    setMemories(page.memories);
    setShowInGallery(page.show_in_gallery === true);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Add several photos in one go (multi-select / multi-drop), capped at MAX_PHOTOS.
  // Photos are held in the browser as downscaled data URLs and only uploaded to
  // storage at publish time (resolvePhotosForPublish) — this lets a not-yet-
  // registered visitor add photos before signing up, and keeps the draft small
  // enough to persist across the sign-up redirect.
  const onFilesSelect = async (files: File[]) => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.slice(0, remaining).map(fileToDownscaledDataUrl));
      setPhotos((prev) => [...prev, ...urls].slice(0, MAX_PHOTOS));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add that photo.');
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (file: File) => {
    void onFilesSelect([file]);
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
      // Upload any browser-held photos to storage now, then save the page.
      const hostedPhotos = await resolvePhotosForPublish(photos);
      const payload = { slug, name, photos: hostedPhotos, highlights, memories, show_in_gallery: showInGallery };
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

  // Publish gate: if you're not signed in yet, save the draft and send you to
  // sign up — you come back here with everything intact and one tap to finish.
  const onPublish = () => {
    if (editingId === null && !isAuthenticated) {
      writeDraft({ name, slug, slugTouched, photos, highlights, memories, showInGallery, pendingPublish: true });
      navigate(`/register?redirect=${encodeURIComponent('/pet-stories/create')}`);
      return;
    }
    saveMut.mutate();
  };

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

  // Preview needs at least something to render.
  const canPreview = name.trim().length > 0 || photos.length > 0 || memories.trim().length > 0;
  const draft = { name, slug, photos, highlights, memories };

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
        path="/pet-stories/create"
      />

      {/* No hero band here. This page is a form; the gallery at /pet-stories
          carries the branding, and a second blue band just pushed the actual
          work below the fold. All this page needs is a way back. */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-1">
        <Link
          to="/pet-stories"
          // primary-700, not the accent gold this used to be: gold read fine
          // on the blue band but is far too pale on warm-50.
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 hover:underline"
        >
          <span aria-hidden="true">←</span>
          Back to pet stories
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Returning from sign-up mid-publish — everything's restored, one tap left. */}
        {resumed && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <span aria-hidden="true" className="text-xl">🎉</span>
            <div>
              <p className="font-bold text-green-800 text-sm">You're all set!</p>
              <p className="text-sm text-green-700">
                Your page is ready — tap <span className="font-semibold">Publish page</span> below to put
                {name ? ` ${name}'s` : ' your'} story live.
              </p>
            </div>
          </div>
        )}

        {/* An owner returning to update a published page used to have to click
            "Create your pet's page" and scroll past the whole form to find Edit.
            When they already have pages, list them FIRST; the create form stays
            below for making another. */}
        {isAuthenticated && (pages?.length ?? 0) > 0 && !editingId && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-warm-900 mb-1">Your pet pages</h2>
          <p className="text-sm text-warm-500 mb-4">
            Tap <span className="font-semibold text-warm-700">Edit</span> on a page to update
            its photos, highlights, story or gallery setting.
          </p>
          {isLoading ? (
            <p className="text-sm text-warm-500">Loading…</p>
          ) : !pages || pages.length === 0 ? (
            // Unreachable: the block above only renders when there is at
            // least one page. Kept as a guard against a future refactor.
            <p className="text-sm text-warm-500">No pages yet — create your first one below.</p>
          ) : (
            <ul className="space-y-3">
              {pages.map((page) => (
                <li
                  key={page.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-warm-200 bg-white p-3"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
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
                        className="block truncate text-xs text-primary-600 hover:underline font-mono"
                      >
                        {SITE_HOST}/pet/{page.slug}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
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
        )}

        {/* Create / edit form */}
        <div ref={formRef} className="rounded-2xl border border-warm-200 bg-white p-5 sm:p-6 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-warm-900 mb-4">
            {editingId
              ? 'Edit page'
              : (pages?.length ?? 0) > 0
                ? 'Create another page'
                : 'Create a new page'}
          </h1>

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

            {/* Page link — created automatically from the pet's name. Shown as a
                read-only preview so it doesn't read as a second field to fill;
                a Customize button reveals the editable input on demand. */}
            <div>
              <label className="block text-sm font-semibold text-warm-800 mb-1.5">Page link</label>
              {customizingSlug ? (
                <>
                  <div className="flex items-center rounded-lg border border-warm-300 focus-within:border-primary-500 overflow-hidden">
                    <span className="pl-3 py-2.5 text-sm text-warm-400 select-none whitespace-nowrap">
                      {SITE_HOST}/pet/
                    </span>
                    <input
                      type="text"
                      autoFocus
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
                </>
              ) : (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-warm-200 bg-warm-50 px-3 py-2.5">
                  <span className="min-w-0 truncate text-sm text-warm-500">
                    {SITE_HOST}/pet/
                    {slug ? (
                      <span className="font-semibold text-warm-900">{slug}</span>
                    ) : (
                      <span className="text-warm-400">your-pet</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {slug && slugStatus === 'ok' && (
                      <span className="text-xs font-medium text-green-600">✓ Available</span>
                    )}
                    {slug && slugStatus === 'taken' && (
                      <span className="text-xs font-medium text-red-600">✗ Taken</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCustomizingSlug(true)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-1.5 text-xs text-warm-400">
                {customizingSlug
                  ? 'Use 2–60 letters, numbers and dashes.'
                  : "Created automatically from your pet's name — tap Customize to change it."}
              </p>
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
                <ImageUpload key={photos.length} multiple isUploading={uploading} onFileSelect={onFileSelect} onFilesSelect={onFilesSelect} />
              ) : (
                <p className="text-xs text-warm-500">Maximum {MAX_PHOTOS} photos reached.</p>
              )}
              <p className="mt-1.5 text-xs text-warm-400">
                Pick or drop several at once (up to {MAX_PHOTOS}). Click a photo to make it the cover.
              </p>
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

            {/* Public-listing consent. Deliberately its own bordered block
                rather than a line in the form: opting in changes who can find
                the page, so it should not read like another styling choice.
                Unchecked by default, and the copy says plainly what each
                state means. */}
            <div className="rounded-xl border border-warm-200 bg-warm-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInGallery}
                  onChange={(e) => setShowInGallery(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-warm-400 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-warm-900">
                    Show {name.trim() || 'your pet'} in the public Pet Stories gallery
                  </span>
                  <span className="mt-1 block text-xs text-warm-600 leading-relaxed">
                    {showInGallery
                      ? 'Your page is listed in the public gallery, so anyone browsing HiSpike can find it.'
                      : 'Your page stays unlisted — it works for anyone you send the link to, but it will not appear anywhere on HiSpike.'}
                  </span>
                  <span className="mt-1 block text-xs text-warm-500">
                    You can change this any time.
                  </span>
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={onPublish}
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saveMut.isPending
                  ? 'Publishing…'
                  : editingId
                    ? 'Save changes'
                    : 'Publish page'}
              </button>
              <button
                type="button"
                disabled={!canPreview}
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 rounded-full border border-primary-600 px-5 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Preview
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

            {/* Honest heads-up for visitors who aren't signed in yet — the
                account is created at publish, not before, so this never reads
                as a surprise redirect. */}
            {hasHydrated && !isAuthenticated && !editingId && (
              <p className="text-xs text-warm-500">
                Build your page freely — publishing creates a quick free account to save it.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Preview overlay — renders the public page exactly, from the draft */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
          onClick={() => setShowPreview(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Page preview"
        >
          <div className="min-h-full px-3 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3 text-white">
                <p className="text-sm font-semibold">
                  Preview — how your page will look {!canSubmit && <span className="text-primary-200 font-normal">(not published yet)</span>}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold"
                >
                  Close ✕
                </button>
              </div>
              <div className="rounded-3xl bg-gradient-to-b from-primary-100 via-primary-50 to-accent-50 p-4 sm:p-8">
                <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-5 sm:p-8">
                  <PetPageView data={draft} preview />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
