import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDogQuery } from '@/hooks/useDogs';
import { useCreateAdoption } from '@/hooks/useAdoptions';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  formatAge,
  formatDate,
  getSizeLabel,
  getSizeColor,
  getStatusColor,
  getStatusLabel,
} from '@/utils/formatters';

const adoptionSchema = z.object({
  message: z
    .string()
    .min(20, 'Please write at least 20 characters about yourself')
    .max(500, 'Message too long (max 500 characters)'),
});

type AdoptionForm = z.infer<typeof adoptionSchema>;

export function DogDetail() {
  const { id } = useParams<{ id: string }>();
  const dogId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showAdoptForm, setShowAdoptForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: dog, isLoading, isError, error, refetch } = useDogQuery(dogId);
  const createAdoption = useCreateAdoption();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdoptionForm>({
    resolver: zodResolver(adoptionSchema),
  });

  if (isLoading) return <LoadingSpinner fullPage />;

  if (isError || !dog) {
    return (
      <ErrorMessage
        title="Dog not found"
        message={(error as Error)?.message ?? 'This dog listing could not be found.'}
        onRetry={() => refetch()}
      />
    );
  }

  const isOwner = user?.id === dog.owner_id;
  const canAdopt = isAuthenticated && !isOwner && dog.status === 'available';

  const images = dog.image_url
    ? [dog.image_url]
    : [`https://placedog.net/800/600?id=${dog.id}`];

  const onSubmit = async (data: AdoptionForm) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/dogs/${dog.id}`);
      return;
    }
    await createAdoption.mutateAsync({
      dog_id: dog.id,
      message: data.message,
    });
    reset();
    setShowAdoptForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-warm-500 mb-8">
        <Link to="/" className="hover:text-warm-700 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/dogs" className="hover:text-warm-700 transition-colors">Dogs</Link>
        <span>/</span>
        <span className="text-warm-900 font-medium">{dog.name}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Image Gallery */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-warm-100 aspect-[4/3]">
            <img
              src={images[selectedImage]}
              alt={`${dog.name} — ${dog.breed}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placedog.net/800/600?id=${dog.id}`;
              }}
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(dog.status)}`}>
                {getStatusLabel(dog.status)}
              </span>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === selectedImage
                      ? 'border-primary-500'
                      : 'border-warm-200 hover:border-warm-400'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-4xl font-extrabold text-warm-900">{dog.name}</h1>
              <span className={`shrink-0 mt-2 px-3 py-1 rounded-lg text-sm font-semibold ${getSizeColor(dog.size)}`}>
                {getSizeLabel(dog.size)}
              </span>
            </div>
            <p className="text-xl text-warm-600 mb-1">{dog.breed}</p>
            <p className="text-warm-400">Listed {formatDate(dog.created_at)}</p>
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Age', value: formatAge(dog.age_months), emoji: '🎂' },
              { label: 'Gender', value: dog.gender === 'male' ? 'Male ♂' : 'Female ♀', emoji: '⚥' },
              { label: 'Color', value: dog.color, emoji: '🎨' },
              { label: 'Size', value: getSizeLabel(dog.size), emoji: '📏' },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="bg-warm-50 rounded-2xl p-4">
                <div className="text-lg mb-1">{emoji}</div>
                <div className="text-xs text-warm-400 uppercase tracking-wide mb-0.5">{label}</div>
                <div className="font-semibold text-warm-900 text-sm">{value}</div>
              </div>
            ))}
          </div>

          {/* Health */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <h3 className="font-semibold text-green-800 mb-3">Health Status</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${dog.vaccinated ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {dog.vaccinated ? '✓' : '✗'}
                </span>
                <span className={`text-sm font-medium ${dog.vaccinated ? 'text-green-700' : 'text-gray-500'}`}>
                  Vaccinated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${dog.neutered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {dog.neutered ? '✓' : '✗'}
                </span>
                <span className={`text-sm font-medium ${dog.neutered ? 'text-green-700' : 'text-gray-500'}`}>
                  Neutered
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {dog.description && (
            <div>
              <h3 className="font-semibold text-warm-900 mb-3">About {dog.name}</h3>
              <p className="text-warm-600 leading-relaxed">{dog.description}</p>
            </div>
          )}

          {/* Owner info */}
          {dog.owner && (
            <div className="border-t border-warm-200 pt-4">
              <p className="text-sm text-warm-400">
                Listed by <span className="font-medium text-warm-700">{dog.owner.full_name}</span>
              </p>
            </div>
          )}

          {/* Adoption Section */}
          <div className="space-y-3">
            {dog.status === 'adopted' && (
              <div className="bg-gray-100 rounded-2xl p-4 text-center">
                <p className="text-warm-600 font-medium">This dog has already been adopted 🎉</p>
              </div>
            )}

            {dog.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                <p className="text-yellow-700 font-medium">Adoption pending review</p>
              </div>
            )}

            {isOwner && (
              <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 text-center">
                <p className="text-primary-700 font-medium mb-2">This is your dog listing</p>
                <Link
                  to="/my-dogs"
                  className="text-sm text-primary-600 hover:underline font-medium"
                >
                  Manage in My Dogs →
                </Link>
              </div>
            )}

            {canAdopt && !showAdoptForm && (
              <button
                onClick={() => setShowAdoptForm(true)}
                className="w-full py-4 bg-primary-500 text-white font-bold text-lg rounded-2xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
              >
                Request Adoption 🐾
              </button>
            )}

            {!isAuthenticated && dog.status === 'available' && (
              <Link
                to={`/login?redirect=/dogs/${dog.id}`}
                className="block w-full py-4 bg-primary-500 text-white font-bold text-lg rounded-2xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200 text-center"
              >
                Sign In to Adopt 🐾
              </Link>
            )}

            {/* Adoption Form */}
            {showAdoptForm && (
              <div className="border-2 border-primary-200 rounded-2xl p-6 bg-primary-50 animate-fade-in">
                <h3 className="font-bold text-warm-900 text-lg mb-3">
                  Tell us about yourself
                </h3>
                <p className="text-sm text-warm-500 mb-4">
                  Why do you want to adopt {dog.name}? What kind of home can you offer?
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder={`Share why you'd be a great home for ${dog.name}...`}
                      className="w-full px-4 py-3 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none bg-white"
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdoptForm(false);
                        reset();
                      }}
                      className="flex-1 py-3 border border-warm-300 text-warm-700 rounded-xl font-medium hover:bg-warm-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createAdoption.isPending}
                      className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {createAdoption.isPending ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
