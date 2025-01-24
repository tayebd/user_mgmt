import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { TaskStatus } from "@/types";

type Props = {
  projectId: string;
  setIsModalNewTaskOpen?: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ projectId, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery(projectId);

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.map((task) => {
      // Set default dates if not provided
      const start = task.createdAt ? new Date(task.createdAt) : new Date();
      const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000); // Default to 1 day duration

      return {
        start,
        end,
        name: task.title,
        id: `Task-${task.id}`,
        type: "task" as TaskTypeItems,
        progress: task.status === TaskStatus.COMPLETED ? 100 : task.status === TaskStatus.IN_PROGRESS ? 50 : 0,
        isDisabled: false,
        project: projectId,
      };
    });
  }, [tasks, projectId]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !tasks) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading project timeline</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Tasks Timeline</h2>
        <select
          className="rounded-md border border-gray-300 px-3 py-1.5"
          value={displayOptions.viewMode}
          onChange={handleViewModeChange}
        >
          <option value={ViewMode.Month}>Month</option>
          <option value={ViewMode.Week}>Week</option>
          <option value={ViewMode.Day}>Day</option>
        </select>
      </div>

      <div className="flex-1">
        {ganttTasks.length > 0 ? (
          <Gantt
            tasks={ganttTasks}
            viewMode={displayOptions.viewMode}
            locale={displayOptions.locale}
            listCellWidth="100px"
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            barBackgroundColor={isDarkMode ? "#101214" : "#aeb8c2"}
            barBackgroundSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">No tasks found in this project</p>
          </div>
        )}
      </div>
      {setIsModalNewTaskOpen && (
        <div className="px-4 pb-5 pt-1">
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add New Task
          </button>
        </div>
      )}
    </div>
  );
};

export default Timeline;
