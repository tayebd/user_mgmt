'use client';

import { Login } from '@/components/Auth/Login';

export default function LoginPage() {
  return (
    <div className="flex">
      <div className="min-h-screen flex items-center justify-center bg-gray-100 flex-1">
        <Login />
      </div>
    </div>
  );
}
