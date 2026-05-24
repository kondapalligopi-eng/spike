import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listPetFoods, type PetFoodRead } from '@/api/petFoods';
import { useSiteSetting } from '@/api/siteSettings';

const LIFESTAGES = ['Puppy', 'Adult', 'Senior', 'All Lifestages'];
const FOOD_FORMS = ['Dry Food', 'Wet Food', 'Freeze-Dried', 'Raw', 'Treats'];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? 'text-accent-500' : 'text-warm-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

function FilterSection({
  title,
  items,
  selected,
  onToggle,
  withSearch,
  moreCount,
}: {
  title: string;
  items: string[];
  selected: Set<string>;
  onToggle: (item: string) => void;
  withSearch?: boolean;
  moreCount?: number;
}) {
  const [query, setQuery] = useState('');
  const filtered = withSearch && query
    ? items.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div className="py-5 border-b border-warm-200">
      <h3 className="font-bold text-warm-900 text-base mb-3">{title}</h3>
      {withSearch && (
        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Find a ${title.toLowerCase()}`}
            className="w-full pl-3 pr-9 py-2 text-sm border border-warm-300 rounded-md outline-none focus:border-primary-500"
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </div>
      )}
      <ul className="space-y-2">
        {filtered.map((item) => (
          <li key={item}>
            <label className="flex items-center gap-2 text-sm text-warm-700 cursor-pointer hover:text-warm-900">
              <input
                type="checkbox"
                checked={selected.has(item)}
                onChange={() => onToggle(item)}
                className="w-4 h-4 accent-primary-600 cursor-pointer"
              />
              {item}
            </label>
          </li>
        ))}
      </ul>
      {moreCount && (
        <button className="mt-3 text-sm text-primary-600 hover:underline font-medium">
          + {moreCount} more
        </button>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: PetFoodRead }) {
  return (
    <article className="bg-white flex flex-col">
      {/* Image area */}
      <div className="relative aspect-square bg-warm-50 rounded-md overflow-hidden mb-3">
        {product.deal && (
          <span className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-md z-10">
            Deal
          </span>
        )}
        {product.image_url && (
          <img
            src={product.image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-contain p-4"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        {/* Fallback */}
        <div className="absolute inset-0 flex items-center justify-center text-7xl bg-gradient-to-br from-primary-50 to-accent-50">
          {product.emoji}
        </div>
        {product.sponsored && (
          <span className="absolute bottom-2 right-2 bg-warm-100 text-warm-600 text-[10px] px-2 py-0.5 rounded">
            Sponsored
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm text-warm-900 leading-snug mb-2">
        <span className="font-bold">{product.brand}</span>{' '}
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-2 text-xs text-warm-600 mb-2">
        <span className="font-bold text-warm-900">{product.rating}</span>
        <Stars value={product.rating} />
        <span>{product.reviews.toLocaleString()}</span>
      </div>

      {/* Price */}
      <div className="mb-2">
        <span className="text-red-600 font-bold">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
        <span className="text-xs text-warm-500 ml-1">({product.per_unit})</span>
        {product.list_price && (
          <span className="text-xs text-warm-500 line-through ml-2">₹{product.list_price.toLocaleString('en-IN')}</span>
        )}
      </div>

      {product.sale_price && (
        <p className="text-xs mb-2">
          <span className="text-red-600 font-bold text-sm">₹{product.sale_price.toLocaleString('en-IN')}</span>{' '}
          <span className="text-warm-700">
            Save {product.save_pct}% today with Autoship, 5% off future orders
          </span>
        </p>
      )}

      {/* Promo */}
      <p className="text-xs text-warm-700 mb-2 flex items-start gap-1">
        <span className="text-red-600">🏷️</span>
        <span><span className="font-semibold">New Customers Only:</span> Spend ₹4,000+, get ₹500 off</span>
      </p>

      {/* Delivery */}
      <p className="text-xs text-warm-700">
        <span className="font-semibold">Free</span> 1–3 day delivery on first-time orders over ₹500
      </p>
      <p className="text-xs text-warm-700 mb-4">
        <span className="font-semibold">Free</span> 365-day returns
      </p>

      {/* CTA */}
      <button
        type="button"
        className="mt-auto w-full py-2.5 border border-red-500 text-red-600 hover:bg-red-50 text-sm font-bold rounded-full transition-colors"
      >
        Add to Cart
      </button>
    </article>
  );
}

function ComingSoon() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '140px 140px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <span aria-hidden="true" className="inline-block text-6xl sm:text-7xl mb-6 drop-shadow">🛒</span>
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-300 uppercase mb-3">
            Shop · Bangalore
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Pet Supplies is launching soon
          </h1>
          <div className="mx-auto h-1 w-20 bg-accent-400 rounded-full mb-5" />
          <p className="text-base sm:text-lg text-primary-100/95 max-w-xl mx-auto mb-8">
            We're hand-picking trusted brands — Royal Canin, Pedigree, ACANA — and
            building hyperlocal delivery across Bengaluru. Check back soon.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
            >
              Back to Home
            </Link>
            <a
              href="mailto:support@hispike.in?subject=Notify%20me%20when%20Pet%20Supplies%20launches"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold tracking-[0.15em] uppercase border border-white/30 transition-all"
            >
              Notify Me
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export function PetSupplies() {
  const isLive = useSiteSetting('pet_supplies_enabled');
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set());
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['pet-foods'],
    queryFn: listPetFoods,
  });

  // Brand list is derived from data so admin-added brands appear in the filter.
  const brands = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => set.add(p.brand));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const toggle = (set: Set<string>, item: string, setState: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setState(next);
  };

  const visibleProducts = (products ?? []).filter((p) => {
    if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
    if (selectedStages.size > 0 && (!p.lifestage || !selectedStages.has(p.lifestage))) return false;
    if (selectedForms.size > 0 && (!p.form || !selectedForms.has(p.form))) return false;
    return true;
  });

  if (!isLive) {
    return <ComingSoon />;
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '120px 120px',
          }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🐕🦴</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Shop · Bangalore
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Dog Food &amp; Treats
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Trusted brands delivered across Bengaluru — Royal Canin, Pedigree, ACANA. Dry food, wet food, treats, and veterinary diets for every life stage.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Filters sidebar */}
          <aside>
            <FilterSection
              title="Brand"
              items={brands}
              selected={selectedBrands}
              onToggle={(i) => toggle(selectedBrands, i, setSelectedBrands)}
            />
            <FilterSection
              title="Lifestage"
              items={LIFESTAGES}
              selected={selectedStages}
              onToggle={(i) => toggle(selectedStages, i, setSelectedStages)}
            />
            <FilterSection
              title="Food Form"
              items={FOOD_FORMS}
              selected={selectedForms}
              onToggle={(i) => toggle(selectedForms, i, setSelectedForms)}
            />
          </aside>

          {/* Product grid */}
          <section>
            <div className="flex items-center justify-between mb-5 text-sm text-warm-600">
              <span>{visibleProducts.length === 0 ? '0' : `1–${visibleProducts.length}`} of {visibleProducts.length} results</span>
              <select className="border border-warm-300 rounded-md px-3 py-1.5 outline-none bg-white">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Customer Rating</option>
              </select>
            </div>
            {isLoading ? (
              <div className="border border-dashed border-warm-300 rounded-md p-10 text-center text-sm text-warm-500">
                Loading products…
              </div>
            ) : isError ? (
              <div className="border border-dashed border-red-300 rounded-md p-10 text-center text-sm text-red-600">
                Could not load products. Please refresh the page.
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="border border-dashed border-warm-300 rounded-md p-10 text-center text-sm text-warm-500">
                No products match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
