'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import useStore from "@/state";
import { GlobalState } from "@/state";
import { Moon, Search, Settings, Sun } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const isDarkMode = useStore((state: GlobalState) => state.isDarkMode);
  const setIsDarkMode = useStore((state: GlobalState) => state.setIsDarkMode);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-800 ml-64">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-semibold">
          Solar Companies
        </Link>
        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
          <input
            type="text"
            className="h-8 w-full rounded-md border border-gray-300 bg-white pl-8 pr-4 text-sm focus:border-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Link
          href="/inverters"
          className={`text-sm ${
            pathname === "/projects" ? "text-blue-500" : "text-gray-700 dark:text-white"
          } hover:text-blue-500`}
        >
          Inverters
        </Link>
        <Link
          href="/pvpanels"
          className={`text-sm ${
            pathname === "/tasks" ? "text-blue-500" : "text-gray-700 dark:text-white"
          } hover:text-blue-500`}
        >
          PV Panels
        </Link>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-gray-700 dark:text-white" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </button>
        <Link
          href="/settings"
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Settings className="h-5 w-5 text-gray-700 dark:text-white" />
        </Link>
        <button
          onClick={handleSignOut}
          className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
