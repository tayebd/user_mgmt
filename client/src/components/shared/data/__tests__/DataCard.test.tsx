/**
 * DataCard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataCard, DataCardGrid } from '../DataCard';

const mockData = [
  {
    id: '1',
    title: 'Test Card 1',
    subtitle: 'Basic card',
    description: 'This is a basic test card with all features',
    image: 'https://picsum.photos/seed/card1/200/200.jpg',
    avatar: 'https://picsum.photos/seed/avatar1/100/100.jpg',
    metadata: [
      { label: 'Created', value: '2023-01-01', icon: 'calendar' },
      { label: 'Updated', value: '2023-01-15', icon: 'clock' }
    ],
    badges: [
      { text: 'Active', variant: 'default' },
      { text: 'Premium', variant: 'secondary' }
    ],
    actions: [
      { label: 'View', onClick: jest.fn() },
      { label: 'Edit', onClick: jest.fn() }
    ],
    variant: 'default'
  },
  {
    id: '2',
    title: 'Test Card 2',
    subtitle: 'Compact card',
    description: 'This is a compact test card',
    image: 'https://picsum.photos/seed/card2/200/200.jpg',
    avatar: 'https://picsum.photos/seed/avatar2/100/100.jpg',
    metadata: [
      { label: 'Created', value: '2023-02-01', icon: 'calendar' }
    ],
    badges: [
      { text: 'Inactive', variant: 'outline' }
    ],
    actions: [
      { label: 'Activate', onClick: jest.fn() }
    ],
    variant: 'compact'
  },
  {
    id: '3',
    title: 'Test Card 3',
    subtitle: 'Detailed card',
    description: 'This is a detailed test card with more information',
    image: 'https://picsum.photos/seed/card3/200/200.jpg',
    avatar: 'https://picsum.photos/seed/avatar3/100/100.jpg',
    metadata: [
      { label: 'Created', value: '2023-03-01', icon: 'calendar' },
      { label: 'Updated', value: '2023-03-15', icon: 'clock' },
      { label: 'Status', value: 'In Progress', icon: 'activity' }
    ],
    badges: [
      { text: 'New', variant: 'destructive' },
      { text: 'Featured', variant: 'secondary' }
    ],
    actions: [
      { label: 'View', onClick: jest.fn() },
      { label: 'Edit', onClick: jest.fn() },
      { label: 'Delete', onClick: jest.fn(), variant: 'destructive' }
    ],
    variant: 'detailed'
  }
];

describe('DataCard Component', () => {
  it('renders card with all properties', () => {
    render(<DataCard {...mockData[0]} />);

    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByText('Basic card')).toBeInTheDocument();
    expect(screen.getByText('This is a basic test card with all features')).toBeInTheDocument();
    expect(screen.getByAltText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByAltText('avatar1')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<DataCard {...mockData[1]} />);

    expect(screen.getByText('Test Card 2')).toBeInTheDocument();
    expect(screen.getByText('Compact card')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders detailed variant', () => {
    render(<DataCard {...mockData[2]} />);

    expect(screen.getByText('Test Card 3')).toBeInTheDocument();
    expect(screen.getByText('Detailed card')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<DataCard {...mockData[0]} size="sm" />);
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();

    rerender(<DataCard {...mockData[0]} size="lg" />);
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<DataCard {...mockData[0]} loading={true} />);

    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<DataCard {...mockData[0]} error="Something went wrong" />);

    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    render(<DataCard {...mockData[0]} clickable={true} onSelect={mockOnClick} />);

    fireEvent.click(screen.getByText('Test Card 1'));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<DataCard {...mockData[0]} className="custom-class" />);

    const cardElement = screen.getByText('Test Card 1').closest('div');
    expect(cardElement).toHaveClass('custom-class');
  });

  it('handles action clicks', () => {
    const mockViewAction = jest.fn();
    const mockEditAction = jest.fn();
    
    render(
      <DataCard
        {...mockData[0]}
        actions={[
          { label: 'View', onClick: mockViewAction },
          { label: 'Edit', onClick: mockEditAction }
        ]}
      />
    );

    fireEvent.click(screen.getByText('View'));
    expect(mockViewAction).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Edit'));
    expect(mockEditAction).toHaveBeenCalled();
  });
});

describe('DataCardGrid Component', () => {
  it('renders grid of cards', () => {
    render(<DataCardGrid data={mockData} />);

    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    expect(screen.getByText('Test Card 2')).toBeInTheDocument();
    expect(screen.getByText('Test Card 3')).toBeInTheDocument();
  });

  it('renders with custom columns', () => {
    const { rerender } = render(<DataCardGrid data={mockData} columns={2} />);
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();

    rerender(<DataCardGrid data={mockData} columns={4} />);
    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
  });

  it('renders with custom gap', () => {
    render(<DataCardGrid data={mockData} gap="gap-8" />);

    expect(screen.getByText('Test Card 1')).toBeInTheDocument();
    const gridElement = screen.getByText('Test Card 1').closest('div');
    expect(gridElement).toHaveClass('gap-8');
  });

  it('renders empty state when no data', () => {
    render(<DataCardGrid data={[]} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});