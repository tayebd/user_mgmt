/**
 * Components Demo Page
 * Showcases all reusable components with examples
 */

'use client';

import React, { useState } from 'react';
import { Container } from '@/components/shared/layout/Container';
import { DataTable, Column } from '@/components/shared/data/DataTable';
import { useAsync } from '@/components/hooks/useAsync';
import { ThemeProvider, useTheme } from '@/components/shared/theme/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundaryHandler } from '@/components/shared/error/ErrorBoundaryHandler';

// Sample data for demo
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' },
];

const columns: Column<typeof sampleData[0]>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
    filterable: true,
  },
  {
    key: 'role',
    title: 'Role',
    sortable: true,
    filterable: true,
    filterOptions: [
      { value: 'Admin', label: 'Administrator' },
      { value: 'User', label: 'Regular User' },
      { value: 'Manager', label: 'Manager' },
    ],
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    filterable: true,
    filterOptions: [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    ),
  },
];

function ComponentsDemoContent() {
  const [activeTab, setActiveTab] = useState('container');
  const { theme, toggleMode, isDark } = useTheme();

  // Demo useAsync hook
  const { data, loading, error, execute } = useAsync(
    async (message: string) => {
      await new Promise(resolve => setTimeout(() => resolve(`Echo: ${message}`), 1000));
      return message;
    },
    {
      onSuccess: (data) => console.log('Success:', data),
      onError: (error) => console.error('Error:', error),
    }
  );

  const handleAsyncDemo = () => {
    execute('Hello from useAsync hook!');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : 'light'}`}>
      <Container size="lg" className="py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Component Library Demo</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Current theme:</span>
              <Button variant="outline" size="sm" onClick={toggleMode}>
                {isDark ? '🌙 Light' : '🌙 Dark'}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              <TabsTrigger value="container">Container</TabsTrigger>
              <TabsTrigger value="datatable">DataTable</TabsTrigger>
              <TabsTrigger value="hooks">Hooks</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="container" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Container Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Basic Container</h3>
                      <Container className="p-4 border border-gray-200 rounded">
                        <p>This is a basic container with default padding and size.</p>
                      </Container>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Container Variants</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Container size="sm" className="p-4 border border-blue-200 rounded bg-blue-50">
                          <p className="text-sm">Small container</p>
                        </Container>
                        <Container size="lg" className="p-4 border border-green-200 rounded bg-green-50">
                          <p className="text-sm">Large container</p>
                        </Container>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Container with Custom Padding</h3>
                      <Container padding="xl" className="p-4 border border-purple-200 rounded bg-purple-50">
                        <p className="text-sm">Container with extra large padding</p>
                      </Container>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="datatable" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>DataTable Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Sortable, filterable, paginated table with AI-enhanced features.
                    </p>

                    <DataTable
                      data={sampleData}
                      columns={columns}
                      pagination={{
                        current: 1,
                        pageSize: 3,
                        total: sampleData.length,
                        onChange: (page, pageSize) => console.log('Page changed:', page, pageSize),
                      }}
                      search={{
                        value: '',
                        onChange: (value) => console.log('Search:', value),
                        placeholder: 'Search users...',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hooks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>useAsync Hook</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Handles async operations with loading, error, and data states.
                    </p>

                    <div className="flex items-center space-x-4 mb-4">
                      <Input
                        placeholder="Enter message to echo..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAsyncDemo();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleAsyncDemo} disabled={loading}>
                        {loading ? 'Loading...' : 'Execute'}
                      </Button>
                    </div>

                    {data && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-semibold text-green-800 mb-2">Response:</h4>
                        <p className="text-green-700">{data}</p>
                      </div>
                    )}

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded">
                        <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
                        <p className="text-red-700">{error.message}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme System</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Consistent theming with light/dark mode support.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Current Theme</h4>
                        <div className="p-4 border border-gray-200 rounded">
                          <p><strong>Mode:</strong> {isDark ? 'Dark' : 'Light'}</p>
                          <p><strong>Is Dark:</strong> {isDark ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Theme Colors</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(theme.colors).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: value }}
                              />
                              <span className="text-sm">{key}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}

export default function ComponentsDemo() {
  return (
    <ErrorBoundaryHandler
      onError={(error, errorInfo) => console.error('Demo Error:', error, errorInfo)}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Component Demo Error</h1>
            <p className="text-gray-600 mb-4">An error occurred while loading the component demo.</p>
            <p className="text-sm text-gray-500 bg-gray-200 p-4 rounded">
              <strong>Error:</strong> An unexpected error occurred
            </p>
          </div>
        </div>
      }
    >
      <ThemeProvider>
        <ComponentsDemoContent />
      </ThemeProvider>
    </ErrorBoundaryHandler>
  );
}