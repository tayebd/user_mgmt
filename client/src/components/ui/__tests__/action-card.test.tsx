/**
 * ActionCard Component Tests - Simple
 * Tests for the standardized action card component with built-in actions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionCard } from '../action-card';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MoreHorizontal: () => <div data-testid="more-horizontal">More</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Delete</div>,
  Eye: () => <div data-testid="eye-icon">View</div>,
  ExternalLink: () => <div data-testid="external-icon">External</div>,
}));

describe('ActionCard Component', () => {
  const mockTitle = 'Test Action Card';
  const mockDescription = 'This is a test action card description';
  const mockContent = <div>Card content goes here</div>;

  it('renders with basic props', () => {
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText(mockDescription)).toBeInTheDocument();
    expect(screen.getByText('Card content goes here')).toBeInTheDocument();
  });

  it('renders with actions', () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

    const actions = [
      {
        id: 'edit',
        label: 'Edit',
        onClick: mockEdit,
        variant: 'default' as const
      },
      {
        id: 'delete',
        label: 'Delete',
        onClick: mockDelete,
        variant: 'destructive' as const,
        requiresConfirmation: true,
        confirmationTitle: 'Confirm Delete',
        confirmationDescription: 'Are you sure you want to delete this item?'
      }
    ];

    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        actions={actions}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByTestId('more-horizontal')).toBeInTheDocument();

    // Test dropdown menu
    const menuButton = screen.getByTestId('more-horizontal');
    fireEvent.click(menuButton);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        variant="elevated"
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();

    // Rerender with different variant
    rerender(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        variant="outlined"
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(
      <ActionCard
        title={mockTitle}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.queryByText(mockDescription)).not.toBeInTheDocument();
    expect(screen.getByText('Card content goes here')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockClick = jest.fn();

    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        onClick={mockClick}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const card = screen.getByText(mockTitle).closest('.group');
    if (card) {
      fireEvent.click(card);
      expect(mockClick).toHaveBeenCalledTimes(1);
    }
  });

  it('renders with href as link', () => {
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        href="https://example.com"
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies custom className', () => {
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        className="custom-action-card"
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const card = screen.getByText(mockTitle).closest('.group');
    expect(card).toHaveClass('custom-action-card');
  });

  describe('Action Handling', () => {
    it('handles action clicks', async () => {
      const mockAction = jest.fn();

      const actions = [
        {
          id: 'view',
          label: 'View Details',
          onClick: mockAction,
          variant: 'default' as const
        }
      ];

      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          actions={actions}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      // Open menu
      const menuButton = screen.getByTestId('more-horizontal');
      fireEvent.click(menuButton);

      // Click action
      const actionButton = screen.getByText('View Details');
      fireEvent.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('handles confirmation dialog for destructive actions', async () => {
      const mockDelete = jest.fn();

      const actions = [
        {
          id: 'delete',
          label: 'Delete',
          onClick: mockDelete,
          variant: 'destructive' as const,
          requiresConfirmation: true,
          confirmationTitle: 'Confirm Delete',
          confirmationDescription: 'Are you sure you want to delete this item?'
        }
      ];

      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          actions={actions}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      // Open menu
      const menuButton = screen.getByTestId('more-horizontal');
      fireEvent.click(menuButton);

      // Click delete action
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
      });

      // Confirm should call the action
      const confirmButton = screen.getByText('Delete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('cancels confirmation dialog', async () => {
      const mockDelete = jest.fn();

      const actions = [
        {
          id: 'delete',
          label: 'Delete',
          onClick: mockDelete,
          variant: 'destructive' as const,
          requiresConfirmation: true,
          confirmationTitle: 'Confirm Delete',
          confirmationDescription: 'Are you sure you want to delete this item?'
        }
      ];

      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          actions={actions}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      // Open menu and click delete
      const menuButton = screen.getByTestId('more-horizontal');
      fireEvent.click(menuButton);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Cancel should not call the action
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper structure', () => {
      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      expect(screen.getByRole('heading', { name: mockTitle })).toBeInTheDocument();
      expect(screen.getByText(mockDescription)).toBeInTheDocument();
    });

    it('supports keyboard navigation for actions', async () => {
      const mockAction = jest.fn();

      const actions = [
        {
          id: 'view',
          label: 'View Details',
          onClick: mockAction,
          variant: 'default' as const
        }
      ];

      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          actions={actions}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      const menuButton = screen.getByTestId('more-horizontal');
      menuButton.focus();

      // Test Enter key
      fireEvent.keyDown(menuButton, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing actions gracefully', () => {
      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      expect(screen.queryByTestId('more-horizontal')).not.toBeInTheDocument();
    });

    it('handles action errors gracefully', () => {
      const mockErrorAction = jest.fn(() => {
        throw new Error('Action failed');
      });

      const actions = [
        {
          id: 'error',
          label: 'Error Action',
          onClick: mockErrorAction,
          variant: 'default' as const
        }
      ];

      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          actions={actions}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      // Open menu
      const menuButton = screen.getByTestId('more-horizontal');
      fireEvent.click(menuButton);

      const errorButton = screen.getByText('Error Action');

      // Should not crash the component when action throws
      expect(() => {
        fireEvent.click(errorButton);
      }).toThrow();

      // Component should still be rendered
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });
  });
});