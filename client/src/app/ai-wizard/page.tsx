'use client';

import { AIProjectWizard } from '@/components/ProjectWizard/AIProjectWizard';

export default function AIWizardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Solar Design Wizard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Get a complete solar system design in seconds using our AI-powered algorithms. Just provide basic requirements and let our intelligent system do the rest.
          </p>
        </div>
        <AIProjectWizard />
      </div>
    </div>
  );
}