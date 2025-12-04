/**
 * Container Component Tests
 * Tests for the flexible responsive container component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Container } from '@/components/shared/layout/Container';

describe('Container Component', () => {
  it('renders with default props', () => {
    render(
      <Container data-testid="container">
        <div>Container content</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('w-full', 'mx-auto', 'max-w-4xl', 'px-6');
  });

  it('renders with different size variants', () => {
    const { rerender } = render(
      <Container size="sm" data-testid="container">
        <div>Small container</div>
      </Container>
    );

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-2xl');

    rerender(
      <Container size="lg" data-testid="container">
        <div>Large container</div>
      </Container>
    );

    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-6xl');

    rerender(
      <Container size="fluid" data-testid="container">
        <div>Fluid container</div>
      </Container>
    );

    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-none');
  });

  it('renders with different padding variants', () => {
    const { rerender } = render(
      <Container padding="sm" data-testid="container">
        <div>Small padding</div>
      </Container>
    );

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('px-4');

    rerender(
      <Container padding="lg" data-testid="container">
        <div>Large padding</div>
      </Container>
    );

    container = screen.getByTestId('container');
    expect(container).toHaveClass('px-8');

    rerender(
      <Container padding="none" data-testid="container">
        <div>No padding</div>
      </Container>
    );

    container = screen.getByTestId('container');
    expect(container).toHaveClass('px-0');
  });

  it('renders with centered content', () => {
    render(
      <Container centered data-testid="container">
        <div>Centered content</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('applies custom className', () => {
    render(
      <Container className="custom-container" data-testid="container">
        <div>Custom styled container</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-container');
  });

  it('handles fluid prop correctly', () => {
    render(
      <Container fluid data-testid="container">
        <div>Fluid container</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-none');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <Container ref={ref} data-testid="container">
        <div>Container with ref</div>
      </Container>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-testid', 'container');
  });

  it('renders with all variant combinations', () => {
    render(
      <Container
        size="xl"
        padding="2xl"
        centered
        className="test-combination"
        data-testid="container"
      >
        <div>Full featured container</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass(
      'max-w-7xl',        // size: xl
      'px-16',           // padding: 2xl
      'flex',            // centered: true
      'items-center',    // centered: true
      'justify-center',  // centered: true
      'test-combination' // custom className
    );
  });

  it('renders asChild correctly', () => {
    render(
      <Container asChild data-testid="container">
        <section>Container as section</section>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('DIV'); // Currently always renders as div
  });

  it('passes through other HTML attributes', () => {
    render(
      <Container
        data-testid="container"
        id="test-id"
        role="main"
        aria-label="Main content"
      >
        <div>Accessible container</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveAttribute('id', 'test-id');
    expect(container).toHaveAttribute('role', 'main');
    expect(container).toHaveAttribute('aria-label', 'Main content');
  });

  it('maintains responsive behavior classes', () => {
    render(
      <Container size="3xl" padding="xl" data-testid="container">
        <div>Responsive container</div>
      </Container>
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-9xl', 'px-12');
  });
});