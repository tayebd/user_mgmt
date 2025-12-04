/**
 * Enhanced Container Component
 * A flexible container component with responsive sizing and padding options
 * Replaces the basic layout container with more features
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const containerVariants = cva(
  "w-full mx-auto",
  {
    variants: {
      size: {
        sm: "max-w-2xl",
        default: "max-w-4xl",
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-full",
        fluid: "max-w-none",
        "2xl": "max-w-8xl",
        "3xl": "max-w-9xl",
        "4xl": "max-w-10xl",
      },
      padding: {
        none: "px-0",
        sm: "px-4",
        default: "px-6",
        lg: "px-8",
        xl: "px-12",
        "2xl": "px-16",
      },
      centered: {
        true: "flex items-center justify-center",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      padding: "default",
      centered: false,
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  asChild?: boolean;
  fluid?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, centered, asChild = false, fluid = false, ...props }, ref) => {
    const Comp = asChild ? "div" : "div";
    
    return (
      <Comp
        ref={ref}
        className={cn(
          containerVariants({ 
            size: fluid ? "fluid" : size, 
            padding, 
            centered 
          }),
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

export { Container, containerVariants };