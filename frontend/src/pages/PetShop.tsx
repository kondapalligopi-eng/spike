import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getShopBySlug } from '@/api/petShops';
import { PageHead } from '@/components/PageHead';
import { PetShopView } from '@/components/PetShopView';

// Public shop page at hispike.in/petshop/<slug>. Rendered client-side (the slug
// isn't known at build time), so it fetches by slug on mount.
export function PetShop() {
  const { slug = '' } = useParams();

  const { data: shop, isLoading, isError } = useQuery({
    queryKey: ['pet-shop', slug],
    queryFn: () => getShopBySlug(slug),
    enabled: !!slug,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="text-2xl font-extrabold text-warm-900">This shop isn't here</h1>
        <p className="mt-2 text-warm-600 max-w-md">
          We couldn't find a shop at <span className="font-mono text-warm-800">/petshop/{slug}</span>.
          It may have been removed, or the link is mistyped.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
        >
          Back to HiSpike
        </Link>
      </div>
    );
  }

  const desc =
    shop.about.replace(/\s+/g, ' ').trim().slice(0, 155) ||
    `${shop.name}${shop.area ? ` in ${shop.area}` : ''} — products & updates on HiSpike.`;

  return (
    <div className="min-h-screen bg-primary-50">
      <PageHead
        title={`${shop.name} — Pet Shop`}
        description={desc}
        path={`/petshop/${shop.slug}`}
        image={shop.hero_url ?? shop.logo_url ?? undefined}
      />
      {/* No "create your own shop" CTA here — this is a customer-facing page
          the owner shares directly. The "on HiSpike" strip inside PetShopView
          is the last element (the footer). */}
      <PetShopView data={shop} />
    </div>
  );
}
