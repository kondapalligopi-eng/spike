import { useState } from 'react';

type Product = {
  brand: string;
  name: string;
  image: string;
  emoji: string;
  rating: number;
  reviews: number;
  price: number;
  perUnit: string;
  listPrice?: number;
  salePrice?: number;
  savePct?: number;
  sponsored?: boolean;
  deal?: boolean;
  lifestage?: string;
  form?: string;
};

const BRANDS = [
  'Royal Canin',
  'Royal Canin Veterinary Diet',
  'Pedigree',
  'ACANA',
];

const LIFESTAGES = ['Puppy', 'Adult', 'Senior', 'All Lifestages'];
const FOOD_FORMS = ['Dry Food', 'Wet Food', 'Freeze-Dried', 'Raw', 'Treats'];

const PRODUCTS: Product[] = [
  {
    brand: 'Royal Canin',
    name: 'Size Health Nutrition Medium Adult Dry Dog Food, 15-lb bag',
    image: '/supplies-1.jpg',
    emoji: '🥫',
    rating: 4.7,
    reviews: 8098,
    price: 29.97,
    perUnit: '$2.00/lb',
    listPrice: 30.99,
    salePrice: 19.48,
    savePct: 35,
    sponsored: true,
    lifestage: 'Adult',
    form: 'Dry Food',
  },
  {
    brand: 'Royal Canin',
    name: 'Size Health Nutrition Medium Puppy Dry Dog Food, 30-lb bag',
    image: '/supplies-2.jpg',
    emoji: '🥫',
    rating: 4.7,
    reviews: 8098,
    price: 47.98,
    perUnit: '$1.60/lb',
    salePrice: 23.99,
    savePct: 50,
    sponsored: true,
    lifestage: 'Puppy',
    form: 'Dry Food',
  },
  {
    brand: 'Pedigree',
    name: 'Complete Nutrition Grilled Steak & Vegetable Flavor Dog Kibble Adult Dry Dog Food, 44-lb bag',
    image: '/supplies-3.jpg',
    emoji: '🥩',
    rating: 4.7,
    reviews: 9772,
    price: 30.98,
    perUnit: '$0.71/lb',
    salePrice: 26.33,
    savePct: 15,
    sponsored: true,
    lifestage: 'Adult',
    form: 'Dry Food',
  },
  {
    brand: 'Royal Canin Veterinary Diet',
    name: 'Gastrointestinal Low Fat Dry Dog Food, 17.6-lb bag',
    image: '/supplies-4.jpg',
    emoji: '🍖',
    rating: 4.6,
    reviews: 3123,
    price: 134.99,
    perUnit: '$4.36/lb',
    salePrice: 114.99,
    savePct: 35,
    sponsored: true,
    lifestage: 'All Lifestages',
    form: 'Dry Food',
  },
  {
    brand: 'ACANA',
    name: 'Singles Limited Ingredient Salmon & Pumpkin Recipe Dry Dog Food, 25-lb bag',
    image: '/supplies-5.jpg',
    emoji: '🐟',
    rating: 4.5,
    reviews: 5612,
    price: 39.99,
    perUnit: '$1.43/lb',
    salePrice: 31.99,
    savePct: 20,
    deal: true,
    lifestage: 'Adult',
    form: 'Dry Food',
  },
  {
    brand: 'Pedigree',
    name: 'Choice Cuts in Gravy with Beef & Country Stew Adult Wet Dog Food, 22-oz cans',
    image: '/supplies-6.jpg',
    emoji: '🐕',
    rating: 4.6,
    reviews: 11420,
    price: 22.98,
    perUnit: '$0.77/lb',
    lifestage: 'Adult',
    form: 'Wet Food',
  },
  {
    brand: 'Royal Canin',
    name: 'Aging Care 12+ Small Senior Dry Dog Food, 13-lb bag',
    image: '/supplies-7.jpg',
    emoji: '🐶',
    rating: 4.8,
    reviews: 6240,
    price: 62.48,
    perUnit: '$2.08/lb',
    salePrice: 53.11,
    savePct: 15,
    lifestage: 'Senior',
    form: 'Dry Food',
  },
  {
    brand: 'ACANA',
    name: 'Wholesome Grains Free-Run Chicken & Pumpkin Recipe Treats',
    image: '/supplies-8.jpg',
    emoji: '🍗',
    rating: 4.7,
    reviews: 8800,
    price: 12.98,
    perUnit: '—',
    salePrice: 9.38,
    savePct: 20,
    deal: true,
    lifestage: 'All Lifestages',
    form: 'Treats',
  },
];

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

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="bg-white flex flex-col">
      {/* Image area */}
      <div className="relative aspect-square bg-warm-50 rounded-md overflow-hidden mb-3">
        {product.deal && (
          <span className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-md z-10">
            Deal
          </span>
        )}
        <img
          src={product.image}
          alt=""
          className="absolute inset-0 w-full h-full object-contain p-4"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
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
          ${Math.floor(product.price)}
          <sup className="text-sm">{product.price.toFixed(2).split('.')[1]}</sup>
        </span>
        <span className="text-xs text-warm-500 ml-1">({product.perUnit})</span>
        {product.listPrice && (
          <span className="text-xs text-warm-500 line-through ml-2">${product.listPrice.toFixed(2)}</span>
        )}
      </div>

      {product.salePrice && (
        <p className="text-xs mb-2">
          <span className="text-red-600 font-bold text-sm">${product.salePrice.toFixed(2)}</span>{' '}
          <span className="text-warm-700">
            Save {product.savePct}% today with Autoship, 5% off future orders
          </span>
        </p>
      )}

      {/* Promo */}
      <p className="text-xs text-warm-700 mb-2 flex items-start gap-1">
        <span className="text-red-600">🏷️</span>
        <span><span className="font-semibold">New Customers Only:</span> Spend $49+, get $20 off</span>
      </p>

      {/* Delivery */}
      <p className="text-xs text-warm-700">
        <span className="font-semibold">Free</span> 1–3 day delivery on first-time orders over $35
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

export function PetSupplies() {
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set());
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, item: string, setState: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setState(next);
  };

  const visibleProducts = PRODUCTS.filter((p) => {
    if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
    if (selectedStages.size > 0 && (!p.lifestage || !selectedStages.has(p.lifestage))) return false;
    if (selectedForms.size > 0 && (!p.form || !selectedForms.has(p.form))) return false;
    return true;
  });

  return (
    <div className="bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / title */}
        <nav className="text-xs text-warm-500 mb-2">
          Cuddly Friend Shop <span className="mx-2">›</span> <span className="text-warm-800">Dog Food & Treats</span>
        </nav>
        <h1 className="text-2xl font-bold text-warm-900 mb-6">Dog Food &amp; Treats</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Filters sidebar */}
          <aside>
            <FilterSection
              title="Brand"
              items={BRANDS}
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
              <span>1–{PRODUCTS.length} of 1,284 results</span>
              <select className="border border-warm-300 rounded-md px-3 py-1.5 outline-none bg-white">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Customer Rating</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {PRODUCTS.map((p) => (
                <ProductCard key={p.name} product={p} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
