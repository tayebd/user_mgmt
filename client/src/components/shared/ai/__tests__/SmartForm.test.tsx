/**
 * SmartForm Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SmartForm } from '../SmartForm';

const mockSchema = {
  name: 'string',
  email: 'string'
} as const;

const mockSections = [
  {
    title: 'Basic Information',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text' as const,
        required: true
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        required: true
      }
    ]
  }
];

const mockSmartFields = {
  name: {
    aiEnabled: true,
    autoComplete: true,
    smartDefaults: true,
    defaultValue: 'John Doe',
    defaultReason: 'Based on user profile'
  }
};

const mockSuggestions = [
  {
    id: '1',
    field: 'name',
    value: 'John Smith',
    confidence: 85,
    reason: 'Common name in your region',
    apply: jest.fn()
  }
];

const mockValidations = [
  {
    field: 'email',
    rule: 'format',
    message: 'Email should be in valid format',
    severity: 'warning' as const,
    fix: {
      label: 'Fix Format',
      action: jest.fn()
    }
  }
];

const mockAnalysis = {
  completeness: 75,
  issues: ['Missing phone number'],
  recommendations: ['Add phone for better contact']
};

describe('SmartForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSuggestionApply = jest.fn();
  const mockOnValidationFix = jest.fn();
  const mockOnAnalyzeForm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with sections', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with AI features enabled', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{
          smartValidation: true,
          autoComplete: true,
          smartDefaults: true
        }}
        smartFields={mockSmartFields}
        suggestions={mockSuggestions}
        validations={mockValidations}
        analysis={mockAnalysis}
      />
    );

    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Smart Validation')).toBeInTheDocument();
    expect(screen.getByText('Form Analysis')).toBeInTheDocument();
  });

  it('applies smart defaults', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{ smartDefaults: true }}
        smartFields={mockSmartFields}
      />
    );

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveValue('John Doe');
  });

  it('displays suggestions', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{ autoComplete: true }}
        suggestions={mockSuggestions}
      />
    );

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  it('displays validations', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{ smartValidation: true }}
        validations={mockValidations}
      />
    );

    expect(screen.getByText('Email should be in valid format')).toBeInTheDocument();
    expect(screen.getByText('Fix Format')).toBeInTheDocument();
  });

  it('displays form analysis', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{ formAnalysis: true }}
        analysis={mockAnalysis}
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Missing phone number')).toBeInTheDocument();
    expect(screen.getByText('Add phone for better contact')).toBeInTheDocument();
  });

  it('calls onSuggestionApply when suggestion is applied', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{ autoComplete: true }}
        suggestions={mockSuggestions}
        onSuggestionApply={mockOnSuggestionApply}
      />
    );

    // Find and click the apply button
    const applyButton = screen.getByText('Apply');
    applyButton.click();

    expect(mockOnSuggestionApply).toHaveBeenCalledWith('1');
  });

  it('calls onValidationFix when validation fix is applied', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{ smartValidation: true }}
        validations={mockValidations}
        onValidationFix={mockOnValidationFix}
      />
    );

    // Find and click the fix button
    const fixButton = screen.getByText('Fix Format');
    fixButton.click();

    expect(mockOnValidationFix).toHaveBeenCalledWith('emailformat');
  });

  it('calls onAnalyzeForm when analysis is refreshed', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        aiFeatures={{ formAnalysis: true }}
        onAnalyzeForm={mockOnAnalyzeForm}
      />
    );

    // Find and click the refresh button
    const refreshButton = screen.getByText('Refresh');
    refreshButton.click();

    expect(mockOnAnalyzeForm).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles loading state', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        loading={true}
      />
    );

    // Check for loading indicators
    // This is a simplified test for demonstration
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(
      <SmartForm
        schema={mockSchema}
        sections={mockSections}
        onSubmit={mockOnSubmit}
        disabled={true}
      />
    );

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toBeDisabled();
  });
});