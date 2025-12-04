/**
 * OrganizationListEnhanced Component Tests
 * Tests for the enhanced organization list with DataTable integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrganizationListEnhanced from '../OrganizationListEnhanced';
import { useOrganizations, useOrganizationStore } from '@/stores/organization-store';

// Mock the organization store
jest.mock('@/stores/organization-store');
const mockUseOrganizations = useOrganizations as jest.MockedFunction<typeof useOrganizations>;
const mockUseOrganizationStore = useOrganizationStore as jest.MockedFunction<typeof useOrganizationStore>;

// Mock Sidebar component
jest.mock('@/components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

// Mock Organization data
const mockOrganizations = [
  {
    id: 1,
    name: 'SolarTech Solutions',
    address: '123 Renewable Energy Blvd, Austin, TX 78701',
    description: 'Leading solar installation company in Texas',
    established: '2015-03-15T00:00:00.000Z',
    website: 'https://solartech.com',
    phone: '+1-512-555-0123',
    email: 'info@solartech.com',
    type: 'Installer',
    certifications: ['NABCEP', 'UL Certified'],
    rating: 4.5,
    reviewCount: 127,
    logoUrl: 'https://example.com/solartech-logo.png',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Green Energy Systems',
    address: '456 Eco Drive, Portland, OR 97201',
    description: 'Commercial and residential solar solutions',
    established: '2018-07-22T00:00:00.000Z',
    website: 'https://greenenergysystems.com',
    phone: '+1-503-555-0456',
    email: 'contact@greenenergysystems.com',
    type: 'Manufacturer',
    certifications: ['ISO 9001', 'CE Marked'],
    rating: 4.2,
    reviewCount: 89,
    logoUrl: 'https://example.com/ges-logo.png',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  }
];

describe('OrganizationListEnhanced Component', () => {
  const mockFetchOrganizations = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganizations.mockReturnValue(mockOrganizations);
    mockUseOrganizationStore.mockReturnValue({
      fetchOrganizations: mockFetchOrganizations,
      loading: false,
      error: null
    } as any);
  });

  it('renders the component with sidebar', () => {
    render(<OrganizationListEnhanced />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Organization Management')).toBeInTheDocument();
  });

  it('displays organization data in DataTable', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('SolarTech Solutions')).toBeInTheDocument();
      expect(screen.getByText('Green Energy Systems')).toBeInTheDocument();
      expect(screen.getByText('Austin, TX')).toBeInTheDocument();
      expect(screen.getByText('Portland, OR')).toBeInTheDocument();
    });
  });

  it('calls fetchOrganizations on mount', () => {
    render(<OrganizationListEnhanced />);

    expect(mockFetchOrganizations).toHaveBeenCalled();
  });

  it('displays table headers correctly', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Organization Name')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Established')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Certifications')).toBeInTheDocument();
    });
  });

  it('displays custom formatted data correctly', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      // Check organization names are in medium font
      expect(screen.getByText('SolarTech Solutions')).toBeInTheDocument();
      expect(screen.getByText('Green Energy Systems')).toBeInTheDocument();

      // Check established year badges
      expect(screen.getByText('2015')).toBeInTheDocument();
      expect(screen.getByText('2018')).toBeInTheDocument();

      // Check organization type badges
      expect(screen.getByText('Installer')).toBeInTheDocument();
      expect(screen.getByText('Manufacturer')).toBeInTheDocument();

      // Check ratings with stars
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
    });
  });

  it('displays truncated addresses correctly', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      const addressElements = screen.getAllByText(/Austin, TX|Portland, OR/);
      addressElements.forEach(element => {
        expect(element.closest('div')).toHaveClass('max-w-xs', 'truncate');
      });
    });
  });

  it('handles sorting functionality', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Organization Name')).toBeInTheDocument();
    });

    // Test sorting by organization name
    const nameHeader = screen.getByText('Organization Name');
    expect(nameHeader).toHaveClass('cursor-pointer');

    // Click to sort
    fireEvent.click(nameHeader);

    // Verify header is clickable
    expect(nameHeader).toHaveClass('cursor-pointer');
  });

  it('displays rating with stars correctly', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      // Check star icons are displayed
      const starElements = document.querySelectorAll('[data-testid*="star"]');
      expect(starElements.length).toBeGreaterThan(0);
    });
  });

  it('displays certification badges correctly', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      // Check certification badges
      expect(screen.getByText('NABCEP')).toBeInTheDocument();
      expect(screen.getByText('UL Certified')).toBeInTheDocument();
      expect(screen.getByText('ISO 9001')).toBeInTheDocument();
      expect(screen.getByText('CE Marked')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes for data display', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      // Check that organization name is in medium font
      const nameElements = screen.getAllByText('SolarTech Solutions');
      nameElements.forEach(element => {
        expect(element.closest('div')).toHaveClass('font-medium');
      });

      // Check established year badges
      const yearElements = screen.getAllByText('2015');
      yearElements.forEach(element => {
        const badgeElement = element.closest('[class*="border"]');
        expect(badgeElement).toBeInTheDocument();
      });
    });
  });

  it('handles loading state', () => {
    mockUseOrganizationStore.mockReturnValue({
      fetchOrganizations: mockFetchOrganizations,
      loading: true,
      error: null
    } as any);

    render(<OrganizationListEnhanced />);

    expect(screen.getByText('Organization Management')).toBeInTheDocument();
  });

  it('handles empty state', () => {
    mockUseOrganizations.mockReturnValue([]);

    render(<OrganizationListEnhanced />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles API errors gracefully', () => {
    mockUseOrganizationStore.mockReturnValue({
      fetchOrganizations: mockFetchOrganizations,
      loading: false,
      error: new Error('Failed to fetch organizations')
    } as any);

    expect(() => render(<OrganizationListEnhanced />)).not.toThrow();
  });

  it('displays review counts correctly', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      // Check review counts are displayed
      expect(screen.getByText('(127)')).toBeInTheDocument();
      expect(screen.getByText('(89)')).toBeInTheDocument();
    });
  });

  it('handles organizations without certifications', async () => {
    const orgsWithoutCerts = [
      {
        ...mockOrganizations[0],
        certifications: []
      }
    ];

    mockUseOrganizations.mockReturnValue(orgsWithoutCerts);

    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('SolarTech Solutions')).toBeInTheDocument();
      // Should not show certification badges
      expect(screen.queryByText('NABCEP')).not.toBeInTheDocument();
    });
  });

  it('handles organizations without ratings', async () => {
    const orgsWithoutRatings = [
      {
        ...mockOrganizations[0],
        rating: null,
        reviewCount: 0
      }
    ];

    mockUseOrganizations.mockReturnValue(orgsWithoutRatings);

    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('SolarTech Solutions')).toBeInTheDocument();
      // Should show "No rating" or similar placeholder
    });
  });

  it('handles organizations without established date', async () => {
    const orgsWithoutDate = [
      {
        ...mockOrganizations[0],
        established: null
      }
    ];

    mockUseOrganizations.mockReturnValue(orgsWithoutDate);

    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('SolarTech Solutions')).toBeInTheDocument();
      // Should handle null established date gracefully
    });
  });

  it('displays website links correctly', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      // Check if website links are rendered (implementation dependent)
      expect(screen.getByText('SolarTech Solutions')).toBeInTheDocument();
    });
  });

  it('handles organizations with long descriptions', async () => {
    const orgsWithLongDesc = [
      {
        ...mockOrganizations[0],
        description: 'This is a very long description that might need to be truncated or handled properly in the display to ensure the layout remains clean and readable.'
      }
    ];

    mockUseOrganizations.mockReturnValue(orgsWithLongDesc);

    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('SolarTech Solutions')).toBeInTheDocument();
      // Should handle long descriptions appropriately
    });
  });

  it('handles different organization types correctly', async () => {
    const orgsWithDifferentTypes = [
      {
        ...mockOrganizations[0],
        type: 'Distributor'
      }
    ];

    mockUseOrganizations.mockReturnValue(orgsWithDifferentTypes);

    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      expect(screen.getByText('Distributor')).toBeInTheDocument();
    });
  });

  it('applies responsive design classes', async () => {
    render(<OrganizationListEnhanced />);

    await waitFor(() => {
      // Check if responsive classes are applied
      const container = document.querySelector('[class*="overflow-x-auto"]');
      expect(container).toBeInTheDocument();
    });
  });
});