import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addGalleryPhoto,
  addProduct,
  addUpdate,
  createShop,
  deleteGalleryPhoto,
  deleteProduct,
  deleteShop,
  deleteUpdate,
  getShopBySlug,
  listMyShops,
  slugAvailable,
  updateProduct,
  updateShop,
  uploadShopPhoto,
  displayPrice,
  SHOP_CATEGORIES,
  type PetShopRead,
  type PetShopSummary,
  type ShopProduct,
} from '@/api/petShops';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SelectMenu } from '@/components/SelectMenu';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toastStore';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const input =
  'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors border-warm-200 bg-white';
const label = 'block text-sm font-medium text-warm-700 mb-1.5';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

// A file → hosted-URL upload button with a thumbnail preview.
function PhotoField({ value, onChange, label: lbl, round }: { value: string | null; onChange: (url: string | null) => void; label: string; round?: boolean; }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadShopPhoto(file));
    } catch (err) {
      toast.error((err as Error).message || 'Upload failed');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };
  return (
    <div>
      <span className={label}>{lbl}</span>
      <div className="flex items-center gap-3">
        <div className={`w-16 h-16 bg-warm-100 border border-warm-200 overflow-hidden flex items-center justify-center text-2xl shrink-0 ${round ? 'rounded-2xl' : 'rounded-xl'}`}>
          {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <span className="text-warm-400">🖼️</span>}
        </div>
        <input ref={ref} type="file" accept="image/*" onChange={pick} className="hidden" />
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:text-warm-400">
          {busy ? 'Uploading…' : value ? 'Change' : 'Upload'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-sm font-semibold text-warm-400 hover:text-red-600">Remove</button>
        )}
      </div>
    </div>
  );
}

type SlugStatus = 'idle' | 'checking' | 'ok' | 'taken' | 'invalid';

