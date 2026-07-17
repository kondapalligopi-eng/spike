import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { login, requestOtp, verifyOtp } from '@/api/auth';
import type { AuthResponse } from '@/types';
import { listRecentPetPages, type PetPageRead } from '@/api/petPages';
import { useAuth } from '@/hooks/useAuth';
import { useBackendWarmup } from '@/lib/warmupBackend';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthTransitionOverlay } from '@/components/AuthTransitionOverlay';
import { toast } from '@/store/toastStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Where to send the user after signing in. It rides in ?redirect=, but the
// method tabs are plain links whose href must be identical on the server and
// the client (the page is pre-rendered without query params — a differing href
// is a hydration mismatch that React resolves by KEEPING the server's value).
// So the tabs link to a bare /login and we stash the destination here instead;
// that also means a pre-hydration tap on a tab can't lose it.
const REDIRECT_KEY = 'hispike_login_redirect';
const readStoredRedirect = (): string | null => {
  try { return sessionStorage.getItem(REDIRECT_KEY); } catch { return null; }
};
const storeRedirect = (v: string) => {
  try { sessionStorage.setItem(REDIRECT_KEY, v); } catch { /* private mode */ }
};
const clearStoredRedirect = () => {
  try { sessionStorage.removeItem(REDIRECT_KEY); } catch { /* private mode */ }
};

// How many recent pages the showcase pulls. The backend caps /recent at 12.
const SHOWCASE_LIMIT = 8;

// Mobile: a horizontal snap-scrolling strip, so eight pages cost one card of
// height instead of eight — the login card stays near the top of the screen.
// Desktop (lg): back to a vertical list, capped in height and scrollable.
const LIST_CLASS =
  'flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 ' +
  'lg:mx-0 lg:px-0 lg:pr-1 lg:block lg:space-y-3 lg:max-w-md ' +
  'lg:max-h-[26rem] lg:overflow-x-visible lg:overflow-y-auto';
const ITEM_CLASS = 'shrink-0 w-[262px] snap-start lg:w-full lg:shrink';

