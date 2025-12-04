import React, { useEffect, useState } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BaseCard } from '@/components/ui/base-card';
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
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="p-6">
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
      </div>
    </BaseCard>
  );
}