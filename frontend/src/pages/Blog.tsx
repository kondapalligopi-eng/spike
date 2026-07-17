import { Link } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { BLOG_POSTS } from '@/content/blogPosts';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function Blog() {
  return (
    <div className="min-h-screen bg-warm-50">
      <PageHead
        title="HiSpike Blog — Pet Care Guides for Bengaluru Dog Parents"
        description="Vet-reviewed advice and neighbourhood guides for dog parents in Bengaluru — vets, dog parks, swimming, grooming and pet supplies."
        path="/blog"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-10">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-accent-600 mb-2">The HiSpike Blog</p>
          <h1 className="text-4xl font-extrabold text-warm-900 leading-tight">Pet care, the Bengaluru way</h1>
          <p className="mt-3 text-warm-600 max-w-2xl text-lg">
            Practical, honest guides for dog parents — from finding a trusted vet to the best parks, pools,
            groomers and pet shops across the city.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BLOG_POSTS.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group flex flex-col rounded-3xl border border-warm-200 bg-white overflow-hidden hover:border-primary-300 hover:shadow-md transition"
            >
              <div className="h-32 bg-gradient-to-br from-primary-100 to-accent-50 flex items-center justify-center text-5xl">
                {p.emoji}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-600">{p.category}</p>
                <h2 className="mt-1.5 font-extrabold text-warm-900 leading-snug group-hover:text-primary-700 transition-colors">{p.h1}</h2>
                <p className="mt-2 text-sm text-warm-500 leading-relaxed line-clamp-3 flex-1">{p.description}</p>
                <p className="mt-3 text-xs text-warm-400">{fmtDate(p.date)} · {p.readMins} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
