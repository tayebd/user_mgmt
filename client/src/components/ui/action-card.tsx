/**
 * Action Card Component
 * A card component with built-in action buttons (edit, delete, view, etc.)
 * Replaces custom card implementations with inconsistent action patterns
 */

import * as React from "react";
import { MoreHorizontal, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BaseCard, BaseCardContent, BaseCardHeader, BaseCardTitle } from "./base-card";
import { cn } from "@/lib/utils";

export interface ActionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: ActionCardAction[];
  variant?: "default" | "elevated" | "outlined" | "ghost" | "interactive";
  padding?: "none" | "sm" | "default" | "lg";
  className?: string;
  href?: string;
  onClick?: () => void;
}

export interface ActionCardAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  disabled?: boolean;
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({
    title,
    description,
    children,
    actions = [],
    variant = "default",
    padding = "default",
    className,
    href,
    onClick,
    ...props
  }, ref) => {
    const cardContent = (
      <BaseCard
        ref={ref}
        variant={variant}
        padding={padding}
        className={cn(
          "group",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <BaseCardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <BaseCardTitle className="truncate">{title}</BaseCardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            {actions.length > 0 && (
              <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {actions.length <= 3 ? (
                  // Render as individual buttons for 3 or fewer actions
                  <div className="flex items-center gap-1">
                    {actions.map((action) => (
                      <ActionCardButton key={action.id} action={action} />
                    ))}
                  </div>
                ) : (
                  // Render as dropdown menu for more than 3 actions
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action) => (
                        <ActionCardMenuItem key={action.id} action={action} />
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </BaseCardHeader>
        <BaseCardContent>{children}</BaseCardContent>
      </BaseCard>
    );

    if (href) {
      return (
        <a href={href} className="block hover:no-underline">
          {cardContent}
        </a>
      );
    }

    return cardContent;
  }
);
ActionCard.displayName = "ActionCard";

// Helper component for rendering individual action buttons
const ActionCardButton = ({ action }: { action: ActionCardAction }) => {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleAction = () => {
    if (action.requiresConfirmation && !isConfirming) {
      setIsConfirming(true);
    } else {
      action.onClick();
      setIsConfirming(false);
    }
  };

  if (action.requiresConfirmation) {
    return (
      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={action.disabled}
          >
            {action.icon || <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action.confirmationTitle || `Confirm ${action.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action.confirmationDescription || `Are you sure you want to ${action.label.toLowerCase()}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {action.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={handleAction}
      disabled={action.disabled}
    >
      {action.icon || <MoreHorizontal className="h-4 w-4" />}
    </Button>
  );
};

// Helper component for dropdown menu items
const ActionCardMenuItem = ({ action }: { action: ActionCardAction }) => {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleAction = () => {
    if (action.requiresConfirmation && !isConfirming) {
      setIsConfirming(true);
    } else {
      action.onClick();
      setIsConfirming(false);
    }
  };

  if (action.requiresConfirmation) {
    return (
      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsConfirming(true);
            }}
            disabled={action.disabled}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action.confirmationTitle || `Confirm ${action.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action.confirmationDescription || `Are you sure you want to ${action.label.toLowerCase()}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {action.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <DropdownMenuItem
      onClick={handleAction}
      disabled={action.disabled}
      className={cn(
        action.variant === "destructive" && "text-destructive focus:text-destructive"
      )}
    >
      {action.icon}
      {action.label}
    </DropdownMenuItem>
  );
};

export { ActionCard };
export default ActionCard;