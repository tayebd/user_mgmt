'use client';

import React from 'react';
import { TaskPriority } from '@/types';
import ReusablePriorityPage from '../reusablePriorityPage';

const LowPriorityPage = () => {
  return (
    <ReusablePriorityPage
      priority={TaskPriority.LOW}
      title="Low Priority Tasks"
      description="Tasks that can be completed when time permits"
    />
  );
};

export default LowPriorityPage;
