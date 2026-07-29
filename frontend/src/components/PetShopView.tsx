import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HeroPaws } from './HeroPaws';
import { SHOP_CATEGORIES, displayPrice, type PetShopRead, type ShopProduct, type ShopUpdate } from '@/api/petShops';

// wa.me deep link with a pre-filled message.
function waLink(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const PRODUCT_TILES = [
  'from-amber-200 to-amber-400',
  'from-emerald-200 to-emerald-400',
  'from-sky-200 to-sky-400',
  'from-rose-200 to-rose-400',
  'from-violet-200 to-violet-400',
  'from-cyan-200 to-cyan-400',
];

function WhatsAppIcon({ className = 'w-4 h-4 fill-current' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.01 0-1.43.75-2.14 1.02-2.43.27-.29.58-.36.77-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2.01.89 2.16.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.69-.8.87-1.08.18-.28.36-.23.61-.14.25.09 1.58.75 1.85.89.27.14.45.21.52.33.07.11.07.66-.17 1.34z" />
    </svg>
  );
}

// Deterministic index for the placeholder tile colour.
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

function ProductCard({ product, waTarget, shopName }: { product: ShopProduct; waTarget: string | null; shopName: string }) {
  const idx = Math.abs(hashCode(product.id)) % PRODUCT_TILES.length;
  const order = waTarget
    ? waLink(waTarget, `Hi ${shopName}! I'm interested in "${product.name}" (seen on HiSpike). Is it available?`)
    : null;
  return (
    <article className="w-44 shrink-0 snap-start bg-white border border-primary-100 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      <div className="aspect-[4/3.4] relative flex items-center justify-center overflow-hidden">
        {product.photo_url ? (
          <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${PRODUCT_TILES[idx]} flex items-center justify-center text-5xl`}>🛍️</div>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white/95 text-[10px] font-bold uppercase tracking-wide text-warm-500 px-2 py-0.5 rounded-full shadow-sm">
            {product.category}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-bold text-sm text-warm-900 leading-snug">{product.name}</p>
        {product.price && <p className="text-base font-extrabold text-warm-900 tabular-nums">{product.price}</p>}
        {order && (
          <a
            href={order}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-1.5 bg-green-100 hover:bg-green-500 text-green-700 hover:text-white font-bold text-xs py-2 rounded-lg transition-colors"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" /> WhatsApp to order
          </a>
        )}
      </div>
    </article>
  );
}

function PromoCard({ update, waTarget, shopName }: { update: ShopUpdate; waTarget: string | null; shopName: string }) {
  const grab = waTarget ? waLink(waTarget, `Hi ${shopName}! I'd like to grab your "${update.title}" offer (seen on HiSpike).`) : null;
  return (
    <div className="relative bg-white border border-primary-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
      {update.badge && (
        <span className="absolute top-3 right-3 bg-accent-400 text-warm-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
          {update.badge}
        </span>
      )}
      <span aria-hidden="true" className="w-11 h-11 rounded-xl bg-accent-100 grid place-items-center text-2xl shrink-0">🎉</span>
      <div className="min-w-0">
        <h4 className="font-extrabold text-warm-900 pr-14">{update.title}</h4>
        {update.body && <p className="mt-0.5 text-sm text-warm-500 leading-snug">{update.body}</p>}
        {grab && (
          <a href={grab} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-green-700 font-bold text-xs hover:underline">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" /> Grab on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

const WRAP = 'max-w-5xl mx-auto px-4 sm:px-6';

export function PetShopView({ data }: { data: PetShopRead }) {
  const waTarget = data.whatsapp || data.phone || null;
  const products = data.products ?? [];
  const updates = data.updates ?? [];
  const photos = data.photos ?? [];

  // Group products into category shelves, ordered by SHOP_CATEGORIES.
  const shelves = useMemo(() => {
    const map = new Map<string, ShopProduct[]>();
    for (const p of products) {
      const c = p.category && (SHOP_CATEGORIES as readonly string[]).includes(p.category) ? p.category : 'Other';
      (map.get(c) ?? map.set(c, []).get(c)!).push(p);
    }
    return SHOP_CATEGORIES.filter((c) => map.has(c)).map((c) => ({ category: c, items: map.get(c)! }));
  }, [products]);

  const jump = (cat: string) => document.getElementById(`shelf-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const trust: React.ReactNode[] = [];
  if (data.free_delivery_over) trust.push(<span key="fd">🚚 Free delivery over <b className="text-accent-300">{data.free_delivery_over}</b></span>);
  if (data.delivery_radius) trust.push(<span key="dr">🏠 Home delivery within <b className="text-accent-300">{data.delivery_radius}</b></span>);
  if (waTarget) trust.push(<span key="wa">💬 Order on <b className="text-accent-300">WhatsApp</b></span>);

  return (
    <div>
      {/* Brand header — logo + shop name, top-left on white, like the shop's own site */}
      <header className="bg-white border-b border-warm-200">
        <div className={`${WRAP} py-3 sm:py-4 flex items-center gap-3`}>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-warm-200 shrink-0 grid place-items-center text-2xl overflow-hidden">
            {data.logo_url ? <img src={data.logo_url} alt={data.name} className="w-full h-full object-cover" /> : <span aria-hidden="true">🏪</span>}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate text-warm-900">{data.name}</h1>
        </div>
      </header>

      {/* Trust strip */}
      {trust.length > 0 && (
        <div className="bg-primary-900 text-white text-xs sm:text-[13px] font-semibold">
          <div className={`${WRAP} py-2.5 flex flex-wrap justify-center items-center gap-x-6 gap-y-1`}>
            {trust.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Hero — HiSpike-style animated blue band (pulsing paws + sparkles).
          Split layout: text on the left, banner photo floated as a card on the
          right. On mobile the photo is hidden, so it reads like the HiSpike
          hero — text on the animated blue, always readable. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <HeroPaws />
        <div className={`relative ${WRAP} grid gap-6 md:gap-8 items-stretch ${data.hero_url ? 'md:grid-cols-2 md:min-h-[300px]' : ''}`}>
          {/* Left — offer, quick facts, description, CTAs (padding lives here so
              the image column can fill the band top-to-bottom) */}
          <div className="py-7 sm:py-9 flex flex-col justify-center">
            {data.offer && (
              <div className="inline-flex items-center gap-2 bg-accent-400 text-warm-900 font-extrabold text-xs sm:text-sm px-3 py-1.5 rounded-lg mb-3 shadow">
                <span className="text-[10px] uppercase tracking-[0.15em] bg-warm-900 text-accent-400 px-1.5 py-0.5 rounded">Sale</span>
                {data.offer}
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] sm:text-sm text-white/90 font-semibold">
              {data.area && <span>📍 {data.area}</span>}
              {data.hours && <span>🕙 {data.hours}</span>}
              {products.length > 0 && <span>🛍️ {products.length} products</span>}
            </div>
            {data.about && <p className="mt-2.5 text-sm sm:text-[15px] text-white/90 leading-relaxed max-w-xl">{data.about}</p>}
            <div className="mt-4 flex flex-wrap gap-2.5">
              {waTarget && (
                <a
                  href={waLink(waTarget, `Hi ${data.name}! I found you on HiSpike.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-colors shadow-lg"
                >
                  <WhatsAppIcon /> WhatsApp
                </a>
              )}
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-primary-50 transition-colors shadow"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#EC4899" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z" /></svg>
                  Call
                </a>
              )}
            </div>
          </div>

          {/* Right — banner photo fills the band top-to-bottom, desktop only */}
          {data.hero_url && (
            <div className="hidden md:block py-4">
              <img
                src={data.hero_url}
                alt={`${data.name} banner`}
                className="w-full h-full object-cover rounded-2xl shadow-xl ring-1 ring-white/20"
              />
            </div>
          )}
        </div>
      </section>

      {/* Category jump band */}
      {shelves.length > 0 && (
        <nav className="bg-primary-100 border-b border-primary-200" aria-label="Shop by category">
          <div className={`${WRAP} py-3 flex items-center gap-3`}>
            <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-warm-500 hidden sm:inline">🐾 Shop by category</span>
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {shelves.map(({ category, items }) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => jump(category)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border-2 border-primary-400/40 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white hover:border-primary-600 font-bold text-[13px] px-3.5 py-1.5 transition-colors"
                >
                  {category} <span className="text-[11px] opacity-80">{items.length}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Product shelves */}
      <div className={`${WRAP} pt-7`}>
        <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-accent-600">Shop the store</p>
        <h2 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-warm-900">Browse by category</h2>
        {products.length === 0 ? (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-primary-200 p-8 text-center text-sm text-warm-500">
            No products listed yet — check back soon.
          </div>
        ) : (
          shelves.map(({ category, items }) => (
            <section key={category} id={`shelf-${category}`} className="mt-5 scroll-mt-4">
              <div className="flex items-baseline justify-between mb-2.5">
                <h3 className="text-lg font-extrabold text-warm-900">
                  {category} <span className="text-xs font-bold text-warm-400">{items.length}</span>
                </h3>
              </div>
              <div className="flex gap-3.5 overflow-x-auto pb-3 snap-x [scrollbar-width:thin]">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} waTarget={waTarget} shopName={data.name} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Promotions */}
      {updates.length > 0 && (
        <div className={`${WRAP} pt-8`}>
          <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-accent-600">Offers</p>
          <h2 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-warm-900 mb-3">Promotions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {updates.map((u) => (
              <PromoCard key={u.id} update={u} waTarget={waTarget} shopName={data.name} />
            ))}
          </div>
        </div>
      )}

      {/* Our shop — owner photo gallery */}
      {photos.length > 0 && (
        <div className={`${WRAP} pt-8`}>
          <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-accent-600">Take a look inside</p>
          <h2 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-warm-900 mb-3">Our shop</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((ph, i) => (
              <figure key={ph.id} className="relative rounded-2xl overflow-hidden bg-primary-100">
                <img
                  src={ph.photo_url}
                  alt={ph.caption ?? `${data.name} photo ${i + 1}`}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
                {ph.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs sm:text-sm font-semibold px-3 py-2">
                    {ph.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* HiSpike strip — for visitors who arrive via a shared link */}
      <div className="mt-10 bg-white border-t border-primary-100">
        <div className={`${WRAP} py-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center`}>
          <img src="/logo.png" alt="HiSpike" className="w-12 h-12 rounded-full" />
          <span className="text-sm font-semibold text-warm-700">
            This shop is on <b className="text-warm-900">Hi</b><b className="text-primary-600">Spike</b> — Bengaluru&apos;s pet-care network
          </span>
          <Link to="/petshops" className="text-sm font-extrabold text-primary-600 hover:underline whitespace-nowrap">
            Browse more pet shops →
          </Link>
        </div>

        {/* Purchase disclaimer — orders happen directly with the shop over
            WhatsApp/Call; HiSpike only lists the shop and isn't a party to
            the sale. Keeps HiSpike out of any buyer↔shop transaction dispute. */}
        <div className="border-t border-warm-100">
          <p className={`${WRAP} py-4 text-center text-xs leading-relaxed text-warm-400`}>
            Orders and payments are made directly with {data.name}. HiSpike lists this shop and is not a
            party to any purchase, and is not responsible for products, prices, or delivery. By contacting
            this shop, you agree to HiSpike&apos;s{' '}
            <Link to="/terms" className="underline hover:text-warm-600">Terms of Use</Link>{' '}and have read the{' '}
            <Link to="/privacy" className="underline hover:text-warm-600">Privacy Notice</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