// One example pet page, styled like the Admin Pet Stories list — clickable so a
// logged-out visitor can open a real page and see how theirs would look.
function ShowcaseCard({ page }: { page: PetPageRead }) {
  return (
    <a
      href={`/pet/${page.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${ITEM_CLASS} flex items-center gap-4 rounded-2xl border border-warm-200 bg-white p-3 hover:border-primary-300 hover:shadow-md transition`}
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
function Showcase({ orderClass }: { orderClass: string }) {
  // Decorative preview — it must never hold up the login card. If it's slow or
  // errors, we fall through to a skeleton then the empty state; the form is a
  // separate element that always renders regardless.
  const { data, isLoading } = useQuery({
    queryKey: ['recent-pet-pages', SHOWCASE_LIMIT],
    queryFn: () => listRecentPetPages(SHOWCASE_LIMIT),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  const pages = data ?? [];

  return (
    // min-w-0: a grid item defaults to min-width:auto, so without this the
    // aside stretches to fit the whole card strip and the PAGE scrolls
    // sideways instead of the strip.
    <aside className={`${orderClass} min-w-0`}>
      <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
        Pet Stories
      </p>
      <h2 className="text-2xl xl:text-3xl font-extrabold text-warm-900 leading-tight">
        See what dog parents have created
      </h2>
      <p className="text-sm text-warm-600 mt-2 mb-6 max-w-md">
        Sign in to give your dog a free, shareable page — photos, highlights and their story,
        at your own <span className="font-mono text-warm-800">hispike.in/pet/</span>link.
      </p>

      {isLoading ? (
        <div className={LIST_CLASS}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${ITEM_CLASS} h-[88px] rounded-2xl border border-warm-200 bg-white animate-pulse`}
            />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="max-w-md rounded-2xl border border-dashed border-warm-300 p-6 text-sm text-warm-500 text-center">
          Be the first to create a page for your dog! 🐾
        </div>
      ) : (
        <>
          <div className={LIST_CLASS}>
            {pages.map((p) => (
              <ShowcaseCard key={p.id} page={p} />
            ))}
          </div>
          {pages.length > 1 && (
            <p className="lg:hidden -mt-1 text-xs text-warm-400">Swipe to see more 🐾</p>
          )}
        </>
      )}
    </aside>
  );
}

const inputClass = (invalid?: boolean) =>
  `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
    invalid ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white'
  }`;

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login: storeLogin } = useAuth();

  // Resolved after mount (see REDIRECT_KEY above): starting at '/' keeps the
  // first client render identical to the pre-rendered HTML, so the follow-up
  // update is a normal re-render rather than an ignored hydration mismatch.
  const [redirectTo, setRedirectTo] = useState('/');
  useEffect(() => {
    const fromUrl = searchParams.get('redirect');
    if (fromUrl) {
      storeRedirect(fromUrl);
      setRedirectTo(fromUrl);
      return;
    }
    setRedirectTo(readStoredRedirect() ?? '/');
  }, [searchParams]);

  // Arriving from the Pet Stories tab? On mobile, lead with the real pages
  // people have created — a first-time visitor lands on the login card and
  // won't scroll to discover the feature. Desktop keeps the two-column layout.
  const fromPetStories = redirectTo === '/pet-stories';

  // Read fresh rather than off `redirectTo` state, which is still '/' on the
  // render right after mount.
  const resolveTarget = () =>
    searchParams.get('redirect') ?? readStoredRedirect() ?? '/';

  // Which sign-in method — driven by the URL (?method=otp) so the tabs are
  // plain links that respond to the very first tap, even before React has
  // hydrated. (On a cold mobile load a button's onClick isn't wired up yet,
  // so the tap was being ignored until a refresh.)
  const method: 'password' | 'otp' = searchParams.get('method') === 'otp' ? 'otp' : 'password';
  // Static hrefs (no ?redirect=) so server and client markup agree — the
  // destination is preserved via sessionStorage instead.
  const tabTo = (m: 'password' | 'otp') => (m === 'otp' ? '/login?method=otp' : '/login');
  // OTP is a two-step flow: enter email → enter the emailed code.
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendIn, setResendIn] = useState(0); // seconds until "Resend" re-enables

  useEffect(() => {
    if (!isAuthenticated) return;
    const target = resolveTarget();
    clearStoredRedirect();
    navigate(target, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, searchParams]);

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  // Switching to the Email-code tab resets the OTP flow to step 1.
  useEffect(() => {
    if (method === 'otp') {
      setOtpStep('request');
      setOtpCode('');
    }
  }, [method]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onLoginSuccess = (data: AuthResponse) => {
    const target = resolveTarget();
    clearStoredRedirect();
    storeLogin(data.access_token, data.user, data.refresh_token);
    toast.success(`Welcome back, ${data.user.full_name}!`);
    navigate(target, { replace: true });
  };

  const passwordMutation = useMutation({
    mutationFn: login,
    onSuccess: onLoginSuccess,
    onError: (error: Error) => toast.error(error.message),
  });

  const requestMutation = useMutation({
    mutationFn: (email: string) => requestOtp(email),
    onSuccess: () => {
      setOtpStep('verify');
      setResendIn(60);
      toast.success('If that email has an account, a code is on its way. Check your inbox.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyOtp(email, code),
    onSuccess: onLoginSuccess,
    onError: (error: Error) => toast.error(error.message),
  });

  const busy = passwordMutation.isPending || requestMutation.isPending || verifyMutation.isPending;

  const onSubmitPassword = (data: LoginForm) => passwordMutation.mutate(data);

  const onSubmitRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(otpEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    requestMutation.mutate(otpEmail.trim());
  };

  const onSubmitVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 4) {
      toast.error('Enter the code from your email');
      return;
    }
    verifyMutation.mutate({ email: otpEmail.trim(), code: otpCode.trim() });
  };

  return (
    <div className="bg-warm-50">
      {busy && (
        <AuthTransitionOverlay
          message={
            requestMutation.isPending
              ? 'Sending your code…'
              : verifyMutation.isPending
                ? 'Signing you in…'
                : 'Signing you in…'
          }
        />
      )}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center px-4 py-10 lg:py-14">
        {/* Left: showcase of real dog pages */}
        <Showcase orderClass={`${fromPetStories ? 'order-1' : 'order-2'} lg:order-1`} />

        {/* Right: login card. On mobile it sits above the showcase, except when
            the user came from Pet Stories — then the pages lead. */}
        <div
          className={`${fromPetStories ? 'order-2' : 'order-1'} lg:order-2 w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end`}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-warm-200 p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" aria-label="HiSpike — Home" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
                <img src="/logo.png?v=2" alt="HiSpike" className="h-14 w-14 object-contain" />
              </Link>
              <h1 className="text-3xl font-extrabold text-warm-900 mt-4 mb-2">Welcome back</h1>
              <p className="text-warm-500">Sign in to your account</p>
            </div>

            {/* Method toggle — links (not buttons) so the first tap works even
                before the page has hydrated on a cold mobile load. */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-warm-100 rounded-xl mb-6" role="tablist">
              {(['password', 'otp'] as const).map((m) => (
                <Link
                  key={m}
                  to={tabTo(m)}
                  replace
                  role="tab"
                  aria-selected={method === m}
                  className={`block text-center py-2 text-sm font-semibold rounded-lg transition-colors ${
                    method === m
                      ? 'bg-white text-warm-900 shadow-sm'
                      : 'text-warm-500 hover:text-warm-700'
                  }`}
                >
                  {m === 'password' ? 'Password' : 'Email code'}
                </Link>
              ))}
            </div>

            {/* method="POST" + action="" is a defensive belt-and-suspenders for
                the SSG hydration race: if the user submits BEFORE React has
                attached onSubmit (the form HTML exists pre-JS), the browser's
                native fallback is GET to the current URL, leaking credentials
                into the address bar. method="POST" forces them into the body. */}
            {method === 'password' ? (
              <form method="POST" action="" onSubmit={handleSubmit(onSubmitPassword)} className="space-y-5">
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
                    className={inputClass(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
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
                    className={inputClass(!!errors.password)}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                >
                  {passwordMutation.isPending ? (<><LoadingSpinner size="sm" />Signing in...</>) : 'Sign In'}
                </button>
              </form>
            ) : otpStep === 'request' ? (
              <form method="POST" action="" onSubmit={onSubmitRequestOtp} className="space-y-5">
                <div>
                  <label htmlFor="otp-email" className="block text-sm font-medium text-warm-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="otp-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className={inputClass(false)}
                  />
                  <p className="mt-1.5 text-xs text-warm-500">
                    We'll email you a 6-digit code to sign in — no password needed.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                >
                  {requestMutation.isPending ? (<><LoadingSpinner size="sm" />Sending…</>) : 'Send code'}
                </button>
              </form>
            ) : (
              <form method="POST" action="" onSubmit={onSubmitVerifyOtp} className="space-y-5">
                <p className="text-sm text-warm-600">
                  Enter the code we sent to <span className="font-semibold text-warm-900">{otpEmail}</span>.
                </p>
                <div>
                  <label htmlFor="otp-code" className="block text-sm font-medium text-warm-700 mb-1.5">
                    Login code
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className={`${inputClass(false)} text-center text-2xl font-bold tracking-[0.5em]`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                >
                  {verifyMutation.isPending ? (<><LoadingSpinner size="sm" />Signing in…</>) : 'Verify & sign in'}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setOtpStep('request'); setOtpCode(''); }}
                    className="font-medium text-warm-500 hover:text-warm-700"
                  >
                    ← Change email
                  </button>
                  <button
                    type="button"
                    disabled={resendIn > 0 || requestMutation.isPending}
                    onClick={() => requestMutation.mutate(otpEmail.trim())}
                    className="font-medium text-primary-600 hover:text-primary-700 disabled:text-warm-400 disabled:cursor-not-allowed"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

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
