'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// Generic API response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// Generic CRUD operations hook
export interface UseCRUDOptions<T> {
  // API functions
  create: (data: Partial<T>) => Promise<ApiResponse<T>>;
  read: (id?: string | number) => Promise<ApiResponse<T | T[]>>;
  update: (id: string | number, data: Partial<T>) => Promise<ApiResponse<T>>;
  delete: (id: string | number) => Promise<ApiResponse<void>>;

  // Configuration
  optimisticUpdates?: boolean;
  validateOnCreate?: (data: Partial<T>) => string | null;
  validateOnUpdate?: (data: Partial<T>) => string | null;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  refreshOnCreate?: boolean;
  refreshOnUpdate?: boolean;
  refreshOnDelete?: boolean;
}

// CRUD state interface
export interface CRUDState<T> {
  data: T | T[] | null;
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// Generic CRUD hook return type
export interface UseCRUDReturn<T> extends CRUDState<T> {
  // Actions
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string | number, data: Partial<T>) => Promise<T | null>;
  remove: (id: string | number) => Promise<boolean>;
  refresh: () => Promise<void>;

  // State setters for manual control
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Generic CRUD hook for consistent data operations across the application
 *
 * @param options Configuration options and API functions
 * @returns CRUD state and actions
 *
 * @example
 * ```tsx
 * const { data, create, update, remove, isLoading, error } = useCRUD<User>({
 *   create: userService.create,
 *   read: userService.get,
 *   update: userService.update,
 *   delete: userService.remove,
 *   successMessages: {
 *     create: 'User created successfully',
 *     update: 'User updated successfully',
 *     delete: 'User deleted successfully'
 *   }
 * });
 * ```
 */
export function useCRUD<T extends { id?: string | number }>(
  options: UseCRUDOptions<T>
): UseCRUDReturn<T> {
  const {
    create,
    read,
    update,
    delete: deleteFn,
    optimisticUpdates = false,
    validateOnCreate,
    validateOnUpdate,
    successMessages = {},
    errorMessages = {},
    refreshOnCreate = true,
    refreshOnUpdate = true,
    refreshOnDelete = true,
  } = options;

  const [state, setState] = useState<CRUDState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  });

  // Clear error helper
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set error helper
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Set loading helper
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  // Optimistic update helper
  const updateOptimistically = useCallback((id: string | number, updates: Partial<T>) => {
    if (!optimisticUpdates) return;

    setState(prev => ({
      ...prev,
      data: Array.isArray(prev.data)
        ? prev.data.map(item =>
            (item.id === id || String(item.id) === String(id))
              ? { ...item, ...updates }
              : item
          )
        : prev.data
    }));
  }, [optimisticUpdates]);

  // Create action
  const handleCreate = useCallback(async (data: Partial<T>): Promise<T | null> => {
    // Validation
    if (validateOnCreate) {
      const validationError = validateOnCreate(data);
      if (validationError) {
        setError(validationError);
        return null;
      }
    }

    setState(prev => ({ ...prev, isCreating: true, error: null }));
    clearError();

    try {
      const response = await create(data);

      if (response.error || !response.data) {
        const errorMessage = response.error || errorMessages.create || 'Failed to create item';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }

      // Optimistic update for list data
      if (Array.isArray(state.data)) {
        setState(prev => ({
          ...prev,
          data: Array.isArray(prev.data) ? [...prev.data, response.data!] : [response.data!]
        }));
      } else {
        setState(prev => ({ ...prev, data: response.data || null }));
      }

      if (successMessages.create) {
        toast.success(successMessages.create);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (errorMessages.create || 'Failed to create item');
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setState(prev => ({ ...prev, isCreating: false }));
    }
  }, [create, validateOnCreate, errorMessages, successMessages, state.data, clearError, setError]);

  // Read action
  const handleRead = useCallback(async (id?: string | number): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    clearError();

    try {
      const response = await read(id);

      if (response.error) {
        const errorMessage = response.error || 'Failed to fetch data';
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setState(prev => ({ ...prev, data: response.data || null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [read, clearError, setError]);

  // Update action
  const handleUpdate = useCallback(async (id: string | number, data: Partial<T>): Promise<T | null> => {
    // Validation
    if (validateOnUpdate) {
      const validationError = validateOnUpdate(data);
      if (validationError) {
        setError(validationError);
        return null;
      }
    }

    setState(prev => ({ ...prev, isUpdating: true, error: null }));
    clearError();

    try {
      // Optimistic update
      updateOptimistically(id, data);

      const response = await update(id, data);

      if (response.error || !response.data) {
        const errorMessage = response.error || errorMessages.update || 'Failed to update item';
        setError(errorMessage);
        toast.error(errorMessage);

        // Revert optimistic update on error
        if (refreshOnUpdate) {
          await handleRead();
        }
        return null;
      }

      if (successMessages.update) {
        toast.success(successMessages.update);
      }

      // Refresh data to get latest state
      if (refreshOnUpdate) {
        await handleRead();
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (errorMessages.update || 'Failed to update item');
      setError(errorMessage);
      toast.error(errorMessage);

      // Revert optimistic update on error
      if (refreshOnUpdate) {
        await handleRead();
      }
      return null;
    } finally {
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [update, validateOnUpdate, errorMessages, successMessages, refreshOnUpdate, updateOptimistically, handleRead, clearError, setError]);

  // Delete action
  const handleDelete = useCallback(async (id: string | number): Promise<boolean> => {
    setState(prev => ({ ...prev, isDeleting: true, error: null }));
    clearError();

    try {
      // Optimistic update
      if (optimisticUpdates && Array.isArray(state.data)) {
        setState(prev => ({
          ...prev,
          data: Array.isArray(prev.data) ? prev.data.filter(item => item.id !== id && String(item.id) !== String(id)) : prev.data
        }));
      }

      const response = await deleteFn(id);

      if (response.error) {
        const errorMessage = response.error || errorMessages.delete || 'Failed to delete item';
        setError(errorMessage);
        toast.error(errorMessage);

        // Revert optimistic update on error
        if (refreshOnDelete) {
          await handleRead();
        }
        return false;
      }

      if (successMessages.delete) {
        toast.success(successMessages.delete);
      }

      // Refresh data to get latest state
      if (refreshOnDelete) {
        await handleRead();
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (errorMessages.delete || 'Failed to delete item');
      setError(errorMessage);
      toast.error(errorMessage);

      // Revert optimistic update on error
      if (refreshOnDelete) {
        await handleRead();
      }
      return false;
    } finally {
      setState(prev => ({ ...prev, isDeleting: false }));
    }
  }, [deleteFn, errorMessages, successMessages, refreshOnDelete, optimisticUpdates, state.data, handleRead, clearError, setError]);

  // Refresh action
  const handleRefresh = useCallback(async (): Promise<void> => {
    await handleRead();
  }, [handleRead]);

  return {
    // State
    ...state,

    // Actions
    create: handleCreate,
    update: handleUpdate,
    remove: handleDelete,
    refresh: handleRefresh,

    // State setters
    setLoading,
    setError,
    clearError,
  };
}

export default useCRUD;