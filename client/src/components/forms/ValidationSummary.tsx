'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface ValidationSummaryProps {
  // Validation state
  errors: Record<string, { message: string; type: 'error' | 'warning' | 'info' }>;
  warnings?: Record<string, string>;
  isValid: boolean;
  isDirty?: boolean;

  // Display options
  title?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'expanded';
  showSuccessMessage?: boolean;
  successMessage?: string;

  // Styling
  className?: string;
  position?: 'top' | 'bottom' | 'static';
}

/**
 * Validation summary component for form feedback
 */
export function ValidationSummary({
  errors,
  warnings = {},
  isValid,
  isDirty = false,
  title = 'Form Validation',
  description,
  variant = 'default',
  showSuccessMessage = false,
  successMessage,
  className = '',
  position = 'top',
}: ValidationSummaryProps) {
  // Get error entries
  const errorEntries = Object.entries(errors);
  const warningEntries = Object.entries(warnings);

  // Determine if there are any issues
  const hasErrors = errorEntries.length > 0;
  const hasWarnings = warningEntries.length > 0;
  const hasIssues = hasErrors || hasWarnings;

  // Generate summary message
  const getSummaryMessage = () => {
    if (showSuccessMessage && isValid && !isDirty) {
      return successMessage || 'Form is valid and ready to submit';
    }

    if (hasErrors) {
      const errorCount = errorEntries.length;
      return `${errorCount} error${errorCount === 1 ? '' : 's'} found`;
    }

    if (hasWarnings) {
      const warningCount = warningEntries.length;
      return `${warningCount} warning${warningCount === 1 ? '' : 's'} found`;
    }

    if (isValid && !isDirty) {
      return 'Form is valid';
    }

    return null;
  };

  const renderCompact = () => (
    <Alert className={`${className} mb-4`}>
      <AlertDescription className="flex items-center">
        {hasErrors && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">Please fix {errorEntries.length} error{errorEntries.length === 1 ? '' : 's'}</span>
          </div>
        )}
        {hasWarnings && (
          <div className="flex items-center text-yellow-600 ml-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="font-medium">{warningEntries.length} warning{warningEntries.length === 1 ? '' : 's'}</span>
          </div>
        )}
        {!hasIssues && isValid && (
          <div className="flex items-center text-green-600 ml-4">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span className="font-medium">Form is valid</span>
          </div>
        )}
        {description && (
          <span className="text-gray-600 ml-2">({description})</span>
        )}
      </AlertDescription>
    </Alert>
  );

  const renderExpanded = () => (
    <div className={`space-y-4 ${className}`}>
      {/* Success Message */}
      {showSuccessMessage && isValid && !isDirty && (
        <Alert>
          <AlertDescription className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium text-green-600">
              {successMessage || 'Form is valid and ready to submit'}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Errors Section */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="flex items-center mb-3">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="font-semibold">{title}</span>
            </div>
            <div className="space-y-2">
              {errorEntries.map(([field, error]) => (
                <div key={field} className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                  </div>
                  <div>
                    <div className="font-medium">{field}</div>
                    <div className="text-sm">{error.message}</div>
                  </div>
                </div>
              ))}
            </div>
            {errorEntries.length === 1 && (
              <div className="mt-3 text-sm">
                Please correct the {errorEntries[0][0]} field.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings Section */}
      {hasWarnings && (
        <Alert>
          <AlertDescription>
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-semibold">Warnings</span>
            </div>
            <div className="space-y-2">
              {warningEntries.map(([field, message]) => (
                <div key={field} className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                  </div>
                  <div>
                    <div className="font-medium">{field}</div>
                    <div className="text-sm">{message}</div>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Status */}
      {!hasIssues && (
        <div className="text-center text-gray-600">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <p className="font-medium">{getSummaryMessage()}</p>
          {description && (
            <p className="text-sm mt-2">{description}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderDefault = () => (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sm text-gray-600">
          Status:
          <span className={
            isValid ? 'text-green-600 font-medium' :
            hasErrors ? 'text-red-600 font-medium' :
            'text-yellow-600 font-medium'
          }>
            {isValid ? 'Valid' : hasErrors ? 'Errors' : 'Warnings'}
          </span>
        </div>
      </div>

      {/* Summary Message */}
      {getSummaryMessage() && (
        <Alert>
          <AlertDescription>
            {getSummaryMessage()}
          </AlertDescription>
        </Alert>
      )}

      {/* Issues Details */}
      {(hasErrors || hasWarnings) && (
        <div className="space-y-3">
          {hasErrors && (
            <div>
              <h4 className="font-medium text-red-600 mb-2">Errors ({errorEntries.length})</h4>
              <div className="space-y-2">
                {errorEntries.map(([field, error]) => (
                  <div key={field} className="flex items-start p-3 border border-red-200 rounded-lg bg-red-50">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-600" />
                    <div className="flex-1">
                      <div className="font-medium text-red-800">{field}</div>
                      <div className="text-sm text-red-600">{error.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasWarnings && (
            <div>
              <h4 className="font-medium text-yellow-600 mb-2">Warnings ({warningEntries.length})</h4>
              <div className="space-y-2">
                {warningEntries.map(([field, message]) => (
                  <div key={field} className="flex items-start p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-medium text-yellow-800">{field}</div>
                      <div className="text-sm text-yellow-600">{message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'expanded':
      return renderExpanded();
    default:
      return renderDefault();
  }
}

export default ValidationSummary;