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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthTransitionOverlay } from '@/components/AuthTransitionOverlay';
import { toast } from '@/store/toastStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

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
    <aside className="order-2 lg:order-1">
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

const inputClass = (invalid?: boolean) =>
  `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
    invalid ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white'
  }`;

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';
  const { isAuthenticated, login: storeLogin } = useAuth();

  // Which sign-in method the user is using. Password stays the default.
  const [method, setMethod] = useState<'password' | 'otp'>('password');
  // OTP is a two-step flow: enter email → enter the emailed code.
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendIn, setResendIn] = useState(0); // seconds until "Resend" re-enables

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onLoginSuccess = (data: AuthResponse) => {
    storeLogin(data.access_token, data.user, data.refresh_token);
    toast.success(`Welcome back, ${data.user.full_name}!`);
    navigate(redirectTo, { replace: true });
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

  const switchMethod = (m: 'password' | 'otp') => {
    setMethod(m);
    if (m === 'otp') {
      setOtpStep('request');
      setOtpCode('');
    }
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

            {/* Method toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-warm-100 rounded-xl mb-6" role="tablist">
              {(['password', 'otp'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={method === m}
                  onClick={() => switchMethod(m)}
                  className={`py-2 text-sm font-semibold rounded-lg transition-colors ${
                    method === m
                      ? 'bg-white text-warm-900 shadow-sm'
                      : 'text-warm-500 hover:text-warm-700'
                  }`}
                >
                  {m === 'password' ? 'Password' : 'Email code'}
                </button>
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
