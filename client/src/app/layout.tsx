'use client';

import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import useStore from '@/state';
import { usePathname } from 'next/navigation';
import { metadata } from './metadata';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = pathname ? !['/login'].includes(pathname) : false;

  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans bg-gray-50 dark:bg-gray-900 flex">
        <AuthProvider>
          {showSidebar && <Sidebar />}
          <div className="flex-1 flex flex-col">
          {showSidebar && <Navbar />}
            <main className="flex-1 p-4">
              <Toaster />
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
