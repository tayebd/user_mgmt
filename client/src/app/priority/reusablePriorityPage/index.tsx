import React, { useEffect, useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types";
import { useGetTasksByUserQuery } from "@/state/api";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header";
import { useAuthState } from "react-firebase-hooks/auth";

interface ReusablePriorityPageProps {
  priority: TaskPriority;
}

const ReusablePriorityPage: React.FC<ReusablePriorityPageProps> = ({
  priority,
}) => {
  const [user, userLoading] = useAuthState(auth);
  const { data: userTasks, isLoading: tasksLoading } = useGetTasksByUserQuery(
    user?.uid || '', 
    { 
      skip: !user?.uid 
    }
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const isLoading = userLoading || tasksLoading;

  useEffect(() => {
    if (userTasks) {
      const filteredTasks = userTasks.filter((task) => task.priority === priority);
      setTasks(filteredTasks);
    }
  }, [userTasks, priority]);

  if (userLoading) {
    return (
      <div className="m-6 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="m-6 p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-6 p-4">
      <Header
        name={`${priority} Priority Tasks`}
      />
      <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
        List of your {priority.toLowerCase()} priority tasks
      </p>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No {priority.toLowerCase()} priority tasks found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                          task.status === TaskStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${task.priority === TaskPriority.HIGH ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 
                          task.priority === TaskPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
                          'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReusablePriorityPage;
