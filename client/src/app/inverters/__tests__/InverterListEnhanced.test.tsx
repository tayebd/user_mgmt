/**
 * InverterListEnhanced Component Tests
 * Tests for the enhanced inverter list with DataTable integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InverterListEnhanced from '../InverterListEnhanced';
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

// Mock Inverter data
const mockInverters = [
  {
    id: 1,
    maker: 'SolarEdge',
    model: 'SE7600H-RW',
    description: 'HD-Wave inverter with setApp',
    powerAC: 7600,
    powerDC: 11000,
    voltageDCMax: 1000,
    voltageDCStart: 150,
    currentDCMax: 22,
    efficiencyCEC: 97.2,
    efficiencyEuro: 96.8,
    phases: 'single',
    mppts: 2,
    weight: 21,
    warranty: 12,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    maker: 'Fronius',
    model: 'Primo 8.2-1',
    description: 'Single-phase string inverter',
    powerAC: 8200,
    powerDC: 10600,
    voltageDCMax: 1000,
    voltageDCStart: 80,
    currentDCMax: 35,
    efficiencyCEC: 97.5,
    efficiencyEuro: 97.0,
    phases: 'single',
    mppts: 2,
    weight: 18.5,
    warranty: 10,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  }
];

describe('InverterListEnhanced Component', () => {
  const mockFetchInverters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApiStore.mockReturnValue({
      inverters: mockInverters,
      fetchInverters: mockFetchInverters,
      totalCount: 2,
      loading: false
    } as any);
  });

  it('renders the component with sidebar', () => {
    render(<InverterListEnhanced />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Inverter Management')).toBeInTheDocument();
  });

  it('displays inverter data in DataTable', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('SolarEdge')).toBeInTheDocument();
      expect(screen.getByText('Fronius')).toBeInTheDocument();
      expect(screen.getByText('SE7600H-RW')).toBeInTheDocument();
      expect(screen.getByText('Primo 8.2-1')).toBeInTheDocument();
    });
  });

  it('calls fetchInverters on mount', () => {
    render(<InverterListEnhanced />);

    expect(mockFetchInverters).toHaveBeenCalledWith(1, 50);
  });

  it('displays table headers correctly', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Manufacturer')).toBeInTheDocument();
      expect(screen.getByText('Model Number')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('AC Power (W)')).toBeInTheDocument();
      expect(screen.getByText('DC Power (W)')).toBeInTheDocument();
      expect(screen.getByText('Efficiency (CEC)')).toBeInTheDocument();
      expect(screen.getByText('Phases')).toBeInTheDocument();
      expect(screen.getByText('MPPTs')).toBeInTheDocument();
    });
  });

  it('displays custom formatted data correctly', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      // Check manufacturer is in bold/medium font
      expect(screen.getByText('SolarEdge')).toBeInTheDocument();
      expect(screen.getByText('SE7600H-RW')).toBeInTheDocument();

      // Check power display
      expect(screen.getByText('7.6kW')).toBeInTheDocument();
      expect(screen.getByText('8.2kW')).toBeInTheDocument();

      // Check efficiency display
      expect(screen.getByText('97.2%')).toBeInTheDocument();
      expect(screen.getByText('97.5%')).toBeInTheDocument();

      // Check phases with badges
      expect(screen.getByText('Single')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 2 of 2 results')).toBeInTheDocument();
    });

    // Test next page button
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();

    // Test previous button
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('handles sorting functionality', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Manufacturer')).toBeInTheDocument();
    });

    // Test sorting by manufacturer
    const manufacturerHeader = screen.getByText('Manufacturer');
    expect(manufacturerHeader).toHaveClass('cursor-pointer');

    // Click to sort
    fireEvent.click(manufacturerHeader);

    // Verify header is clickable
    expect(manufacturerHeader).toHaveClass('cursor-pointer');
  });

  it('displays technical specifications correctly', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      // Check voltage specifications
      expect(screen.getByText('1000V')).toBeInTheDocument();
      expect(screen.getByText('150V')).toBeInTheDocument();
      expect(screen.getByText('80V')).toBeInTheDocument();

      // Check current specifications
      expect(screen.getByText('22A')).toBeInTheDocument();
      expect(screen.getByText('35A')).toBeInTheDocument();
    });
  });

  it('displays warranty information correctly', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      // Check warranty badges
      expect(screen.getByText('12 years')).toBeInTheDocument();
      expect(screen.getByText('10 years')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes for data display', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      // Check that manufacturer is in medium font
      const manufacturerElements = screen.getAllByText('SolarEdge');
      manufacturerElements.forEach(element => {
        expect(element.closest('div')).toHaveClass('font-medium');
      });

      // Check that model is in monospace font
      const modelElements = screen.getAllByText('SE7600H-RW');
      modelElements.forEach(element => {
        expect(element.closest('div')).toHaveClass('font-mono', 'text-sm');
      });
    });
  });

  it('handles loading state', () => {
    mockUseApiStore.mockReturnValue({
      inverters: [],
      fetchInverters: mockFetchInverters,
      totalCount: 0,
      loading: true
    } as any);

    render(<InverterListEnhanced />);

    expect(screen.getByText('Inverter Management')).toBeInTheDocument();
  });

  it('handles empty state', () => {
    mockUseApiStore.mockReturnValue({
      inverters: [],
      fetchInverters: mockFetchInverters,
      totalCount: 0,
      loading: false
    } as any);

    render(<InverterListEnhanced />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles page changes correctly', async () => {
    const { rerender } = render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(mockFetchInverters).toHaveBeenCalledWith(1, 50);
    });

    rerender(<InverterListEnhanced />);

    expect(mockFetchInverters).toHaveBeenCalled();
  });

  it('displays weight information correctly', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('21kg')).toBeInTheDocument();
      expect(screen.getByText('18.5kg')).toBeInTheDocument();
    });
  });

  it('displays MPPT information correctly', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Both inverters have 2 MPPTs
    });
  });

  it('handles API errors gracefully', () => {
    mockFetchInverters.mockImplementation(() => {
      throw new Error('API Error');
    });

    expect(() => render(<InverterListEnhanced />)).not.toThrow();
  });

  it('displays efficiency badges with correct variants', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      // Check efficiency badges - should be green for high efficiency
      const efficiencyElements = screen.getAllByText('97.2%');
      efficiencyElements.forEach(element => {
        const badgeElement = element.closest('[class*="bg-green"]');
        expect(badgeElement).toBeInTheDocument();
      });
    });
  });

  it('handles three-phase inverters correctly', async () => {
    const threePhaseInverters = [
      {
        ...mockInverters[0],
        phases: 'three',
        powerAC: 10000
      }
    ];

    mockUseApiStore.mockReturnValue({
      inverters: threePhaseInverters,
      fetchInverters: mockFetchInverters,
      totalCount: 1,
      loading: false
    } as any);

    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Three')).toBeInTheDocument();
    });
  });

  it('displays power ratings in correct format', async () => {
    render(<InverterListEnhanced />);

    await waitFor(() => {
      // Check AC power display (kW format for >1000W)
      expect(screen.getByText('7.6kW')).toBeInTheDocument();
      expect(screen.getByText('8.2kW')).toBeInTheDocument();

      // Check DC power display (kW format for >1000W)
      expect(screen.getByText('11.0kW')).toBeInTheDocument();
      expect(screen.getByText('10.6kW')).toBeInTheDocument();
    });
  });

  it('handles single MPPT inverters correctly', async () => {
    const singleMPPTInverters = [
      {
        ...mockInverters[0],
        mppts: 1
      }
    ];

    mockUseApiStore.mockReturnValue({
      inverters: singleMPPTInverters,
      fetchInverters: mockFetchInverters,
      totalCount: 1,
      loading: false
    } as any);

    render(<InverterListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});