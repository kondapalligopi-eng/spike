// Enums
export type DogStatus = 'available' | 'pending' | 'adopted';
export type DogSize = 'small' | 'medium' | 'large' | 'extra_large';
export type DogGender = 'male' | 'female';
export type AdoptionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type UserRole = 'user' | 'admin';

// Core models
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dog {
  id: number;
  name: string;
  breed: string;
  age_months: number;
  size: DogSize;
  gender: DogGender;
  color: string;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
  status: DogStatus;
  image_url?: string;
  owner_id: number;
  owner?: User;
  created_at: string;
  updated_at: string;
}

export interface Adoption {
  id: number;
  dog_id: number;
  adopter_id: number;
  status: AdoptionStatus;
  message?: string;
  dog?: Dog;
  adopter?: User;
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Dog CRUD
export interface DogCreateData {
  name: string;
  breed: string;
  age_months: number;
  size: DogSize;
  gender: DogGender;
  color: string;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
}

export interface DogUpdateData extends Partial<DogCreateData> {
  status?: DogStatus;
}

// Filters
export interface DogFilters {
  search?: string;
  breed?: string;
  size?: DogSize[];
  status?: DogStatus;
  gender?: DogGender;
  min_age?: number;
  max_age?: number;
  page?: number;
  size_per_page?: number;
}

// Adoption create
export interface AdoptionCreateData {
  dog_id: number;
  message?: string;
}

// Admin stats
export interface AdminStats {
  total_dogs: number;
  total_users: number;
  total_adoptions: number;
  available_dogs: number;
  pending_adoptions: number;
  adopted_dogs: number;
}

// Toast
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// API error
export interface ApiError {
  detail: string | { msg: string; type: string }[];
}
