'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useGetProjectQuery, useUpdateTaskMutation } from '@/state/api';
import { MoreVertical, MessageSquare, Plus } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import { TaskStatus, Task } from '@/types';
import { Button } from "@/components/ui/button";

interface BoardViewProps {
  projectId: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ projectId, setIsModalNewTaskOpen }) => {
  const { data: project, isLoading } = useGetProjectQuery(projectId);
  const [updateTask] = useUpdateTaskMutation();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading project</p>
      </div>
    );
  }

  const columns = [
    { id: TaskStatus.NOT_STARTED, title: 'Not Started' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
    { id: TaskStatus.COMPLETED, title: 'Completed' },
    { id: TaskStatus.ON_HOLD, title: 'On Hold' },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return project.tasks.filter(task => task.status === status);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const task = project.tasks.find(t => t.id === draggableId);
    if (!task) return;

    try {
      await updateTask({
        taskId: task.id,
        task: {
          status: destination.droppableId as TaskStatus,
        }
      }).unwrap();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex h-full w-80 flex-none flex-col rounded-lg bg-gray-100 p-2"
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <h3 className="text-sm font-medium text-gray-900">{column.title}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsModalNewTaskOpen(true)}>
                <Plus className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-2 overflow-y-auto"
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default BoardView;
