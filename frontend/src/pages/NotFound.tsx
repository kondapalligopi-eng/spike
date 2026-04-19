import { Link, useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <div className="text-[120px] leading-none mb-4">🐾</div>
        <h1 className="text-8xl font-extrabold text-warm-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-warm-900 mb-4">
          Oops! This page ran away
        </h2>
        <p className="text-warm-500 text-lg mb-10 leading-relaxed">
          The page you are looking for doesn't exist or may have been moved.
          Don't worry — there are plenty of great dogs waiting for you!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 border-2 border-warm-300 text-warm-700 font-bold rounded-2xl hover:bg-warm-100 transition-colors"
          >
            ← Go Back
          </button>
          <Link
            to="/"
            className="px-8 py-3.5 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
          >
            Go Home
          </Link>
          <Link
            to="/dogs"
            className="px-8 py-3.5 bg-accent-500 text-white font-bold rounded-2xl hover:bg-accent-600 transition-colors shadow-lg shadow-accent-200"
          >
            Browse Dogs 🐕
          </Link>
        </div>
      </div>
    </div>
  );
}
