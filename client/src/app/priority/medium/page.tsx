'use client';

import React from 'react';
import { TaskPriority } from '@/types';
import ReusablePriorityPage from '../reusablePriorityPage';

const MediumPriorityPage = () => {
  return (
    <ReusablePriorityPage
      priority={TaskPriority.MEDIUM}
      title="Medium Priority Tasks"
      description="Tasks that should be completed after high priority items"
    />
  );
};

export default MediumPriorityPage;
