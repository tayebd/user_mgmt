'use client';

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ErrorFallback } from "@/components/ui/error-fallback";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-4">
          <ErrorBoundary fallback={ErrorFallback}>
            <AuthProvider>
              <Toaster />
              {children}
            </AuthProvider>
          </ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
