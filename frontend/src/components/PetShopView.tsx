import type { PetShopRead, ShopProduct, ShopUpdate } from '@/api/petShops';

// wa.me deep link with a pre-filled message.
function waLink(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// Lightweight "2 days ago" formatting; falls back to a date for older posts.
function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PRODUCT_TILES = [
  'from-amber-200 to-amber-400',
  'from-emerald-200 to-emerald-400',
  'from-sky-200 to-sky-400',
  'from-rose-200 to-rose-400',
  'from-violet-200 to-violet-400',
  'from-cyan-200 to-cyan-400',
];

function ProductCard({ product, waTarget, shopName }: { product: ShopProduct; waTarget: string | null; shopName: string; }) {
  const idx = Math.abs(hashCode(product.id)) % PRODUCT_TILES.length;
  const order = waTarget
    ? waLink(waTarget, `Hi ${shopName}! I'm interested in "${product.name}" (seen on HiSpike). Is it available?`)
    : null;
  return (
    <div className="bg-white border border-warm-200 rounded-2xl overflow-hidden flex flex-col">
      <div className="aspect-[4/3] flex items-center justify-center overflow-hidden">
        {product.photo_url ? (
          <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${PRODUCT_TILES[idx]} flex items-center justify-center text-5xl`}>
            🛍️
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="font-bold text-warm-900 leading-snug">{product.name}</p>
        {product.price && <p className="text-lg font-extrabold text-primary-700">{product.price}</p>}
        {product.description && (
          <p className="text-[13px] text-warm-500 leading-relaxed flex-1">{product.description}</p>
        )}
        {order && (
          <a
            href={order}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
          >
            <WhatsAppIcon /> WhatsApp to order
          </a>
        )}
      </div>
    </div>
  );
}

function UpdateCard({ update }: { update: ShopUpdate }) {
  return (
    <div className="bg-white border border-warm-200 border-l-4 border-l-accent-400 rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h4 className="font-bold text-warm-900">{update.title}</h4>
        <span className="text-xs text-warm-500 whitespace-nowrap shrink-0 mt-0.5">{relTime(update.created_at)}</span>
      </div>
      {update.body && <p className="text-sm text-warm-600 leading-relaxed">{update.body}</p>}
    </div>
  );
}

export function PetShopView({ data }: { data: PetShopRead }) {
  const waTarget = data.whatsapp || data.phone || null;
  const products = data.products ?? [];
  const updates = data.updates ?? [];

  return (
    <div>
      {/* Hero header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-500 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shrink-0 flex items-center justify-center text-4xl sm:text-5xl shadow-lg overflow-hidden">
            {data.logo_url ? (
              <img src={data.logo_url} alt={data.name} className="w-full h-full object-cover" />
            ) : (
              <span aria-hidden="true">🏪</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{data.name}</h1>
            {(data.area || data.hours) && (
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/90">
                {data.area && <span>📍 {data.area}</span>}
                {data.hours && <span>🕘 {data.hours}</span>}
              </div>
            )}
            {data.about && (
              <p className="mt-3 text-[15px] text-white/90 leading-relaxed max-w-2xl">{data.about}</p>
            )}
          </div>
          <div className="flex gap-2.5 flex-wrap w-full sm:w-auto">
            {waTarget && (
              <a
                href={waLink(waTarget, `Hi ${data.name}! I found you on HiSpike.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-3 rounded-full transition-colors"
              >
                <WhatsAppIcon /> WhatsApp
              </a>
            )}
            {data.phone && (
              <a
                href={`tel:${data.phone}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold text-sm px-5 py-3 rounded-full hover:bg-warm-100 transition-colors"
              >
                📞 Call
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Updates feed */}
      {updates.length > 0 && (
        <section className="mt-9">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-accent-600 mb-3">From the shop</p>
          <h2 className="text-xl font-extrabold text-warm-900 mb-4">Latest updates</h2>
          <div className="flex flex-col gap-3">
            {updates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mt-9">
        <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-accent-600 mb-3">Shop</p>
        <h2 className="text-xl font-extrabold text-warm-900 mb-4">
          Products <span className="text-warm-500 font-semibold text-base">({products.length})</span>
        </h2>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-warm-300 p-8 text-center text-sm text-warm-500">
            No products listed yet — check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} waTarget={waTarget} shopName={data.name} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
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
