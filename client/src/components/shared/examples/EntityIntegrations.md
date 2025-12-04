# Entity Integration Examples

This document provides examples of how to integrate the shared components with existing entity pages in the application.

## Table of Contents

- [PV Panels Integration](#pv-panels-integration)
- [Inverters Integration](#inverters-integration)
- [Organizations Integration](#organizations-integration)
- [Best Practices](#best-practices)

## PV Panels Integration

### Enhanced PV Panel List

```tsx
// src/app/pvpanels/PVPanelListEnhanced.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DataTable, 
  SearchBar, 
  LoadingState, 
  ErrorHandler,
  useDebounce,
  useQueryParams,
  usePaginationParams
} from '@/components/shared';
import { usePVPanelList } from '@/hooks/usePVPanelList';
import { PVPanel } from '@/types/pvpanel';

export function PVPanelListEnhanced() {
  const router = useRouter();
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // Use custom hooks for data fetching
  const { data: panels, loading, refetch } = usePVPanelList();
  
  // Use query params for filtering and pagination
  const { filters, setFilter, removeFilter, clearFilters } = useFilterParams({
    status: 'all',
    location: 'all'
  });
  
  const { page, limit, setPage, nextPage, prevPage, resetPagination } = usePaginationParams(1, 10);
  
  // Use debounced search
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, { delay: 300 });
  
  // Apply filters and search to data
  const filteredPanels = React.useMemo(() => {
    let filtered = panels || [];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(panel => 
        panel.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        panel.serialNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(panel => panel.status === filters.status);
    }
    
    // Apply location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(panel => panel.location === filters.location);
    }
    
    return filtered;
  }, [panels, debouncedSearchTerm, filters]);
  
  // Paginate filtered data
  const paginatedPanels = React.useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredPanels.slice(startIndex, endIndex);
  }, [filteredPanels, page, limit]);
  
  // Handle panel selection
  const handlePanelSelection = (panelId: string) => {
    setSelectedPanels(prev => 
      prev.includes(panelId) 
        ? prev.filter(id => id !== panelId)
        : [...prev, panelId]
    );
  };
  
  // Handle panel actions
  const handleViewPanel = (panelId: string) => {
    router.push(`/pvpanel/${panelId}`);
  };
  
  const handleEditPanel = (panelId: string) => {
    router.push(`/pvpanel/${panelId}?mode=edit`);
  };
  
  const handleDeletePanel = async (panelId: string) => {
    try {
      await deletePVPanel(panelId);
      refetch();
      setSelectedPanels(prev => prev.filter(id => id !== panelId));
    } catch (err) {
      setError({
        type: 'network',
        title: 'Delete Failed',
        message: `Failed to delete panel: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        retryable: true
      });
    }
  };
  
  // Table columns definition
  const columns: Column<PVPanel>[] = [
    {
      key: 'name',
      title: 'Panel Name',
      sortable: true,
      filterable: true,
      render: (panel) => (
        <div className="font-medium">{panel.name}</div>
      )
    },
    {
      key: 'serialNumber',
      title: 'Serial Number',
      sortable: true,
      filterable: true,
      render: (panel) => (
        <div className="font-mono text-sm">{panel.serialNumber}</div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (panel) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            panel.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span>{panel.status}</span>
        </div>
      )
    },
    {
      key: 'powerRating',
      title: 'Power Rating',
      sortable: true,
      filterable: true,
      render: (panel) => (
        <div>{panel.powerRating}W</div>
      )
    },
    {
      key: 'location',
      title: 'Location',
      sortable: true,
      filterable: true,
      render: (panel) => (
        <div>{panel.location}</div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      filterable: false,
      render: (panel) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewPanel(panel.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </button>
          <button
            onClick={() => handleEditPanel(panel.id)}
            className="text-gray-600 hover:text-gray-800"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeletePanel(panel.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      )
    }
  ];
  
  // Handle search
  const handleSearch = (term: string, activeFilters: any) => {
    setSearchTerm(term);
    // Reset to first page when searching
    if (term !== searchTerm) {
      setPage(1);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilter(key as any, value);
    setPage(1); // Reset to first page when filtering
  };
  
  // Handle pagination
  const handlePaginationChange = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
  };
  
  // Handle bulk actions
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedPanels.map(id => deletePVPanel(id)));
      refetch();
      setSelectedPanels([]);
    } catch (err) {
      setError({
        type: 'network',
        title: 'Bulk Delete Failed',
        message: `Failed to delete selected panels: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        retryable: true
      });
    }
  };
  
  // Handle error retry
  const handleRetry = () => {
    setError(null);
    refetch();
  };
  
  // Handle error dismiss
  const handleDismissError = () => {
    setError(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorHandler
          error={error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">PV Panels</h2>
        
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          placeholder="Search panels..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              value: filters.status,
              options: [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' }
              ]
            },
            {
              key: 'location',
              label: 'Location',
              type: 'select',
              value: filters.location,
              options: [
                { value: 'all', label: 'All' },
                { value: 'roof-1', label: 'Roof 1' },
                { value: 'roof-2', label: 'Roof 2' },
                { value: 'ground', label: 'Ground' }
              ]
            }
          ]}
        />
        
        {/* Active Filters Display */}
        {(filters.status !== 'all' || filters.location !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.status !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Status: {filters.status}
              </span>
            )}
            {filters.location !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Location: {filters.location}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Bulk Actions */}
        {selectedPanels.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedPanels.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <LoadingState variant="spinner" size="lg" text="Loading panels..." />
          </div>
        ) : (
          <DataTable
            data={paginatedPanels}
            columns={columns}
            rowSelection={{
              selectedRowKeys: selectedPanels,
              onChange: setSelectedPanels
            }}
            pagination={{
              current: page,
              pageSize: limit,
              total: filteredPanels.length,
              onChange: handlePaginationChange
            }}
            emptyState={
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">No panels found</div>
                <p className="text-sm text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
```

### Enhanced PV Panel Form

```tsx
// src/app/pvpanel/PVPanelFormEnhanced.tsx
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  AutoForm, 
  LoadingButton, 
  ErrorHandler,
  useLocalStorage,
  useError
} from '@/components/shared';
import { usePVPanel, useCreatePVPanel, useUpdatePVPanel } from '@/hooks/usePVPanel';
import { PVPanel, PVPanelSchema } from '@/types/pvpanel';

export function PVPanelFormEnhanced() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelId = searchParams.get('id');
  const mode = searchParams.get('mode') || 'view';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  
  const { addError, removeError } = useError();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Use custom hooks for data fetching
  const { data: panel, loading: panelLoading, error: panelError } = usePVPanel(panelId);
  const createPanel = useCreatePVPanel();
  const updatePanel = useUpdatePVPanel(panelId);
  
  // Use localStorage for form drafts
  const [draft, setDraft] = useLocalStorage<PVPanel>(
    `pvpanel-draft-${panelId || 'new'}`,
    {} as PVPanel
  );
  
  // Initialize form with draft data if available
  const initialData = React.useMemo(() => {
    if (isEdit && panelId) {
      return panel || draft;
    }
    return draft;
  }, [isEdit, panelId, panel, draft]);
  
  // Handle form submission
  const handleSubmit = async (data: PVPanel) => {
    setLoading(true);
    setSubmitSuccess(false);
    removeError('submit-error');
    
    try {
      if (isEdit && panelId) {
        await updatePanel(data);
      } else {
        await createPanel(data);
      }
      
      // Clear draft on successful submission
      setDraft({} as PVPanel);
      setSubmitSuccess(true);
      
      // Redirect to list after successful submission
      setTimeout(() => {
        router.push('/pvpanels');
      }, 1500);
    } catch (err) {
      addError({
        id: 'submit-error',
        type: 'network',
        title: 'Submission Failed',
        message: `Failed to ${isEdit ? 'update' : 'create'} panel: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        retryable: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form cancellation
  const handleCancel = () => {
    router.push('/pvpanels');
  };
  
  // Handle save draft
  const handleSaveDraft = (data: PVPanel) => {
    setDraft(data);
  };
  
  // Handle error retry
  const handleRetry = () => {
    removeError('submit-error');
  };
  
  // Handle error dismiss
  const handleDismissError = () => {
    removeError('submit-error');
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit PV Panel' : isView ? 'View PV Panel' : 'Add PV Panel'}
          </h1>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isView && (
              <button
                onClick={() => router.push(`/pvpanel/${panelId}?mode=edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {/* Save Draft Button */}
            {!isView && (
              <button
                onClick={() => handleSaveDraft(initialData)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Save Draft
              </button>
            )}
          </div>
        </div>
        
        {/* Error Display */}
        <ErrorHandler
          error={panelError || (useError().errors.find(e => e.id === 'submit-error') || null)}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
        
        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  Success!
                </h3>
                <p className="text-sm text-green-700">
                  Panel {isEdit ? 'updated' : 'created'} successfully. Redirecting to panel list...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Form */}
        <AutoForm
          schema={PVPanelSchema}
          sections={[
            {
              title: 'Basic Information',
              fields: [
                {
                  name: 'name',
                  label: 'Panel Name',
                  type: 'text',
                  required: true,
                  disabled: isView
                },
                {
                  name: 'serialNumber',
                  label: 'Serial Number',
                  type: 'text',
                  required: true,
                  disabled: isView
                },
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  required: true,
                  disabled: isView,
                  options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'maintenance', label: 'Maintenance' }
                  ]
                }
              ]
            },
            {
              title: 'Technical Specifications',
              fields: [
                {
                  name: 'powerRating',
                  label: 'Power Rating (W)',
                  type: 'number',
                  required: true,
                  disabled: isView
                },
                {
                  name: 'voltageRating',
                  label: 'Voltage Rating (V)',
                  type: 'number',
                  required: true,
                  disabled: isView
                },
                {
                  name: 'currentRating',
                  label: 'Current Rating (A)',
                  type: 'number',
                  required: true,
                  disabled: isView
                }
              ]
            },
            {
              title: 'Location Information',
              fields: [
                {
                  name: 'location',
                  label: 'Location',
                  type: 'select',
                  required: true,
                  disabled: isView,
                  options: [
                    { value: 'roof-1', label: 'Roof 1' },
                    { value: 'roof-2', label: 'Roof 2' },
                    { value: 'ground', label: 'Ground' }
                  ]
                },
                {
                  name: 'installationDate',
                  label: 'Installation Date',
                  type: 'date',
                  required: true,
                  disabled: isView
                }
              ]
            }
          ]}
          initialData={initialData}
          onSubmit={handleSubmit}
          submitText={isEdit ? 'Update Panel' : 'Create Panel'}
          cancelText="Cancel"
          disabled={loading || panelLoading}
          loading={loading || panelLoading}
        />
        
        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <LoadingButton
            loading={loading || panelLoading}
            onClick={() => document.getElementById('auto-form-submit')?.click()}
            disabled={isView}
          >
            {isEdit ? 'Update Panel' : 'Create Panel'}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
```

## Inverters Integration

### Enhanced Inverter List

```tsx
// src/app/inverters/InverterListEnhanced.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DataTable, 
  SearchBar, 
  LoadingState, 
  ErrorHandler,
  useDebounce,
  useQueryParams,
  usePaginationParams,
  DataCard,
  DataCardGrid
} from '@/components/shared';
import { useInverterList } from '@/hooks/useInverterList';
import { Inverter } from '@/types/inverter';

export function InverterListEnhanced() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedInverters, setSelectedInverters] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // Use custom hooks for data fetching
  const { data: inverters, loading, refetch } = useInverterList();
  
  // Use query params for filtering and pagination
  const { filters, setFilter, removeFilter, clearFilters } = useFilterParams({
    status: 'all',
    type: 'all'
  });
  
  const { page, limit, setPage, nextPage, prevPage, resetPagination } = usePaginationParams(1, 12);
  
  // Use debounced search
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, { delay: 300 });
  
  // Apply filters and search to data
  const filteredInverters = React.useMemo(() => {
    let filtered = inverters || [];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(inverter => 
        inverter.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        inverter.model.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        inverter.serialNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(inverter => inverter.status === filters.status);
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(inverter => inverter.type === filters.type);
    }
    
    return filtered;
  }, [inverters, debouncedSearchTerm, filters]);
  
  // Paginate filtered data
  const paginatedInverters = React.useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredInverters.slice(startIndex, endIndex);
  }, [filteredInverters, page, limit]);
  
  // Handle inverter selection
  const handleInverterSelection = (inverterId: string) => {
    setSelectedInverters(prev => 
      prev.includes(inverterId) 
        ? prev.filter(id => id !== inverterId)
        : [...prev, inverterId]
    );
  };
  
  // Handle inverter actions
  const handleViewInverter = (inverterId: string) => {
    router.push(`/inverter/${inverterId}`);
  };
  
  const handleEditInverter = (inverterId: string) => {
    router.push(`/inverter/${inverterId}?mode=edit`);
  };
  
  const handleDeleteInverter = async (inverterId: string) => {
    try {
      await deleteInverter(inverterId);
      refetch();
      setSelectedInverters(prev => prev.filter(id => id !== inverterId));
    } catch (err) {
      setError({
        type: 'network',
        title: 'Delete Failed',
        message: `Failed to delete inverter: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        retryable: true
      });
    }
  };
  
  // Table columns definition
  const tableColumns: Column<Inverter>[] = [
    {
      key: 'name',
      title: 'Inverter Name',
      sortable: true,
      filterable: true,
      render: (inverter) => (
        <div className="font-medium">{inverter.name}</div>
      )
    },
    {
      key: 'model',
      title: 'Model',
      sortable: true,
      filterable: true,
      render: (inverter) => (
        <div className="font-mono text-sm">{inverter.model}</div>
      )
    },
    {
      key: 'serialNumber',
      title: 'Serial Number',
      sortable: true,
      filterable: true,
      render: (inverter) => (
        <div className="font-mono text-sm">{inverter.serialNumber}</div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      filterable: true,
      render: (inverter) => (
        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
          {inverter.type}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (inverter) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            inverter.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span>{inverter.status}</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      filterable: false,
      render: (inverter) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewInverter(inverter.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </button>
          <button
            onClick={() => handleEditInverter(inverter.id)}
            className="text-gray-600 hover:text-gray-800"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteInverter(inverter.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      )
    }
  ];
  
  // Handle search
  const handleSearch = (term: string, activeFilters: any) => {
    setSearchTerm(term);
    // Reset to first page when searching
    if (term !== searchTerm) {
      setPage(1);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilter(key as any, value);
    setPage(1); // Reset to first page when filtering
  };
  
  // Handle pagination
  const handlePaginationChange = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
  };
  
  // Handle bulk actions
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedInverters.map(id => deleteInverter(id)));
      refetch();
      setSelectedInverters([]);
    } catch (err) {
      setError({
        type: 'network',
        title: 'Bulk Delete Failed',
        message: `Failed to delete selected inverters: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        retryable: true
      });
    }
  };
  
  // Handle error retry
  const handleRetry = () => {
    setError(null);
    refetch();
  };
  
  // Handle error dismiss
  const handleDismissError = () => {
    setError(null);
  };
  
  // Render inverter cards
  const renderInverterCards = () => {
    return (
      <DataCardGrid data={paginatedInverters} columns={3}>
        {paginatedInverters.map(inverter => (
          <DataCard
            key={inverter.id}
            title={inverter.name}
            subtitle={inverter.model}
            description={`Serial: ${inverter.serialNumber}`}
            metadata={[
              { label: 'Type', value: inverter.type },
              { label: 'Status', value: inverter.status }
            ]}
            badges={[
              { text: inverter.type, variant: 'default' },
              { 
                text: inverter.status, 
                variant: inverter.status === 'active' ? 'secondary' : 'outline' 
              }
            ]}
            actions={[
              { label: 'View', onClick: () => handleViewInverter(inverter.id) },
              { label: 'Edit', onClick: () => handleEditInverter(inverter.id) },
              { 
                label: 'Delete', 
                onClick: () => handleDeleteInverter(inverter.id),
                variant: 'destructive' 
              }
            ]}
            onClick={() => handleInverterSelection(inverter.id)}
            selected={selectedInverters.includes(inverter.id)}
          />
        ))}
      </DataCardGrid>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorHandler
          error={error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Inverters</h2>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
        
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          placeholder="Search inverters..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              value: filters.status,
              options: [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' }
              ]
            },
            {
              key: 'type',
              label: 'Type',
              type: 'select',
              value: filters.type,
              options: [
                { value: 'all', label: 'All' },
                { value: 'string', label: 'String' },
                { value: 'central', label: 'Central' },
                { value: 'micro', label: 'Micro' }
              ]
            }
          ]}
        />
        
        {/* Active Filters Display */}
        {(filters.status !== 'all' || filters.type !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.status !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Status: {filters.status}
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Type: {filters.type}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Bulk Actions */}
        {selectedInverters.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedInverters.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>
      
      {/* Data Display */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <LoadingState variant="spinner" size="lg" text="Loading inverters..." />
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <DataTable
                data={paginatedInverters}
                columns={tableColumns}
                rowSelection={{
                  selectedRowKeys: selectedInverters,
                  onChange: setSelectedInverters
                }}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total: filteredInverters.length,
                  onChange: handlePaginationChange
                }}
                emptyState={
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No inverters found</div>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                }
              />
            ) : (
              renderInverterCards()
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

## Organizations Integration

### Enhanced Organization List

```tsx
// src/app/organizations/OrganizationListEnhanced.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DataTable, 
  SearchBar, 
  LoadingState, 
  ErrorHandler,
  useDebounce,
  useQueryParams,
  usePaginationParams,
  DataCard,
  DataCardGrid
} from '@/components/shared';
import { useOrganizationList } from '@/hooks/useOrganizationList';
import { Organization } from '@/types/organization';

export function OrganizationListEnhanced() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // Use custom hooks for data fetching
  const { data: organizations, loading, refetch } = useOrganizationList();
  
  // Use query params for filtering and pagination
  const { filters, setFilter, removeFilter, clearFilters } = useFilterParams({
    status: 'all',
    type: 'all'
  });
  
  const { page, limit, setPage, nextPage, prevPage, resetPagination } = usePaginationParams(1, 10);
  
  // Use debounced search
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, { delay: 300 });
  
  // Apply filters and search to data
  const filteredOrganizations = React.useMemo(() => {
    let filtered = organizations || [];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(organization => 
        organization.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        organization.domain.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(organization => organization.status === filters.status);
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(organization => organization.type === filters.type);
    }
    
    return filtered;
  }, [organizations, debouncedSearchTerm, filters]);
  
  // Paginate filtered data
  const paginatedOrganizations = React.useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredOrganizations.slice(startIndex, endIndex);
  }, [filteredOrganizations, page, limit]);
  
  // Handle organization selection
  const handleOrganizationSelection = (organizationId: string) => {
    setSelectedOrganizations(prev => 
      prev.includes(organizationId) 
        ? prev.filter(id => id !== organizationId)
        : [...prev, organizationId]
    );
  };
  
  // Handle organization actions
  const handleViewOrganization = (organizationId: string) => {
    router.push(`/organization/${organizationId}`);
  };
  
  const handleEditOrganization = (organizationId: string) => {
    router.push(`/organization/${organizationId}?mode=edit`);
  };
  
  const handleDeleteOrganization = async (organizationId: string) => {
    try {
      await deleteOrganization(organizationId);
      refetch();
      setSelectedOrganizations(prev => prev.filter(id => id !== organizationId));
    } catch (err) {
      setError({
        type: 'network',
        title: 'Delete Failed',
        message: `Failed to delete organization: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        retryable: true
      });
    }
  };
  
  // Table columns definition
  const tableColumns: Column<Organization>[] = [
    {
      key: 'name',
      title: 'Organization Name',
      sortable: true,
      filterable: true,
      render: (organization) => (
        <div className="font-medium">{organization.name}</div>
      )
    },
    {
      key: 'domain',
      title: 'Domain',
      sortable: true,
      filterable: true,
      render: (organization) => (
        <div className="font-mono text-sm">{organization.domain}</div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      filterable: true,
      render: (organization) => (
        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
          {organization.type}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (organization) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            organization.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span>{organization.status}</span>
        </div>
      )
    },
    {
      key: 'memberCount',
      title: 'Members',
      sortable: true,
      filterable: false,
      render: (organization) => (
        <div>{organization.memberCount}</div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      filterable: false,
      render: (organization) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewOrganization(organization.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </button>
          <button
            onClick={() => handleEditOrganization(organization.id)}
            className="text-gray-600 hover:text-gray-800"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteOrganization(organization.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      )
    }
  ];
  
  // Handle search
  const handleSearch = (term: string, activeFilters: any) => {
    setSearchTerm(term);
    // Reset to first page when searching
    if (term !== searchTerm) {
      setPage(1);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilter(key as any, value);
    setPage(1); // Reset to first page when filtering
  };
  
  // Handle pagination
  const handlePaginationChange = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
  };
  
  // Handle bulk actions
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedOrganizations.map(id => deleteOrganization(id)));
      refetch();
      setSelectedOrganizations([]);
    } catch (err) {
      setError({
        type: 'network',
        title: 'Bulk Delete Failed',
        message: `Failed to delete selected organizations: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        retryable: true
      });
    }
  };
  
  // Handle error retry
  const handleRetry = () => {
    setError(null);
    refetch();
  };
  
  // Handle error dismiss
  const handleDismissError = () => {
    setError(null);
  };
  
  // Render organization cards
  const renderOrganizationCards = () => {
    return (
      <DataCardGrid data={paginatedOrganizations} columns={3}>
        {paginatedOrganizations.map(organization => (
          <DataCard
            key={organization.id}
            title={organization.name}
            subtitle={organization.domain}
            description={`${organization.memberCount} members`}
            image={organization.logo}
            metadata={[
              { label: 'Type', value: organization.type },
              { label: 'Status', value: organization.status }
            ]}
            badges={[
              { text: organization.type, variant: 'default' },
              { 
                text: organization.status, 
                variant: organization.status === 'active' ? 'secondary' : 'outline' 
              }
            ]}
            actions={[
              { label: 'View', onClick: () => handleViewOrganization(organization.id) },
              { label: 'Edit', onClick: () => handleEditOrganization(organization.id) },
              { 
                label: 'Delete', 
                onClick: () => handleDeleteOrganization(organization.id),
                variant: 'destructive' 
              }
            ]}
            onClick={() => handleOrganizationSelection(organization.id)}
            selected={selectedOrganizations.includes(organization.id)}
          />
        ))}
      </DataCardGrid>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorHandler
          error={error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Organizations</h2>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
        
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          placeholder="Search organizations..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              value: filters.status,
              options: [
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]
            },
            {
              key: 'type',
              label: 'Type',
              type: 'select',
              value: filters.type,
              options: [
                { value: 'all', label: 'All' },
                { value: 'customer', label: 'Customer' },
                { value: 'partner', label: 'Partner' },
                { value: 'internal', label: 'Internal' }
              ]
            }
          ]}
        />
        
        {/* Active Filters Display */}
        {(filters.status !== 'all' || filters.type !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.status !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Status: {filters.status}
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Type: {filters.type}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Bulk Actions */}
        {selectedOrganizations.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedOrganizations.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>
      
      {/* Data Display */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <LoadingState variant="spinner" size="lg" text="Loading organizations..." />
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <DataTable
                data={paginatedOrganizations}
                columns={tableColumns}
                rowSelection={{
                  selectedRowKeys: selectedOrganizations,
                  onChange: setSelectedOrganizations
                }}
                pagination={{
                  current: page,
                  pageSize: limit,
                  total: filteredOrganizations.length,
                  onChange: handlePaginationChange
                }}
                emptyState={
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No organizations found</div>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                }
              />
            ) : (
              renderOrganizationCards()
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Component Composition

- Use shared components as building blocks
- Compose multiple components for complex UI
- Keep components focused on single responsibilities
- Use props to customize behavior

### 2. State Management

- Use custom hooks for data fetching
- Leverage localStorage for form drafts
- Implement proper error handling
- Use query params for filtering and pagination

### 3. Performance Optimization

- Use React.memo for expensive components
- Implement proper key props for lists
- Use useMemo for expensive calculations
- Debounce search and filter inputs

### 4. Accessibility

- Implement proper ARIA labels
- Ensure keyboard navigation
- Provide focus management
- Use semantic HTML elements

### 5. Error Handling

- Implement error boundaries
- Provide user-friendly error messages
- Offer retry mechanisms
- Log errors for debugging

### 6. Testing

- Write comprehensive unit tests
- Test error scenarios
- Test loading states
- Test user interactions

### 7. Code Organization

- Group related components in directories
- Use consistent naming conventions
- Implement proper TypeScript types
- Document component APIs