import { Project } from "@/types";
import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import { useDeleteProjectMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Props = {
  project: Project;
};

const ProjectCard = ({ project }: Props) => {
  const router = useRouter();
  const [deleteProject] = useDeleteProjectMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/projects/${project.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      await deleteProject(project.id).unwrap();
      router.refresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-2xs transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        {/* Action buttons */}
        <div className="absolute right-4 top-4 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleEdit}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isDeleting}
                className="rounded-full p-2 text-red-500 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {project.name}
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {project.description || "No description provided"}
          </p>
        </div>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="mr-2 h-4 w-4" />
            <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
