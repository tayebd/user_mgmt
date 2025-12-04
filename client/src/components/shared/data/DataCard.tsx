/**
 * DataCard Component
 * A flexible card component for displaying data with various layouts
 * Supports different variants, actions, and interactive features
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BaseCard } from '@/components/ui/base-card';

export interface DataCardAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export interface DataCardProps {
  // Content
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  avatar?: string;
  
  // Metadata
  metadata?: Array<{
    label: string;
    value: string | number | React.ReactNode;
    icon?: React.ReactNode;
  }>;
  
  // Badges and tags
  badges?: Array<{
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    color?: string;
  }>;
  
  // Actions
  actions?: DataCardAction[];
  primaryAction?: DataCardAction;
  
  // Layout variants
  variant?: 'default' | 'compact' | 'detailed' | 'horizontal' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
  // Interactive features
  clickable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  
  // Loading and states
  loading?: boolean;
  error?: string;
  
  // Styling
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const variantStyles = {
  default: 'flex flex-col',
  compact: 'flex flex-col',
  detailed: 'flex flex-col',
  horizontal: 'flex flex-row gap-4',
  minimal: 'flex flex-col'
};

const sizeStyles = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export function DataCard({
  title,
  subtitle,
  description,
  image,
  avatar,
  metadata = [],
  badges = [],
  actions = [],
  primaryAction,
  variant = 'default',
  size = 'md',
  clickable = false,
  selected = false,
  onSelect,
  loading = false,
  error,
  className,
  imageClassName,
  contentClassName,
  ariaLabel,
  ariaDescribedBy
}: DataCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (clickable && onSelect) {
      onSelect();
    }
  };

  const renderMedia = () => {
    if (image && !imageError) {
      return (
        <div className={cn(
          'relative overflow-hidden rounded-lg',
          variant === 'horizontal' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48',
          imageClassName
        )}>
          <img
            src={image}
            alt={title || 'Card image'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full" />
            </div>
          )}
        </div>
      );
    }

    if (avatar && !imageError) {
      return (
        <div className="flex-shrink-0">
          <img
            src={avatar}
            alt={title || 'Avatar'}
            className={cn(
              'rounded-full object-cover',
              variant === 'horizontal' ? 'w-12 h-12' : 'w-16 h-16'
            )}
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return null;
  };

  const renderContent = () => (
    <div className={cn(
      'flex-1 min-w-0',
      contentClassName
    )}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-2">
          {title && (
            <h3 className={cn(
              'font-semibold text-gray-900 dark:text-gray-100 truncate',
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
            )}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={cn(
              'text-gray-600 dark:text-gray-400 truncate',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Description */}
      {description && variant !== 'compact' && variant !== 'minimal' && (
        <p className={cn(
          'text-gray-700 dark:text-gray-300 line-clamp-2',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {description}
        </p>
      )}

      {/* Metadata */}
      {metadata.length > 0 && variant !== 'minimal' && (
        <div className={cn(
          'space-y-1',
          variant === 'detailed' ? 'mt-4' : 'mt-2'
        )}>
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {item.icon && (
                <span className="flex-shrink-0 w-4 h-4">
                  {item.icon}
                </span>
              )}
              <span className="font-medium">{item.label}:</span>
              <span className="truncate">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className={cn(
          'flex flex-wrap gap-1',
          variant === 'detailed' ? 'mt-4' : 'mt-2'
        )}>
          {badges.map((badge, index) => (
            <Badge
              key={index}
              variant={badge.variant || 'default'}
              className={cn(
                'text-xs',
                badge.color && `bg-${badge.color}-100 text-${badge.color}-800`
              )}
            >
              {badge.text}
            </Badge>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );

  const renderActions = () => {
    if (actions.length === 0 && !primaryAction) return null;

    return (
      <div className={cn(
        'flex gap-2',
        variant === 'horizontal' ? 'flex-col' : 'flex-row',
        variant === 'detailed' ? 'mt-4 pt-4 border-t' : 'mt-3'
      )}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size={size === 'sm' ? 'sm' : 'default'}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="flex items-center gap-2"
          >
            {action.icon && <span className="w-4 h-4">{action.icon}</span>}
            {action.loading ? 'Loading...' : action.label}
          </Button>
        ))}
        
        {primaryAction && (
          <Button
            variant={primaryAction.variant || 'default'}
            size={size === 'sm' ? 'sm' : 'default'}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || primaryAction.loading}
            className="flex items-center gap-2"
          >
            {primaryAction.icon && <span className="w-4 h-4">{primaryAction.icon}</span>}
            {primaryAction.loading ? 'Loading...' : primaryAction.label}
          </Button>
        )}
      </div>
    );
  };

  return (
    <BaseCard
      className={cn(
        'relative transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        clickable && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        selected && 'ring-2 ring-blue-500 ring-offset-2',
        loading && 'opacity-50',
        className
      )}
      onClick={handleCardClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className={cn(
        'flex gap-3',
        variant === 'horizontal' ? 'flex-row' : 'flex-col'
      )}>
        {/* Media section */}
        {(image || avatar) && (
          <div className={cn(
            variant === 'horizontal' ? 'flex-shrink-0' : 'w-full'
          )}>
            {renderMedia()}
          </div>
        )}

        {/* Content section */}
        <div className={cn(
          'flex-1',
          variant === 'horizontal' ? 'min-w-0' : 'w-full'
        )}>
          {renderContent()}
        </div>
      </div>

      {/* Actions section */}
      {renderActions()}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
        </div>
      )}
    </BaseCard>
  );
}

// Specialized variants
export interface DataCardGridProps {
  data: Array<DataCardProps>;
  columns?: number;
  gap?: string;
  className?: string;
}

export function DataCardGrid({
  data,
  columns = 3,
  gap = 'gap-4',
  className
}: DataCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={cn(
      'grid',
      gridCols[columns as keyof typeof gridCols] || gridCols[3],
      gap,
      className
    )}>
      {data.map((item, index) => (
        <DataCard key={index} {...item} />
      ))}
    </div>
  );
}

export default DataCard;