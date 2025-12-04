
# Component Reusability Implementation Guide

## Phase 1: Foundation (Weeks 1-2)

### 1.1 Restructure Component Organization

#### Step 1: Create New Directory Structure
```bash
# Create new directory structure
mkdir -p client/src/components/shared/{layout,forms,data,feedback,navigation,charts}
mkdir -p client/src/components/hooks
mkdir -p client/src/components/utils
mkdir -p client/src/components/lib
```

#### Step 2: Move Existing Components
```bash
# Move layout components
mv client/src/components/ui/layout.tsx client/src/components/shared/layout/

# Move form components
mv client/src/components/forms/* client/src/components/shared/forms/

# Update import paths in all affected files
```

#### Step 3: Create Index Files
Create index files for each component category to export components:

```typescript
// client/src/components/shared/layout/index.ts
export * from './Container';
export * from './Flex';
export * from './Grid';
export * from './Stack';
export * from './Section';
```

### 1.2 Enhance Existing Components

#### Step 1: Improve BaseCard
Enhance the existing BaseCard component with additional features:
- Add loading state support
- Add error state support
- Add skeleton loading variant
- Improve accessibility

#### Step 2: Enhance ActionCard
Add new features to ActionCard:
- Add bulk actions support
- Add selection state
- Add drag and drop support
- Improve keyboard navigation

#### Step 3: Standardize API Client Usage
Update all service files to use the standardized API client:
- Replace direct fetch calls with apiClient
- Add consistent error handling
- Add request/response logging
- Add timeout handling

## Phase 2: Core Components (Weeks 3-4)

### 2.1 Data Components

#### Step 1: Implement DataTable
Create a comprehensive data table component:

```typescript
// client/src/components/shared/data/DataTable.tsx
import React, { useState, useMemo } from 'react';
import { BaseCard } from '../layout';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowSelection?: {
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[]) => void;
  };
  onRow?: (record: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  rowSelection,
  onRow,
  className
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortOrder]);

  const handleSort = (field: keyof T) => {
    if (!columns.find(col => col.key === field)?.sortable) return;
    
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <BaseCard className={cn('w-full', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {rowSelection && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        rowSelection.onChange(data.map(item => item.id));
                      } else {
                        rowSelection.onChange([]);
                      }
                    }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-sm',
                    column.sortable && 'cursor-pointer hover:bg-gray-50',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && sortField === column.key && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading rows
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-t">
                  {rowSelection && <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>}
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => (
                <tr key={record.id || index} className="border-t hover:bg-gray-50">
                  {rowSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={rowSelection.selectedRowKeys.includes(record.id)}
                        onChange={(e) => {
                          const selectedKeys = e.target.checked
                            ? [...rowSelection.selectedRowKeys, record.id]
                            : rowSelection.selectedRowKeys.filter(key => key !== record.id);
                          rowSelection.onChange(selectedKeys);
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={String(column.key)} className={cn('px-4 py-3', column.className)}>
                      {column.render
                        ? column.render(record[column.key], record)
                        : record[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </BaseCard>
  );
}
```

#### Step 2: Create DataList
Create a list view component for displaying data in a card format:

```typescript
// client/src/components/shared/data/DataList.tsx
import React from 'react';
import { BaseCard } from '../layout';
import { cn } from '@/lib/utils';

export interface DataListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  itemClassName?: string;
}

export function DataList<T extends Record<string, any>>({
  items,
  renderItem,
  loading = false,
  emptyMessage = 'No items found',
  className,
  itemClassName
}: DataListProps<T>) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <BaseCard key={index} className={cn(itemClassName)}>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          </BaseCard>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <BaseCard className={cn('text-center py-8', className)}>
        <p className="text-gray-500">{emptyMessage}</p>
      </BaseCard>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <BaseCard key={item.id || index} className={cn(itemClassName)}>
          {renderItem(item, index)}
        </BaseCard>
      ))}
    </div>
  );
}
```

#### Step 3: Develop DataCard
Create an enhanced card component for displaying data with actions:

```typescript
// client/src/components/shared/data/DataCard.tsx
import React from 'react';
import { BaseCard, BaseCardContent, BaseCardHeader, BaseCardTitle } from '../layout';
import { cn } from '@/lib/utils';

export interface DataCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function DataCard({
  title,
  description,
  children,
  actions,
  loading = false,
  error,
  className,
  href,
  onClick
}: DataCardProps) {
  const cardContent = (
    <BaseCard
      className={cn(
        'group transition-all duration-200',
        loading && 'opacity-60',
        error && 'border-red-200 bg-red-50',
        className
      )}
      onClick={onClick}
    >
      <BaseCardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <BaseCardTitle className={cn(error && 'text-red-900')}>
              {title}
            </BaseCardTitle>
            {description && (
              <p className={cn(
                'text-sm mt-1',
                error ? 'text-red-700' : 'text-gray-600'
              )}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {actions}
            </div>
          )}
        </div>
      </BaseCardHeader>
      <BaseCardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        ) : error ? (
          <div className="text-red-700 text-sm">{error}</div>
        ) : (
          children
        )}
      </BaseCardContent>
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
```

