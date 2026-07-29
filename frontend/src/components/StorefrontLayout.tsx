import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import { ToastContainer } from './Toast';
import { VisitTracker } from './VisitTracker';

// A chrome-free shell for the public pet-shop storefront (/petshop/<slug>).
// Shop owners share this link directly with their customers, so it must feel
// like the shop's own site — no HiSpike navbar or global footer. The
// storefront supplies its own light "on HiSpike" strip at the bottom.
export function StorefrontLayout() {
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
