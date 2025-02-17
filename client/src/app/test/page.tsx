'use client'

import { ProjectWizard } from '@/components/ProjectWizard/ProjectWizard';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Project Wizard Test</h1>
      <ProjectWizard />
    </div>
  );
} 