import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/api/auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHead } from '@/components/PageHead';
import { toast } from '@/store/toastStore';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });
type Form = z.infer<typeof schema>;

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: Form) => resetPassword(token, data.password),
    onSuccess: (res) => {
      toast.success(res.message || 'Your password has been updated.');
      navigate('/login', { replace: true });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const fieldClass = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
      hasError ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white'
    }`;

  return (
    <div className="bg-warm-50 flex items-center justify-center px-4 py-12">
      <PageHead
        title="Set a new password"
        description="Choose a new password for your HiSpike account."
        path="/reset-password"
      />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-warm-200 p-8">
          <div className="text-center mb-8">
            <Link to="/" aria-label="HiSpike — Home" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/logo.png?v=2" alt="HiSpike" className="h-14 w-14 object-contain" />
            </Link>
            <h1 className="text-3xl font-extrabold text-warm-900 mt-4 mb-2">Set a new password</h1>
            <p className="text-warm-500">Choose a strong password you’ll remember</p>
          </div>

          {!token ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <p className="text-sm text-warm-700">
                This reset link is missing or invalid. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block text-sm text-primary-600 font-semibold hover:text-primary-700"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form method="POST" action="" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-1.5">
                  New password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={fieldClass(!!errors.password)}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-warm-700 mb-1.5">
                  Confirm new password
                </label>
                <input
                  {...register('confirm_password')}
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={fieldClass(!!errors.confirm_password)}
                />
                {errors.confirm_password && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.confirm_password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
              >
                {mutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Updating…
                  </>
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
