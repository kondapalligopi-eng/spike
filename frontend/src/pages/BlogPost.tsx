import { Link, useParams } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { ArticleSchema } from '@/components/ArticleSchema';
import { FaqSchema } from '@/components/FaqSchema';
import { BLOG_POSTS, getBlogPost } from '@/content/blogPosts';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// Styles plain <p>/<ul>/<li>/<strong>/<a> inside the article body without a
// typography plugin.
const PROSE =
  'space-y-4 [&_p]:text-[17px] [&_p]:leading-relaxed [&_p]:text-warm-700 ' +
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:text-[17px] [&_li]:text-warm-700 [&_li]:leading-relaxed ' +
  '[&_strong]:font-semibold [&_strong]:text-warm-900 ' +
  '[&_a]:text-primary-600 [&_a]:font-semibold [&_a]:underline hover:[&_a]:text-primary-700';

export function BlogPost() {
  const { slug = '' } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-2xl font-extrabold text-warm-900">Article not found</h1>
        <p className="mt-2 text-warm-600">This post may have moved or been renamed.</p>
        <Link to="/blog" className="mt-6 inline-flex rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors">
          Back to the blog
        </Link>
      </div>
    );
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-warm-50">
      <PageHead title={post.title} description={post.description} path={`/blog/${post.slug}`} />
      <ArticleSchema headline={post.title} description={post.description} path={`/blog/${post.slug}`} datePublished={post.date} />
      <FaqSchema faqs={post.faqs} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm">
            <li>
              <Link to="/" className="inline-flex items-center gap-1.5 font-medium text-warm-500 hover:text-primary-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.44 1.152-.44 1.591 0L21.75 12M4.5 9.75v10.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V15a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v5.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V9.75" />
                </svg>
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-warm-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li>
              <Link to="/blog" className="font-medium text-warm-500 hover:text-primary-600 transition-colors">Blog</Link>
            </li>
            <li aria-hidden="true" className="text-warm-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </li>
            <li aria-current="page" className="font-semibold text-warm-800">{post.category}</li>
          </ol>
        </nav>

        <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-accent-600">{post.category}</p>
        <h1 className="mt-2 text-3xl sm:text-[40px] font-extrabold text-warm-900 leading-tight">{post.h1}</h1>
        <p className="mt-3 text-sm text-warm-500">{fmtDate(post.date)} · {post.readMins} min read</p>

        <div className="mt-8 text-[17px] leading-relaxed text-warm-700">{post.intro}</div>

        <div className="mt-8 space-y-10">
          {post.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl font-extrabold text-warm-900 mb-4">{s.heading}</h2>
              <div className={PROSE}>{s.body}</div>
            </section>
          ))}
        </div>

        {/* CTA into the live directory */}
        <div className="mt-12 rounded-2xl bg-primary-50 border border-primary-100 p-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-extrabold text-warm-900 text-lg">{post.cta.blurb}</p>
            <p className="text-sm text-warm-500 mt-0.5">Verified &amp; hyperlocal to Bengaluru on HiSpike.</p>
          </div>
          <Link to={post.cta.to} className="mt-4 sm:mt-0 inline-flex shrink-0 rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors whitespace-nowrap">
            {post.cta.label} →
          </Link>
        </div>

        {/* FAQs (visible) */}
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold text-warm-900 mb-5">Frequently asked questions</h2>
          <div className="space-y-4">
            {post.faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-warm-200 bg-white p-5">
                <h3 className="font-bold text-warm-900">{f.q}</h3>
                <p className="mt-1.5 text-warm-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mt-14">
          <h2 className="text-lg font-extrabold text-warm-900 mb-4">More from the HiSpike blog</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="rounded-2xl border border-warm-200 bg-white p-4 hover:border-primary-300 hover:shadow-md transition">
                <div className="text-3xl mb-2" aria-hidden="true">{p.emoji}</div>
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-600">{p.category}</p>
                <p className="mt-1 font-bold text-warm-900 leading-snug">{p.h1}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
