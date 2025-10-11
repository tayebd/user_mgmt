import { Model } from 'survey-core';

// Helper function to safely get score from a choice
export const getChoiceScore = (choice: { value: string; score?: number }): number => {
  const score = choice?.score;
  return typeof score === 'number' && !isNaN(score) ? score : 0;
};

// Helper function to calculate max score from choices
export const getMaxScore = (choices: Array<{ value: string; score?: number }> | undefined): number => {
  if (!Array.isArray(choices)) return 0;
  return choices.reduce((max: number, choice) => {
    const score = getChoiceScore(choice);
    return score > max ? score : max;
  }, 0);
};

// Calculate max possible score from all questions
export const calculateMaxScore = (surveyModel: Model): number => {
  try {
    const questions = surveyModel.getAllQuestions();
    return questions.reduce((total: number, question) => {
      const choices = question.choices as Array<{ value: string; score?: number }> | undefined;
      return total + getMaxScore(choices);
    }, 0);
  } catch (error) {
    console.error('Error calculating max score:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error?.constructor?.name,
      timestamp: new Date().toISOString()
    });
    return 0; // Fallback to 0 if calculation fails
  }
};

// Calculate total score from survey data
export const calculateTotalScore = (data: Record<string, unknown>): number => {
  try {
    return Object.values(data).reduce((sum: number, value) => {
      if (value && typeof value === 'object' && 'score' in value) {
        const score = (value as { score: number }).score;
        return typeof score === 'number' && !isNaN(score) ? sum + score : sum;
      }
      return sum;
    }, 0);
  } catch (error) {
    console.error('Score calculation error:', error);
    return 0;
  }
};

// Setup survey completion with score display
export const setupSurveyCompletion = (surveyModel: Model, maxScore: number) => {
  surveyModel.onComplete.add((sender) => {
    try {
      if (!sender.data) {
        throw new Error('Survey data is missing');
      }

      const totalScore = calculateTotalScore(sender.data);

      // Validate scores
      if (totalScore > maxScore) {
        console.warn('Total score exceeds max score:', { totalScore, maxScore });
        maxScore = totalScore; // Adjust max score if needed
      }

      // Update completion text with actual scores
      const roundedTotal = Math.round(totalScore);
      const roundedMax = Math.round(maxScore);

      sender.completedHtml = `<div class="survey-completion">
        <h3 class="text-2xl font-bold mb-4 text-gray-900">Survey Completed!</h3>
        <p class="text-lg text-gray-700 mb-2">You got ${roundedTotal} out of ${roundedMax} points.</p>
        <p class="text-gray-600">Thank you for your feedback!</p>
      </div>`;

      // Log scores for debugging
      console.log('Survey scores:', {
        totalScore: roundedTotal,
        maxScore: roundedMax,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in survey completion:', {
        error,
        timestamp: new Date().toISOString()
      });
      // Fallback to showing completion without scores
      sender.completedHtml = `<div class="survey-completion">
        <h3 class="text-2xl font-bold mb-4 text-gray-900">Survey Completed!</h3>
        <p class="text-gray-600">Thank you for your feedback!</p>
      </div>`;
    }
  });
};