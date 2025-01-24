'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/redux";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Settings,
  Search,
  Timer,
  AlertTriangle,
  AlertCircle,
  ChevronFirst,
  ChevronLast,
  LogOut,
} from "lucide-react";
import { setIsSidebarCollapsed } from "@/state";

const Sidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    {
      title: "Pages",
      list: [
        {
          title: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Projects",
          href: "/projects",
          icon: ListTodo,
        },
        {
          title: "Timeline",
          href: "/timeline",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Analytics",
      list: [
        {
          title: "Search",
          href: "/search",
          icon: Search,
        },
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "Tasks",
      list: [
        {
          title: "Urgent",
          href: "/priority/urgent",
          icon: Timer,
        },
        {
          title: "High",
          href: "/priority/high",
          icon: AlertTriangle,
        },
        {
          title: "Medium",
          href: "/priority/medium",
          icon: AlertCircle,
        },
        {
          title: "Low",
          href: "/priority/low",
          icon: AlertCircle,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-black ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex-1 space-y-8 py-4">
          <div className="px-3 py-3">
            <div className="flex items-center justify-between">
              {!isSidebarCollapsed && (
                <span className="text-xl font-bold">Taskify</span>
              )}
              <button
                onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
                className="grid h-6 w-6 place-items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isSidebarCollapsed ? (
                  <ChevronLast className="h-4 w-4" />
                ) : (
                  <ChevronFirst className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <div key={index} className="px-3">
                {!isSidebarCollapsed && (
                  <p className="mb-2 px-4 text-xs uppercase tracking-wider text-gray-400">
                    {item.title}
                  </p>
                )}

                <div className="space-y-1">
                  {item.list.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ${
                          isActive
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            : ""
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {!isSidebarCollapsed && (
                          <span className="text-sm">{item.title}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
