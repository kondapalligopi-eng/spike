import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { register as registerApi } from '@/api/auth';
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

export function Register() {
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
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      storeLogin(data.access_token, data.user);
      toast.success(`Welcome to PetDogs, ${data.user.full_name}!`);
      navigate(redirectTo, { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    mutation.mutate(data);
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
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-warm-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-warm-900">
              <span>🐾</span> PetDogs
            </Link>
            <h1 className="text-3xl font-extrabold text-warm-900 mt-4 mb-2">Create account</h1>
            <p className="text-warm-500">Join thousands of dog lovers</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-warm-700 mb-1.5">
                Full name
              </label>
              <input
                {...register('full_name')}
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className={fieldClass(!!errors.full_name)}
              />
              {errorEl(errors.full_name?.message)}
            </div>

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
                className={fieldClass(!!errors.email)}
              />
              {errorEl(errors.email?.message)}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-warm-700 mb-1.5">
                Phone number{' '}
                <span className="text-warm-400 font-normal">(optional)</span>
              </label>
              <input
                {...register('phone')}
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                className={fieldClass(!!errors.phone)}
              />
              {errorEl(errors.phone?.message)}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-1.5">
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={fieldClass(!!errors.password)}
              />
              {errorEl(errors.password?.message)}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-warm-700 mb-1.5">
                Confirm password
              </label>
              <input
                {...register('confirm_password')}
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={fieldClass(!!errors.confirm_password)}
              />
              {errorEl(errors.confirm_password?.message)}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3.5 mt-2 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-warm-400 leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
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

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-warm-400 hover:text-warm-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
