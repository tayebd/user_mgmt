/**
 * UI Components Index
 * Centralized exports for all UI components
 * Provides a single import point for consistent component usage
 */

// Re-export all existing shadcn/ui components
export * from './alert';
export * from './alert-dialog';
export * from './badge';
export * from './button';
export * from './card';
export * from './checkbox';
export * from './dialog';
export * from './dropdown-menu';
export * from './form';
export * from './input';
export * from './label';
export * from './progress';
export * from './scroll-area';
export * from './select';
export * from './separator';
export * from './skeleton';
export * from './slider';
export * from './switch';
export * from './table';
export * from './tabs';
export * from './textarea';
export * from './toast';
export { Toaster as SonnerToaster } from './sonner';
export { Toaster as BasicToaster } from './toaster';

// Default Toaster for general use (Sonner with theme support)
export { Toaster } from './sonner';

// Export new standardized components
export * from './base-card';
export * from './action-card';
export * from './layout';

// Export custom utility components
export * from './error-boundary';
export * from './error-fallback';
export * from './loading';
export * from './sonner';

// Re-export commonly used utilities
export { cn } from "@/lib/utils";