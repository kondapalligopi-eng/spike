import type { RouteRecord } from 'vite-react-ssg';
import { RootShell } from '@/components/RootShell';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Dogs } from '@/pages/Dogs';
import { DogDetail } from '@/pages/DogDetail';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { Profile } from '@/pages/Profile';
import { MyDogs } from '@/pages/MyDogs';
import { PetPages } from '@/pages/PetPages';
import { PetPage } from '@/pages/PetPage';
import { Adoptions } from '@/pages/Adoptions';
import { Admin } from '@/pages/Admin';
import { Swimming } from '@/pages/Swimming';
import { Hospital } from '@/pages/Hospital';
import { Park } from '@/pages/Park';
import { Grooming } from '@/pages/Grooming';
import { GroomingSalon } from '@/pages/GroomingSalon';
import { PetSupplies } from '@/pages/PetSupplies';
import { DogWalking } from '@/pages/DogWalking';
import { OurStory } from '@/pages/OurStory';
import { Newsroom } from '@/pages/Newsroom';
import { Blog } from '@/pages/Blog';
import { Careers } from '@/pages/Careers';
import { Feedback } from '@/pages/Feedback';
import { TermsOfService } from '@/pages/TermsOfService';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { NotFound } from '@/pages/NotFound';

export const routes: RouteRecord[] = [
  {
    element: <RootShell />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, Component: Home },
          { path: 'login', Component: Login },
          { path: 'register', Component: Register },
          { path: 'dogs', Component: Dogs },
          { path: 'dogs/:id', Component: DogDetail },
          { path: 'swimming', Component: Swimming },
          { path: 'hospital', Component: Hospital },
          { path: 'park', Component: Park },
          { path: 'grooming', Component: Grooming },
          { path: 'grooming/:slug', Component: GroomingSalon },
          { path: 'pet-supplies', Component: PetSupplies },
          { path: 'dog-walking', Component: DogWalking },
          // Public, shareable dog page — slug is user-created, so it renders
          // client-side (not pre-rendered at build time).
          { path: 'pet/:slug', Component: PetPage },
          {
            path: 'pet-stories',
            element: (
              <ProtectedRoute>
                <PetPages />
              </ProtectedRoute>
            ),
          },
          { path: 'about', Component: OurStory },
          { path: 'newsroom', Component: Newsroom },
          { path: 'blog', Component: Blog },
          { path: 'careers', Component: Careers },
          { path: 'feedback', Component: Feedback },
          { path: 'terms', Component: TermsOfService },
          { path: 'privacy', Component: PrivacyPolicy },
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
