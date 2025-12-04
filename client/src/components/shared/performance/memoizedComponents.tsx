/**
 * Memoized Components
 * Performance-optimized versions of shared components using React.memo and useMemo
 */

import React, { memo, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import * as z from 'zod';

// Memoized DataTable
import { DataTable, DataTableProps } from '../data/DataTable';

export const MemoizedDataTable = memo(function MemoizedDataTable<T extends Record<string, any>>(
  props: DataTableProps<T>
) {
  // Memoize expensive calculations
  const memoizedColumns = useMemo(() => {
    return props.columns.map(column => ({
      ...column,
      // Add any computed properties here
      computedWidth: column.width || 'auto'
    }));
  }, [props.columns]);

  const memoizedData = useMemo(() => {
    return props.data || [];
  }, [props.data]);

  const memoizedPagination = useMemo(() => {
    return props.pagination || { current: 1, pageSize: 10, total: 0 };
  }, [props.pagination]);

  const memoizedRowSelection = useMemo(() => {
    return props.rowSelection || { selectedRowKeys: [], onChange: () => {} };
  }, [props.rowSelection]);

  return (
    <DataTable
      {...props}
      columns={memoizedColumns}
      data={memoizedData}
      pagination={memoizedPagination}
      rowSelection={memoizedRowSelection}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for fine-grained control
  return (
    prevProps.data === nextProps.data &&
    prevProps.columns === nextProps.columns &&
    prevProps.pagination === nextProps.pagination &&
    prevProps.rowSelection === nextProps.rowSelection
  );
});

MemoizedDataTable.displayName = 'MemoizedDataTable';

// Memoized SearchBar
import { SearchBar, SearchBarProps } from '../data/SearchBar';

export const MemoizedSearchBar = memo(function MemoizedSearchBar(
  props: SearchBarProps
) {
  // Memoize expensive calculations
  const memoizedFilters = useMemo(() => {
    return props.filters || [];
  }, [props.filters]);

  const memoizedSuggestions = useMemo(() => {
    return props.suggestions || [];
  }, [props.suggestions]);

  // Memoize event handlers
  const memoizedOnSearch = useCallback((term: string, filters?: Record<string, any>) => {
    props.onSearch?.(term, filters);
  }, [props.onSearch]);

  const memoizedOnChange = useCallback((value: string) => {
    props.onChange?.(value);
  }, [props.onChange]);

  const memoizedOnSuggestionSelect = useCallback((suggestion: any) => {
    props.onSuggestionSelect?.(suggestion);
  }, [props.onSuggestionSelect]);

  const memoizedOnFiltersChange = useCallback((filters: Record<string, any>) => {
    props.onFiltersChange?.(filters);
  }, [props.onFiltersChange]);

  return (
    <SearchBar
      {...props}
      filters={memoizedFilters}
      suggestions={memoizedSuggestions}
      onSearch={memoizedOnSearch}
      onChange={memoizedOnChange}
      onSuggestionSelect={memoizedOnSuggestionSelect}
      onFiltersChange={memoizedOnFiltersChange}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.filters === nextProps.filters &&
    prevProps.suggestions === nextProps.suggestions &&
    prevProps.onSearch === nextProps.onSearch &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onSuggestionSelect === nextProps.onSuggestionSelect &&
    prevProps.onFiltersChange === nextProps.onFiltersChange
  );
});

MemoizedSearchBar.displayName = 'MemoizedSearchBar';

// Memoized DataCard
import { DataCard, DataCardProps } from '../data/DataCard';

export const MemoizedDataCard = memo(function MemoizedDataCard(
  props: DataCardProps
) {
  // Memoize expensive calculations
  const memoizedActions = useMemo(() => {
    return props.actions || [];
  }, [props.actions]);

  const memoizedMetadata = useMemo(() => {
    return props.metadata || [];
  }, [props.metadata]);

  const memoizedBadges = useMemo(() => {
    return props.badges || [];
  }, [props.badges]);

  return (
    <DataCard
      {...props}
      actions={memoizedActions}
      metadata={memoizedMetadata}
      badges={memoizedBadges}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.description === nextProps.description &&
    prevProps.image === nextProps.image &&
    prevProps.avatar === nextProps.avatar &&
    prevProps.metadata === nextProps.metadata &&
    prevProps.badges === nextProps.badges &&
    prevProps.actions === nextProps.actions &&
    prevProps.onSelect === nextProps.onSelect
  );
});

MemoizedDataCard.displayName = 'MemoizedDataCard';

// Memoized Modal
import { Modal, ModalProps } from '../feedback/Modal';

export const MemoizedModal = memo(function MemoizedModal(
  props: ModalProps
) {
  // Memoize event handlers
  const memoizedOnClose = useCallback(() => {
    props.onClose?.();
  }, [props.onClose]);

  const memoizedOnPrimaryAction = useCallback(() => {
    props.primaryAction?.onClick?.();
  }, [props.primaryAction?.onClick]);

  return (
    <Modal
      {...props}
      onClose={memoizedOnClose}
      primaryAction={props.primaryAction ? {
        ...props.primaryAction,
        onClick: memoizedOnPrimaryAction
      } : undefined}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.open === nextProps.open &&
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.size === nextProps.size &&
    prevProps.primaryAction === nextProps.primaryAction &&
    prevProps.onClose === nextProps.onClose
  );
});

MemoizedModal.displayName = 'MemoizedModal';

// Memoized LoadingState
import { LoadingState, LoadingStateProps } from '../loading/LoadingStates';

export const MemoizedLoadingState = memo(function MemoizedLoadingState(
  props: LoadingStateProps
) {
  // Memoize expensive calculations
  const memoizedStyle = useMemo(() => {
    return cn(
      'flex items-center justify-center',
      props.className
    );
  }, [props.className]);

  return (
    <LoadingState
      {...props}
      className={memoizedStyle}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.color === nextProps.color &&
    prevProps.text === nextProps.text &&
    prevProps.progress === nextProps.progress &&
    prevProps.className === nextProps.className
  );
});

MemoizedLoadingState.displayName = 'MemoizedLoadingState';

// Memoized LoadingButton
import { LoadingButton, LoadingButtonProps } from '../loading/LoadingStates';

export const MemoizedLoadingButton = memo(function MemoizedLoadingButton(
  props: LoadingButtonProps
) {
  // Memoize expensive calculations
  const memoizedStyle = useMemo(() => {
    return cn(
      'inline-flex items-center justify-center',
      props.className
    );
  }, [props.className]);

  return (
    <LoadingButton
      {...props}
      className={memoizedStyle}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.className === nextProps.className &&
    prevProps.loadingText === nextProps.loadingText &&
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size
  );
});

MemoizedLoadingButton.displayName = 'MemoizedLoadingButton';

// Memoized ErrorHandler
import { ErrorHandler, ErrorHandlerProps } from '../error/ErrorHandler';

export const MemoizedErrorHandler = memo(function MemoizedErrorHandler(
  props: ErrorHandlerProps
) {
  // Memoize expensive calculations
  const memoizedStyle = useMemo(() => {
    return cn(
      'w-full',
      props.className
    );
  }, [props.className]);

  // Memoize event handlers
  const memoizedOnRetry = useCallback(() => {
    props.onRetry?.();
  }, [props.onRetry]);

  const memoizedOnDismiss = useCallback(() => {
    props.onDismiss?.();
  }, [props.onDismiss]);

  return (
    <ErrorHandler
      {...props}
      className={memoizedStyle}
      onRetry={memoizedOnRetry}
      onDismiss={memoizedOnDismiss}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.error === nextProps.error &&
    prevProps.onRetry === nextProps.onRetry &&
    prevProps.onDismiss === nextProps.onDismiss &&
    prevProps.showDetails === nextProps.showDetails &&
    prevProps.compact === nextProps.compact &&
    prevProps.className === nextProps.className
  );
});

MemoizedErrorHandler.displayName = 'MemoizedErrorHandler';

// Memoized SmartForm
import { SmartForm, SmartFormProps } from '../ai/SmartForm';

export const MemoizedSmartForm = memo(function MemoizedSmartForm<T extends z.ZodType>(
  props: SmartFormProps<T>
) {
  // Memoize expensive calculations
  const memoizedSections = useMemo(() => {
    return props.sections.map(section => ({
      ...section,
      // Add any computed properties here
      computedFields: section.fields || []
    }));
  }, [props.sections]);

  const memoizedSmartFields = useMemo(() => {
    return props.smartFields || {};
  }, [props.smartFields]);

  const memoizedSuggestions = useMemo(() => {
    return props.suggestions || [];
  }, [props.suggestions]);

  const memoizedValidations = useMemo(() => {
    return props.validations || [];
  }, [props.validations]);

  const memoizedAIFeatures = useMemo(() => {
    return props.aiFeatures || {};
  }, [props.aiFeatures]);

  // Memoize event handlers
  const memoizedOnSuggestionApply = useCallback((suggestionId: string) => {
    props.onSuggestionApply?.(suggestionId);
  }, [props.onSuggestionApply]);

  const memoizedOnValidationFix = useCallback((validationId: string) => {
    props.onValidationFix?.(validationId);
  }, [props.onValidationFix]);

  const memoizedOnAnalyzeForm = useCallback((data: Partial<z.infer<T>>) => {
    if (!props.onAnalyzeForm) return Promise.resolve({ completeness: 0, issues: [], recommendations: [] });
    return props.onAnalyzeForm(data);
  }, [props.onAnalyzeForm]);

  return (
    <SmartForm
      {...props}
      sections={memoizedSections}
      smartFields={memoizedSmartFields}
      suggestions={memoizedSuggestions}
      validations={memoizedValidations}
      aiFeatures={memoizedAIFeatures}
      onSuggestionApply={memoizedOnSuggestionApply}
      onValidationFix={memoizedOnValidationFix}
      onAnalyzeForm={memoizedOnAnalyzeForm}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.schema === nextProps.schema &&
    prevProps.sections === nextProps.sections &&
    prevProps.smartFields === nextProps.smartFields &&
    prevProps.suggestions === nextProps.suggestions &&
    prevProps.validations === nextProps.validations &&
    prevProps.aiFeatures === nextProps.aiFeatures &&
    prevProps.onSuggestionApply === nextProps.onSuggestionApply &&
    prevProps.onValidationFix === nextProps.onValidationFix &&
    prevProps.onAnalyzeForm === nextProps.onAnalyzeForm
  );
});

MemoizedSmartForm.displayName = 'MemoizedSmartForm';

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const [renderCount, setRenderCount] = React.useState(0);
  const [lastRenderTime, setLastRenderTime] = React.useState(Date.now());

  React.useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastRenderTime(Date.now());
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCount + 1,
        timeSinceLastRender: Date.now() - lastRenderTime
      });
    }
  });

  return {
    renderCount,
    lastRenderTime,
    timeSinceLastRender: Date.now() - lastRenderTime
  };
}

