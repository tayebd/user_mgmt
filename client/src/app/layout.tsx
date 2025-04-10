'use client';

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-4">
          <Toaster />
          {children}
        </main>
      </body>
    </html>
  );
}
