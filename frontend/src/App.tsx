import type { RouteRecord } from 'vite-react-ssg';
import { RootShell } from '@/components/RootShell';
import { RouteError } from '@/components/RouteError';
import { Layout } from '@/components/Layout';
import { StorefrontLayout } from '@/components/StorefrontLayout';
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
import { PetStoriesGallery } from '@/pages/PetStoriesGallery';
import { PetPlay } from '@/pages/PetPlay';
import { PetShop } from '@/pages/PetShop';
import { PetShopCart } from '@/pages/PetShopCart';
import { PetShops } from '@/pages/PetShops';
import { MyShop } from '@/pages/MyShop';
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
import { BlogPost } from '@/pages/BlogPost';
import { BLOG_POST_SLUGS } from '@/content/blogPosts';
import { Careers } from '@/pages/Careers';
import { Feedback } from '@/pages/Feedback';
import { TermsOfService } from '@/pages/TermsOfService';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { NotFound } from '@/pages/NotFound';

export const routes: RouteRecord[] = [
  {
    element: <RootShell />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: <Layout />,
        errorElement: <RouteError />,
        children: [
          { index: true, Component: Home },
          { path: 'login', Component: Login },
          { path: 'register', Component: Register },
          { path: 'forgot-password', Component: ForgotPassword },
          { path: 'reset-password', Component: ResetPassword },
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
          // Nose-work game — front-end only, no scoring backend yet.
          { path: 'pet-play', Component: PetPlay },
          // Pet Shops directory (browse) — inside HiSpike chrome.
          { path: 'petshops', Component: PetShops },
          // Public so visitors can build a pet page before signing up — the
          // /pet-stories is the PUBLIC GALLERY — the nav tab lands here, so a
          // first-time visitor sees real stories instead of an empty form.
          // Creating moves one click in, behind the hero CTA.
          { path: 'pet-stories', Component: PetStoriesGallery },
          // The build-first create/edit flow. Sign-up happens at Publish (see
          // PetPages). Pre-rendered, so it needs its own Render rewrite rule.
          { path: 'pet-stories/create', Component: PetPages },
          {
            path: 'my-shop',
            element: (
              <ProtectedRoute>
                <MyShop />
              </ProtectedRoute>
            ),
          },
          { path: 'about', Component: OurStory },
          { path: 'newsroom', Component: Newsroom },
          { path: 'blog', Component: Blog },
          // Each article is pre-rendered at build time (getStaticPaths) so
          // crawlers get full HTML, not the SPA shell.
          {
            path: 'blog/:slug',
            Component: BlogPost,
            getStaticPaths: () => BLOG_POST_SLUGS.map((s) => `blog/${s}`),
          },
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
      {
        // Public pet-shop storefront — client-rendered, slug-based. Rendered
        // in its own chrome-free shell (no HiSpike navbar/footer) so owners
        // can share it with customers as if it were the shop's own site.
        // Pathless layout route so it doesn't collide with the '/' Layout above.
        element: <StorefrontLayout />,
        errorElement: <RouteError />,
        children: [
          { path: 'petshop/:slug', Component: PetShop },
          { path: 'petshop/:slug/cart', Component: PetShopCart },
        ],
      },
    ],
  },
];