// Performance optimization utilities
export function createMemoizedComponent<T extends Record<string, any>, P extends object>(
  Component: React.ComponentType<P>,
  areEqual: (prevProps: P, nextProps: P) => boolean = (prevProps, nextProps) => {
    return Object.keys(prevProps).length === Object.keys(nextProps).length &&
           Object.keys(prevProps).every(key => prevProps[key as keyof P] === nextProps[key as keyof P]);
  }
) {
  return memo(Component, areEqual);
}

// Debounced update utility
export function useDebouncedUpdate<T>(
  value: T,
  delay: number = 300
): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Virtual scrolling utility for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number = 50,
  containerHeight: number = 400
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleRange = React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);
  
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    handleScroll
  };
}

// Lazy loading utility
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    let isMounted = true;
    
    setLoading(true);
    setError(null);
    
    loadFn()
      .then(result => {
        if (isMounted) {
          setData(result);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, deps);
  
  const retry = React.useCallback(() => {
    setData(null);
    setError(null);
    loadFn()
      .then(setData)
      .catch(setError);
  }, [loadFn]);
  
  return { data, loading, error, retry };
}

export default {
  MemoizedDataTable,
  MemoizedSearchBar,
  MemoizedDataCard,
  MemoizedModal,
  MemoizedLoadingState,
  MemoizedLoadingButton,
  MemoizedErrorHandler,
  MemoizedSmartForm,
  usePerformanceMonitor,
  createMemoizedComponent,
  useDebouncedUpdate,
  useVirtualScrolling,
  useLazyLoad
};