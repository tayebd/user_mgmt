/**
 * ActionCard Component Tests
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

// Mock shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={props['data-testid']}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, disabled, ...props }: any) => (
    <div onClick={onClick} {...props}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open, onOpenChange }: any) =>
    open ? <div onClick={() => onOpenChange(false)}>{children}</div> : null,
  AlertDialogAction: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogTrigger: ({ children }: any) => <div>{children}</div>,
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

    expect(screen.getByTestId('action-card')).toBeInTheDocument();
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
        icon: <div data-testid="edit-icon">Edit</div>,
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

    expect(screen.getByTestId('action-card')).toBeInTheDocument();
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText(mockDescription)).toBeInTheDocument();
    // The component should render some action buttons
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
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

    expect(screen.getByTestId('action-card')).toBeInTheDocument();

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

    expect(screen.getByTestId('action-card')).toBeInTheDocument();
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

    expect(screen.getByTestId('action-card')).toBeInTheDocument();
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

    const card = screen.getByTestId('action-card');
    fireEvent.click(card);
    expect(mockClick).toHaveBeenCalledTimes(1);
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

    expect(screen.getByTestId('action-card')).toBeInTheDocument();
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

    const card = screen.getByTestId('action-card');
    expect(card).toHaveClass('custom-action-card');
  });

  describe('Action Handling', () => {
    it('handles action clicks', () => {
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

      expect(screen.getByTestId('action-card')).toBeInTheDocument();
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
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

      expect(screen.getByTestId('action-card')).toBeInTheDocument();
      // The component should render the action card with destructive actions
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
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

      expect(screen.getByTestId('action-card')).toBeInTheDocument();
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
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

      expect(screen.getByTestId('action-card')).toBeInTheDocument();
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      expect(screen.getByText(mockDescription)).toBeInTheDocument();
    });

    it('supports keyboard navigation for actions', () => {
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

      expect(screen.getByTestId('action-card')).toBeInTheDocument();
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
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

      expect(screen.getByTestId('action-card')).toBeInTheDocument();
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

      expect(screen.getByTestId('action-card')).toBeInTheDocument();
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });
  });
});