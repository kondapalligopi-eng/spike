import { Link } from 'react-router-dom';
import type { Dog } from '@/types';
import { formatAge, getSizeLabel, getSizeColor, getStatusColor, getStatusLabel } from '@/utils/formatters';

interface DogCardProps {
  dog: Dog;
  showActions?: boolean;
  onDelete?: (id: number) => void;
}

export function DogCard({ dog, showActions = false, onDelete }: DogCardProps) {
  const placeholderImage = `https://placedog.net/400/300?id=${dog.id}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      <Link to={`/dogs/${dog.id}`} className="block">
        <div className="relative h-52 overflow-hidden bg-warm-100">
          <img
            src={dog.image_url ?? placeholderImage}
            alt={`${dog.name} - ${dog.breed}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }}
          />
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(dog.status)}`}
            >
              {getStatusLabel(dog.status)}
            </span>
          </div>
          {/* Gender */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-warm-700 text-xs font-medium px-2 py-1 rounded-full">
              {dog.gender === 'male' ? '♂ Male' : '♀ Female'}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to={`/dogs/${dog.id}`}
            className="font-bold text-warm-900 text-lg hover:text-primary-600 transition-colors leading-tight"
          >
            {dog.name}
          </Link>
          <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getSizeColor(dog.size)}`}>
            {getSizeLabel(dog.size)}
          </span>
        </div>

        <p className="text-warm-600 text-sm mb-1">{dog.breed}</p>
        <p className="text-warm-400 text-sm mb-3">{formatAge(dog.age_months)} old</p>

        <div className="flex items-center gap-2 mb-4">
          {dog.vaccinated && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Vaccinated
            </span>
          )}
          {dog.neutered && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Neutered
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/dogs/${dog.id}`}
            className="flex-1 text-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
          >
            View Details
          </Link>
          {showActions && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(dog.id);
              }}
              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              aria-label="Delete dog listing"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
