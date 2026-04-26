import type { RouteRecord } from 'vite-react-ssg';
import { RootShell } from '@/components/RootShell';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Dogs } from '@/pages/Dogs';
import { DogDetail } from '@/pages/DogDetail';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Profile } from '@/pages/Profile';
import { MyDogs } from '@/pages/MyDogs';
import { NewDog } from '@/pages/NewDog';
import { Adoptions } from '@/pages/Adoptions';
import { Admin } from '@/pages/Admin';
import { Swimming } from '@/pages/Swimming';
import { Hospital } from '@/pages/Hospital';
import { Park } from '@/pages/Park';
import { Grooming } from '@/pages/Grooming';
import { GroomingSalon } from '@/pages/GroomingSalon';
import { PetSupplies } from '@/pages/PetSupplies';
import { NotFound } from '@/pages/NotFound';

export const routes: RouteRecord[] = [
  {
    element: <RootShell />,
    children: [
      { path: '/login', Component: Login },
      { path: '/register', Component: Register },
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, Component: Home },
          { path: 'dogs', Component: Dogs },
          { path: 'dogs/:id', Component: DogDetail },
          { path: 'swimming', Component: Swimming },
          { path: 'hospital', Component: Hospital },
          { path: 'park', Component: Park },
          { path: 'grooming', Component: Grooming },
          { path: 'grooming/:slug', Component: GroomingSalon },
          { path: 'pet-supplies', Component: PetSupplies },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ),
          },
          {
            path: 'my-dogs',
            element: (
              <ProtectedRoute>
                <MyDogs />
              </ProtectedRoute>
            ),
          },
          {
            path: 'my-dogs/new',
            element: (
              <ProtectedRoute>
                <NewDog />
              </ProtectedRoute>
            ),
          },
          {
            path: 'adoptions',
            element: (
              <ProtectedRoute>
                <Adoptions />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin',
            element: (
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            ),
          },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
];
