import 'survey-core/defaultV2.min.css';
import React, { useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';

// interface SurveyDisplayProps {
//   surveyJson: Record<string, string>;
//   onComplete: (sender: Record<string, string>) => void;
// }

// export function SurveyDisplay({ surveyJson, onComplete }: SurveyDisplayProps) {
//   const survey = new Model(surveyJson);
  
//   survey.onComplete.add(onComplete);
  
//   return (
//     <div className="survey-container">
//       <Survey model={survey} />
//     </div>
//   );
// }

interface SurveyDisplayProps {
  survey: Model;
  onComplete: (survey: Model) => void;
}

const SurveyDisplay: React.FC<SurveyDisplayProps> = ({ survey, onComplete }) => {
  useEffect(() => {
    // Add completion handler
    survey.onComplete.add((sender) => {
      onComplete(sender);
    });
  }, [survey, onComplete]);

  return <Survey model={survey} />;
};

export default SurveyDisplay;