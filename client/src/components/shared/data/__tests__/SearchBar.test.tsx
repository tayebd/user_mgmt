/**
 * SearchBar Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnChange = jest.fn();
  const mockOnSuggestionSelect = jest.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onSearch: mockOnSearch,
    onSuggestionSelect: mockOnSuggestionSelect
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchBar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test query' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('test query');
    });
  });

  it('calls onSearch when form is submitted', async () => {
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query', {});
    });
  });

  it('displays suggestions when provided', () => {
    const suggestions = [
      { id: '1', text: 'Suggestion 1' },
      { id: '2', text: 'Suggestion 2' }
    ];

    render(
      <SearchBar
        {...defaultProps}
        suggestions={suggestions}
        value="test"
      />
    );

    expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
  });

  it('calls onSuggestionSelect when suggestion is clicked', async () => {
    const suggestions = [
      { id: '1', text: 'Suggestion 1' }
    ];

    render(
      <SearchBar
        {...defaultProps}
        suggestions={suggestions}
        value="test"
      />
    );

    const suggestion = screen.getByText('Suggestion 1');
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(mockOnSuggestionSelect).toHaveBeenCalledWith({
        id: '1',
        text: 'Suggestion 1'
      });
    });
  });

  it('renders filters when provided', () => {
    const filters = [
      {
        key: 'status',
        label: 'Status',
        type: 'select' as const,
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ],
        value: 'active'
      }
    ];

    render(
      <SearchBar
        {...defaultProps}
        filters={filters}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows clear button when value is present', () => {
    render(
      <SearchBar
        {...defaultProps}
        value="test"
      />
    );

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const mockOnClear = jest.fn();
    
    render(
      <SearchBar
        {...defaultProps}
        value="test"
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  it('handles keyboard navigation in suggestions', async () => {
    const suggestions = [
      { id: '1', text: 'Suggestion 1' },
      { id: '2', text: 'Suggestion 2' }
    ];

    render(
      <SearchBar
        {...defaultProps}
        suggestions={suggestions}
        value="test"
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    
    // Arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSuggestionSelect).toHaveBeenCalledWith({
        id: '1',
        text: 'Suggestion 1'
      });
    });
  });

  it('closes suggestions on escape key', async () => {
    const suggestions = [
      { id: '1', text: 'Suggestion 1' }
    ];

    render(
      <SearchBar
        {...defaultProps}
        suggestions={suggestions}
        value="test"
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(
      <SearchBar
        {...defaultProps}
        loading={true}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SearchBar
        {...defaultProps}
        className="custom-class"
      />
    );

    const container = screen.getByPlaceholderText('Search...').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});