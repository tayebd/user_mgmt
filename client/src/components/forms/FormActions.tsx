'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, RotateCcw, X, CheckCircle, AlertCircle } from 'lucide-react';

export interface FormActionsProps {
  // Basic actions
  onCancel?: () => void;
  onReset?: () => void;
  onSubmit?: () => void;
  onClear?: () => void;

  // Loading states
  isSubmitting?: boolean;
  isValid?: boolean;
  isLoading?: boolean;

  // Labels
  submitText?: string;
  cancelText?: string;
  resetText?: string;
  clearText?: string;

  // Status and variants
  submitVariant?: 'default' | 'destructive' | 'success' | 'outline';
  cancelVariant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';

  // Layout
  alignment?: 'left' | 'center' | 'right';
  className?: string;

  // Status indicators
  status?: 'idle' | 'validating' | 'success' | 'error' | 'warning';
  statusMessage?: string;
  showStatus?: boolean;

  // Advanced options
  confirmBeforeSubmit?: boolean;
  confirmText?: string;
  disableOnInvalid?: boolean;
  showResetOnSuccess?: boolean;
  autoSave?: boolean;
  autoSaveMessage?: string;
}

/**
 * Standardied form actions component for consistent form behavior
 */
export function FormActions({
  onCancel,
  onReset,
  onSubmit,
  onClear,

  isSubmitting = false,
  isValid = true,
  isLoading = false,

  submitText = 'Submit',
  cancelText = 'Cancel',
  resetText = 'Reset',
  clearText = 'Clear',

  submitVariant = 'default',
  cancelVariant = 'outline',
  size = 'default',

  alignment = 'right',
  className = '',

  status,
  statusMessage,
  showStatus = false,

  confirmBeforeSubmit = false,
  confirmText = 'Are you sure you want to submit this form?',

  disableOnInvalid = true,
  showResetOnSuccess = false,
  autoSave = false,
  autoSaveMessage = 'Saving...',
}: FormActionsProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Determine if buttons should be disabled
  const isDisabled = disableOnInvalid ? !isValid || isLoading : isLoading;

  // Handle submit with confirmation
  const handleSubmit = React.useCallback(() => {
    if (isDisabled || isSubmitting) return;

    if (confirmBeforeSubmit) {
      setShowConfirm(true);
    } else {
      onSubmit?.();
    }
  }, [isValid, isLoading, isSubmitting, confirmBeforeSubmit, onSubmit]);

  // Handle confirmed submit
  const handleConfirmSubmit = React.useCallback(() => {
    setShowConfirm(false);
    onSubmit?.();
  }, [onSubmit]);

  // Handle confirmation cancellation
  const handleConfirmCancel = React.useCallback(() => {
    setShowConfirm(false);
  }, []);

  // Status indicator configurations
  const getStatusIcon = React.useCallback(() => {
    switch (status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  }, [status]);

  const getStatusColor = React.useCallback(() => {
    switch (status) {
      case 'validating':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }, [status]);

  return (
    <div className={`flex gap-3 ${alignment === 'left' ? '' : 'ml-auto'} ${alignment === 'right' ? 'justify-end' : ''} ${className}`}>
      {/* Status Display */}
      {(showStatus || status) && statusMessage && (
        <Alert className={`mb-4 ${status === 'error' ? 'destructive' : status === 'warning' ? 'default' : ''}`}>
          {getStatusIcon()}
          <AlertDescription className="flex items-center">
            <span className={getStatusColor()}>{statusMessage}</span>
            {autoSave && status === 'validating' && (
              <span className="text-sm text-gray-500 ml-2">({autoSaveMessage})</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Left-aligned actions */}
      {alignment === 'left' && (
        <>
          {onClear && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={onClear}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {clearText}
            </Button>
          )}

          {onReset && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={onReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {resetText}
            </Button>
          )}

          {onCancel && (
            <Button
              type="button"
              variant={cancelVariant}
              size={size}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              {cancelText}
            </Button>
          )}

          <Button
            type="submit"
            variant={submitVariant}
            size={size}
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {submitVariant === 'success' ? <CheckCircle className="mr-2 h-4 w-4" /> : submitVariant === 'destructive' ? <AlertCircle className="mr-2 h-4 w-4" /> : null}
                {submitText}
              </>
            )}
          </Button>
        </>
      )}

      {/* Center-aligned actions */}
      {alignment === 'center' && (
        <>
          {onCancel && (
            <Button
              type="button"
              variant={cancelVariant === 'secondary' ? 'secondary' : cancelVariant}
              size={size}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelText}
            </Button>
          )}

          {onClear && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={onClear}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {clearText}
            </Button>
          )}

          {onReset && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={onReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {resetText}
            </Button>
          )}

          <Button
            type="submit"
            variant={submitVariant}
            size={size}
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {submitVariant === 'success' ? <CheckCircle className="mr-2 h-4 w-4" /> : submitVariant === 'destructive' ? <AlertCircle className="mr-2 h-4 w-4" /> : null}
                {submitText}
              </>
            )}
          </Button>

          {onSubmit && (
            <Button
              type="submit"
              variant={submitVariant}
              size={size}
              onClick={handleSubmit}
              disabled={isDisabled}
            >
              {submitText}
            </Button>
          )}
        </>
      )}

      {/* Right-aligned actions */}
      {alignment === 'right' && (
        <>
          {onCancel && (
            <Button
              type="button"
              variant={cancelVariant === 'secondary' ? 'secondary' : cancelVariant}
              size={size}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelText}
            </Button>
          )}

          {onReset && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={onReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {resetText}
            </Button>
          )}

          {onClear && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={onClear}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {clearText}
            </Button>
          )}

          <Button
            type="submit"
            variant={submitVariant}
            size={size}
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {status === 'success' ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                {submitText}
              </>
            )}
          </Button>
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Confirm Action</h3>
              <p className="text-gray-600 mt-2">{confirmText}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleConfirmCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormActions;