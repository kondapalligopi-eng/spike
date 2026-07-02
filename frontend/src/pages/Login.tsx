import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { login } from '@/api/auth';
import { listRecentPetPages, type PetPageRead } from '@/api/petPages';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthTransitionOverlay } from '@/components/AuthTransitionOverlay';
import { toast } from '@/store/toastStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

// One example pet page, styled like the Admin Pet Stories list — clickable so a
// logged-out visitor can open a real page and see how theirs would look.
function ShowcaseCard({ page }: { page: PetPageRead }) {
  return (
    <a
      href={`/pet/${page.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-2xl border border-warm-200 bg-white p-3 hover:border-primary-300 hover:shadow-md transition"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-warm-100 flex items-center justify-center shrink-0">
        {page.photos[0] ? (
          <img src={page.photos[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl" aria-hidden="true">🐶</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-warm-900 truncate">{page.name}</p>
        <p className="text-xs text-primary-600 font-mono truncate">hispike.in/pet/{page.slug}</p>
        {page.memories && (
          <p className="text-xs text-warm-500 mt-0.5 line-clamp-1">{page.memories}</p>
        )}
      </div>
      <span className="text-warm-300 shrink-0" aria-hidden="true">→</span>
    </a>
  );
}

// Left-hand showcase on the login screen — real registered dog pages, so people
// can preview the feature before creating an account.
function Showcase() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-pet-pages'],
    queryFn: () => listRecentPetPages(5),
  });
  const pages = data ?? [];

  return (
    <aside className="hidden lg:block">
      <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
        Pet Stories
      </p>
      <h2 className="text-2xl xl:text-3xl font-extrabold text-warm-900 leading-tight">
        See what dog parents have created
      </h2>
      <p className="text-sm text-warm-600 mt-2 mb-6 max-w-md">
        Sign in to give your dog a free, shareable page — photos, highlights and their story,
        at your own <span className="font-mono text-warm-800">hispike.in/pet/</span> link.
      </p>

      <div className="space-y-3 max-w-md">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-[88px] rounded-2xl border border-warm-200 bg-white animate-pulse" />
          ))
        ) : pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-warm-300 p-6 text-sm text-warm-500 text-center">
            Be the first to create a page for your dog! 🐾
          </div>
        ) : (
          pages.map((p) => <ShowcaseCard key={p.id} page={p} />)
        )}
      </div>
    </aside>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';
  const { isAuthenticated, login: storeLogin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      storeLogin(data.access_token, data.user, data.refresh_token);
      toast.success(`Welcome back, ${data.user.full_name}!`);
      navigate(redirectTo, { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: LoginForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-warm-50">
      {mutation.isPending && <AuthTransitionOverlay message="Signing you in…" />}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center px-4 py-10 lg:py-14">
        {/* Left: showcase of real dog pages */}
        <Showcase />

        {/* Right: login card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="bg-white rounded-3xl shadow-xl border border-warm-200 p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" aria-label="HiSpike — Home" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
                <img src="/logo.png?v=2" alt="HiSpike" className="h-14 w-14 object-contain" />
              </Link>
              <h1 className="text-3xl font-extrabold text-warm-900 mt-4 mb-2">Welcome back</h1>
              <p className="text-warm-500">Sign in to your account</p>
            </div>

            {/* method="POST" + action="" is a defensive belt-and-suspenders for
                the SSG hydration race: if the user submits BEFORE React has
                attached the onSubmit handler (the form HTML exists pre-JS), the
                browser would fall back to its native default — which is GET to
                the current URL, leaking email & password into the address bar.
                method="POST" forces credentials into the body instead. action=""
                points to the same page, which won't accept POST, so the worst
                case is a wasted round-trip — never a leak. */}
            <form method="POST" action="" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-1.5">
                  Email address
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-warm-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
              >
                {mutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-warm-500">
                Don't have an account?{' '}
                <Link
                  to={`/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
