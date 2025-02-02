// /app/projects/[id]/ProjectContent.tsx
"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import Board from "@/app/projects/BoardView";
import List from "@/app/projects/ListView";
import Timeline from "@/app/projects/TimelineView";
import Table from "@/app/projects/TableView";
import ModalNewTask from "@/components/ModalNewTask";

interface ProjectContentProps {
  id: string;
}

export default function ProjectContent({ id }: ProjectContentProps) {
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        projectId={id}
      />
      <ProjectHeader 
        projectId={id} 
        onNewTask={() => setIsModalNewTaskOpen(true)}
      />
      {activeTab === "Board" && (
        <Board projectId={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "List" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Timeline" && (
        <Timeline projectId={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
}
