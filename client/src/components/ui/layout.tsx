/**
 * Layout Components
 * Standardized layout patterns to replace custom implementations
 * Provides consistent spacing, alignment, and responsive behavior
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Flex Layout Component
const flexVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        col: "flex-col",
        "row-reverse": "flex-row-reverse",
        "col-reverse": "flex-col-reverse",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
      wrap: {
        nowrap: "flex-nowrap",
        wrap: "flex-wrap",
        "wrap-reverse": "flex-wrap-reverse",
      },
      gap: {
        none: "gap-0",
        sm: "gap-2",
        default: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
    },
    defaultVariants: {
      direction: "row",
      align: "start",
      justify: "start",
      wrap: "nowrap",
      gap: "default",
    },
  }
);

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, align, justify, wrap, gap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          flexVariants({ direction, align, justify, wrap, gap }),
          className
        )}
        {...props}
      />
    );
  }
);
Flex.displayName = "Flex";

// Grid Layout Component
const gridVariants = cva(
  "grid",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        12: "grid-cols-12",
        auto: "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
        "auto-min": "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]",
        "auto-max": "grid-cols-[repeat(auto-fill,minmax(250px,1fr))]",
      },
      gap: {
        none: "gap-0",
        sm: "gap-2",
        default: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
    },
    defaultVariants: {
      cols: "auto",
      gap: "default",
    },
  }
);

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          gridVariants({ cols, gap }),
          className
        )}
        {...props}
      />
    );
  }
);
Grid.displayName = "Grid";

// Container Component
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
      },
      padding: {
        none: "px-0",
        sm: "px-4",
        default: "px-6",
        lg: "px-8",
        xl: "px-12",
      },
    },
    defaultVariants: {
      size: "default",
      padding: "default",
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          containerVariants({ size, padding }),
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";

// Stack Component (vertical flex with consistent spacing)
export interface StackProps extends Omit<FlexProps, 'direction'> {
  spacing?: "none" | "sm" | "default" | "lg" | "xl";
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing, align, justify, wrap, gap, ...props }, ref) => {
    const gapValue = spacing || gap;

    return (
      <Flex
        ref={ref}
        direction="col"
        align={align}
        justify={justify}
        wrap={wrap}
        gap={gapValue}
        className={className}
        {...props}
      />
    );
  }
);
Stack.displayName = "Stack";

// Spacer Component
export interface SpacerProps {
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  axis?: "horizontal" | "vertical";
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ size = "default", axis = "vertical", ...props }, ref) => {
    const sizeClasses = {
      xs: "w-2 h-2",
      sm: "w-4 h-4",
      default: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    };

    const axisClasses = {
      horizontal: "w-full h-0",
      vertical: "w-0 h-full",
    };

    return (
      <div
        ref={ref}
        className={cn(
          axisClasses[axis],
          sizeClasses[size],
          "shrink-0"
        )}
        {...props}
      />
    );
  }
);
Spacer.displayName = "Spacer";

// Section Component (for major page sections)
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "main" | "article" | "aside";
  container?: boolean;
  containerSize?: "sm" | "default" | "lg" | "xl" | "full" | "fluid";
  padding?: "none" | "sm" | "default" | "lg" | "xl";
  py?: "none" | "sm" | "default" | "lg" | "xl";
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({
    as: Component = "section",
    container = true,
    containerSize = "default",
    padding = "default",
    py = "default",
    className,
    children,
    ...props
  }, ref) => {
    const pyClasses = {
      none: "py-0",
      sm: "py-8",
      default: "py-12",
      lg: "py-16",
      xl: "py-20",
    };

    const content = (
      <div
        ref={ref}
        className={cn(
          container && cn(
            containerVariants({ size: containerSize, padding })
          ),
          !container && cn(
            "w-full",
            padding !== "none" && `px-${padding === "sm" ? "4" : padding === "lg" ? "8" : padding === "xl" ? "12" : "6"}`,
            pyClasses[py]
          ),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

    if (container) {
      return content;
    }

    // If no container wrapper, return with the semantic element
    return React.createElement(Component, { ref, className: cn(pyClasses[py], className), ...props }, children);
  }
);
Section.displayName = "Section";

export {
  Flex,
  Grid,
  Container,
  Stack,
  Spacer,
  Section,
  flexVariants,
  gridVariants,
  containerVariants,
};