### 2.2 Form Components

#### Step 1: Build AutoForm
Create a dynamic form component that generates forms from schema:

```typescript
// client/src/components/shared/forms/AutoForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseCard, BaseCardContent, BaseCardHeader, BaseCardTitle } from '../layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: any;
  disabled?: boolean;
  description?: string;
  defaultValue?: any;
}

export interface FormSection {
  title?: string;
  description?: string;
  fields: FormField[];
}

export interface AutoFormProps<T extends z.ZodType> {
  // Form configuration
  schema: T;
  sections: FormSection[];
  onSubmit: (data: z.infer<T>) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<z.infer<T>>;
  submitText?: string;
  cancelText?: string;
  disabled?: boolean;
  loading?: boolean;

  // UI configuration
  title?: string;
  description?: string;
  submitVariant?: 'default' | 'destructive';
  className?: string;
}

export function AutoForm<T extends z.ZodType>({
  schema,
  sections,
  onSubmit,
  onCancel,
  initialData = {},
  submitText = 'Submit',
  cancelText = 'Cancel',
  disabled = false,
  loading = false,
  title,
  description,
  submitVariant = 'default',
  className = ''
}: AutoFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: initialData as DefaultValues<z.infer<T>>,
    mode: 'onBlur'
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData as DefaultValues<z.infer<T>>);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: z.infer<T>) => {
    if (disabled || loading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.name as keyof typeof errors];
    const isRequired = field.required || field.validation?.required;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <div className="space-y-2">
            <label htmlFor={field.name} className={cn(
              'text-sm font-medium',
              isRequired && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}>
              {field.label}
            </label>
            <input
              {...register(field.name as any)}
              type={field.type}
              placeholder={field.placeholder}
              disabled={field.disabled || disabled}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                error && 'border-red-500 focus:ring-red-500'
              )}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <label htmlFor={field.name} className={cn(
              'text-sm font-medium',
              isRequired && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}>
              {field.label}
            </label>
            <textarea
              {...register(field.name as any)}
              placeholder={field.placeholder}
              disabled={field.disabled || disabled}
              rows={4}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                error && 'border-red-500 focus:ring-red-500'
              )}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label htmlFor={field.name} className={cn(
              'text-sm font-medium',
              isRequired && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}>
              {field.label}
            </label>
            <select
              {...register(field.name as any)}
              disabled={field.disabled || disabled}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                error && 'border-red-500 focus:ring-red-500'
              )}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              {...register(field.name as any)}
              type="checkbox"
              disabled={field.disabled || disabled}
              id={field.name}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 ml-2">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Unknown field type: {field.type}</p>
          </div>
        );
    }
  };

  return (
    <BaseCard className={cn('w-full max-w-4xl mx-auto', className)}>
      {title && (
        <BaseCardHeader>
          <BaseCardTitle>{title}</BaseCardTitle>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </BaseCardHeader>
      )}
      
      <BaseCardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              {section.title && (
                <h3 className="text-lg font-semibold">{section.title}</h3>
              )}
              {section.description && (
                <p className="text-gray-600">{section.description}</p>
              )}
              <div className="space-y-4">
                {section.fields.map(renderField)}
              </div>
            </div>
          ))}

          <div className="flex gap-4 justify-end pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || loading}
              >
                {cancelText}
              </Button>
            )}

            <Button
              type="submit"
              variant={submitVariant}
              disabled={disabled || loading || !isValid || isSubmitting}
            >
              {isSubmitting || loading ? 'Processing...' : submitText}
            </Button>
          </div>
        </form>
      </BaseCardContent>
    </BaseCard>
  );
}
```

#### Step 2: Create MultiStepForm
Create a wizard-style form component with progress tracking:

