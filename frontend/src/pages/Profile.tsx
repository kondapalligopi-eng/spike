import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { updateCurrentUser } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/store/toastStore';
import { formatDate } from '@/utils/formatters';

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s+\-()]{7,20}$/.test(val),
      { message: 'Please enter a valid phone number' }
    ),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function Profile() {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        phone: user.phone ?? '',
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      updateCurrentUser({ full_name: data.full_name, phone: data.phone }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      reset({ full_name: updatedUser.full_name, phone: updatedUser.phone ?? '' });
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (!user) return <LoadingSpinner fullPage />;

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900 mb-2">My Profile</h1>
        <p className="text-warm-500">Manage your account details</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-10 bg-white rounded-2xl border border-warm-200 p-6 shadow-sm">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-warm-900">{user.full_name}</h2>
          <p className="text-warm-500 text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-primary-100 text-primary-700'
            }`}>
              {user.role === 'admin' ? 'Admin' : 'Member'}
            </span>
            <span className="text-xs text-warm-400">
              Joined {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
        <h3 className="font-bold text-warm-900 text-lg mb-6">Edit Information</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-warm-700 mb-1.5">
              Full name
            </label>
            <input
              {...register('full_name')}
              id="full_name"
              type="text"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
                errors.full_name ? 'border-red-300 bg-red-50' : 'border-warm-200'
              }`}
            />
            {errors.full_name && (
              <p className="mt-1.5 text-xs text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              Email address
              <span className="ml-2 text-xs text-warm-400 font-normal">(cannot be changed)</span>
            </label>
            <div className="w-full px-4 py-3 border border-warm-100 bg-warm-50 rounded-xl text-sm text-warm-500 cursor-not-allowed">
              {user.email}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-warm-700 mb-1.5">
              Phone number
              <span className="ml-2 text-xs text-warm-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('phone')}
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
                errors.phone ? 'border-red-300 bg-red-50' : 'border-warm-200'
              }`}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || !isDirty}
              className="px-8 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            {isDirty && (
              <button
                type="button"
                onClick={() => reset()}
                className="px-6 py-3 text-warm-600 hover:text-warm-800 font-medium transition-colors"
              >
                Discard
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
