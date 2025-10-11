'use client';

import React from 'react';
import { Survey } from '@/types';

interface SurveyLayoutProps {
  survey: Survey;
  children: React.ReactNode;
}

export function SurveyLayout({ survey, children }: SurveyLayoutProps) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{survey.title}</h1>

      {survey.description && (
        <p className="text-gray-600 mb-6">{survey.description}</p>
      )}

      {children}
    </div>
  );
}