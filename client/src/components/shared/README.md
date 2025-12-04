# Shared Components Library

A comprehensive library of reusable React components, hooks, and utilities for building modern web applications.

## Table of Contents

- [Installation](#installation)
- [Components](#components)
  - [Data Components](#data-components)
  - [Feedback Components](#feedback-components)
  - [Loading Components](#loading-components)
  - [AI Components](#ai-components)
- [Hooks](#hooks)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Contributing](#contributing)

## Installation

```bash
npm install @your-org/shared-components
```

## Components

### Data Components

#### DataTable

A powerful and flexible data table component with sorting, filtering, pagination, and row selection.

**Features:**
- Sorting and filtering
- Pagination
- Row selection
- Custom cell renderers
- Responsive design
- Accessibility support

**Usage:**
```tsx
import { DataTable, Column } from '@/components/shared';

const columns: Column<User>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    filterable: true
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
    filterable: true
  }
];

function UserTable() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      pagination={pagination}
      onPaginationChange={setPagination}
      rowSelection={{
        selectedRowKeys: [],
        onChange: (keys) => console.log('Selected:', keys)
      }}
    />
  );
}
```

#### SearchBar

A versatile search component with autocomplete, filters, and suggestions.

**Features:**
- Autocomplete suggestions
- Advanced filtering
- Custom search handlers
- Keyboard navigation
- Debounced search

**Usage:**
```tsx
import { SearchBar } from '@/components/shared';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  const handleSearch = (term: string, activeFilters: any) => {
    setSearchTerm(term);
    // Perform search with filters
  };

  const suggestions = [
    { id: '1', text: 'Suggestion 1' },
    { id: '2', text: 'Suggestion 2' }
  ];

  return (
    <SearchBar
      value={searchTerm}
      onChange={setSearchTerm}
      onSearch={handleSearch}
      suggestions={suggestions}
      filters={[
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]
        }
      ]}
    />
  );
}
```

#### DataCard

A flexible card component for displaying data with various layouts and interactive features.

**Features:**
- Multiple layout variants
- Image and avatar support
- Metadata display
- Badge support
- Action buttons
- Clickable cards

**Usage:**
```tsx
import { DataCard } from '@/components/shared';

function UserCard({ user }: { user: User }) {
  return (
    <DataCard
      title={user.name}
      subtitle={user.email}
      description={user.bio}
      image={user.avatar}
      metadata={[
        { label: 'Joined', value: user.createdAt.toLocaleDateString() },
        { label: 'Status', value: user.status }
      ]}
      badges={[
        { text: 'Active', variant: 'default' },
        { text: 'Premium', variant: 'secondary' }
      ]}
      actions={[
        { label: 'Edit', onClick: () => console.log('Edit') },
        { label: 'Delete', onClick: () => console.log('Delete'), variant: 'destructive' }
      ]}
    />
  );
}
```

### Feedback Components

#### Modal

A versatile modal component with multiple variants and customization options.

**Features:**
- Multiple variants (default, confirm, alert)
- Customizable sizes
- Backdrop and escape key handling
- Animation support
- Accessibility features

**Usage:**
```tsx
import { Modal, ConfirmModal, AlertModal } from '@/components/shared';

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log('Confirmed');
    setIsOpen(false);
  };

  return (
    <>
      {/* Basic Modal */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Basic Modal"
        size="md"
      >
        <p>This is a basic modal content.</p>
        <Modal.Actions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
      />

      {/* Alert Modal */}
      <AlertModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Alert"
        message="This is an important message."
      />
    </>
  );
}
```

### Loading Components

#### LoadingState

A comprehensive loading component with multiple variants and animations.

**Features:**
- Multiple variants (spinner, skeleton, progress, dots, pulse, bars)
- Customizable sizes and colors
- Progress indicators
- Text support

**Usage:**
```tsx
import { LoadingState } from '@/components/shared';

function LoadingExample() {
  return (
    <div className="space-y-4">
      {/* Spinner */}
      <LoadingState variant="spinner" size="lg" color="primary" />
      
      {/* Skeleton */}
      <LoadingState variant="skeleton" />
      
      {/* Progress */}
      <LoadingState variant="progress" progress={75} text="Loading data..." />
      
      {/* Dots */}
      <LoadingState variant="dots" color="secondary" />
    </div>
  );
}
```

#### LoadingOverlay

A full-screen loading overlay with backdrop support.

**Features:**
- Backdrop with blur option
- Customizable loading content
- Preserve content underneath
- Animation support

**Usage:**
```tsx
import { LoadingOverlay } from '@/components/shared';

function OverlayExample() {
  const [loading, setLoading] = useState(false);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  return (
    <div>
      <LoadingOverlay loading={loading} blur={true}>
        <div>Your content here</div>
      </LoadingOverlay>
      
      <Button onClick={startLoading}>Start Loading</Button>
      <Button onClick={stopLoading}>Stop Loading</Button>
    </div>
  );
}
```

#### LoadingButton

A button component with integrated loading states.

**Features:**
- Loading spinner integration
- Disabled state during loading
- Customizable loading text
- Multiple variants and sizes

**Usage:**
```tsx
import { LoadingButton } from '@/components/shared';

function ButtonExample() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setCount(c => c + 1);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <p>Count: {count}</p>
      <LoadingButton
        loading={loading}
        onClick={handleClick}
        loadingText="Processing..."
      >
        Click Me
      </LoadingButton>
    </div>
  );
}
```

#### PageLoading

A full-page loading component for route transitions.

**Features:**
- Fullscreen and non-fullscreen modes
- Customizable text and styling
- Centered content
- Animation support

**Usage:**
```tsx
import { PageLoading } from '@/components/shared';

function PageExample() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Button onClick={() => setLoading(true)}>Show Loading</Button>
      
      {loading && (
        <PageLoading
          text="Loading page content..."
          fullscreen={true}
        />
      )}
      
      {!loading && (
        <div>
          <h1>Page Content</h1>
          <p>This is the actual page content.</p>
        </div>
      )}
    </div>
  );
}
```

### AI Components

#### AIEnhancedDataTable

An AI-powered data table with insights, recommendations, and predictive analytics.

**Features:**
- AI insights and recommendations
- Natural language search
- Data analysis and predictions
- Anomaly detection
- Smart filtering and sorting

**Usage:**
```tsx
import { AIEnhancedDataTable } from '@/components/shared';

function AITableExample() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const insights = [
    {
      id: '1',
      type: 'trend',
      title: 'Upward Trend',
      description: 'User engagement is increasing',
      confidence: 85,
      severity: 'medium'
    }
  ];

  const recommendations = [
    {
      id: '1',
      type: 'filter',
      title: 'Filter by Status',
      description: 'Show only active users',
      impact: 'high',
      effort: 'low',
      apply: () => console.log('Apply filter')
    }
  ];

  const analysis = {
    summary: 'Data shows positive trends',
    keyFindings: ['Most users are active', 'Engagement increasing'],
    trends: [
      {
        field: 'engagement',
        direction: 'up',
        change: 15,
        significance: 'high'
      }
    ],
    predictions: [
      {
        field: 'growth',
        prediction: 'Continued growth',
        confidence: 75,
        timeframe: 'next month'
      }
    ]
  };

  return (
    <AIEnhancedDataTable
      data={data}
      columns={columns}
      loading={loading}
      insights={insights}
      recommendations={recommendations}
      analysis={analysis}
      aiFeatures={{
        insights: true,
        recommendations: true,
        predictions: true,
        naturalLanguageSearch: true
      }}
    />
  );
}
```

#### SmartForm

An AI-enhanced form component with intelligent validation and assistance.

**Features:**
- AI-powered suggestions
- Smart defaults
- Predictive validation
- Form analysis
- Natural language help

**Usage:**
```tsx
import { SmartForm } from '@/components/shared';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be 18 or older')
});

const sections = [
  {
    title: 'Personal Information',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true
      }
    ]
  },
  {
    title: 'Additional Information',
    fields: [
      {
        name: 'age',
        label: 'Age',
        type: 'number',
        required: true
      }
    ]
  }
];

function SmartFormExample() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Submit form data
      await submitUserData(data);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    {
      id: '1',
      field: 'name',
      value: 'John Doe',
      confidence: 85,
      reason: 'Common name in your region',
      apply: () => console.log('Apply suggestion')
    }
  ];

  const smartFields = {
    name: {
      aiEnabled: true,
      autoComplete: true,
      smartDefaults: true,
      defaultValue: 'John Doe',
      defaultReason: 'Based on user profile'
    }
  };

  return (
    <SmartForm
      schema={userSchema}
      sections={sections}
      onSubmit={handleSubmit}
      loading={loading}
      suggestions={suggestions}
      smartFields={smartFields}
      aiFeatures={{
        smartValidation: true,
        autoComplete: true,
        smartDefaults: true,
        formAnalysis: true
      }}
    />
  );
}
```

## Hooks

### useDebounce

A hook for debouncing values and functions with advanced options.

**Features:**
- Value debouncing
- Function debouncing
- Leading and trailing edge control
- Max wait option
- Cancel and flush methods

**Usage:**
```tsx
import { useDebounce, useDebouncedCallback } from '@/components/shared';

function DebounceExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, { delay: 300 });

  // Debounce search function
  const debouncedSearch = useDebouncedCallback((term: string) => {
    // Perform search
    console.log('Searching for:', term);
    return searchAPI(term);
  }, { delay: 300 });

  useEffect(() => {
    if (debouncedSearchTerm) {
      debouncedSearch(debouncedSearchTerm).then(setResults);
    }
  }, [debouncedSearchTerm, debouncedSearch]);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <div>Results: {results.length}</div>
    </div>
  );
}
```

### useLocalStorage

A hook for synchronizing state with localStorage with advanced features.

**Features:**
- Automatic serialization/deserialization
- Cross-tab synchronization
- Error handling
- Expiration support
- Type-specific variants

**Usage:**
```tsx
import { 
  useLocalStorage, 
  useLocalStorageBoolean, 
  useLocalStorageObject,
  useLocalStorageWithExpiration 
} from '@/components/shared';

function LocalStorageExample() {
  // Basic usage
  const [user, setUser] = useLocalStorage('user', null);
  
  // Type-specific usage
  const [darkMode, setDarkMode] = useLocalStorageBoolean('darkMode', false);
  const [settings, setSettings] = useLocalStorageObject('settings', {});
  
  // Expiration usage
  const [cachedData, setCachedData] = useLocalStorageWithExpiration(
    'cachedData', 
    null, 
    60000 // 1 minute
  );

  return (
    <div>
      <button onClick={() => setUser({ name: 'John', id: '1' })}>
        Set User
      </button>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode: {darkMode ? 'On' : 'Off'}
      </button>
      <button onClick={() => setSettings({ theme: darkMode ? 'dark' : 'light' })}>
        Update Settings
      </button>
      <button onClick={() => setCachedData({ data: 'expensive data' })}>
        Cache Data
      </button>
    </div>
  );
}
```

### useQueryParams

A hook for managing URL query parameters with type safety.

**Features:**
- Type-safe parameter handling
- Specialized hooks for common patterns
- URL synchronization
- Custom serializers

**Usage:**
```tsx
import { 
  useQueryParams, 
  usePaginationParams, 
  useFilterParams, 
  useSearchParams 
} from '@/components/shared';

function QueryParamsExample() {
  // Basic usage
  const [params, setParams] = useQueryParams();
  
  // Pagination
  const { page, limit, setPage, nextPage, prevPage } = usePaginationParams();
  
  // Filters
  const { filters, setFilter, removeFilter, clearFilters } = useFilterParams({
    status: 'all',
    category: 'all'
  });
  
  // Search
  const { search, setSearch, clearSearch, hasSearch } = useSearchParams();

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <div>Page: {page}, Limit: {limit}</div>
      <div>Filters: {JSON.stringify(filters)}</div>
    </div>
  );
}
```

## Error Handling

### ErrorHandler

A comprehensive error handling system with multiple components and utilities.

**Features:**
- Multiple error types
- Error actions and recovery
- Error boundaries
- Toast notifications
- Error context provider

**Usage:**
```tsx
import { 
  ErrorHandler, 
  ErrorBoundary, 
  ErrorToast, 
  ErrorProvider, 
  useError 
} from '@/components/shared';

function ErrorExample() {
  const { errors, addError, removeError, clearErrors } = useError();

  const error = {
    id: 'test-error',
    type: 'network',
    title: 'Network Error',
    message: 'Failed to connect to server',
    details: 'HTTP 500: Internal Server Error',
    timestamp: new Date(),
    retryable: true,
    severity: 'high',
    actions: [
      {
        label: 'Retry',
        onClick: () => console.log('Retry')
      }
    ]
  };

  return (
    <ErrorProvider>
      <div>
        <button onClick={() => addError(error)}>
          Add Error
        </button>
        <button onClick={clearErrors}>
          Clear Errors
        </button>
        <div>Errors: {errors.length}</div>
        
        {/* Error Display */}
        <ErrorHandler
          error={error}
          onRetry={() => console.log('Retry')}
          onDismiss={() => removeError(error.id)}
        />
        
        {/* Error Boundary */}
        <ErrorBoundary
          onError={(error, errorInfo) => console.error('Error:', error, errorInfo)}
        >
          <ComponentThatMightError />
        </ErrorBoundary>
      </div>
    </ErrorProvider>
  );
}
```

## Examples

For more detailed examples and integration patterns, see the [examples](./examples) directory.

## Contributing

We welcome contributions! Please see our [contributing guide](./CONTRIBUTING.md) for details.

## License

MIT License - see the [LICENSE](./LICENSE) file for details.