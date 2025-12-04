/**
 * Shared Components Index
 * Centralized exports for all reusable components
 */

// Layout Components
export { Container } from './layout/Container';
export type { ContainerProps } from './layout/Container';

// Data Components
export { default as DataTable } from './data/DataTable';
export type { DataTableProps, Column } from './data/DataTable';
export { DataCard, DataCardGrid } from './data/DataCard';
export type { DataCardProps, DataCardAction, DataCardGridProps } from './data/DataCard';
export { default as SearchBar } from './data/SearchBar';
export type { SearchBarProps, SearchFilter, SearchSuggestion } from './data/SearchBar';

// Feedback Components
export { Modal, ConfirmModal, AlertModal } from './feedback/Modal';
export type { ModalProps, ConfirmModalProps, AlertModalProps } from './feedback/Modal';
export {
  ErrorHandler,
  ErrorBoundary,
  ErrorToast,
  ErrorProvider,
  useError
} from './error/ErrorHandler';
export type {
  ErrorInfo,
  ErrorAction,
  ErrorHandlerProps,
  ErrorBoundaryProps,
  ErrorToastProps,
  ErrorContextType,
  ErrorProviderProps
} from './error/ErrorHandler';

// Loading Components
export {
  LoadingState,
  LoadingOverlay,
  LoadingButton,
  PageLoading
} from './loading/LoadingStates';
export type {
  LoadingStateProps,
  LoadingOverlayProps,
  LoadingButtonProps,
  PageLoadingProps
} from './loading/LoadingStates';

// AI Components
export { SmartForm } from './ai/SmartForm';
export type {
  SmartFormProps,
  SmartSuggestion,
  SmartValidation,
  SmartFieldConfig
} from './ai/SmartForm';

// Theme Components
export { ThemeProvider, useTheme, cnTheme, themeVars } from './theme/ThemeProvider';
export type { Theme, ThemeProviderProps } from './theme/ThemeProvider';

// Hooks
export { default as useAsync } from '../hooks/useAsync';
export type { UseAsyncOptions, UseAsyncReturn } from '../hooks/useAsync';
export { default as useDebounce, useDebouncedCallback } from '../hooks/useDebounce';
export type { UseDebounceOptions } from '../hooks/useDebounce';
export {
  default as useLocalStorage,
  useLocalStorageBoolean,
  useLocalStorageNumber,
  useLocalStorageString,
  useLocalStorageObject,
  useLocalStorageWithExpiration
} from '../hooks/useLocalStorage';
export type { UseLocalStorageOptions } from '../hooks/useLocalStorage';
export {
  default as useQueryParams,
  usePaginationParams,
  useFilterParams,
  useSearchParams
} from '../hooks/useQueryParams';
export type { UseQueryParamsOptions, QueryParams } from '../hooks/useQueryParams';
