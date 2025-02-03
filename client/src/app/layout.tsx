import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import WelcomePage from "./welcome/page";
import useStore from '@/state';

export const metadata: Metadata = {
  title: "Project Management App",
  description: "A modern project management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans bg-gray-50 dark:bg-gray-900">
        <AuthProvider>
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
