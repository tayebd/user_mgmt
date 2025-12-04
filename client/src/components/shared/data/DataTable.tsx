/**
 * DataTable Component
 * A powerful and flexible data table component with sorting, filtering, pagination, and row selection.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Types
export interface Column<T = Record<string, any>> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  filterOptions?: { value: string; label: string }[];
  className?: string;
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
}

export interface RowSelectionConfig<T = Record<string, any>> {
  selectedRowKeys: (keyof T | string)[];
  onChange?: (selectedRowKeys: (keyof T | string)[], selectedRows: T[]) => void;
}

export interface SearchConfig {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface DataTableProps<T = Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  rowSelection?: RowSelectionConfig<T>;
  search?: SearchConfig;
  emptyState?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

// DataTable Component
export function DataTable<T = Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  rowSelection,
  search,
  emptyState,
  className,
  onRowClick
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null
  });

  const [filterConfig /* setFilterConfig */] = useState<{
    key: keyof T | null;
    value: string;
  }>({
    key: null,
    value: ''
  });

  const [currentPage, setCurrentPage] = useState(pagination?.current || 1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const sortKey = sortConfig.key as keyof T;
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue === null || bValue === null) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterConfig.key || !filterConfig.value) return sortedData;

    return sortedData.filter(item => {
      const filterKey = filterConfig.key as keyof T;
      const value = item[filterKey];
      if (value === undefined || value === null) return false;

      return String(value).toLowerCase().includes(filterConfig.value.toLowerCase());
    });
  }, [sortedData, filterConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Handle sort
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        // Toggle direction if same key
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // Set new key with default asc direction
        return {
          key,
          direction: 'asc'
        };
      }
    });
  }, []);

  // Handle filter (not currently used, but available for future implementation)
  // const handleFilter = useCallback((key: keyof T, value: string) => {
  //   setFilterConfig({ key, value });
  // }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    pagination?.onChange?.(page, pageSize);
  }, [pagination, pageSize]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    pagination?.onChange?.(1, newPageSize);
  }, [pagination]);

  // Handle row selection
  const handleRowSelection = useCallback((rowKey: keyof T | string, checked: boolean) => {
    if (!rowSelection) return;

    const newSelectedRowKeys = checked
      ? [...rowSelection.selectedRowKeys, rowKey]
      : rowSelection.selectedRowKeys.filter(key => key !== rowKey);

    const newSelectedRows = data.filter(item => newSelectedRowKeys.includes((item as any).id as keyof T | string));

    rowSelection.onChange?.(newSelectedRowKeys, newSelectedRows);
  }, [data, rowSelection]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!rowSelection) return;

    const newSelectedRowKeys = checked
      ? paginatedData.map(item => (item as any).id as keyof T | string)
      : [];

    rowSelection.onChange?.(newSelectedRowKeys, paginatedData);
  }, [paginatedData, rowSelection]);

  // Check if all rows are selected
  const allSelected = useMemo(() => {
    if (!rowSelection || paginatedData.length === 0) return false;

    return paginatedData.every(item => rowSelection.selectedRowKeys.includes((item as any).id as keyof T | string));
  }, [paginatedData, rowSelection]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(filteredData.length / pageSize);
  }, [filteredData.length, pageSize]);

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      {/* Search Bar */}
      {search && (
        <div className="p-4 border-b border-gray-200">
          <div className="max-w-md">
            <input
              type="text"
              placeholder={search.placeholder || 'Search...'}
              value={search.value}
              onChange={(e) => search.onChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox for select all */}
              {rowSelection && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable && (
                      <span className="ml-2">
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="px-6 py-4 text-center">
                  {emptyState || (
                    <div className="text-gray-500">
                      <p>No data available</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={String((row as any).id)}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-gray-50'
                  )}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {/* Checkbox for row selection */}
                  {rowSelection && (
                    <td className="px-6 py-4 whitespace-nowrap w-12">
                      <input
                        type="checkbox"
                        checked={rowSelection.selectedRowKeys.includes((row as any).id as keyof T | string)}
                        onChange={(e) => handleRowSelection((row as any).id as keyof T | string, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}

                  {/* Data Cells */}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap',
                        column.className
                      )}
                    >
                      {column.render ? (
                        column.render(row[column.key], row, index)
                      ) : (
                        String(row[column.key] ?? '')
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing
                <span className="font-medium"> {(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, filteredData.length)}
                </span>{' '}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  className={cn(
                    currentPage === 1
                      ? 'bg-blue-50 border-blue-500 text-blue-600 relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 text-sm font-medium'
                  )}
                >
                  1
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={cn(
                    'relative inline-flex items-center px-4 py-2 text-sm font-medium',
                    currentPage <= 1
                      ? 'bg-white border-gray-300 text-gray-500 opacity-50 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        currentPage === pageNum
                          ? 'bg-blue-50 border-blue-500 text-blue-600 relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 text-sm font-medium'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'relative inline-flex items-center px-4 py-2 text-sm font-medium',
                    currentPage >= totalPages
                      ? 'bg-white border-gray-300 text-gray-500 opacity-50 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={cn(
                    currentPage === totalPages
                      ? 'bg-blue-50 border-blue-500 text-blue-600 relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 text-sm font-medium'
                  )}
                >
                  {totalPages}
                </button>
              </nav>
            </div>
            <div className="flex items-center">
              <label htmlFor="page-size" className="mr-2 text-sm text-gray-700">
                Page size
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default DataTable;
