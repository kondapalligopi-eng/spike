import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '@/api/auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageHead } from '@/components/PageHead';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type Form = z.infer<typeof schema>;

export function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: Form) => forgotPassword(data.email),
    onSuccess: (_res, data) => setSentTo(data.email),
  });

  return (
    <div className="bg-warm-50 flex items-center justify-center px-4 py-12">
      <PageHead
        title="Reset your password"
        description="Request a password reset link for your HiSpike account."
        path="/forgot-password"
      />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-warm-200 p-8">
          <div className="text-center mb-8">
            <Link to="/" aria-label="HiSpike — Home" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/logo.png?v=2" alt="HiSpike" className="h-14 w-14 object-contain" />
            </Link>
            <h1 className="text-3xl font-extrabold text-warm-900 mt-4 mb-2">Forgot password?</h1>
            <p className="text-warm-500">
              {sentTo ? 'Check your inbox' : 'We’ll email you a link to reset it'}
            </p>
          </div>

          {sentTo ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-2xl">
                📬
              </div>
              <p className="text-sm text-warm-700">
                If an account exists for <span className="font-semibold text-warm-900">{sentTo}</span>,
                we’ve sent a reset link. It expires in 1 hour. Check your spam folder if you don’t see it.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm text-primary-600 font-semibold hover:text-primary-700"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <form method="POST" action="" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
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
                    <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
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
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-primary-600 font-semibold hover:text-primary-700">
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
