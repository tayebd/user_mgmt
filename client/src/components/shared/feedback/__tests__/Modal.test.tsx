/**
 * Modal Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, ConfirmModal, AlertModal } from '../Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <Modal
        open={true}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render modal when closed', () => {
    render(
      <Modal
        open={false}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(
      <Modal
        open={true}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal Content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls primary action when button is clicked', async () => {
    render(
      <Modal
        open={true}
        onClose={mockOnClose}
        title="Test Modal"
        primaryAction={{
          label: 'Primary Action',
          onClick: mockOnConfirm
        }}
      >
        <div>Modal Content</div>
      </Modal>
    );

    const primaryButton = screen.getByText('Primary Action');
    fireEvent.click(primaryButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <Modal
        open={true}
        onClose={mockOnClose}
        title="Test Modal"
        size="lg"
      >
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl');
  });

  it('handles keyboard escape key', async () => {
    render(
      <Modal
        open={true}
        onClose={mockOnClose}
        title="Test Modal"
        closeOnEscape={true}
      >
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

describe('ConfirmModal Component', () => {
  it('renders confirmation dialog', () => {
    render(
      <ConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        message="Are you sure you want to continue?"
      />
    );

    expect(screen.getByText('Are you sure you want to continue?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(
      <ConfirmModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        message="Are you sure you want to continue?"
      />
    );

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });
});

describe('AlertModal Component', () => {
  it('renders alert dialog', () => {
    render(
      <AlertModal
        open={true}
        onClose={mockOnClose}
        message="This is an important message"
      />
    );

    expect(screen.getByText('This is an important message')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('calls onClose when OK button is clicked', async () => {
    render(
      <AlertModal
        open={true}
        onClose={mockOnClose}
        message="This is an important message"
      />
    );

    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});