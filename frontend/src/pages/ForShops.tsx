import { Link } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { HeroPaws } from '@/components/HeroPaws';
import { FaqSchema, type FaqItem } from '@/components/FaqSchema';

// The pitch page for shop OWNERS. /petshops is the directory and speaks to pet
// owners; this is the other side of the marketplace and the link to send a shop
// on WhatsApp. It exists because the directory gave an owner no idea what was
// behind "List Your Shop" — no mention of a storefront, shelves, orders or cost.
//
// Every claim here is one the product actually delivers today. Notably it does
// NOT name a future price: the plan is a paid tier later, but billing does not
// exist yet, so promising a number would be a commitment we cannot honour.

const WHAT_YOU_GET = [
  {
    icon: '🏪',
    title: 'Your own shop page',
    body: 'A proper storefront at hispike.in/petshop/your-shop — your logo, banner, timings, area and a live "Open now" status. Send the link on WhatsApp or put it in your Instagram bio.',
  },
  {
    icon: '🧺',
    title: 'Products on shelves',
    body: 'List food, treats, toys, grooming and accessories. Each category gets its own row customers can swipe through, so a hundred products stay easy to browse.',
  },
  {
    icon: '💬',
    title: 'Orders on WhatsApp',
    body: 'Customers tap to message or call you directly. No middleman, no bidding for leads — the conversation is yours and so is the customer.',
  },
  {
    icon: '🛒',
    title: 'A real cart',
    body: 'Customers can add items and place an order from the page. You see every order, mark it confirmed or delivered, and keep the history.',
  },
  {
    icon: '💸',
    title: 'Money straight to you',
    body: 'Add your UPI ID and the customer’s UPI app opens with the amount and item already filled in. Payment goes to your bank account directly — HiSpike never touches it and takes no commission.',
  },
  {
    icon: '📊',
    title: 'Know what sells',
    body: 'A simple dashboard shows your orders and what people are buying, worked out from your real sales — not guesses.',
  },
  {
    icon: '📸',
    title: 'Show the shop itself',
    body: 'Upload photos of your store so customers recognise it before they walk in. Small shops win on trust, and a face beats a logo.',
  },
  {
    icon: '🏷️',
    title: 'Run your offers',
    body: 'Put your current sale in the page headline, set a free-delivery limit and a delivery radius, and add promotion cards for specific deals.',
  },
];

const STEPS = [
  { n: '1', title: 'Create your page', body: 'Sign up and fill in your shop name, area, timings and phone number. Takes a few minutes.' },
  { n: '2', title: 'Add your products', body: 'Add what you stock, with prices and a category. Add photos of the shop while you are there.' },
  { n: '3', title: 'Share the link', body: 'Send your shop link to customers on WhatsApp and put it wherever you already post. That is it.' },
];

const FAQS: FaqItem[] = [
  {
    q: 'How much does it cost to list my pet shop?',
    a: 'It is free to list your shop on HiSpike. There is no setup fee and no commission on your orders — when a customer pays you, the full amount is yours.',
  },
  {
    q: 'Do I need a website or any technical knowledge?',
    a: 'No. You fill in a form with your shop details and products, and the page builds itself. If you can use WhatsApp, you can run your HiSpike shop page.',
  },
  {
    q: 'How do customers pay me?',
    a: 'Directly. Add your UPI ID and the customer’s UPI app opens with the amount and item name already filled in, so the money reaches your bank account straight away. You can also add your own Razorpay payment link for cards and net banking, or simply take payment on delivery.',
  },
  {
    q: 'Does HiSpike take a commission on my sales?',
    a: 'No. HiSpike never handles your money — payments go from the customer to you directly, so there is nothing for us to take a cut of.',
  },
  {
    q: 'Can I edit my shop page after creating it?',
    a: 'Yes, any time. Prices, products, timings, offers and photos are all editable from your own dashboard, and changes show on your page immediately.',
  },
  {
    q: 'Which areas can list a shop?',
    a: 'Pet shops in and around Bengaluru can list today. We are adding more cities — if you are elsewhere, create your page anyway and we will be in touch as we open your city.',
  },
];

// `crop` caps the height and anchors to the top of the image. The phone
// screenshot is twice as tall as it is wide, so shown whole it towers over the
// desktop shot beside it and leaves a dead column; cropping keeps the two
// roughly level while still showing the part that matters.
function Shot({
  src,
  alt,
  caption,
  crop,
}: {
  src: string;
  alt: string;
  caption: string;
  crop?: string;
}) {
  return (
    <figure className="min-w-0">
      <div className="rounded-2xl border border-warm-200 bg-white overflow-hidden shadow-sm">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={crop ? `w-full ${crop} object-cover object-top block` : 'w-full h-auto block'}
        />
      </div>
      <figcaption className="mt-2 text-xs text-warm-500 text-center">{caption}</figcaption>
    </figure>
  );
}

