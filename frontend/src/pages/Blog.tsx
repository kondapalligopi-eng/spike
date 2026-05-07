type Post = {
  date: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  emoji: string;
  href: string;
};

const POSTS: Post[] = [
  {
    date: '2026-04-20',
    category: 'Vet Care',
    title: 'Monsoon health: 7 things every Bengaluru dog parent should watch for',
    excerpt:
      'Tick fever, fungal infections, and damp-paw rashes spike during the city\'s long monsoon. Here\'s what vets across Indiranagar and HSR Layout watch for.',
    readTime: '6 min',
    emoji: '🩺',
    href: '#',
  },
  {
    date: '2026-04-08',
    category: 'Training',
    title: 'A complete guide to teaching your puppy to swim safely',
    excerpt:
      'From shallow-end intros to controlled lap sessions — how Bengaluru\'s top swim coaches build water confidence without overwhelming a young dog.',
    readTime: '9 min',
    emoji: '🏊',
    href: '#',
  },
  {
    date: '2026-03-25',
    category: 'Grooming',
    title: 'How often should you groom an Indie? A monsoon-smart routine',
    excerpt:
      'Indies don\'t need the same schedule as a Golden or a Spitz. We talked to four salons in Koramangala and HSR for the season-by-season breakdown.',
    readTime: '5 min',
    emoji: '✂️',
    href: '#',
  },
  {
    date: '2026-03-12',
    category: 'Outdoors',
    title: 'The 10 best dog-friendly parks across Bengaluru — ranked',
    excerpt:
      'Cubbon, Lalbagh, Agara Lake, and the neighbourhood gems we love. Off-leash zones, water bowls, parking, and how dog-friendly each one really is.',
    readTime: '8 min',
    emoji: '🌳',
    href: '#',
  },
  {
    date: '2026-02-28',
    category: 'Nutrition',
    title: 'Royal Canin vs Acana vs home-cooked — what fits your dog?',
    excerpt:
      'Premium kibble, novel-protein diets, or fresh-cooked meals. A practical comparison from a Bengaluru vet on what to feed and how much.',
    readTime: '7 min',
    emoji: '🥣',
    href: '#',
  },
  {
    date: '2026-02-10',
    category: 'Adoption',
    title: 'Adopting an Indie from a Bengaluru shelter: what to expect',
    excerpt:
      'Paperwork, home checks, and the first 30 days. A step-by-step guide for first-time adopters from CUPA, Charlie\'s Animal Rescue Centre, and others.',
    readTime: '10 min',
    emoji: '🐶',
    href: '#',
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function Blog() {
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">📝</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Stories · HiSpike
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              The HiSpike Blog
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Vet-reviewed advice, neighbourhood guides, and the science of caring for a Bengaluru dog.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-6">
            {POSTS.map((post) => (
              <a
                key={post.title}
                href={post.href}
                className="group rounded-2xl border-2 border-primary-100 bg-white overflow-hidden hover:border-primary-300 hover:shadow-md transition-all flex flex-col"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-primary-200 to-primary-500 flex items-center justify-center text-6xl">
                  <span aria-hidden="true">{post.emoji}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-bold tracking-[0.25em] uppercase">
                    <span className="text-primary-700">{post.category}</span>
                    <span className="text-warm-400">·</span>
                    <span className="text-warm-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-base font-bold text-warm-900 group-hover:text-primary-700 transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-warm-600 leading-relaxed flex-1">{post.excerpt}</p>
                  <p className="text-xs text-warm-400 mt-3">{formatDate(post.date)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
