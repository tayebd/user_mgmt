'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import useStore from "@/state";
import { GlobalState } from "@/state";
import { Moon, Search, Settings, Sun, Zap, PanelTop, Calculator } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const isDarkMode = useStore((state: GlobalState) => state.isDarkMode);
  const setIsDarkMode = useStore((state: GlobalState) => state.setIsDarkMode);

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase client not configured');
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left side - Branding and main navigation */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-orange-600 dark:text-orange-400">
          <Zap className="h-6 w-6" />
          Solar PV Designer
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/test"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              pathname === "/test" ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300 hover:text-orange-500"
            }`}
          >
            <Calculator className="h-4 w-4" />
            Project Wizard
          </Link>
          <Link
            href="/pvpanels"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              pathname === "/pvpanels" ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300 hover:text-orange-500"
            }`}
          >
            <PanelTop className="h-4 w-4" />
            PV Panels
          </Link>
          <Link
            href="/inverters"
            className={`text-sm font-medium transition-colors ${
              pathname === "/inverters" ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300 hover:text-orange-500"
            }`}
          >
            Inverters
          </Link>
        </div>
      </div>

      {/* Right side - Search and user actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex h-min w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-orange-400"
            placeholder="Search equipment, projects..."
          />
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <Link
          href="/settings"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>

        <button
          onClick={handleSignOut}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
