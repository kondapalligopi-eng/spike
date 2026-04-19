import type { Dog, User, Adoption, AdminStats, PaginatedResponse } from '@/types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export { delay };

export const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'admin@petdogs.com',
    full_name: 'Admin User',
    phone: '9876543210',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'john@example.com',
    full_name: 'John Smith',
    phone: '9123456780',
    role: 'user',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

export const MOCK_DOGS: Dog[] = [
  {
    id: 1,
    name: 'Buddy',
    breed: 'Golden Retriever',
    age_months: 18,
    size: 'large',
    gender: 'male',
    color: 'Golden',
    description: 'Buddy is a friendly and energetic Golden Retriever who loves playing fetch and swimming. He is great with kids and other dogs.',
    vaccinated: true,
    neutered: true,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=1',
    owner_id: 2,
    owner: MOCK_USERS[1],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Luna',
    breed: 'Labrador Retriever',
    age_months: 8,
    size: 'large',
    gender: 'female',
    color: 'Black',
    description: 'Luna is an adorable black Lab puppy full of energy. She loves cuddles and is learning basic commands quickly.',
    vaccinated: true,
    neutered: false,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=2',
    owner_id: 1,
    owner: MOCK_USERS[0],
    created_at: '2024-03-05T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z',
  },
  {
    id: 3,
    name: 'Max',
    breed: 'German Shepherd',
    age_months: 36,
    size: 'large',
    gender: 'male',
    color: 'Black and Tan',
    description: 'Max is a well-trained German Shepherd, perfect for an active family. He knows sit, stay, and heel. Very loyal and protective.',
    vaccinated: true,
    neutered: true,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=3',
    owner_id: 2,
    owner: MOCK_USERS[1],
    created_at: '2024-03-08T00:00:00Z',
    updated_at: '2024-03-08T00:00:00Z',
  },
  {
    id: 4,
    name: 'Daisy',
    breed: 'Beagle',
    age_months: 24,
    size: 'medium',
    gender: 'female',
    color: 'Tricolor',
    description: 'Daisy is a sweet Beagle who loves sniffing everything! She is house-trained and gets along well with cats.',
    vaccinated: true,
    neutered: true,
    status: 'pending',
    image_url: 'https://placedog.net/500/400?id=4',
    owner_id: 1,
    owner: MOCK_USERS[0],
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 5,
    name: 'Charlie',
    breed: 'Poodle (Standard)',
    age_months: 12,
    size: 'medium',
    gender: 'male',
    color: 'White',
    description: 'Charlie is a hypoallergenic Standard Poodle, great for families with allergies. Super intelligent and easy to train.',
    vaccinated: true,
    neutered: false,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=5',
    owner_id: 2,
    owner: MOCK_USERS[1],
    created_at: '2024-03-12T00:00:00Z',
    updated_at: '2024-03-12T00:00:00Z',
  },
  {
    id: 6,
    name: 'Bella',
    breed: 'French Bulldog',
    age_months: 10,
    size: 'small',
    gender: 'female',
    color: 'Brindle',
    description: 'Bella is a playful and affectionate French Bulldog. She loves lounging on the couch and short walks. Perfect for apartment living.',
    vaccinated: true,
    neutered: true,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=6',
    owner_id: 1,
    owner: MOCK_USERS[0],
    created_at: '2024-03-14T00:00:00Z',
    updated_at: '2024-03-14T00:00:00Z',
  },
  {
    id: 7,
    name: 'Rocky',
    breed: 'Rottweiler',
    age_months: 48,
    size: 'large',
    gender: 'male',
    color: 'Black and Tan',
    description: 'Rocky is a gentle giant despite his size. Well-socialized and obedient. Needs an experienced owner with a yard.',
    vaccinated: true,
    neutered: true,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=7',
    owner_id: 2,
    owner: MOCK_USERS[1],
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 8,
    name: 'Coco',
    breed: 'Shih Tzu',
    age_months: 15,
    size: 'small',
    gender: 'female',
    color: 'Brown and White',
    description: 'Coco is a lap dog who loves being pampered. She has a silky coat and a gentle temperament. Great for seniors.',
    vaccinated: true,
    neutered: false,
    status: 'adopted',
    image_url: 'https://placedog.net/500/400?id=8',
    owner_id: 1,
    owner: MOCK_USERS[0],
    created_at: '2024-03-16T00:00:00Z',
    updated_at: '2024-03-16T00:00:00Z',
  },
  {
    id: 9,
    name: 'Bruno',
    breed: 'Boxer',
    age_months: 30,
    size: 'large',
    gender: 'male',
    color: 'Fawn',
    description: 'Bruno is a high-energy Boxer who loves to play. He is great with children and very loyal. Needs daily exercise.',
    vaccinated: true,
    neutered: true,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=9',
    owner_id: 2,
    owner: MOCK_USERS[1],
    created_at: '2024-03-17T00:00:00Z',
    updated_at: '2024-03-17T00:00:00Z',
  },
  {
    id: 10,
    name: 'Milo',
    breed: 'Dachshund',
    age_months: 20,
    size: 'small',
    gender: 'male',
    color: 'Red',
    description: 'Milo is a curious and brave little Dachshund. He loves digging and exploring. Best in a home without stairs.',
    vaccinated: true,
    neutered: true,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=10',
    owner_id: 1,
    owner: MOCK_USERS[0],
    created_at: '2024-03-18T00:00:00Z',
    updated_at: '2024-03-18T00:00:00Z',
  },
  {
    id: 11,
    name: 'Zoe',
    breed: 'Border Collie',
    age_months: 14,
    size: 'medium',
    gender: 'female',
    color: 'Black and White',
    description: 'Zoe is an extremely intelligent Border Collie who needs mental stimulation. She excels at agility and frisbee.',
    vaccinated: true,
    neutered: false,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=11',
    owner_id: 2,
    owner: MOCK_USERS[1],
    created_at: '2024-03-19T00:00:00Z',
    updated_at: '2024-03-19T00:00:00Z',
  },
  {
    id: 12,
    name: 'Toby',
    breed: 'Siberian Husky',
    age_months: 22,
    size: 'large',
    gender: 'male',
    color: 'Grey and White',
    description: 'Toby is a majestic Husky with blue eyes. He is talkative and loves cold weather. Needs a lot of exercise and space.',
    vaccinated: true,
    neutered: true,
    status: 'available',
    image_url: 'https://placedog.net/500/400?id=12',
    owner_id: 1,
    owner: MOCK_USERS[0],
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
];

export const MOCK_ADOPTIONS: Adoption[] = [
  {
    id: 1,
    dog_id: 4,
    adopter_id: 2,
    status: 'pending',
    message: 'We have a large yard and love Beagles. We are experienced dog owners.',
    dog: MOCK_DOGS[3],
    adopter: MOCK_USERS[1],
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: 2,
    dog_id: 8,
    adopter_id: 2,
    status: 'approved',
    message: 'I live alone and want a calm companion. Coco sounds perfect!',
    dog: MOCK_DOGS[7],
    adopter: MOCK_USERS[1],
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-16T00:00:00Z',
  },
];

export const MOCK_STATS: AdminStats = {
  total_dogs: MOCK_DOGS.length,
  total_users: MOCK_USERS.length,
  total_adoptions: MOCK_ADOPTIONS.length,
  available_dogs: MOCK_DOGS.filter((d) => d.status === 'available').length,
  pending_adoptions: MOCK_ADOPTIONS.filter((d) => d.status === 'pending').length,
  adopted_dogs: MOCK_DOGS.filter((d) => d.status === 'adopted').length,
};

let mockDogs = [...MOCK_DOGS];
let mockAdoptions = [...MOCK_ADOPTIONS];
let nextDogId = MOCK_DOGS.length + 1;
let nextAdoptionId = MOCK_ADOPTIONS.length + 1;

export function getMockDogs(
  filters: { breed?: string; status?: string; gender?: string; size?: string[]; min_age?: number; max_age?: number } = {},
  page = 1,
  pageSize = 12
): PaginatedResponse<Dog> {
  let filtered = mockDogs;
  if (filters.breed) {
    filtered = filtered.filter((d) =>
      d.breed.toLowerCase().includes(filters.breed!.toLowerCase())
    );
  }
  if (filters.status) filtered = filtered.filter((d) => d.status === filters.status);
  if (filters.gender) filtered = filtered.filter((d) => d.gender === filters.gender);
  if (filters.size && filters.size.length > 0) {
    filtered = filtered.filter((d) => filters.size!.includes(d.size));
  }
  if (filters.min_age !== undefined) filtered = filtered.filter((d) => d.age_months >= filters.min_age!);
  if (filters.max_age !== undefined) filtered = filtered.filter((d) => d.age_months <= filters.max_age!);

  const total = filtered.length;
  const pages = Math.ceil(total / pageSize);
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  return { items, total, page, size: pageSize, pages };
}

export function getMockDogById(id: number): Dog | undefined {
  return mockDogs.find((d) => d.id === id);
}

export function getMockMyDogs(userId: number): Dog[] {
  return mockDogs.filter((d) => d.owner_id === userId);
}

export function createMockDog(data: Omit<Dog, 'id' | 'owner_id' | 'owner' | 'status' | 'image_url' | 'created_at' | 'updated_at'>, userId: number): Dog {
  const newDog: Dog = {
    ...data,
    id: nextDogId++,
    status: 'available',
    image_url: `https://placedog.net/500/400?id=${nextDogId}`,
    owner_id: userId,
    owner: MOCK_USERS.find((u) => u.id === userId),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockDogs.push(newDog);
  return newDog;
}

export function updateMockDog(id: number, data: Partial<Dog>): Dog | undefined {
  const index = mockDogs.findIndex((d) => d.id === id);
  if (index === -1) return undefined;
  mockDogs[index] = { ...mockDogs[index], ...data, updated_at: new Date().toISOString() };
  return mockDogs[index];
}

export function deleteMockDog(id: number): void {
  mockDogs = mockDogs.filter((d) => d.id !== id);
}

export function getMockAdoptions(userId: number): Adoption[] {
  return mockAdoptions.filter(
    (a) => a.adopter_id === userId || a.dog?.owner_id === userId
  );
}

export function createMockAdoption(dogId: number, userId: number, message?: string): Adoption {
  const dog = getMockDogById(dogId);
  const adoption: Adoption = {
    id: nextAdoptionId++,
    dog_id: dogId,
    adopter_id: userId,
    status: 'pending',
    message,
    dog,
    adopter: MOCK_USERS.find((u) => u.id === userId),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockAdoptions.push(adoption);
  return adoption;
}