export function ForShops() {
  return (
    <div className="min-h-screen bg-warm-50">
      <PageHead
        title="List Your Pet Shop — Free Shop Page on HiSpike"
        description="Put your pet shop online free. Get your own storefront page with products, WhatsApp ordering and UPI payments straight to your account — no commission, no setup fee."
        path="/for-shops"
      />
      <FaqSchema faqs={FAQS} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <HeroPaws />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-2">
            For Pet Shop Owners · Bengaluru
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl">
            Put your pet shop online — free
          </h1>
          <div className="mt-3 h-0.5 w-16 bg-accent-400 rounded-full" />
          <p className="mt-4 text-base sm:text-lg text-primary-100/90 max-w-2xl leading-relaxed">
            Your own shop page with your products, your timings and your phone number.
            Customers browse and order, and they pay you directly. No commission, no setup fee.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/my-shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create your shop page
            </Link>
            <a href="#what-you-get" className="text-sm font-semibold text-primary-100 hover:text-white underline underline-offset-4">
              See what you get
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* What the page actually looks like */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-900 tracking-tight">
            This is your shop page
          </h2>
          <p className="mt-2 text-warm-500 max-w-2xl leading-relaxed">
            Not a listing in someone else&rsquo;s directory — a page of your own, that works just as well on a phone.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr] items-start">
            <Shot
              src="/for-shops/storefront-hero.png"
              alt="A pet shop storefront on HiSpike showing the shop name, current sale, delivery terms, opening hours and WhatsApp and Call buttons"
              caption="Your storefront — offer, timings and contact buttons up front"
            />
            <Shot
              src="/for-shops/storefront-mobile.png"
              alt="The same pet shop storefront on a phone screen"
              caption="The same page on a phone, where most customers will see it"
            />
          </div>
          <div className="mt-6">
            <Shot
              src="/for-shops/storefront-shelves.png"
              alt="Product shelves on a pet shop storefront, with a swipeable row of products for each category"
              caption="Products sit on shelves by category, so a big catalogue stays browsable"
            />
          </div>
        </section>

        {/* What you get */}
        <section id="what-you-get" className="scroll-mt-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-900 tracking-tight">
            What you get
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {WHAT_YOU_GET.map((f) => (
              <div key={f.title} className="rounded-2xl border border-warm-200 bg-white p-5">
                <div className="text-2xl" aria-hidden="true">{f.icon}</div>
                <h3 className="mt-2 font-bold text-warm-900">{f.title}</h3>
                <p className="mt-1 text-sm text-warm-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-900 tracking-tight">
            How it works
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-warm-200 bg-white p-5">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm">
                  {s.n}
                </span>
                <h3 className="mt-3 font-bold text-warm-900">{s.title}</h3>
                <p className="mt-1 text-sm text-warm-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cost — answered plainly, because it is the first thing an owner wonders */}
        <section className="rounded-3xl bg-primary-50 border border-primary-100 p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-900 tracking-tight">
            What it costs
          </h2>
          <p className="mt-3 text-warm-600 leading-relaxed max-w-2xl">
            It is free to list your shop. No setup fee, and{' '}
            <strong className="text-warm-900">no commission on your orders</strong> — payments go
            from your customer straight to your own UPI or payment link, so HiSpike never handles
            your money in the first place.
          </p>
        </section>

        {/* FAQ — rendered, not just schema, so a reader sees the same answers Google does */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-900 tracking-tight">
            Common questions
          </h2>
          <div className="mt-6 divide-y divide-warm-200 rounded-2xl border border-warm-200 bg-white">
            {FAQS.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none font-bold text-warm-900">
                  {f.q}
                  <span className="shrink-0 text-warm-400 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-2 text-sm text-warm-500 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="text-center rounded-3xl border-2 border-dashed border-warm-300 p-8 sm:p-10">
          <div className="text-4xl mb-3" aria-hidden="true">🏪</div>
          <h2 className="text-2xl font-extrabold text-warm-900 tracking-tight">
            Ready to put your shop online?
          </h2>
          <p className="mt-2 text-warm-500 max-w-xl mx-auto leading-relaxed">
            Create your page, add a few products, and share the link with the customers you already have.
          </p>
          <Link
            to="/my-shop"
            className="mt-6 inline-flex rounded-full bg-primary-600 px-7 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
          >
            Create your shop page — free
          </Link>
          <p className="mt-4 text-sm text-warm-500">
            Looking for a pet shop instead?{' '}
            <Link to="/petshops" className="font-semibold text-primary-700 hover:underline">
              Browse shops in Bengaluru
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
