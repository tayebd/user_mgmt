'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateTaskMutation } from '@/state/api';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const router = useRouter();
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedTask = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate),
        projectId: task.projectId,
        assignedToId: task.assignedToId,
      };

      console.log('Updating task:', {
        taskId: task.id,
        updatedTask,
      });

      await updateTask({
        taskId: task.id,
        task: updatedTask,
      }).unwrap();
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here. Click update when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.values(TaskPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
