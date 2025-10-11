'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WelcomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <p className="text-gray-600">You have successfully logged in.</p>
        <p className="mt-2">Email: {user.email}</p>
        <p className="mt-4">Thank you for joining Solar Project Manager.</p>
        {/* You can add more content or links here */}
      </div>
    </div>
  );
}
