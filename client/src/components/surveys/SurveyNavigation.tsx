import React, { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { Button } from '@/components/ui/button';

interface SurveyNavigationProps {
  survey: Model;
}

export function SurveyNavigation({ survey }: SurveyNavigationProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  useEffect(() => {
    const updatePageInfo = () => {
      setCurrentPageIndex(survey.currentPageNo);
      setTotalPages(survey.visiblePages.length);
    };
    
    // Update when the current page changes
    survey.onCurrentPageChanged.add(updatePageInfo);
    
    // Initial update
    updatePageInfo();
    
    return () => {
      survey.onCurrentPageChanged.remove(updatePageInfo);
    };
  }, [survey]);
  
  // const handleStart = () => {
  //   survey.start();
  // };
  
  const handleNextPage = () => {
    const success = survey.nextPage();
    if (!success) {
      console.log('Navigation failed - check validation errors');
    }
  };
  
  const handlePrevPage = () => {
    const success = survey.prevPage();
    if (!success) {
      console.log('Navigation failed - already at first page');
    }
  };
  
  const handleComplete = () => {
    const success = survey.tryComplete();
    if (!success) {
      console.log('Completion failed - check validation errors');
    }
  };
  
  return (
    <div className="flex justify-between items-center mt-6">
      <Button 
        variant="outline" 
        onClick={handlePrevPage}
        disabled={currentPageIndex === 0}
      >
        Previous
      </Button>
      
      <span className="text-sm">
        Page {currentPageIndex + 1} of {totalPages}
      </span>
      
      {currentPageIndex < totalPages - 1 ? (
        <Button onClick={handleNextPage}>
          Next
        </Button>
      ) : (
        <Button onClick={handleComplete}>
          Complete
        </Button>
      )}
    </div>
  );
}