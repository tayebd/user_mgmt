/**
 * BaseCard Component Tests
 * Tests for the standardized base card component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BaseCard, BaseCardHeader, BaseCardTitle, BaseCardDescription, BaseCardContent, BaseCardFooter } from '../base-card';

describe('BaseCard Component', () => {
  it('renders with default props', () => {
    render(
      <BaseCard data-testid="base-card">
        <div>Card content</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('group');
  });

  it('renders with custom variant', () => {
    render(
      <BaseCard variant="elevated" data-testid="base-card">
        <div>Card content</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toHaveClass('shadow-md');
  });

  it('renders with custom padding', () => {
    render(
      <BaseCard padding="lg" data-testid="base-card">
        <div>Card content</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toHaveClass('p-8');
  });

  it('renders with hover effects', () => {
    render(
      <BaseCard hover data-testid="base-card">
        <div>Card content</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('renders with interactive cursor', () => {
    render(
      <BaseCard interactive data-testid="base-card">
        <div>Card content</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:border-primary');
  });

  it('passes custom className to the component', () => {
    render(
      <BaseCard className="custom-class" data-testid="base-card">
        <div>Card content</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toHaveClass('custom-class');
  });

  it('applies click handler when provided', () => {
    const handleClick = jest.fn();
    render(
      <BaseCard onClick={handleClick} data-testid="base-card">
        <div>Card content</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('BaseCard Subcomponents', () => {
  describe('BaseCardHeader', () => {
    it('renders with correct classes', () => {
      render(
        <BaseCardHeader data-testid="card-header">
          <div>Header content</div>
        </BaseCardHeader>
      );

      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('passes custom className', () => {
      render(
        <BaseCardHeader className="custom-header" data-testid="card-header">
          <div>Header content</div>
        </BaseCardHeader>
      );

      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('BaseCardTitle', () => {
    it('renders with correct styling', () => {
      render(
        <BaseCardTitle data-testid="card-title">
          Card Title
        </BaseCardTitle>
      );

      const title = screen.getByTestId('card-title');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });
  });

  describe('BaseCardDescription', () => {
    it('renders with correct styling', () => {
      render(
        <BaseCardDescription data-testid="card-description">
          Card Description
        </BaseCardDescription>
      );

      const description = screen.getByTestId('card-description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('BaseCardContent', () => {
    it('renders with correct classes', () => {
      render(
        <BaseCardContent data-testid="card-content">
          <div>Content</div>
        </BaseCardContent>
      );

      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('BaseCardFooter', () => {
    it('renders with correct classes', () => {
      render(
        <BaseCardFooter data-testid="card-footer">
          <div>Footer</div>
        </BaseCardFooter>
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });
  });
});

describe('BaseCard Integration', () => {
  it('renders complete card structure', () => {
    render(
      <BaseCard variant="elevated" padding="lg">
        <BaseCardHeader>
          <BaseCardTitle>Test Title</BaseCardTitle>
          <BaseCardDescription>Test Description</BaseCardDescription>
        </BaseCardHeader>
        <BaseCardContent>
          <div>Card content goes here</div>
        </BaseCardContent>
        <BaseCardFooter>
          <button>Footer Button</button>
        </BaseCardFooter>
      </BaseCard>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('handles variant combinations correctly', () => {
    render(
      <BaseCard variant="outlined" interactive data-testid="base-card">
        <BaseCardContent>
          <div>Interactive outlined card</div>
        </BaseCardContent>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toHaveClass('border-2', 'cursor-pointer');
  });

  it('supports custom styling combinations', () => {
    render(
      <BaseCard variant="default" className="custom-shadow" data-testid="base-card">
        <div>Custom styled card</div>
      </BaseCard>
    );

    const card = screen.getByTestId('base-card');
    expect(card).toHaveClass('custom-shadow');
  });
});

describe('BaseCard Accessibility', () => {
  it('is accessible as a semantic element', () => {
    render(
      <BaseCard role="article" aria-labelledby="card-title" data-testid="base-card">
        <BaseCardHeader>
          <BaseCardTitle id="card-title">Card Title</BaseCardTitle>
        </BaseCardHeader>
        <BaseCardContent>
          <div>Card content</div>
        </BaseCardContent>
      </BaseCard>
    );

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByLabelText('Card Title')).toBeInTheDocument();
  });

  it('maintains focus states', () => {
    const { getByTestId } = render(
      <div>
        <BaseCard tabIndex={0} data-testid="base-card">
          <div>Focusable card</div>
        </BaseCard>
      </div>
    );

    const card = getByTestId('base-card');
    card.focus();
    expect(card).toHaveFocus();
  });
});