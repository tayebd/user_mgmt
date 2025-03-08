'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyCreatorWrapper } from '@/components/surveys/SurveyCreator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// import { createSurvey } from '@/state/api';
// import Sidebar from '@/components/Sidebar';
// import SurveyManagement from '@/components/Survey/SurveyManagement';
import { useApiStore } from '@/state/api';

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [surveyJson, setSurveyJson] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSurvey }  = useApiStore();


  const handleSurveyJsonChange = (json: string) => {
    setSurveyJson(json);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      console.log('create survey:', { title, description, surveyJson });

      const newSurvey = await createSurvey({
        title,
        description,
        surveyJson,
        active: false,
        responseCount: 0,
        targetResponses: 0,
        userId: 28,
      });
      
      router.push(`/surveys/${newSurvey.id}`);
    } catch (error: unknown) {
      console.error('Failed to create survey:', error);
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
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Survey'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
