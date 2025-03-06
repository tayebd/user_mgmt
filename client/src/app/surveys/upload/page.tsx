'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiStore } from '@/state/api';
import { Model } from "survey-core";  
import { Survey } from 'survey-react-ui';
import { toast } from 'sonner';

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
          setSurveyPreview(
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Survey Preview</h4>
              <Survey model={surveyModel} />
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
      
      // Parse the survey JSON to validate it
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const surveyModel = new Model(JSON.parse(surveyJson));
      

      const newSurvey = await createSurvey({
          title,
          description,
          surveyJson,
          active: false,
          responseCount: 0,
          targetResponses: 0,
      });
      
      router.push(`/surveys/${newSurvey.id}`);
    } catch (error: unknown) {
      console.error('Failed to create survey:', error);
      alert('Failed to create survey. Please check your JSON and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Survey from JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Survey Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="jsonUpload" className="text-sm font-medium">Upload Survey JSON</label>
              <Input
                id="jsonUpload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
              />
            </div>
            
            {surveyJson && (
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-4">Uploaded Survey JSON</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(JSON.parse(surveyJson), null, 2)}
                </pre>
              </div>
            )}
            
            {surveyPreview}
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !surveyJson}
            >
              {isSubmitting ? 'Creating...' : 'Create Survey'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
