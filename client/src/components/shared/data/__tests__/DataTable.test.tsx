/**
 * DataTable Component Tests
 * Tests for the sortable, filterable data table component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTable, Column } from '@/components/shared/data/DataTable';

interface TestData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const mockData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
];

const mockColumns: Column<TestData>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
  },
  {
    key: 'role',
    title: 'Role',
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    sortable: false,
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    ),
  },
];

describe('DataTable Component', () => {
  it('renders with basic data and columns', () => {
    render(<DataTable<TestData> data={mockData} columns={mockColumns} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders custom cell content', () => {
    render(<DataTable<TestData> data={mockData} columns={mockColumns} />);

    const statusElements = screen.getAllByText('Active');
    expect(statusElements).toHaveLength(2);
    expect(statusElements[0]).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('handles sorting correctly', async () => {
    const { container } = render(<DataTable<TestData> data={mockData} columns={mockColumns} />);

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveClass('cursor-pointer', 'hover:bg-gray-50');

    // Click to sort by name ascending
    fireEvent.click(screen.getByText('Name'));

    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveTextContent('Bob Johnson'); // B comes before J
    });

    // Click to sort by name descending
    fireEvent.click(screen.getByText('Name'));

    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveTextContent('John Doe'); // J comes after B
    });
  });

  it('does not sort non-sortable columns', () => {
    render(<DataTable<TestData> data={mockData} columns={mockColumns} />);

    const statusHeader = screen.getByText('Status');
    expect(statusHeader).not.toHaveClass('cursor-pointer');

    // Click should not trigger sorting
    fireEvent.click(statusHeader);

    // Data should remain in original order
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('John Doe');
  });

  it('renders pagination controls', () => {
    const mockPagination = {
      current: 1,
      pageSize: 2,
      total: 3,
      onChange: jest.fn(),
    };

    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        pagination={mockPagination}
      />
    );

    expect(screen.getByText('Showing 1 to 2 of 3 results')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('handles pagination changes', () => {
    const mockOnChange = jest.fn();
    const mockPagination = {
      current: 1,
      pageSize: 2,
      total: 3,
      onChange: mockOnChange,
    };

    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        pagination={mockPagination}
      />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockOnChange).toHaveBeenCalledWith(2, 2);
  });

  it('disables Previous button on first page', () => {
    const mockPagination = {
      current: 1,
      pageSize: 2,
      total: 3,
      onChange: jest.fn(),
    };

    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        pagination={mockPagination}
      />
    );

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    const mockPagination = {
      current: 2,
      pageSize: 2,
      total: 3,
      onChange: jest.fn(),
    };

    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        pagination={mockPagination}
      />
    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('renders loading state', () => {
    render(<DataTable<TestData> data={mockData} columns={mockColumns} loading={true} />);

    // Should show loading skeleton rows
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders empty state', () => {
    render(<DataTable<TestData> data={[]} columns={mockColumns} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles row selection', () => {
    const mockSelection = {
      selectedRowKeys: [],
      onChange: jest.fn(),
    };

    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        rowSelection={mockSelection}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0];

    // Select all rows
    fireEvent.click(headerCheckbox);
    expect(mockSelection.onChange).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('handles individual row selection', () => {
    const mockSelection = {
      selectedRowKeys: [],
      onChange: jest.fn(),
    };

    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        rowSelection={mockSelection}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const firstRowCheckbox = checkboxes[1]; // Skip header checkbox

    fireEvent.click(firstRowCheckbox);
    expect(mockSelection.onChange).toHaveBeenCalledWith([1]);
  });

  it('renders with custom className', () => {
    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        className="custom-data-table"
      />
    );

    const table = document.querySelector('.custom-data-table');
    expect(table).toBeInTheDocument();
  });

  it('accepts onRow prop without errors', () => {
    const mockOnRow = jest.fn().mockReturnValue(<tr>Custom row</tr>);

    render(
      <DataTable<TestData>
        data={mockData}
        columns={mockColumns}
        onRow={mockOnRow}
      />
    );

    // The onRow functionality is not implemented yet, but the component should accept the prop
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});