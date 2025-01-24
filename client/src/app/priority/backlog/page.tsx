'use client';

import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { TaskPriority } from "@/types";

const Urgent = () => {
  return (
    <ReusablePriorityPage 
      priority={TaskPriority.LOW}
      title="Backlog Tasks"
      description="View and manage all tasks in your backlog"
    />
  );
};

export default Urgent;
