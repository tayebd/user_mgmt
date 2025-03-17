'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyCreatorWrapper } from '@/components/surveys/SurveyCreator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiStore } from '@/state/api';
import { useUserAuth } from '@/utils/userAuth';

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [surveyJson, setSurveyJson] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSurvey } = useApiStore();
  const { currentUserId, isLoading } = useUserAuth();


  const handleSurveyJsonChange = (json: string) => {
    setSurveyJson(json);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Only log metadata to avoid large console output
      console.log('Creating survey:', { 
        title, 
        description, 
        jsonLength: surveyJson.length ,
        id: currentUserId
      });

      // Create a Set to track objects for circular reference detection
      const seen = new Set();
      
      // Validate that the JSON is parseable before sending
      try {
        // Just parse to validate, we don't need to use the result
        JSON.parse(surveyJson);
      } catch (parseError) {
        console.error('Invalid survey JSON:', parseError);
        throw new Error('The survey contains invalid JSON. Please check the format.');
      }

      // Validate that the JSON is valid
      try {
        // Parse and stringify to ensure it's valid JSON without circular references
        const parsedJson = JSON.parse(surveyJson);
        // Use a replacer function to handle circular references
        const safeJson = JSON.stringify(parsedJson, (key, value) => {
          // Handle circular references
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular Reference]';
            }
            seen.add(value);
          }
          return value;
        });
        
        // Ensure we have a valid user ID before creating the survey
        if (!currentUserId) {
          console.error('No valid user ID available for survey creation');
          throw new Error('User authentication issue. Please log out and log back in to create a survey.');
        }
        
        console.log('Creating survey with user ID:', currentUserId);
        
        // Create the survey with the string JSON
        const newSurvey = await createSurvey({
          title,
          description,
          surveyJson: safeJson, // Use the safe JSON string
          active: false,
          responseCount: 0,
          targetResponses: 0,
          userId: currentUserId, // Only use the current user ID, no fallback
        });
        
        // Navigate to the new survey
        router.push(`/surveys/${newSurvey.id}`);
      } catch (jsonError) {
        console.error('Error processing survey JSON:', jsonError);
        throw new Error('The survey contains invalid JSON that cannot be serialized. Please check for circular references.');
      }
    } catch (error: unknown) {
      console.error('Failed to create survey:', error);
      alert('Failed to create survey: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Survey</CardTitle>
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
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-4">Survey Builder</h3>
              <SurveyCreatorWrapper onSave={handleSurveyJsonChange} />
            </div>
            
            <Button type="submit" disabled={isSubmitting || !currentUserId || isLoading}>
              {isSubmitting ? 'Creating...' : isLoading ? 'Loading User...' : 'Create Survey'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
