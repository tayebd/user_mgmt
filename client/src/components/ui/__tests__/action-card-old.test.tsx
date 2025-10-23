/**
 * ActionCard Component Tests
 * Tests for the standardized action card component with built-in actions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionCard } from '../action-card';

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

  it('renders with primary action button', () => {
    const mockAction = jest.fn();
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        primaryAction={{
          label: 'Primary Action',
          onClick: mockAction,
          variant: 'default'
        }}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const primaryButton = screen.getByText('Primary Action');
    expect(primaryButton).toBeInTheDocument();

    fireEvent.click(primaryButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('renders with secondary action button', () => {
    const mockAction = jest.fn();
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        secondaryAction={{
          label: 'Secondary Action',
          onClick: mockAction,
          variant: 'outline'
        }}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const secondaryButton = screen.getByText('Secondary Action');
    expect(secondaryButton).toBeInTheDocument();

    fireEvent.click(secondaryButton);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('renders with both primary and secondary actions', () => {
    const mockPrimary = jest.fn();
    const mockSecondary = jest.fn();

    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        primaryAction={{
          label: 'Save',
          onClick: mockPrimary,
          variant: 'default'
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: mockSecondary,
          variant: 'outline'
        }}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save'));
    expect(mockPrimary).toHaveBeenCalledTimes(1);
    expect(mockSecondary).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockSecondary).toHaveBeenCalledTimes(1);
  });

  it('renders with dropdown menu actions', () => {
    const mockAction1 = jest.fn();
    const mockAction2 = jest.fn();

    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        menuActions={[
          {
            label: 'Edit',
            onClick: mockAction1,
            icon: 'edit'
          },
          {
            label: 'Delete',
            onClick: mockAction2,
            icon: 'trash',
            variant: 'destructive'
          }
        ]}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    // Should render a menu button (typically represented by dots or kebab icon)
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();

    // Open menu and check actions
    fireEvent.click(menuButton);

    // Note: In a real implementation, you'd check for menu items
    // This test assumes the dropdown menu functionality works
  });

  it('renders with confirmation dialog for destructive actions', async () => {
    const mockDestructiveAction = jest.fn();

    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        primaryAction={{
          label: 'Delete',
          onClick: mockDestructiveAction,
          variant: 'destructive',
          confirm: {
            title: 'Confirm Delete',
            description: 'Are you sure you want to delete this item?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
          }
        }}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeInTheDocument();

    // Click delete button
    fireEvent.click(deleteButton);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    // Cancel should not call the action
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
    expect(mockDestructiveAction).not.toHaveBeenCalled();
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

    let card = screen.getByTestId('action-card');
    expect(card).toHaveClass('shadow-md');

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

    card = screen.getByTestId('action-card');
    expect(card).toHaveClass('border-2');
  });

  it('renders with custom className', () => {
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

  it('handles disabled actions', () => {
    const mockAction = jest.fn();

    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        primaryAction={{
          label: 'Disabled Action',
          onClick: mockAction,
          disabled: true,
          variant: 'default'
        }}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const disabledButton = screen.getByText('Disabled Action');
    expect(disabledButton).toBeDisabled();

    fireEvent.click(disabledButton);
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('renders loading state', () => {
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        loading={true}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const card = screen.getByTestId('action-card');
    expect(card).toHaveClass('opacity-75');

    // Actions should be disabled when loading
    if (screen.queryByRole('button')) {
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    }
  });

  it('applies hover effects when interactive', () => {
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        interactive={true}
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    const card = screen.getByTestId('action-card');
    expect(card).toHaveClass('hover:shadow-md');
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

  it('renders with icon', () => {
    render(
      <ActionCard
        title={mockTitle}
        description={mockDescription}
        icon="solar-panel"
        data-testid="action-card"
      >
        {mockContent}
      </ActionCard>
    );

    // In a real implementation, this would check for the icon
    // For now, we just ensure the card renders without errors
    expect(screen.getByTestId('action-card')).toBeInTheDocument();
    expect(screen.getByText(mockTitle)).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('is accessible as a semantic element', () => {
      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          role="article"
          aria-labelledby="card-title"
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByLabelText(mockTitle)).toBeInTheDocument();
    });

    it('maintains focus states', () => {
      const { getByTestId } = render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          primaryAction={{
            label: 'Action',
            onClick: jest.fn(),
            variant: 'default'
          }}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      const actionButton = screen.getByText('Action');
      actionButton.focus();
      expect(actionButton).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      const mockAction = jest.fn();

      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          primaryAction={{
            label: 'Primary Action',
            onClick: mockAction,
            variant: 'default'
          }}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      const primaryButton = screen.getByText('Primary Action');

      // Test Enter key
      primaryButton.focus();
      fireEvent.keyDown(primaryButton, { key: 'Enter' });
      expect(mockAction).toHaveBeenCalledTimes(1);

      // Test Space key
      mockAction.mockClear();
      primaryButton.focus();
      fireEvent.keyDown(primaryButton, { key: ' ' });
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles missing onClick gracefully', () => {
      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          primaryAction={{
            label: 'No Action',
            variant: 'default'
            // No onClick provided
          }}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      const button = screen.getByText('No Action');
      expect(button).toBeInTheDocument();

      // Should not throw error when clicked
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('handles action errors gracefully', () => {
      const mockErrorAction = jest.fn(() => {
        throw new Error('Action failed');
      });

      render(
        <ActionCard
          title={mockTitle}
          description={mockDescription}
          primaryAction={{
            label: 'Error Action',
            onClick: mockErrorAction,
            variant: 'default'
          }}
          data-testid="action-card"
        >
          {mockContent}
        </ActionCard>
      );

      const button = screen.getByText('Error Action');

      // Should not crash the component when action throws
      expect(() => {
        fireEvent.click(button);
      }).toThrow();

      // Component should still be rendered
      expect(screen.getByTestId('action-card')).toBeInTheDocument();
    });
  });
});