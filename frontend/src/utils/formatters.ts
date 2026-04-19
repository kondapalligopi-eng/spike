import type { AdoptionStatus, DogSize, DogStatus } from '@/types';

export function formatAge(months: number): string {
  if (months < 1) return 'Less than 1 month';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  const yearStr = years === 1 ? '1 year' : `${years} years`;
  const monthStr = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
  return `${yearStr} ${monthStr}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: DogStatus): string {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'adopted':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getAdoptionStatusColor(status: AdoptionStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getSizeLabel(size: DogSize): string {
  switch (size) {
    case 'small':
      return 'Small';
    case 'medium':
      return 'Medium';
    case 'large':
      return 'Large';
    case 'extra_large':
      return 'Extra Large';
    default:
      return size;
  }
}

export function getSizeColor(size: DogSize): string {
  switch (size) {
    case 'small':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-purple-100 text-purple-800';
    case 'large':
      return 'bg-orange-100 text-orange-800';
    case 'extra_large':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getStatusLabel(status: DogStatus): string {
  switch (status) {
    case 'available':
      return 'Available';
    case 'pending':
      return 'Pending';
    case 'adopted':
      return 'Adopted';
    default:
      return status;
  }
}

export function getAdoptionStatusLabel(status: AdoptionStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
