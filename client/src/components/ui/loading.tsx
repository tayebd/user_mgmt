import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 rounded-md h-4"
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  lines?: number;
}

export function LoadingCard({ className, lines = 3 }: LoadingCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
      <div className="animate-pulse space-y-3">
        <div className="bg-gray-200 rounded-md h-6 w-3/4" />
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="bg-gray-200 rounded-md h-4" />
        ))}
        <div className="bg-gray-200 rounded-md h-10 w-1/4 mt-4" />
      </div>
    </div>
  );
}