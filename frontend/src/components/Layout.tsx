import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ToastContainer } from './Toast';

export function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-warm-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-warm-700 font-semibold">
              <span className="text-xl">🐾</span>
              <span>PetDogs</span>
            </div>
            <p className="text-sm text-warm-400">
              &copy; {new Date().getFullYear()} PetDogs. Connecting dogs with loving families.
            </p>
            <div className="flex items-center gap-4 text-sm text-warm-500">
              <a href="/dogs" className="hover:text-warm-700 transition-colors">Browse Dogs</a>
              <a href="/register" className="hover:text-warm-700 transition-colors">Join Us</a>
            </div>
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  );
}
