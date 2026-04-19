import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDog, useUploadDogImage } from '@/hooks/useDogs';
import { ImageUpload } from '@/components/ImageUpload';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { DogSize, DogGender } from '@/types';

const newDogSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  breed: z.string().min(1, 'Breed is required').max(100, 'Breed name too long'),
  age_months: z
    .number({ invalid_type_error: 'Age is required' })
    .int('Age must be a whole number')
    .min(0, 'Age cannot be negative')
    .max(240, 'Age seems too high (max 240 months = 20 years)'),
  size: z.enum(['small', 'medium', 'large', 'extra_large'], {
    errorMap: () => ({ message: 'Please select a size' }),
  }),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  color: z.string().min(1, 'Color is required').max(50),
  description: z.string().min(20, 'Description too short (min 20 chars)').max(1000),
  vaccinated: z.boolean(),
  neutered: z.boolean(),
});

type NewDogForm = z.infer<typeof newDogSchema>;

const SIZES: { value: DogSize; label: string; desc: string }[] = [
  { value: 'small', label: 'Small', desc: 'Under 10kg' },
  { value: 'medium', label: 'Medium', desc: '10–25kg' },
  { value: 'large', label: 'Large', desc: '25–45kg' },
  { value: 'extra_large', label: 'Extra Large', desc: 'Over 45kg' },
];

const GENDERS: { value: DogGender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Male', emoji: '♂' },
  { value: 'female', label: 'Female', emoji: '♀' },
];

export function NewDog() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const createDog = useCreateDog();
  const uploadImage = useUploadDogImage();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewDogForm>({
    resolver: zodResolver(newDogSchema),
    defaultValues: {
      vaccinated: false,
      neutered: false,
    },
  });

  const selectedSize = watch('size');
  const selectedGender = watch('gender');

  const onSubmit = async (data: NewDogForm) => {
    const dog = await createDog.mutateAsync(data);

    if (imageFile) {
      await uploadImage.mutateAsync({ id: dog.id, file: imageFile });
    }

    navigate('/my-dogs');
  };

  const isLoading = createDog.isPending || uploadImage.isPending;

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
      hasError ? 'border-red-300 bg-red-50' : 'border-warm-200'
    }`;

  const errorEl = (msg: string | undefined) =>
    msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-warm-500 mb-8">
        <Link to="/my-dogs" className="hover:text-warm-700 transition-colors">
          My Dogs
        </Link>
        <span>/</span>
        <span className="text-warm-900 font-medium">New Listing</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900 mb-2">Create Dog Listing</h1>
        <p className="text-warm-500">Fill in the details to help find a loving home</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-warm-900 text-lg">Basic Information</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-warm-700 mb-1.5">
                Dog's name *
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                placeholder="e.g. Buddy"
                className={inputClass(!!errors.name)}
              />
              {errorEl(errors.name?.message)}
            </div>

            {/* Breed */}
            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-warm-700 mb-1.5">
                Breed *
              </label>
              <input
                {...register('breed')}
                id="breed"
                type="text"
                placeholder="e.g. Labrador Retriever"
                className={inputClass(!!errors.breed)}
              />
              {errorEl(errors.breed?.message)}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age_months" className="block text-sm font-medium text-warm-700 mb-1.5">
                Age (in months) *
              </label>
              <input
                {...register('age_months', { valueAsNumber: true })}
                id="age_months"
                type="number"
                min={0}
                max={240}
                placeholder="e.g. 24"
                className={inputClass(!!errors.age_months)}
              />
              {errorEl(errors.age_months?.message)}
            </div>

            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-warm-700 mb-1.5">
                Color / Coat *
              </label>
              <input
                {...register('color')}
                id="color"
                type="text"
                placeholder="e.g. Golden, Black & White"
                className={inputClass(!!errors.color)}
              />
              {errorEl(errors.color?.message)}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-warm-700 mb-1.5">
              Description *
              <span className="text-warm-400 font-normal ml-1">(min 20 characters)</span>
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={5}
              placeholder="Tell potential adopters about this dog's personality, habits, favourite activities..."
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-warm-200'
              }`}
            />
            {errorEl(errors.description?.message)}
          </div>
        </div>

        {/* Gender */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
          <h2 className="font-bold text-warm-900 text-lg mb-4">Gender *</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENDERS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('gender', value, { shouldValidate: true })}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                  selectedGender === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-warm-200 text-warm-600 hover:border-warm-400'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
          {errorEl(errors.gender?.message)}
        </div>

        {/* Size */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
          <h2 className="font-bold text-warm-900 text-lg mb-4">Size *</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SIZES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('size', value, { shouldValidate: true })}
                className={`flex flex-col items-center p-4 rounded-xl border-2 text-center transition-all ${
                  selectedSize === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-warm-200 hover:border-warm-400'
                }`}
              >
                <span className="text-2xl mb-1">
                  {value === 'small' ? '🐩' : value === 'medium' ? '🐕' : value === 'large' ? '🦮' : '🐕‍🦺'}
                </span>
                <span className={`text-sm font-semibold ${selectedSize === value ? 'text-primary-700' : 'text-warm-700'}`}>
                  {label}
                </span>
                <span className="text-xs text-warm-400 mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
          {errorEl(errors.size?.message)}
        </div>

        {/* Health */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
          <h2 className="font-bold text-warm-900 text-lg mb-4">Health Status</h2>
          <div className="space-y-4">
            {[
              { field: 'vaccinated' as const, label: 'Vaccinated', desc: 'Up to date on vaccinations', emoji: '💉' },
              { field: 'neutered' as const, label: 'Neutered/Spayed', desc: 'Has been neutered or spayed', emoji: '🏥' },
            ].map(({ field, label, desc, emoji }) => (
              <label key={field} className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register(field)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-warm-200 peer-checked:bg-primary-500 rounded-full transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="font-medium text-warm-900 text-sm">{label}</span>
                  </div>
                  <p className="text-xs text-warm-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
          <h2 className="font-bold text-warm-900 text-lg mb-2">Photo</h2>
          <p className="text-sm text-warm-500 mb-4">
            Add a photo to increase adoption chances by 3x
          </p>
          <ImageUpload
            onFileSelect={(file) => setImageFile(file)}
            isUploading={uploadImage.isPending}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-none px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-200 text-base"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                {createDog.isPending ? 'Creating...' : 'Uploading image...'}
              </>
            ) : (
              'Publish Listing 🐾'
            )}
          </button>
          <Link
            to="/my-dogs"
            className="px-6 py-4 text-warm-600 font-medium hover:text-warm-900 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
