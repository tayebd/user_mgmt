'use client';

import React from 'react';
import { SimpleSurveyCreator } from './SimpleSurveyCreator';

interface SurveyCreatorProps {
  initialJson?: string;
  onSave: (json: string) => void;
}

export function SurveyCreatorWrapper({ initialJson, onSave }: SurveyCreatorProps) {
  return (
    <div className="survey-creator-container">
      <SimpleSurveyCreator initialJson={initialJson} onSave={onSave} />
    </div>
  );
}