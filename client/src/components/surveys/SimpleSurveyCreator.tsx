'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface Question {
  id: string;
  type: 'text' | 'rating' | 'choice' | 'checkbox' | 'dropdown';
  title: string;
  description?: string;
  required?: boolean;
  choices?: string[];
  maxRating?: number;
}

interface SurveyJson {
  title: string;
  description: string;
  questions: Question[];
  completedHtml?: string;
}

interface SimpleSurveyCreatorProps {
  initialJson?: string;
  onSave: (json: string) => void;
}

// Default survey template
const defaultSurvey: SurveyJson = {
  title: "New Survey",
  description: "Please answer the following questions",
  questions: [
    {
      id: "q1",
      type: "rating",
      title: "How satisfied are you with our service?",
      description: "Rate from 1 to 5",
      required: true,
      maxRating: 5
    },
    {
      id: "q2",
      type: "choice",
      title: "Which features do you use most?",
      choices: ["Feature A", "Feature B", "Feature C"],
      required: true
    },
    {
      id: "q3",
      type: "text",
      title: "Additional feedback",
      description: "Any comments or suggestions?"
    }
  ],
  completedHtml: "<h3>Thank you for completing the survey!</h3><p>Your feedback is valuable to us.</p>"
};

// Convert our format to SurveyJS format
export const convertToSurveyJSFormat = (survey: SurveyJson): string => {
  const surveyJsFormat = {
    title: survey.title,
    description: survey.description,
    completedHtml: survey.completedHtml,
    pages: [
      {
        name: "page1",
        elements: survey.questions.map(q => {
          const element: any = {
            name: q.id,
            type: q.type === 'choice' ? 'radiogroup' :
                   q.type === 'checkbox' ? 'checkbox' :
                   q.type === 'dropdown' ? 'dropdown' :
                   q.type === 'rating' ? 'rating' : 'text',
            title: q.title
          };

          if (q.description) {
            element.description = q.description;
          }

          if (q.required) {
            element.isRequired = true;
          }

          if (q.choices && q.choices.length > 0) {
            element.choices = q.choices.map((choice, index) => ({
              value: choice,
              text: choice
            }));
          }

          if (q.type === 'rating' && q.maxRating) {
            element.maxRateDescription = "Very Good";
            element.minRateDescription = "Very Poor";
            element.rateMax = q.maxRating;
          }

          return element;
        })
      }
    ]
  };

  return JSON.stringify(surveyJsFormat, null, 2);
};

export function SimpleSurveyCreator({ initialJson, onSave }: SimpleSurveyCreatorProps) {
  const [survey, setSurvey] = useState<SurveyJson>(() => {
    if (initialJson) {
      try {
        // Try to parse existing JSON and convert it to our format
        const parsed = JSON.parse(initialJson);
        // For now, start with default if parsing existing format is complex
        return defaultSurvey;
      } catch (error) {
        console.error('Error parsing initial JSON:', error);
        return defaultSurvey;
      }
    }
    return defaultSurvey;
  });

  const [newQuestionType, setNewQuestionType] = useState<Question['type']>('text');

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: newQuestionType,
      title: `New ${newQuestionType} question`,
      required: false
    };

    if (newQuestionType === 'rating') {
      newQuestion.maxRating = 5;
    } else if (['choice', 'checkbox', 'dropdown'].includes(newQuestionType)) {
      newQuestion.choices = ['Option 1', 'Option 2', 'Option 3'];
    }

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addChoice = (questionIndex: number) => {
    const newChoice = `Option ${Date.now()}`;
    updateQuestion(questionIndex, {
      choices: [...(survey.questions[questionIndex].choices || []), newChoice]
    });
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const choices = [...(survey.questions[questionIndex].choices || [])];
    choices[choiceIndex] = value;
    updateQuestion(questionIndex, { choices });
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const choices = [...(survey.questions[questionIndex].choices || [])];
    choices.splice(choiceIndex, 1);
    updateQuestion(questionIndex, { choices });
  };

  const handleSave = () => {
    const surveyJsJson = convertToSurveyJSFormat(survey);
    onSave(surveyJsJson);
  };

  return (
    <div className="space-y-6">
      {/* Survey Info */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="survey-title">Title</Label>
            <Input
              id="survey-title"
              value={survey.title}
              onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Survey title"
            />
          </div>
          <div>
            <Label htmlFor="survey-description">Description</Label>
            <Textarea
              id="survey-description"
              value={survey.description}
              onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Survey description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({survey.questions.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={newQuestionType} onValueChange={(value: Question['type']) => setNewQuestionType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="choice">Multiple Choice</SelectItem>
                  <SelectItem value="checkbox">Checkboxes</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {survey.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions yet. Add your first question above.
            </div>
          ) : (
            <div className="space-y-4">
              {survey.questions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{question.type}</Badge>
                          {question.required && <Badge variant="default">Required</Badge>}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label>Question Title</Label>
                            <Input
                              value={question.title}
                              onChange={(e) => updateQuestion(index, { title: e.target.value })}
                              placeholder="Enter your question"
                            />
                          </div>

                          <div>
                            <Label>Description (optional)</Label>
                            <Input
                              value={question.description || ''}
                              onChange={(e) => updateQuestion(index, { description: e.target.value })}
                              placeholder="Additional context for the question"
                            />
                          </div>

                          {question.type === 'rating' && (
                            <div>
                              <Label>Maximum Rating</Label>
                              <Input
                                type="number"
                                min="3"
                                max="10"
                                value={question.maxRating || 5}
                                onChange={(e) => updateQuestion(index, { maxRating: parseInt(e.target.value) })}
                              />
                            </div>
                          )}

                          {['choice', 'checkbox', 'dropdown'].includes(question.type) && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Choices</Label>
                                <Button
                                  onClick={() => addChoice(index)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Choice
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {question.choices?.map((choice, choiceIndex) => (
                                  <div key={choiceIndex} className="flex items-center gap-2">
                                    <Input
                                      value={choice}
                                      onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                                      placeholder={`Choice ${choiceIndex + 1}`}
                                    />
                                    <Button
                                      onClick={() => removeChoice(index, choiceIndex)}
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={question.required || false}
                              onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                            />
                            <Label htmlFor={`required-${index}`}>Required question</Label>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeQuestion(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Survey
        </Button>
      </div>
    </div>
  );
}