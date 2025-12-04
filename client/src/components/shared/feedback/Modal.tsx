/**
 * Modal Component
 * A flexible modal dialog component with multiple variants and sizes
 * Supports custom content, actions, and accessibility features
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BaseCard } from '@/components/ui/base-card';

export interface ModalProps {
  // Control
  open: boolean;
  onClose: () => void;
  
  // Content
  title?: string;
  description?: string;
  children: React.ReactNode;
  
  // Sizing
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  
  // Behavior
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventClose?: boolean;
  
  // Styling
  className?: string;
  overlayClassName?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4'
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  primaryAction,
  secondaryAction,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventClose = false,
  className,
  overlayClassName,
  ariaLabel,
  ariaDescribedBy
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape || preventClose) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose, preventClose]);

  // Handle focus management
  useEffect(() => {
    if (!open) return;

    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick && !preventClose) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in duration-200',
        overlayClassName
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy}
    >
      <BaseCard
        ref={modalRef}
        className={cn(
          'w-full',
          sizeClasses[size],
          'animate-in zoom-in-95 duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-end gap-3">
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                >
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'default'}
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled || primaryAction.loading}
                >
                  {primaryAction.loading ? 'Loading...' : primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Close button */}
        {!preventClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </BaseCard>
    </div>
  );
}

// Modal variants for common use cases
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'size'> {
  message: string;
  confirmVariant?: 'default' | 'destructive';
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmModal({
  message,
  confirmVariant = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onClose,
  onConfirm,
  ...props
}: ConfirmModalProps & { onConfirm: () => void }) {
  return (
    <Modal
      {...props}
      open={props.open}
      onClose={onClose}
      size="sm"
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        variant: confirmVariant
      }}
      secondaryAction={{
        label: cancelLabel,
        onClick: onClose
      }}
    >
      <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </Modal>
  );
}

export interface AlertModalProps extends Omit<ModalProps, 'children' | 'size' | 'secondaryAction'> {
  message: string;
  alertLabel?: string;
  variant?: 'default' | 'destructive';
}

export function AlertModal({
  message,
  alertLabel = 'OK',
  variant = 'default',
  onClose,
  ...props
}: AlertModalProps) {
  return (
    <Modal
      {...props}
      open={props.open}
      onClose={onClose}
      size="sm"
      primaryAction={{
        label: alertLabel,
        onClick: onClose,
        variant
      }}
    >
      <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </Modal>
  );
}

export default Modal;