function ShopDetailsForm({ shop, onSaved }: { shop: PetShopRead | null; onSaved: (s: PetShopRead) => void }) {
  const editing = !!shop;
  const [name, setName] = useState(shop?.name ?? '');
  const [slug, setSlug] = useState(shop?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(editing);
  const [logo, setLogo] = useState<string | null>(shop?.logo_url ?? null);
  const [hero, setHero] = useState<string | null>(shop?.hero_url ?? null);
  const [about, setAbout] = useState(shop?.about ?? '');
  const [offer, setOffer] = useState(shop?.offer ?? '');
  const [area, setArea] = useState(shop?.area ?? '');
  const [hours, setHours] = useState(shop?.hours ?? '');
  const [phone, setPhone] = useState(shop?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(shop?.whatsapp ?? '');
  const [freeDeliveryOver, setFreeDeliveryOver] = useState(shop?.free_delivery_over ?? '');
  const [deliveryRadius, setDeliveryRadius] = useState(shop?.delivery_radius ?? '');
  const [paymentUrl, setPaymentUrl] = useState(shop?.payment_url ?? '');
  const [upiId, setUpiId] = useState(shop?.upi_id ?? '');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');

  // Auto-fill slug from the name until the user edits it directly.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  // Debounced availability check.
  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return; }
    if (!SLUG_RE.test(slug)) { setSlugStatus('invalid'); return; }
    if (editing && slug === shop?.slug) { setSlugStatus('ok'); return; }
    setSlugStatus('checking');
    const h = window.setTimeout(async () => {
      try {
        setSlugStatus((await slugAvailable(slug, shop?.id)) ? 'ok' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 400);
    return () => window.clearTimeout(h);
  }, [slug, editing, shop?.slug, shop?.id]);

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = {
        slug, name: name.trim(), logo_url: logo, hero_url: hero, about: about.trim(),
        offer: offer.trim() || null,
        area: area.trim() || null, hours: hours.trim() || null,
        phone: phone.trim() || null, whatsapp: whatsapp.trim() || null,
        free_delivery_over: freeDeliveryOver.trim() || null,
        delivery_radius: deliveryRadius.trim() || null,
      };
      return editing ? updateShop(shop!.id, payload) : createShop(payload);
    },
    onSuccess: (s) => { toast.success(editing ? 'Shop updated.' : 'Shop created!'); onSaved(s); },
    onError: (e: Error) => toast.error(e.message || 'Could not save the shop.'),
  });

  const canSave = name.trim().length > 0 && (slugStatus === 'ok') && !saveMut.isPending;

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (canSave) saveMut.mutate(); }} className="space-y-5">
      <div>
        <label className={label} htmlFor="shop-name">Shop name</label>
        <input id="shop-name" className={input} placeholder="Paws & Whiskers" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className={label} htmlFor="shop-slug">Your link</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-warm-500 font-mono whitespace-nowrap">hispike.in/petshop/</span>
          <input id="shop-slug" className={input} placeholder="paws-and-whiskers" value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
        </div>
        <p className="mt-1.5 text-xs h-4">
          {slugStatus === 'checking' && <span className="text-warm-400">Checking…</span>}
          {slugStatus === 'ok' && <span className="text-green-600">✓ Available</span>}
          {slugStatus === 'taken' && <span className="text-red-600">Already taken — try another.</span>}
          {slugStatus === 'invalid' && <span className="text-red-600">Only lowercase letters, numbers and dashes.</span>}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <PhotoField value={logo} onChange={setLogo} label="Shop logo" round />
        <PhotoField value={hero} onChange={setHero} label="Banner photo (wide storefront header)" />
      </div>

      <div>
        <label className={label} htmlFor="shop-offer">Headline offer <span className="text-warm-400 font-normal">(optional — gold sale ribbon)</span></label>
        <input id="shop-offer" className={input} placeholder="Monsoon Sale — 15% off beds & raincoats" value={offer} onChange={(e) => setOffer(e.target.value)} />
      </div>

      <div>
        <label className={label} htmlFor="shop-about">About the shop</label>
        <textarea id="shop-about" rows={3} className={input} placeholder="What you sell, what makes you special, delivery info…" value={about} onChange={(e) => setAbout(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="shop-fdo">Free delivery over <span className="text-warm-400 font-normal">(optional)</span></label>
          <input id="shop-fdo" className={input} placeholder="₹499" value={freeDeliveryOver} onChange={(e) => setFreeDeliveryOver(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="shop-radius">Delivery radius <span className="text-warm-400 font-normal">(optional)</span></label>
          <input id="shop-radius" className={input} placeholder="5 km" value={deliveryRadius} onChange={(e) => setDeliveryRadius(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="shop-area">Area <span className="text-warm-400 font-normal">(optional)</span></label>
          <input id="shop-area" className={input} placeholder="Indiranagar, Bengaluru" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="shop-hours">Hours <span className="text-warm-400 font-normal">(optional)</span></label>
          <input id="shop-hours" className={input} placeholder="10am–9pm" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="shop-wa">WhatsApp number</label>
          <input id="shop-wa" className={input} placeholder="+91 98765 43210" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="shop-phone">Call number <span className="text-warm-400 font-normal">(optional)</span></label>
          <input id="shop-phone" className={input} placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <button type="submit" disabled={!canSave} className={btnPrimary}>
        {saveMut.isPending ? (<><LoadingSpinner size="sm" />Saving…</>) : editing ? 'Save changes' : 'Create shop'}
      </button>
    </form>
  );
}

function ProductForm({ initial, onSubmit, onCancel, busy }: { initial?: ShopProduct; onSubmit: (p: { name: string; price: string | null; description: string; photo_url: string | null; category: string | null }) => void; onCancel: () => void; busy: boolean; }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [photo, setPhoto] = useState<string | null>(initial?.photo_url ?? null);
  const [category, setCategory] = useState<string>(initial?.category ?? 'Food');
  return (
    <div className="rounded-2xl border-2 border-primary-100 bg-primary-50/40 p-4 space-y-3">
      <PhotoField value={photo} onChange={setPhoto} label="Product photo" />
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className={label}>Name</label><input className={input} placeholder="Royal Canin Adult 3kg" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <label className={label}>Category</label>
          <SelectMenu
            value={category}
            onChange={setCategory}
            options={SHOP_CATEGORIES.map((c) => ({ value: c, label: c }))}
            ariaLabel="Product category"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>Price <span className="text-warm-400 font-normal">(optional)</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-500 font-semibold pointer-events-none">₹</span>
            <input className={`${input} pl-8`} placeholder="1,299" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <div><label className={label}>Description <span className="text-warm-400 font-normal">(optional)</span></label><input className={input} placeholder="Complete nutrition for adult dogs." value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      </div>
      <div className="flex gap-2">
        <button type="button" disabled={busy || !name.trim()} className={btnPrimary} onClick={() => onSubmit({ name: name.trim(), price: price.trim() || null, description: description.trim(), photo_url: photo, category })}>
          {busy ? 'Saving…' : initial ? 'Update product' : 'Add product'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-warm-500 hover:text-warm-700 px-3">Cancel</button>
      </div>
    </div>
  );
}

function ProductsManager({ shop, onChanged }: { shop: PetShopRead; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const addMut = useMutation({ mutationFn: (p: Parameters<typeof addProduct>[1]) => addProduct(shop.id, p), onSuccess: () => { setAdding(false); onChanged(); toast.success('Product added.'); }, onError: (e: Error) => toast.error(e.message) });
  const editMut = useMutation({ mutationFn: ({ id, p }: { id: string; p: Parameters<typeof updateProduct>[1] }) => updateProduct(id, p), onSuccess: () => { setEditId(null); onChanged(); toast.success('Product updated.'); }, onError: (e: Error) => toast.error(e.message) });
  const delMut = useMutation({ mutationFn: deleteProduct, onSuccess: () => { setConfirmId(null); onChanged(); toast.success('Product removed.'); }, onError: (e: Error) => toast.error(e.message) });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-warm-900">Products <span className="text-warm-500 font-semibold text-sm">({shop.products.length})</span></h2>
        {!adding && <button onClick={() => { setAdding(true); setEditId(null); }} className="text-sm font-bold text-primary-600 hover:text-primary-700">＋ Add product</button>}
      </div>
      {adding && <div className="mb-4"><ProductForm busy={addMut.isPending} onSubmit={(p) => addMut.mutate(p)} onCancel={() => setAdding(false)} /></div>}
      {shop.products.length === 0 && !adding ? (
        <p className="text-sm text-warm-500 rounded-2xl border border-dashed border-warm-300 p-6 text-center">No products yet — add your first one.</p>
      ) : (
        <ul className="space-y-3">
          {shop.products.map((p) => (
            <li key={p.id}>
              {editId === p.id ? (
                <ProductForm initial={p} busy={editMut.isPending} onSubmit={(np) => editMut.mutate({ id: p.id, p: np })} onCancel={() => setEditId(null)} />
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-warm-200 bg-white p-3">
                  <div className="w-14 h-14 rounded-xl bg-warm-100 overflow-hidden flex items-center justify-center text-xl shrink-0">
                    {p.photo_url ? <img src={p.photo_url} alt="" className="w-full h-full object-cover" /> : '🛍️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-warm-900 truncate">{p.name}</p>
                      {p.category && <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded-full">{p.category}</span>}
                    </div>
                    <p className="text-sm text-primary-700 font-semibold">{displayPrice(p.price) || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setEditId(p.id); setAdding(false); }} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Edit</button>
                    {confirmId === p.id ? (
                      <button onClick={() => delMut.mutate(p.id)} className="text-sm font-bold text-red-600">Confirm?</button>
                    ) : (
                      <button onClick={() => setConfirmId(p.id)} className="text-sm font-semibold text-warm-400 hover:text-red-600">Delete</button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UpdatesManager({ shop, onChanged }: { shop: PetShopRead; onChanged: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [badge, setBadge] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const addMut = useMutation({ mutationFn: () => addUpdate(shop.id, { title: title.trim(), body: body.trim(), badge: badge.trim() || null }), onSuccess: () => { setTitle(''); setBody(''); setBadge(''); onChanged(); toast.success('Promotion posted.'); }, onError: (e: Error) => toast.error(e.message) });
  const delMut = useMutation({ mutationFn: deleteUpdate, onSuccess: () => { setConfirmId(null); onChanged(); }, onError: (e: Error) => toast.error(e.message) });

  return (
    <section>
      <h2 className="text-lg font-extrabold text-warm-900 mb-1">Promotions</h2>
      <p className="text-sm text-warm-500 mb-4">Post an offer or new arrival — it shows as a promo card on your shop page.</p>
      <div className="rounded-2xl border-2 border-accent-200 bg-accent-50/40 p-4 space-y-3 mb-4">
        <div className="grid sm:grid-cols-[1fr_120px] gap-3">
          <div>
            <label className={label}>Title</label>
            <input className={input} placeholder="Monsoon Sale on beds" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={label}>Badge <span className="text-warm-400 font-normal">(short)</span></label>
            <input className={input} placeholder="15% OFF" maxLength={24} value={badge} onChange={(e) => setBadge(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={label}>Details <span className="text-warm-400 font-normal">(optional)</span></label>
          <input className={input} placeholder="A line or two about it" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <button disabled={!title.trim() || addMut.isPending} className={btnPrimary} onClick={() => addMut.mutate()}>{addMut.isPending ? 'Posting…' : 'Post promotion'}</button>
      </div>
      {shop.updates.length > 0 && (
        <ul className="space-y-2">
          {shop.updates.map((u) => (
            <li key={u.id} className="flex items-start justify-between gap-3 rounded-xl border border-warm-200 bg-white p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-warm-900">{u.title}</p>
                  {u.badge && <span className="shrink-0 bg-accent-400 text-warm-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{u.badge}</span>}
                </div>
                {u.body && <p className="text-sm text-warm-600">{u.body}</p>}
              </div>
              {confirmId === u.id ? (
                <button onClick={() => delMut.mutate(u.id)} className="text-sm font-bold text-red-600 shrink-0">Confirm?</button>
              ) : (
                <button onClick={() => setConfirmId(u.id)} className="text-sm font-semibold text-warm-400 hover:text-red-600 shrink-0">Delete</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PhotosManager({ shop, onChanged }: { shop: PetShopRead; onChanged: () => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const photos = shop.photos ?? [];

  const addMut = useMutation({
    mutationFn: () => addGalleryPhoto(shop.id, { photo_url: photo!, caption: caption.trim() || null }),
    onSuccess: () => { setPhoto(null); setCaption(''); onChanged(); toast.success('Photo added.'); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({ mutationFn: deleteGalleryPhoto, onSuccess: () => { setConfirmId(null); onChanged(); }, onError: (e: Error) => toast.error(e.message) });

  return (
    <section>
      <h2 className="text-lg font-extrabold text-warm-900 mb-1">Shop photos</h2>
      <p className="text-sm text-warm-500 mb-4">Show customers around — your storefront, shelves, grooming corner. Shows as the "Our shop" gallery.</p>
      <div className="rounded-2xl border-2 border-primary-100 bg-primary-50/40 p-4 space-y-3 mb-4">
        <PhotoField value={photo} onChange={setPhoto} label="Add a photo" />
        <div>
          <label className={label}>Caption <span className="text-warm-400 font-normal">(optional)</span></label>
          <input className={input} placeholder="e.g. Our food aisle" maxLength={160} value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <button disabled={!photo || addMut.isPending} className={btnPrimary} onClick={() => addMut.mutate()}>
          {addMut.isPending ? 'Adding…' : 'Add to gallery'}
        </button>
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((ph) => (
            <div key={ph.id} className="relative rounded-2xl overflow-hidden border border-warm-200 group">
              <img src={ph.photo_url} alt={ph.caption ?? ''} className="w-full aspect-[4/3] object-cover" />
              {ph.caption && <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-semibold px-2 py-1.5">{ph.caption}</p>}
              {confirmId === ph.id ? (
                <button onClick={() => delMut.mutate(ph.id)} className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">Delete?</button>
              ) : (
                <button onClick={() => setConfirmId(ph.id)} aria-label="Remove photo" className="absolute top-2 right-2 bg-white/90 hover:bg-white text-warm-700 hover:text-red-600 w-7 h-7 rounded-full grid place-items-center font-bold shadow">✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function MyShop() {
  const qc = useQueryClient();
  const { user } = useAuth();
  // Scoped to the user id so switching accounts doesn't show the previous
  // owner's shops from cache (see the same fix on Pet Stories).
  const { data: shops, isLoading } = useQuery({ queryKey: ['my-shops', user?.id], queryFn: listMyShops });
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: PetShopSummary | null =
    shops?.find((s) => s.id === selectedId) ?? shops?.[0] ?? null;

  // Full shop (with products + updates) for the selected summary.
  const { data: fullShop } = useQuery({
    queryKey: ['pet-shop', selected?.slug],
    queryFn: () => getShopBySlug(selected!.slug),
    enabled: !!selected && !creating,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['my-shops'] });
    if (selected) qc.invalidateQueries({ queryKey: ['pet-shop', selected.slug] });
  };

  const delShopMut = useMutation({
    mutationFn: deleteShop,
    onSuccess: () => { toast.success('Shop deleted.'); setSelectedId(null); qc.invalidateQueries({ queryKey: ['my-shops'] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const [confirmDelShop, setConfirmDelShop] = useState(false);

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const showCreate = creating || !shops || shops.length === 0;

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-accent-600 mb-1">Pet Shops</p>
          <h1 className="text-3xl font-extrabold text-warm-900">Your shop</h1>
        </div>

        {showCreate ? (
          <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-warm-900 mb-1">{shops && shops.length ? 'Create another shop' : 'Set up your shop'}</h2>
            <p className="text-sm text-warm-500 mb-6">A free storefront at your own <span className="font-mono">hispike.in/petshop/</span> link.</p>
            <ShopDetailsForm shop={null} onSaved={(s) => { setCreating(false); setSelectedId(s.id); qc.invalidateQueries({ queryKey: ['my-shops'] }); }} />
            {shops && shops.length > 0 && (
              <button onClick={() => setCreating(false)} className="mt-4 text-sm font-semibold text-warm-500 hover:text-warm-700">← Back to my shop</button>
            )}
          </div>
        ) : selected ? (
          <div className="space-y-6">
            {/* toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {shops.length > 1 && (
                  <SelectMenu
                    value={selected.id}
                    onChange={setSelectedId}
                    options={shops.map((s) => ({ value: s.id, label: s.name }))}
                    ariaLabel="Switch shop"
                    className="min-w-[220px]"
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden="true">
                        <path d="M4 9h16l-1-5H5L4 9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    }
                  />
                )}
                <button onClick={() => setCreating(true)} className="text-sm font-bold text-primary-600 hover:text-primary-700">＋ New shop</button>
              </div>
              <a href={`/petshop/${selected.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary-600 hover:text-primary-700">View public page ↗</a>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-6 sm:p-8">
              <h2 className="text-lg font-extrabold text-warm-900 mb-5">Shop details</h2>
              {fullShop ? (
                // key so it remounts (and re-reads initial values) when the
                // async full shop loads or the selected shop changes.
                <ShopDetailsForm key={fullShop.id} shop={fullShop} onSaved={() => invalidate()} />
              ) : (
                <div className="py-8 flex justify-center"><LoadingSpinner /></div>
              )}
            </div>

            {fullShop && (
              <>
                <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-6 sm:p-8"><ProductsManager key={`p-${fullShop.id}`} shop={fullShop} onChanged={invalidate} /></div>
                <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-6 sm:p-8"><UpdatesManager key={`u-${fullShop.id}`} shop={fullShop} onChanged={invalidate} /></div>
                <div className="bg-white rounded-3xl shadow-sm border border-warm-200 p-6 sm:p-8"><PhotosManager key={`g-${fullShop.id}`} shop={fullShop} onChanged={invalidate} /></div>
              </>
            )}

            <div className="pt-2">
              {confirmDelShop ? (
                <span className="text-sm">
                  <span className="text-warm-600">Delete this shop and everything in it?</span>{' '}
                  <button onClick={() => delShopMut.mutate(selected.id)} className="font-bold text-red-600">Yes, delete</button>{' · '}
                  <button onClick={() => setConfirmDelShop(false)} className="font-semibold text-warm-500">Cancel</button>
                </span>
              ) : (
                <button onClick={() => setConfirmDelShop(true)} className="text-sm font-semibold text-warm-400 hover:text-red-600">Delete shop</button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
