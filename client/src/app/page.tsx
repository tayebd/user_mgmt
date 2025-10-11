'use client';

import Link from "next/link";
import { Calculator, PanelTop, Zap, TrendingUp, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Design Your Perfect
          <span className="text-orange-600 dark:text-orange-400 block">Solar PV System</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Professional-grade solar project design made simple. Calculate, configure, and optimize your solar installation with our intuitive wizard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/test"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg"
          >
            <Calculator className="h-5 w-5" />
            Start Project Wizard
          </Link>
          <Link
            href="/pvpanels"
            className="inline-flex items-center gap-2 border border-gray-300 hover:border-orange-500 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            <PanelTop className="h-5 w-5" />
            Browse Equipment
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
            <Calculator className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step-by-Step Wizard</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Guided design process from site assessment to final system configuration with real-time calculations.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Analysis</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Accurate energy production estimates and ROI calculations based on your specific location and equipment.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Code Compliance</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Automatic validation against NEC standards and local regulations for safe, compliant installations.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/test"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <Calculator className="h-5 w-5 text-orange-600" />
            <span className="font-medium">New Project</span>
          </Link>
          <Link
            href="/pvpanels"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <PanelTop className="h-5 w-5 text-blue-600" />
            <span className="font-medium">PV Panels</span>
          </Link>
          <Link
            href="/inverters"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Zap className="h-5 w-5 text-green-600" />
            <span className="font-medium">Inverters</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <Users className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
