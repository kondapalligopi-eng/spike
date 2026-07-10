import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { register as registerApi, registerOtp, requestOtp, verifyOtp } from '@/api/auth';
import type { AuthResponse } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/store/toastStore';

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Name too long'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[\d\s+\-()]{7,20}$/.test(val),
        { message: 'Please enter a valid phone number' }
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Shared with Login.tsx — see the note there. The tabs are plain links whose
// href must match the pre-rendered HTML, so the post-auth destination lives in
// sessionStorage rather than in ?redirect=.
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

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login: storeLogin } = useAuth();

  // Resolved after mount so the first client render matches the pre-rendered
  // HTML (a query-derived value here would be an ignored hydration mismatch).
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

  const resolveTarget = () =>
    searchParams.get('redirect') ?? readStoredRedirect() ?? '/';

  // Method driven by the URL (?method=otp) so the tabs are links that work on
  // the first tap even before hydration (fixes the cold-load mobile issue).
  const method: 'password' | 'otp' = searchParams.get('method') === 'otp' ? 'otp' : 'password';
  const tabTo = (m: 'password' | 'otp') =>
    m === 'otp' ? '/register?method=otp' : '/register';
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpName, setOtpName] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

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
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onAuthSuccess = (data: AuthResponse) => {
    storeLogin(data.access_token, data.user, data.refresh_token);
    toast.success(`Welcome to HiSpike, ${data.user.full_name}!`);
    navigate(redirectTo, { replace: true });
  };

  const passwordMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: onAuthSuccess,
    onError: (error: Error) => toast.error(error.message),
  });

  // OTP sign-up: create the passwordless account + email a code.
  const requestMutation = useMutation({
    mutationFn: registerOtp,
    onSuccess: () => {
      setOtpStep('verify');
      setResendIn(60);
      toast.success('Check your email for a code to finish signing up.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Resend uses the login-code endpoint (the account already exists by now).
  const resendMutation = useMutation({
    mutationFn: (email: string) => requestOtp(email),
    onSuccess: () => {
      setResendIn(60);
      toast.success('A new code is on its way.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyOtp(email, code),
    onSuccess: onAuthSuccess,
    onError: (error: Error) => toast.error(error.message),
  });

  const busy =
    passwordMutation.isPending ||
    requestMutation.isPending ||
    resendMutation.isPending ||
    verifyMutation.isPending;

  const onSubmitPassword = (data: RegisterForm) => passwordMutation.mutate(data);

  const onSubmitRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpName.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }
    if (!isValidEmail(otpEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    requestMutation.mutate({
      full_name: otpName.trim(),
      email: otpEmail.trim(),
      phone: otpPhone.trim() || undefined,
    });
  };

  const onSubmitVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 4) {
      toast.error('Enter the code from your email');
      return;
    }
    verifyMutation.mutate({ email: otpEmail.trim(), code: otpCode.trim() });
  };

  const fieldClass = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
      hasError ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white'
    }`;

  const errorEl = (msg: string | undefined) =>
    msg ? (
      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {msg}
      </p>
    ) : null;

  return (
    <div className="bg-warm-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-warm-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" aria-label="HiSpike — Home" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/logo.png?v=2" alt="HiSpike" className="h-14 w-14 object-contain" />
            </Link>
            <h1 className="text-3xl font-extrabold text-warm-900 mt-4 mb-2">Create account</h1>
            <p className="text-warm-500">Join thousands of dog lovers</p>
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
                  method === m ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500 hover:text-warm-700'
                }`}
              >
                {m === 'password' ? 'Password' : 'Email code'}
              </Link>
            ))}
          </div>

          {/* See Login.tsx — method="POST" guards against the SSG hydration
              race exposing typed credentials in the URL on native submit. */}
          {method === 'password' ? (
            <form method="POST" action="" onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-warm-700 mb-1.5">Full name</label>
                <input {...register('full_name')} id="full_name" type="text" autoComplete="name" placeholder="Jane Doe" className={fieldClass(!!errors.full_name)} />
                {errorEl(errors.full_name?.message)}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-1.5">Email address</label>
                <input {...register('email')} id="email" type="email" autoComplete="email" placeholder="you@example.com" className={fieldClass(!!errors.email)} />
                {errorEl(errors.email?.message)}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-warm-700 mb-1.5">
                  Phone number <span className="text-warm-400 font-normal">(optional)</span>
                </label>
                <input {...register('phone')} id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" className={fieldClass(!!errors.phone)} />
                {errorEl(errors.phone?.message)}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-1.5">Password</label>
                <input {...register('password')} id="password" type="password" autoComplete="new-password" placeholder="Min 8 chars, 1 uppercase, 1 number" className={fieldClass(!!errors.password)} />
                {errorEl(errors.password?.message)}
              </div>
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-warm-700 mb-1.5">Confirm password</label>
                <input {...register('confirm_password')} id="confirm_password" type="password" autoComplete="new-password" placeholder="••••••••" className={fieldClass(!!errors.confirm_password)} />
                {errorEl(errors.confirm_password?.message)}
              </div>
              <button type="submit" disabled={busy} className="w-full py-3.5 mt-2 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200">
                {passwordMutation.isPending ? (<><LoadingSpinner size="sm" />Creating account...</>) : 'Create Account'}
              </button>
            </form>
          ) : otpStep === 'request' ? (
            <form method="POST" action="" onSubmit={onSubmitRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="otp-name" className="block text-sm font-medium text-warm-700 mb-1.5">Full name</label>
                <input id="otp-name" type="text" autoComplete="name" placeholder="Jane Doe" value={otpName} onChange={(e) => setOtpName(e.target.value)} className={fieldClass(false)} />
              </div>
              <div>
                <label htmlFor="otp-email" className="block text-sm font-medium text-warm-700 mb-1.5">Email address</label>
                <input id="otp-email" type="email" autoComplete="email" placeholder="you@example.com" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} className={fieldClass(false)} />
              </div>
              <div>
                <label htmlFor="otp-phone" className="block text-sm font-medium text-warm-700 mb-1.5">
                  Phone number <span className="text-warm-400 font-normal">(optional)</span>
                </label>
                <input id="otp-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)} className={fieldClass(false)} />
              </div>
              <p className="text-xs text-warm-500">
                We'll email you a 6-digit code to create your account — no password needed.
              </p>
              <button type="submit" disabled={busy} className="w-full py-3.5 mt-1 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200">
                {requestMutation.isPending ? (<><LoadingSpinner size="sm" />Sending…</>) : 'Send code'}
              </button>
            </form>
          ) : (
            <form method="POST" action="" onSubmit={onSubmitVerifyOtp} className="space-y-4">
              <p className="text-sm text-warm-600">
                Enter the code we sent to <span className="font-semibold text-warm-900">{otpEmail}</span> to finish creating your account.
              </p>
              <div>
                <label htmlFor="otp-code" className="block text-sm font-medium text-warm-700 mb-1.5">Sign-up code</label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className={`${fieldClass(false)} text-center text-2xl font-bold tracking-[0.5em]`}
                />
              </div>
              <button type="submit" disabled={busy} className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200">
                {verifyMutation.isPending ? (<><LoadingSpinner size="sm" />Creating account…</>) : 'Verify & create account'}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setOtpStep('request'); setOtpCode(''); }} className="font-medium text-warm-500 hover:text-warm-700">
                  ← Edit details
                </button>
                <button
                  type="button"
                  disabled={resendIn > 0 || resendMutation.isPending}
                  onClick={() => resendMutation.mutate(otpEmail.trim())}
                  className="font-medium text-primary-600 hover:text-primary-700 disabled:text-warm-400 disabled:cursor-not-allowed"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-warm-400 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">Privacy Policy</Link>.
          </p>

          <div className="mt-4 text-center">
            <p className="text-sm text-warm-500">
              Already have an account?{' '}
              <Link
                to={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
