import { Routes, Route } from 'react-router-dom';
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
import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Auth pages (no layout wrapper) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main layout */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dogs" element={<Dogs />} />
        <Route path="dogs/:id" element={<DogDetail />} />
        <Route path="swimming" element={<Swimming />} />
        <Route path="hospital" element={<Hospital />} />
        <Route path="park" element={<Park />} />
        <Route path="grooming" element={<Grooming />} />

        {/* Protected routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-dogs"
          element={
            <ProtectedRoute>
              <MyDogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-dogs/new"
          element={
            <ProtectedRoute>
              <NewDog />
            </ProtectedRoute>
          }
        />
        <Route
          path="adoptions"
          element={
            <ProtectedRoute>
              <Adoptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
