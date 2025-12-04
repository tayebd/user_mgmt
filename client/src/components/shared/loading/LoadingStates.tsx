/**
 * LoadingStates Component
 * Comprehensive loading states with different variants and animations
 * Provides consistent loading UI across the application
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { BaseCard } from '@/components/ui/base-card';

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'progress' | 'dots' | 'pulse' | 'bars';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  progress?: number; // 0-100
  className?: string;
  overlay?: boolean;
  centered?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

export function LoadingState({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  progress,
  className,
  overlay = false,
  centered = true
}: LoadingStateProps) {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  const renderSpinner = () => (
    <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', sizeClass, colorClass)}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-2">
      <div className="animate-pulse">
        <div className={cn('h-4 bg-gray-200 rounded', size === 'sm' ? 'w-16' : size === 'lg' ? 'w-32' : 'w-24')}></div>
      </div>
      <div className="animate-pulse">
        <div className={cn('h-4 bg-gray-200 rounded', size === 'sm' ? 'w-24' : size === 'lg' ? 'w-48' : 'w-32')}></div>
      </div>
      <div className="animate-pulse">
        <div className={cn('h-4 bg-gray-200 rounded', size === 'sm' ? 'w-20' : size === 'lg' ? 'w-40' : 'w-28')}></div>
      </div>
    </div>
  );

  const renderProgress = () => {
    // Ensure progress is a valid number
    const validProgress = typeof progress === 'number' && !isNaN(progress) ? Math.max(0, Math.min(100, progress)) : 0;

    return (
      <div className="w-full">
        {progress !== undefined && (
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Loading...</span>
              <span>{validProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn('h-2 rounded-full transition-all duration-300', colorClass.replace('text-', 'bg-'))}
                style={{ width: `${validProgress}%` }}
              />
            </div>
          </div>
        )}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 bg-current rounded-full animate-bounce',
              colorClass
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
    );
  };

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 bg-current rounded-full animate-pulse',
            colorClass
          )}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={cn('animate-pulse rounded-full bg-current', sizeClass, colorClass)}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const renderBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'w-1 bg-current animate-pulse',
            colorClass,
            size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : 'h-6'
          )}
          style={{
            height: `${parseInt(sizeClass.split(' ')[1]) * (0.4 + i * 0.2)}px`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'skeleton':
        return renderSkeleton();
      case 'progress':
        return renderProgress();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      text && 'space-y-2',
      className
    )}>
      {renderContent()}
      {text && (
        <p className={cn(
          'text-sm text-gray-600',
          colorClass
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <BaseCard className="p-6">
          {content}
        </BaseCard>
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Loading Overlay Component
export interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  variant?: LoadingStateProps['variant'];
  size?: LoadingStateProps['size'];
  color?: LoadingStateProps['color'];
  text?: string;
  backdrop?: boolean;
  blur?: boolean;
}

export function LoadingOverlay({
  loading,
  children,
  variant = 'spinner',
  size = 'lg',
  color = 'primary',
  text,
  backdrop = true,
  blur = true
}: LoadingOverlayProps) {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50">
      {backdrop && (
        <div
          className={cn(
            'absolute inset-0',
            blur ? 'backdrop-blur-sm' : 'bg-black/20'
          )}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingState
          variant={variant}
          size={size}
          color={color}
          text={text}
          overlay={false}
        />
      </div>
    </div>
  );
}

// Loading Button Component
export interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  loading,
  children,
  disabled,
  className,
  loadingText = 'Loading...',
  variant = 'default',
  size = 'md'
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'default': 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
          'outline': 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
          'ghost': 'hover:bg-gray-100 text-gray-700 focus:ring-blue-500'
        }[variant],
        {
          'sm': 'px-3 py-1.5 text-sm',
          'md': 'px-4 py-2 text-sm',
          'lg': 'px-6 py-3 text-base'
        }[size],
        className
      )}
    >
      {loading ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Page Loading Component
export interface PageLoadingProps {
  text?: string;
  variant?: LoadingStateProps['variant'];
  size?: LoadingStateProps['size'];
  color?: LoadingStateProps['color'];
  fullscreen?: boolean;
}

export function PageLoading({
  text = 'Loading page...',
  variant = 'spinner',
  size = 'xl',
  color = 'primary',
  fullscreen = true
}: PageLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <LoadingState
        variant={variant}
        size={size}
        color={color}
        text={text}
      />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingState;