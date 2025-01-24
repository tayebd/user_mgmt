'use client';

import React from 'react';
import { TaskPriority } from '@/types';
import ReusablePriorityPage from '../reusablePriorityPage';

const HighPriorityPage = () => {
  return (
    <ReusablePriorityPage
      priority={TaskPriority.HIGH}
      title="High Priority Tasks"
      description="Important tasks that need to be addressed soon"
    />
  );
};

export default HighPriorityPage;
