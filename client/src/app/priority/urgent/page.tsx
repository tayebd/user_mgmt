'use client';

import React from 'react';
import { TaskPriority } from '@/types';
import ReusablePriorityPage from '../reusablePriorityPage';

const UrgentPriorityPage = () => {
  return (
    <ReusablePriorityPage
      priority={TaskPriority.URGENT}
      title="Urgent Tasks"
      description="Tasks that require immediate attention"
    />
  );
};

export default UrgentPriorityPage;
