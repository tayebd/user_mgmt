/**
 * SmartForm Component
 * An AI-enhanced form component with intelligent validation and assistance
 * Features auto-completion, smart defaults, and predictive validation
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AutoForm, FormField, FormSection } from '../forms/AutoForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BaseCard } from '@/components/ui/base-card';
import { cn } from '@/lib/utils';
import { useAsync } from '../../hooks/useAsync';

export interface SmartSuggestion {
  id: string;
  field: string;
  value: any;
  confidence: number; // 0-100
  reason: string;
  apply: () => void;
}

export interface SmartValidation {
  field: string;
  rule: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  fix?: {
    label: string;
    action: () => void;
  };
}

export interface SmartFieldConfig {
  // AI Features
  aiEnabled?: boolean;
  autoComplete?: boolean;
  smartDefaults?: boolean;
  predictiveValidation?: boolean;
  
  // Auto-completion
  suggestions?: Array<{
    value: any;
    label: string;
    confidence?: number;
  }>;
  onSuggestionRequest?: (field: string, currentValue: any) => Promise<any[]>;
  
  // Smart defaults
  defaultValue?: any;
  defaultReason?: string;
  
  // Validation
  customRules?: Array<{
    name: string;
    validator: (value: any) => boolean | string;
    message: string;
    severity?: 'info' | 'warning' | 'error';
  }>;
}

export interface SmartFormProps<T extends z.ZodType> {
  // Base form props
  schema: T;
  sections: FormSection[];
  onSubmit: (data: z.infer<T>) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<z.infer<T>>;
  submitText?: string;
  cancelText?: string;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  className?: string;

  // AI Features
  aiFeatures?: {
    smartValidation?: boolean;
    autoComplete?: boolean;
    smartDefaults?: boolean;
    formAnalysis?: boolean;
    predictiveHelp?: boolean;
  };

  // AI Configuration
  smartFields?: Record<string, SmartFieldConfig>;
  suggestions?: SmartSuggestion[];
  validations?: SmartValidation[];
  
  // AI Actions
  onSuggestionApply?: (suggestionId: string) => void;
  onValidationFix?: (validationId: string) => void;
  onAnalyzeForm?: (data: Partial<z.infer<T>>) => Promise<{
    completeness: number;
    issues: string[];
    recommendations: string[];
  }>;
}

export function SmartForm<T extends z.ZodType>({
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
  className,
  aiFeatures = {},
  smartFields = {},
  suggestions = [],
  validations = [],
  onSuggestionApply,
  onValidationFix,
  onAnalyzeForm
}: SmartFormProps<T>) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showValidations, setShowValidations] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState<SmartSuggestion[]>([]);
  const [currentValidations, setCurrentValidations] = useState<SmartValidation[]>([]);
  const [formAnalysis, setFormAnalysis] = useState<{
    completeness: number;
    issues: string[];
    recommendations: string[];
  } | null>(null);

  const {
    smartValidation = true,
    autoComplete = true,
    smartDefaults = true,
    formAnalysis: enableFormAnalysis = true,
    predictiveHelp = true
  } = aiFeatures;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: initialData as DefaultValues<z.infer<T>>,
    mode: 'onChange'
  });

  // Watch form values for AI features
  const formValues = watch();

  // Analyze form for smart features
  const { execute: analyzeForm, loading: analysisLoading } = useAsync(
    async (data: Partial<z.infer<T>>) => {
      if (!onAnalyzeForm) return null;
      const result = await onAnalyzeForm(data);
      setFormAnalysis(result);
      return result;
    }
  );

  // Auto-analyze form when data changes
  useEffect(() => {
    if (enableFormAnalysis && onAnalyzeForm && Object.keys(formValues).length > 0) {
      const timeoutId = setTimeout(() => {
        analyzeForm(formValues);
      }, 1000); // Debounce analysis

      return () => clearTimeout(timeoutId);
    }
  }, [formValues, enableFormAnalysis, onAnalyzeForm]);

  // Apply smart defaults
  useEffect(() => {
    if (!smartDefaults) return;

    Object.entries(smartFields).forEach(([fieldName, config]) => {
      if (config.smartDefaults && config.defaultValue !== undefined && !formValues[fieldName as keyof T]) {
        setValue(fieldName as any, config.defaultValue);
      }
    });
  }, [smartFields, smartDefaults, setValue, formValues]);

  // Filter suggestions by current field
  const fieldSuggestions = useMemo(() => {
    return currentSuggestions.filter(suggestion => {
      const fieldConfig = smartFields[suggestion.field];
      return fieldConfig?.aiEnabled !== false;
    });
  }, [currentSuggestions, smartFields]);

  // Filter validations by current field
  const fieldValidations = useMemo(() => {
    return currentValidations.filter(validation => {
      const fieldConfig = smartFields[validation.field];
      return fieldConfig?.predictiveValidation !== false;
    });
  }, [currentValidations, smartFields]);

  // Handle suggestion application
  const handleSuggestionApply = useCallback((suggestion: SmartSuggestion) => {
    setValue(suggestion.field as any, suggestion.value);
    onSuggestionApply?.(suggestion.id);
    
    // Remove applied suggestion
    setCurrentSuggestions(prev => 
      prev.filter(s => s.id !== suggestion.id)
    );
  }, [setValue, onSuggestionApply]);

  // Handle validation fix
  const handleValidationFix = useCallback((validation: SmartValidation) => {
    if (validation.fix) {
      validation.fix.action();
      onValidationFix?.(validation.field + validation.rule);
    }
  }, [onValidationFix]);

  // Get validation severity color
  const getValidationColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Enhanced form sections with AI features
  const enhancedSections = useMemo(() => {
    return sections.map(section => ({
      ...section,
      fields: section.fields.map(field => {
        const fieldConfig = smartFields[field.name];
        if (!fieldConfig) return field;

        return {
          ...field,
          // Add AI-powered features to field
          description: [
            field.description,
            fieldConfig.defaultReason && !formValues[field.name as keyof T] 
              ? `AI suggestion: ${fieldConfig.defaultReason}` 
              : null
          ].filter(Boolean).join(' '),
          
          // Add suggestions to select fields
          options: field.type === 'select' && fieldConfig.suggestions
            ? fieldConfig.suggestions.map(s => ({
                value: s.value,
                label: `${s.label} ${s.confidence ? `(${s.confidence}% confidence)` : ''}`
              }))
            : field.options
        };
      })
    }));
  }, [sections, smartFields, formValues]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* AI Suggestions Panel */}
      {aiFeatures.autoComplete && fieldSuggestions.length > 0 && (
        <BaseCard className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">AI Suggestions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showSuggestions && (
            <div className="space-y-3">
              {fieldSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="p-3 rounded-lg border border-blue-200 bg-blue-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{suggestion.field}</span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {suggestion.reason}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Suggested value:</span>
                        <span className="text-sm bg-white px-2 py-1 rounded border">
                          {String(suggestion.value)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionApply(suggestion)}
                      className="ml-3"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BaseCard>
      )}

      {/* Smart Validation Panel */}
      {aiFeatures.smartValidation && fieldValidations.length > 0 && (
        <BaseCard className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Smart Validation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowValidations(!showValidations)}
            >
              {showValidations ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showValidations && (
            <div className="space-y-3">
              {fieldValidations.map(validation => (
                <div
                  key={validation.field + validation.rule}
                  className={cn(
                    'p-3 rounded-lg border',
                    getValidationColor(validation.severity)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{validation.field}</span>
                        <Badge variant="outline" className="text-xs">
                          {validation.rule}
                        </Badge>
                      </div>
                      <p className="text-sm">{validation.message}</p>
                    </div>
                    
                    {validation.fix && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidationFix(validation)}
                        className="ml-3"
                      >
                        {validation.fix.label}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </BaseCard>
      )}

      {/* Form Analysis Panel */}
      {aiFeatures.formAnalysis && formAnalysis && (
        <BaseCard className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Form Analysis</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => analyzeForm(formValues)}
              disabled={analysisLoading}
            >
              {analysisLoading ? 'Analyzing...' : 'Refresh'}
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Completeness */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Completeness</h4>
                <span className="text-sm font-medium">
                  {formAnalysis.completeness}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formAnalysis.completeness}%` }}
                />
              </div>
            </div>

            {/* Issues */}
            {formAnalysis.issues.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Issues to Address</h4>
                <ul className="list-disc list-inside space-y-1">
                  {formAnalysis.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {formAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {formAnalysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-blue-600">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </BaseCard>
      )}

      {/* Enhanced AutoForm */}
      <AutoForm
        schema={schema}
        sections={enhancedSections}
        onSubmit={onSubmit}
        onCancel={onCancel}
        initialData={initialData}
        submitText={submitText}
        cancelText={cancelText}
        disabled={disabled}
        loading={loading}
        title={title}
        description={description}
      />
    </div>
  );
}

export default SmartForm;