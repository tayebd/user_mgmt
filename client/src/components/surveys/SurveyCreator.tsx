'use client';

import React, { useEffect } from 'react';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';

interface SurveyCreatorProps {
  initialJson?: string;
  onSave: (json: string) => void;
}

export function SurveyCreatorWrapper({ initialJson, onSave }: SurveyCreatorProps) {
  const creatorOptions = {
    showLogicTab: true,
    isAutoSave: true
  };
  
  const creator = new SurveyCreator(creatorOptions);
  
  // Load initial survey JSON if available
  useEffect(() => {
    if (initialJson) {
      creator.text = initialJson;
    }
  }, [creator, initialJson]);
  
  // Handle save event
  creator.saveSurveyFunc = (saveNo: number, callback: (no: number, isSuccess: boolean) => void) => {
    // Get the survey JSON
    const json = JSON.parse(creator.text);
    onSave(json);
    callback(saveNo, true);
  };
  
  return (
    <div className="survey-creator-container">
      <SurveyCreatorComponent creator={creator} />
    </div>
  );
}