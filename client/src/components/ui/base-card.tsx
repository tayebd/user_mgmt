/**
 * Base Card Component
 * A unified, configurable card component to replace custom card implementations
 * Provides consistent styling and behavior across the application
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const baseCardVariants = cva(
  "group relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border hover:shadow-md",
        elevated: "border-border shadow-md hover:shadow-lg hover:-translate-y-1",
        outlined: "border-2 border-border hover:border-primary",
        ghost: "border-transparent shadow-none hover:bg-accent",
        interactive: "border-border hover:shadow-md hover:border-primary cursor-pointer",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      size: "default",
    },
  }
);

export interface BaseCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof baseCardVariants> {
  asChild?: boolean;
  hover?: boolean;
  interactive?: boolean;
}

const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, variant, padding, size, hover, interactive, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <div
          ref={ref}
          className={cn(
            baseCardVariants({ variant, padding, size }),
            hover && "hover:shadow-md",
            interactive && "cursor-pointer hover:border-primary",
            className
          )}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseCardVariants({ variant, padding, size }),
          hover && "hover:shadow-md",
          interactive && "cursor-pointer hover:border-primary",
          className
        )}
        {...props}
      />
    );
  }
);
BaseCard.displayName = "BaseCard";

const BaseCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
BaseCardHeader.displayName = "BaseCardHeader";

const BaseCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
BaseCardTitle.displayName = "BaseCardTitle";

const BaseCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
BaseCardDescription.displayName = "BaseCardDescription";

const BaseCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
BaseCardContent.displayName = "BaseCardContent";

const BaseCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
BaseCardFooter.displayName = "BaseCardFooter";

export {
  BaseCard,
  BaseCardHeader,
  BaseCardFooter,
  BaseCardTitle,
  BaseCardDescription,
  BaseCardContent,
};