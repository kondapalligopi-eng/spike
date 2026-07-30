import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import { ToastContainer } from './Toast';
import { VisitTracker } from './VisitTracker';
import { useCartStore } from '@/store/cartStore';

// A chrome-free shell for the public pet-shop storefront (/petshop/<slug>).
// Shop owners share this link directly with their customers, so it must feel
// like the shop's own site — no HiSpike navbar or global footer. The
// storefront supplies its own light "on HiSpike" strip at the bottom.
export function StorefrontLayout() {
  // Read the persisted cart on the client only (skipHydration) — avoids an
  // SSG hydration mismatch against the empty-cart prerender.
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      <ScrollToTop />
      <VisitTracker />
      <main className="flex-1">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
