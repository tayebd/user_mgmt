import {
  getChoiceScore,
  getMaxScore,
  calculateMaxScore,
  calculateTotalScore,
  setupSurveyCompletion,
} from '../SurveyScoreCalculator';
import { Model } from 'survey-core';

// Define types for test objects
interface Choice {
  value: string;
  score?: number;
}

interface Question {
  choices?: Choice[] | undefined;
}

// Mock SurveyModel that implements the minimum required interface
const createMockSurveyModel = () => ({
  getAllQuestions: jest.fn(),
  onComplete: {
    add: jest.fn(),
  },
  completedHtml: '',
  data: {},
});

interface SurveySender {
  data: Record<string, unknown> | null;
  completedHtml: string;
}

// Mock SurveyJS Model
const mockModel = createMockSurveyModel();

describe('SurveyScoreCalculator', () => {
  describe('getChoiceScore', () => {
    it('should return score from choice object', () => {
      const choice = { value: 'option1', score: 5 };
      expect(getChoiceScore(choice)).toBe(5);
    });

    it('should return 0 for choice without score', () => {
      const choice = { value: 'option1' };
      expect(getChoiceScore(choice)).toBe(0);
    });

    it('should return 0 for choice with invalid score', () => {
      const choice = { value: 'option1', score: NaN };
      expect(getChoiceScore(choice)).toBe(0);
    });

    it('should return 0 for undefined choice', () => {
      expect(getChoiceScore(undefined as unknown as Choice)).toBe(0);
    });
  });

  describe('getMaxScore', () => {
    it('should calculate max score from choices array', () => {
      const choices = [
        { value: 'option1', score: 1 },
        { value: 'option2', score: 3 },
        { value: 'option3', score: 2 },
      ];
      expect(getMaxScore(choices)).toBe(3);
    });

    it('should return 0 for empty choices array', () => {
      expect(getMaxScore([])).toBe(0);
    });

    it('should return 0 for undefined choices', () => {
      expect(getMaxScore(undefined)).toBe(0);
    });

    it('should handle choices without scores', () => {
      const choices = [
        { value: 'option1' },
        { value: 'option2', score: 2 },
        { value: 'option3' },
      ];
      expect(getMaxScore(choices)).toBe(2);
    });
  });

  describe('calculateMaxScore', () => {
    it('should calculate total max score from all questions', () => {
      const questions = [
        {
          choices: [
            { value: 'option1', score: 1 },
            { value: 'option2', score: 3 },
          ],
        },
        {
          choices: [
            { value: 'optionA', score: 2 },
            { value: 'optionB', score: 4 },
          ],
        },
      ];

      mockModel.getAllQuestions.mockReturnValue(questions);

      const maxScore = calculateMaxScore(mockModel as unknown as Model);

      expect(maxScore).toBe(7); // 3 + 4
    });

    it('should handle questions without choices', () => {
      const questions = [
        { choices: undefined },
        { choices: [{ value: 'option1', score: 2 }] },
      ];

      mockModel.getAllQuestions.mockReturnValue(questions);

      const maxScore = calculateMaxScore(mockModel as unknown as Model);

      expect(maxScore).toBe(2);
    });

    it('should return 0 when getAllQuestions throws error', () => {
      mockModel.getAllQuestions.mockImplementation(() => {
        throw new Error('Test error');
      });

      const maxScore = calculateMaxScore(mockModel as unknown as Model);

      expect(maxScore).toBe(0);
    });
  });

  describe('calculateTotalScore', () => {
    it('should calculate total score from survey data', () => {
      const data = {
        question1: { score: 5 },
        question2: { score: 3 },
        question3: { score: 2 },
      };

      expect(calculateTotalScore(data)).toBe(10);
    });

    it('should ignore non-object values', () => {
      const data = {
        question1: { score: 5 },
        question2: 'string value',
        question3: 123,
        question4: { score: 3 },
      };

      expect(calculateTotalScore(data)).toBe(8);
    });

    it('should handle values without score property', () => {
      const data = {
        question1: { score: 5 },
        question2: { otherProperty: 10 },
        question3: { score: 3 },
      };

      expect(calculateTotalScore(data)).toBe(8);
    });

    it('should handle invalid score values', () => {
      const data = {
        question1: { score: 5 },
        question2: { score: NaN },
        question3: { score: 'invalid' },
        question4: { score: 3 },
      };

      expect(calculateTotalScore(data)).toBe(8);
    });

    it('should return 0 for empty data', () => {
      expect(calculateTotalScore({})).toBe(0);
    });

    it('should return 0 when calculation throws error', () => {
      const invalidData = {
        question1: {
          get score() {
            throw new Error('Test error');
          },
        },
      };

      expect(calculateTotalScore(invalidData)).toBe(0);
    });
  });

  describe('setupSurveyCompletion', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockModel.completedHtml = '';
    });

    it('should setup completion handler with score display', () => {
      const maxScore = 10;

      setupSurveyCompletion(mockModel as unknown as Model, maxScore);

      expect(mockModel.onComplete.add).toHaveBeenCalled();

      // Call the completion handler
      const completionHandler = mockModel.onComplete.add.mock.calls[0][0];
      const sender = {
        data: {
          question1: { score: 7 },
          question2: { score: 2 },
        },
        completedHtml: '',
      };

      completionHandler(sender);

      expect(sender.completedHtml).toContain('You got 9 out of 10 points');
    });

    it('should handle missing survey data gracefully', () => {
      const maxScore = 10;

      setupSurveyCompletion(mockModel as unknown as Model, maxScore);

      const completionHandler = mockModel.onComplete.add.mock.calls[0][0];
      const sender = {
        data: null,
        completedHtml: '',
      };

      completionHandler(sender);

      expect(sender.completedHtml).toContain('Survey Completed!');
      expect(sender.completedHtml).not.toContain('points');
    });

    it('should adjust max score when total exceeds it', () => {
      const maxScore = 5;

      setupSurveyCompletion(mockModel as unknown as Model, maxScore);

      const completionHandler = mockModel.onComplete.add.mock.calls[0][0];
      const sender = {
        data: {
          question1: { score: 10 },
        },
        completedHtml: '',
      };

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      completionHandler(sender);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Total score exceeds max score:',
        { totalScore: 10, maxScore: 5 }
      );
      expect(sender.completedHtml).toContain('You got 10 out of 10 points');

      consoleWarnSpy.mockRestore();
    });

    it('should handle errors in completion handler', () => {
      const maxScore = 10;

      setupSurveyCompletion(mockModel as unknown as Model, maxScore);

      const completionHandler = mockModel.onComplete.add.mock.calls[0][0];
      const sender = {
        get data() {
          throw new Error('Test error');
        },
        completedHtml: '',
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      completionHandler(sender);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in survey completion:', {
        error: expect.any(Error),
        timestamp: expect.any(String),
      });
      expect(sender.completedHtml).toContain('Survey Completed!');
      expect(sender.completedHtml).not.toContain('points');

      consoleErrorSpy.mockRestore();
    });
  });
});