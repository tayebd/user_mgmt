'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm, DefaultValues, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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

export interface GenericFormProps<T extends FieldValues = FieldValues> {
  // Form configuration
  sections: FormSection[];
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<T | null | void>;
  onCancel?: () => void;
  initialData?: Partial<T>;
  submitText?: string;
  cancelText?: string;
  disabled?: boolean;
  loading?: boolean;

  // UI configuration
  title?: string;
  description?: string;
  submitVariant?: 'default' | 'destructive';
  showReset?: boolean;
  className?: string;

  // Advanced options
  mode?: 'onBlur' | 'onChange' | 'onSubmit';
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  resetOptions?: {
    resetValues?: boolean;
    resetErrors?: boolean;
    keepDirtyValues?: boolean;
    keepTouchedValues?: boolean;
    keepErrors?: boolean;
    keepDirty?: boolean;
    keepTouched?: boolean;
    keepSubmitCount?: boolean;
  };
}

/**
 * Generic form component with built-in validation and error handling
 */
export function GenericForm<T extends FieldValues = FieldValues>({
  sections,
  schema,
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
  showReset = false,
  className = '',
  mode = 'onBlur',
  reValidateMode = 'onSubmit',
  resetOptions = {},
}: GenericFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, touchedFields, dirtyFields, isValid, isSubmitting: formIsSubmitting },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: initialData as DefaultValues<T>,
    mode,
    reValidateMode,
    resetOptions,
  });

  // Watch for form state changes
  const formStateWatcher = watch();
  const errorWatcher = watch();

  // Set initial values when they change
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData as DefaultValues<T>);
    }
  }, [initialData, reset]);

  const handleFormSubmit = useCallback(async (data: T) => {
    if (disabled || loading || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onSubmit(data);

      if (result !== undefined) {
        // Show success message
        toast.success('Form submitted successfully');

        // Reset form if successful and no data returned
        if (!result) {
          reset();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Form submission failed';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, disabled, loading, isSubmitting, reset]);

  const handleReset = useCallback(() => {
    reset();
    setSubmitError(null);
    toast.info('Form has been reset');
  }, [reset]);

  const renderField = useCallback((field: FormField) => {
    const error = errors[field.name as keyof typeof errors];
    const isTouched = touchedFields[field.name as keyof typeof touchedFields];
    const isDirty = dirtyFields[field.name as keyof typeof dirtyFields];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Input
              {...register(field.name as any, field.validation)}
              type={field.type}
              placeholder={field.placeholder}
              disabled={field.disabled || disabled}
              className={
                error ? 'border-red-500 focus:ring-red-500' :
                isTouched && !isDirty ? 'border-green-500' : ''
              }
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Textarea
              {...register(field.name as any, field.validation)}
              placeholder={field.placeholder}
              disabled={field.disabled || disabled}
              rows={4}
              className={
                error ? 'border-red-500 focus:ring-red-500' :
                isTouched && !isDirty ? 'border-green-500' : ''
              }
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Select
              {...register(field.name as any, field.validation)}
              disabled={field.disabled || disabled}
              onValueChange={(value) => setValue(field.name as any, value as any)}
              defaultValue={field.defaultValue}
            >
              <SelectTrigger className={
                error ? 'border-red-500 focus:ring-red-500' :
                isTouched && !isDirty ? 'border-green-500' : ''
              }>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-gray-500 mt-1">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2 flex items-center space-x-2">
            <Checkbox
              {...register(field.name as any, field.validation)}
              disabled={field.disabled || disabled}
              id={field.name}
              defaultChecked={field.defaultValue}
            />
            <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            {field.description && (
              <p className="text-sm text-gray-500 ml-4">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name} className={field.required ? 'required' : ''}>
              {field.label}
            </Label>
            <Input
              {...register(field.name as any, field.validation)}
              type="date"
              disabled={field.disabled || disabled}
              className={
                error ? 'border-red-500 focus:ring-red-500' :
                isTouched && !isDirty ? 'border-green-500' : ''
              }
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error.message?.toString()}</p>
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
  }, [errors, touchedFields, dirtyFields, disabled, register, setValue]);

  const renderSection = useCallback((section: FormSection, index: number) => (
    <Card key={index} className="mb-6">
      {section.title && (
        <CardHeader>
          <CardTitle className="text-lg">{section.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-6">
        {section.description && (
          <p className="text-gray-600 mb-4">{section.description}</p>
        )}
        <div className="space-y-4">
          {section.fields.map(renderField)}
        </div>
      </CardContent>
    </Card>
  ), [renderField]);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {title && (
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
      )}

      {submitError && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {sections.map(renderSection)}

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

          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting || loading}
            >
              Reset
            </Button>
          )}

          <Button
            type="submit"
            variant={submitVariant}
            disabled={disabled || loading || !isValid || isSubmitting}
            className="min-w-32"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {submitVariant === 'destructive' && <AlertCircle className="mr-2 h-4 w-4" />}
                {submitVariant === 'default' && <CheckCircle2 className="mr-2 h-4 w-4" />}
                {submitText}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default GenericForm;