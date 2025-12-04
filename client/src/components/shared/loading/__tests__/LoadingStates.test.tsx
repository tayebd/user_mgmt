/**
 * LoadingStates Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingState, LoadingOverlay, LoadingButton, PageLoading } from '../LoadingStates';

describe('LoadingState Component', () => {
  it('renders spinner variant', () => {
    render(<LoadingState variant="spinner" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders skeleton variant', () => {
    render(<LoadingState variant="skeleton" />);
    
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('renders progress variant', () => {
    render(<LoadingState variant="progress" progress={50} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders dots variant', () => {
    render(<LoadingState variant="dots" />);
    
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('renders pulse variant', () => {
    render(<LoadingState variant="pulse" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders bars variant', () => {
    render(<LoadingState variant="bars" />);
    
    expect(screen.getAllByRole('status')).toHaveLength(4);
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingState variant="spinner" size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4 h-4');

    rerender(<LoadingState variant="spinner" size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8 h-8');
  });

  it('applies correct color classes', () => {
    render(<LoadingState variant="spinner" color="success" />);
    
    expect(screen.getByRole('status')).toHaveClass('text-green-600');
  });

  it('displays custom text', () => {
    render(<LoadingState variant="spinner" text="Custom loading text" />);
    
    expect(screen.getByText('Custom loading text')).toBeInTheDocument();
  });
});

describe('LoadingOverlay Component', () => {
  it('renders overlay when loading', () => {
    render(
      <LoadingOverlay loading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render overlay when not loading', () => {
    render(
      <LoadingOverlay loading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('applies backdrop blur', () => {
    render(
      <LoadingOverlay loading={true} blur={true}>
        <div>Content</div>
      </LoadingOverlay>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Content').closest('div')).toHaveClass('backdrop-blur-sm');
  });
});

describe('LoadingButton Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button when not loading', () => {
    render(
      <LoadingButton loading={false} onClick={mockOnClick}>
        Button Text
      </LoadingButton>
    );

    expect(screen.getByText('Button Text')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders loading state when loading', () => {
    render(
      <LoadingButton loading={true} onClick={mockOnClick}>
        Button Text
      </LoadingButton>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <LoadingButton loading={false} onClick={mockOnClick}>
        Button Text
      </LoadingButton>
    );

    screen.getByText('Button Text').click();
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    render(
      <LoadingButton loading={true} onClick={mockOnClick}>
        Button Text
      </LoadingButton>
    );

    screen.getByText('Loading...').click();
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom loading text', () => {
    render(
      <LoadingButton loading={true} loadingText="Processing..." onClick={mockOnClick}>
        Button Text
      </LoadingButton>
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});

describe('PageLoading Component', () => {
  it('renders fullscreen loading', () => {
    render(<PageLoading />);

    expect(screen.getByText('Loading page...')).toBeInTheDocument();
    expect(screen.getByText('Loading page...').closest('div')).toHaveClass('fixed inset-0 bg-white');
  });

  it('renders non-fullscreen loading', () => {
    render(<PageLoading fullscreen={false} />);

    expect(screen.getByText('Loading page...')).toBeInTheDocument();
    expect(screen.getByText('Loading page...').closest('div')).not.toHaveClass('fixed');
  });

  it('applies custom text', () => {
    render(<PageLoading text="Custom page loading text" />);

    expect(screen.getByText('Custom page loading text')).toBeInTheDocument();
  });
});