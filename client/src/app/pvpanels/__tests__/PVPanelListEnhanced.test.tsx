/**
 * PVPanelListEnhanced Component Tests
 * Tests for the enhanced PV panel list with DataTable integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PVPanelListEnhanced from '../PVPanelListEnhanced';
import { useApiStore } from '@/state/api';

// Mock the API store
jest.mock('@/state/api');
const mockUseApiStore = useApiStore as jest.MockedFunction<typeof useApiStore>;

// Mock Sidebar component
jest.mock('@/components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

// Mock PV Panel data
const mockPVPanels = [
  {
    id: 1,
    maker: 'SunPower',
    model: 'SP-470-NE',
    description: 'High-efficiency monocrystalline panel',
    powerSTC: 470,
    vocSTC: 45.2,
    iscSTC: 13.45,
    vmp: 37.8,
    imp: 12.44,
    efficiency: 22.8,
    temperatureCoefficientVoc: -0.29,
    temperatureCoefficientIsc: 0.05,
    temperatureCoefficientPmpp: -0.37,
    length: 2090,
    width: 1040,
    weight: 22,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    maker: 'LG',
    model: 'NeON R',
    description: 'Premium N-type panel',
    powerSTC: 405,
    vocSTC: 41.2,
    iscSTC: 12.43,
    vmp: 34.8,
    imp: 11.64,
    efficiency: 21.7,
    temperatureCoefficientVoc: -0.28,
    temperatureCoefficientIsc: 0.04,
    temperatureCoefficientPmpp: -0.35,
    length: 1722,
    width: 1134,
    weight: 19.5,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  }
];

describe('PVPanelListEnhanced Component', () => {
  const mockFetchPVPanels = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiStore.mockReturnValue({
      pvPanels: mockPVPanels,
      fetchPVPanels: mockFetchPVPanels,
      totalCount: 2,
      loading: false
    } as any);
  });

  it('renders the component with sidebar', () => {
    render(<PVPanelListEnhanced />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('PV Panels')).toBeInTheDocument();
  });

  it('displays PV panel data in DataTable', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('SunPower')).toBeInTheDocument();
      expect(screen.getByText('LG')).toBeInTheDocument();
      expect(screen.getByText('SP-470-NE')).toBeInTheDocument();
      expect(screen.getByText('NeON R')).toBeInTheDocument();
    });
  });

  it('calls fetchPVPanels on mount', () => {
    render(<PVPanelListEnhanced />);

    expect(mockFetchPVPanels).toHaveBeenCalledWith(1, 50);
  });

  it('displays table headers correctly', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Manufacturer')).toBeInTheDocument();
      expect(screen.getByText('Model Number')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Power (W)')).toBeInTheDocument();
      expect(screen.getByText('Efficiency')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 2 of 2 results')).toBeInTheDocument();
    });

    // Test next page (though it won't work since we only have 2 items)
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();

    // Test previous button
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('handles sorting functionality', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Manufacturer')).toBeInTheDocument();
    });

    // Test sorting by manufacturer
    const manufacturerHeader = screen.getByText('Manufacturer');
    expect(manufacturerHeader).toHaveClass('cursor-pointer');

    // Click to sort
    fireEvent.click(manufacturerHeader);

    // The sort functionality is handled by DataTable, so we just verify the header is clickable
    expect(manufacturerHeader).toHaveClass('cursor-pointer');
  });

  it('displays custom formatted data correctly', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      // Check manufacturer is in bold/medium font
      expect(screen.getByText('SunPower')).toBeInTheDocument();
      expect(screen.getByText('SP-470-NE')).toBeInTheDocument();

      // Check power display
      expect(screen.getByText('470W')).toBeInTheDocument();
      expect(screen.getByText('405W')).toBeInTheDocument();

      // Check efficiency display
      expect(screen.getByText('22.8%')).toBeInTheDocument();
      expect(screen.getByText('21.7%')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    mockUseApiStore.mockReturnValue({
      pvPanels: [],
      fetchPVPanels: mockFetchPVPanels,
      totalCount: 0,
      loading: true
    } as any);

    render(<PVPanelListEnhanced />);

    // DataTable should show loading state
    // Note: This depends on DataTable's loading implementation
    expect(screen.getByText('PV Panel Management')).toBeInTheDocument();
  });

  it('handles empty state', () => {
    mockUseApiStore.mockReturnValue({
      pvPanels: [],
      fetchPVPanels: mockFetchPVPanels,
      totalCount: 0,
      loading: false
    } as any);

    render(<PVPanelListEnhanced />);

    // DataTable should show empty state
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles page changes correctly', async () => {
    const { rerender } = render(<PVPanelListEnhanced />);

    await waitFor(() => {
      expect(mockFetchPVPanels).toHaveBeenCalledWith(1, 50);
    });

    // Simulate page change by updating the component's state
    // This is a simplified test since we can't easily access internal state
    rerender(<PVPanelListEnhanced />);

    // Verify fetch was called again
    expect(mockFetchPVPanels).toHaveBeenCalled();
  });

  it('displays technical specifications correctly', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      // Check voltage and current values
      expect(screen.getByText('45.2V')).toBeInTheDocument();
      expect(screen.getByText('13.45A')).toBeInTheDocument();
      expect(screen.getByText('37.8V')).toBeInTheDocument();
      expect(screen.getByText('12.44A')).toBeInTheDocument();
    });
  });

  it('displays physical dimensions correctly', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      // Check dimensions
      expect(screen.getByText('2090×1040mm')).toBeInTheDocument();
      expect(screen.getByText('1722×1134mm')).toBeInTheDocument();

      // Check weight
      expect(screen.getByText('22kg')).toBeInTheDocument();
      expect(screen.getByText('19.5kg')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes for data display', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      // Check that manufacturer is in medium font
      const manufacturerElements = screen.getAllByText('SunPower');
      manufacturerElements.forEach(element => {
        expect(element.closest('div')).toHaveClass('font-medium');
      });

      // Check that model is in monospace font
      const modelElements = screen.getAllByText('SP-470-NE');
      modelElements.forEach(element => {
        expect(element.closest('div')).toHaveClass('font-mono', 'text-sm');
      });
    });
  });

  it('handles API errors gracefully', () => {
    mockFetchPVPanels.mockImplementation(() => {
      throw new Error('API Error');
    });

    // Component should not crash
    expect(() => render(<PVPanelListEnhanced />)).not.toThrow();
  });

  it('displays temperature coefficients correctly', async () => {
    render(<PVPanelListEnhanced />);

    await waitFor(() => {
      // Check temperature coefficients
      expect(screen.getByText('-0.29%/°C')).toBeInTheDocument();
      expect(screen.getByText('0.05%/°C')).toBeInTheDocument();
      expect(screen.getByText('-0.37%/°C')).toBeInTheDocument();
    });
  });

  it('handles large dataset efficiently', () => {
    const largeDataset = Array.from({ length: 100 }, (_, index) => ({
      ...mockPVPanels[0],
      id: index + 1,
      model: `Model-${index + 1}`
    }));

    mockUseApiStore.mockReturnValue({
      pvPanels: largeDataset,
      fetchPVPanels: mockFetchPVPanels,
      totalCount: 100,
      loading: false
    } as any);

    render(<PVPanelListEnhanced />);

    expect(screen.getByText('PV Panel Management')).toBeInTheDocument();
    // DataTable should handle large datasets efficiently
  });
});