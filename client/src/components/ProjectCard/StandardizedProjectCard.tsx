/**
 * Standardized ProjectCard Component
 * Refactored to use the new standardized UI components
 * Replaces custom card implementation with ActionCard
 */

import React from "react";
import Link from "next/link";
import { Calendar, Clock, Edit2, Trash2, Eye, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApiStore } from "@/state/api";
import ActionCard from "@/components/ui/action-card";
import type { Project } from "@/types";

type Props = {
  project: Project;
  variant?: "default" | "elevated" | "outlined";
  showActions?: boolean;
  className?: string;
};

const StandardizedProjectCard = ({
  project,
  variant = "elevated",
  showActions = true,
  className
}: Props) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { deleteProject } = useApiStore();

  const handleEdit = () => {
    router.push(`/projects/${project.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(project.id);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    router.push(`/projects/${project.id}`);
  };

  // Define actions for the card
  const actions = showActions ? [
    {
      id: 'view',
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
      variant: 'default' as const,
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit2 className="h-4 w-4" />,
      onClick: handleEdit,
      variant: 'default' as const,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: 'destructive' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Delete Project',
      confirmationDescription: 'Are you sure you want to delete this project? This action cannot be undone.',
      disabled: isDeleting,
    }
  ] : [];

  // Format project dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ActionCard
      title={project.name}
      description={project.description || 'No description available'}
      actions={actions}
      variant={variant}
      className={className}
      href={showActions ? undefined : `/projects/${project.id}`}
    >
      <div className="space-y-4">
        {/* Project metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Start: {formatDate(project.startDate)}</span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>End: {formatDate(project.endDate)}</span>
            </div>
          )}
        </div>

        {/* Project status */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {project.status}
          </span>
        </div>

        {/* Project members */}
        {project.members && project.members.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Team:</span>
            <span className="ml-2">{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Task count */}
        {project.tasks && project.tasks.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Tasks:</span>
            <span className="ml-2">{project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Company information if available */}
        {project.companyId && (
          <div className="text-sm">
            <span className="font-medium">Company ID:</span>
            <span className="ml-2">#{project.companyId}</span>
          </div>
        )}
      </div>
    </ActionCard>
  );
};

export default StandardizedProjectCard;