```typescript
// client/src/components/shared/forms/MultiStepForm.tsx
import React, { useState } from 'react';
import { BaseCard, BaseCardContent, BaseCardHeader, BaseCardTitle } from '../layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  validation?: () => boolean;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onStepChange?: (stepId: string) => void;
  initialData?: Record<string, any>;
  className?: string;
}

export function MultiStepForm({
  steps,
  onSubmit,
  onStepChange,
  initialData = {},
  className = ''
}: MultiStepFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep.validation && !currentStep.validation()) {
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextStepIndex);
    onStepChange?.(steps[nextStepIndex].id);
  };

  const handlePrevious = () => {
    const prevStepIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevStepIndex);
    onStepChange?.(steps[prevStepIndex].id);
  };

  const handleStepDataUpdate = (stepId: string, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(stepData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoToStep = (stepIndex: number) => {
    if (stepIndex <= currentStepIndex) return true;
    
    for (let i = currentStepIndex + 1; i <= stepIndex; i++) {
      if (steps[i].validation && !steps[i].validation()) {
        return false;
      }
    }
    return true;
  };

  return (
    <BaseCard className={cn('w-full max-w-4xl mx-auto', className)}>
      <BaseCardHeader>
        <BaseCardTitle>{currentStep.title}</BaseCardTitle>
        {currentStep.description && (
          <p className="text-gray-600">{currentStep.description}</p>
        )}
      </BaseCardHeader>

      <BaseCardContent>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Navigation */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => canGoToStep(index) && setCurrentStepIndex(index)}
                disabled={!canGoToStep(index)}
                className={cn(
                  'flex flex-col items-center text-sm',
                  index === currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-500',
                  !canGoToStep(index) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center mb-1',
                  index === currentStepIndex 
                    ? 'bg-blue-600 text-white' 
                    : canGoToStep(index) 
                      ? 'bg-gray-200 text-gray-600' 
                      : 'bg-gray-100 text-gray-400'
                )}>
                  {index + 1}
                </div>
                <span className="text-xs">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {React.cloneElement(currentStep.content as React.ReactElement, {
            data: stepData[currentStep.id],
            onDataChange: (data: any) => handleStepDataUpdate(currentStep.id, data)
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            Previous
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </BaseCardContent>
    </BaseCard>
  );
}
```

## Phase 3: Advanced Components (Weeks 5-6)

### 3.1 Feedback Components

#### Step 1: Create Modal System
Create a reusable modal component:

```typescript
// client/src/components/shared/feedback/Modal.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BaseCard } from '../layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  showFooter?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
  showFooter = true,
  footer,
  className = ''
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl">
        <BaseCard className={cn(
          'transform transition-all',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md',
          size === 'lg' && 'max-w-lg',
          size === 'xl' && 'max-w-xl',
          className
        )}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              {closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="mb-4">
              {children}
            </div>

            {/* Footer */}
            {showFooter && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                {footer || (
                  <>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={onClose}>
                      Confirm
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </BaseCard>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
```

#### Step 2: Implement Drawer
Create a slide-out drawer component:

```typescript
// client/src/components/shared/feedback/Drawer.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BaseCard } from '../layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  showFooter?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  placement = 'right',
  size = 'md',
  closable = true,
  showFooter = true,
  footer,
  className = ''
}: DrawerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  const sizeClasses = {
    sm: placement === 'left' || placement === 'right' ? 'w-80' : 'h-80',
    md: placement === 'left' || placement === 'right' ? 'w-96' : 'h-96',
    lg: placement === 'left' || placement === 'right' ? 'w-[28rem]' : 'h-[28rem]',
    xl: placement === 'left' || placement === 'right' ? 'w-[32rem]' : 'h-[32rem]'
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closable ? onClose : undefined}
      />

      {/* Drawer Content */}
      <div className={cn(
        'fixed bg-white shadow-lg transform transition-transform',
        sizeClasses[size],
        placement === 'left' && 'left-0 top-0 bottom-0',
        placement === 'right' && 'right-0 top-0 bottom-0',
        placement === 'top' && 'top-0 left-0 right-0',
        placement === 'bottom' && 'bottom-0 left-0 right-0',
        isOpen ? 'translate-x-0' : 
          placement === 'left' ? '-translate-x-full' :
          placement === 'right' ? 'translate-x-full' :
          placement === 'top' ? '-translate-y-full' :
          'translate-y-full',
        className
      )}>
        <BaseCard className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="flex justify-end gap-2 p-4 border-t">
              {footer || (
                <>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={onClose}>
                    Confirm
                  </Button>
                </>
              )}
            </div>
          )}
        </BaseCard>
      </div>
    </div>
  );

  return ReactDOM.createPortal(drawerContent, document.body);
}
```

### 3.2 Chart Components

#### Step 1: Integrate Chart Library
Install and configure a chart library:

```bash
# Install recharts for React charts
pnpm add recharts
```

#### Step 2: Create Chart Components
Create reusable chart components:

```typescript
// client/src/components/shared/charts/LineChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BaseCard } from '../layout';
import { cn } from '@/lib/utils';

export interface LineChartProps {
  data: any[];
  xKey: string;
  lines: Array<{
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
    dot?: boolean;
  }>;
  title?: string;
  height?: number;
  className?: string;
}

export function LineChartComponent({
  data,
  xKey,
  lines,
  title,
  height = 400,
  className = ''
}: LineChartProps) {
  return (
    <BaseCard className={cn('w-full', className)}>
      {title && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3