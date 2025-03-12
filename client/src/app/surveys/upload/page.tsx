'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiStore } from '@/state/api';
import { Model, FunctionFactory } from "survey-core";  
import { Survey } from 'survey-react-ui';
import { toast } from 'sonner';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

function validateIndustry (params: string[]) {
  const value = params[0];
  return value.indexOf("survey");
}

FunctionFactory.Instance.register("validateIndustry", validateIndustry);

export default function LoadSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [surveyJson, setSurveyJson] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyPreview, setSurveyPreview] = useState<React.ReactNode | null>(null);
  const { createSurvey } = useApiStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          // Parse the JSON
          //const jsonObject = JSON.parse(text);
          
          // Set the survey JSON
          setSurveyJson(text);
          
          // Create a preview of the survey
          const surveyModel = new Model(text);
          // Configure the survey model to fit container width
          surveyModel.width = '100%';
          // Configure survey model for responsive layout
          Object.assign(surveyModel, {
            width: '100%',
            questionsOnPageMode: 'singlePage',
            showProgressBar: 'top',
            checkErrorsMode: 'onValueChanged'
          });

          // Handle survey rendering and ensure proper width constraints
          surveyModel.onAfterRenderSurvey.add(() => {
            try {
              const surveyContainer = document.querySelector('.sv_main') as HTMLElement | null;
              if (!surveyContainer) return;

              // Apply container styles
              Object.assign(surveyContainer.style, {
                width: '100%',
                maxWidth: '100%',
                overflowX: 'hidden',
                position: 'relative'
              });

              // Style all child elements for proper width handling
              const elements = surveyContainer.getElementsByTagName('*');
              Array.from(elements).forEach(el => {
                if (el instanceof HTMLElement) {
                  Object.assign(el.style, {
                    maxWidth: '100%',
                    overflowWrap: 'break-word',
                    boxSizing: 'border-box'
                  });

                  // Special handling for specific survey elements
                  if (el.classList.contains('sv_q_title')) {
                    el.style.wordBreak = 'break-word';
                  }
                  if (el.classList.contains('sv_row')) {
                    el.style.width = '100%';
                  }
                }
              });
            } catch (error) {
              console.error('Error applying survey styles:', error);
            }
          });
          setSurveyPreview(
            <div className="mt-4 w-full">
              <h4 className="text-sm font-medium mb-2">Survey Preview</h4>
              <div className="max-w-full overflow-hidden">
                <Survey model={surveyModel} />
              </div>
            </div>
          );
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        toast("Invalid JSON file. Please upload a valid SurveyJS JSON.");
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast("Error reading the file. Please try again.");
    };
    
    // Read the file as text
    reader.readAsText(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!surveyJson) {
      alert('Please upload a survey JSON file first.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      let createdSurvey;
      
      try {
        // Parse the survey JSON to validate it
        const parsedJson = JSON.parse(surveyJson);
        
        // Create a new model instance for validation only
        const surveyModel = new Model(parsedJson);
        
        // Add validation logic
        surveyModel.onValidateQuestion.add((survey, options) => {
          if (options.name === "industry") {
            if (options.value && options.value.indexOf("survey") === -1) {
              options.error = 'Your answer must contain the word "survey"'
            }
          }
        });
        
        // Log what we're about to send - but only the string version of the JSON
        console.log('upload survey:', { title, description, jsonLength: surveyJson.length });
        
        // Send the original JSON string, not the model instance
        createdSurvey = await createSurvey({
          title,
          description,
          surveyJson, // This is already a string
          userId: 1,
          active: false,
          responseCount: 0,
          targetResponses: 100,
        });
      } catch (parseError) {
        console.error('Error parsing survey JSON:', parseError);
        throw new Error('Invalid survey JSON format');
      }
      
      if (createdSurvey) {
        router.push(`/surveys/${createdSurvey.id}/respond`);
      }
    } catch (error: unknown) {
      console.error('Failed to create survey:', error);
      alert('Failed to create survey. Please check your JSON and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <main className="flex-1 p-4 ml-64 overflow-y-auto overflow-x-hidden relative w-[calc(100%-16rem)]">
        <div className="max-w-[calc(100vw-17rem)] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Upload Survey</h1>
            <p className="text-gray-600 mt-2">Create a new survey from a JSON file</p>
          </div>
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Surveys
          </Button>
        </div>

        <Card className="bg-blue-50 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Upload className="mr-2 h-5 w-5" />
              Upload Survey JSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-700">Survey Title</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  placeholder="Enter survey title"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  placeholder="Enter survey description"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="jsonUpload" className="text-sm font-medium text-gray-700">Upload Survey JSON</label>
              <div className="flex items-center space-x-2">
                <Input
                  id="jsonUpload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                  onClick={() => document.getElementById('jsonUpload')?.click()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
            
            {surveyJson && (
              <div className="border border-blue-200 rounded-md p-4 bg-white mt-6">
                <h3 className="text-sm font-medium mb-4 text-blue-700">Uploaded Survey JSON</h3>
                <div className="overflow-x-auto max-w-full">
                  <pre className="text-xs bg-blue-50 p-4 rounded border border-blue-100 max-h-60 whitespace-pre-wrap break-all overflow-x-hidden">
                    {JSON.stringify(JSON.parse(surveyJson), null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {surveyPreview && (
              <div className="border border-blue-200 rounded-md p-4 bg-white mt-6">
                <h3 className="text-sm font-medium mb-4 text-blue-700">Survey Preview</h3>
                <div className="bg-blue-50 p-4 rounded border border-blue-100 overflow-y-auto max-h-[60vh] overflow-x-hidden">
                  <div className="max-w-full overflow-hidden">
                    <div className="survey-container w-full mx-auto px-4" style={{ maxWidth: 'min(100%, 800px)' }}>
                      {surveyPreview}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="sticky bottom-0 bg-white py-4 border-t mt-6">
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !surveyJson}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Survey'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  );
}
