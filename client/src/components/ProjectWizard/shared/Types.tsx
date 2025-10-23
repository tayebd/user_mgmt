/**
 * Shared Types for Project Wizards
 * Common interfaces and types used by both Regular and AI Project Wizards
 */

import type { PVPanel, Inverter, PVProject } from '@/shared/types';

// Wizard step definitions
export type WizardStep =
  | 'location'
  | 'system-requirements'
  | 'array-configuration'
  | 'electrical-parameters'
  | 'project-info'
  | 'review'
  | 'results';

export type WizardMode = 'regular' | 'ai';

// Form data types for each step
export interface LocationStepData {
  address: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  // Additional location-specific data
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  // Solar-specific location data
  annualIrradiance?: number; // kWh/m²/year
  climateZone?: string;
  shadingProfile?: {
    morning: number; // 0-100%
    midday: number; // 0-100%
    evening: number; // 0-100%
  };
}

export interface SystemRequirementsStepData {
  targetPower: number; // kW
  availableRoofArea: number; // m²
  budget: number; // local currency
  priority: 'cost' | 'efficiency' | 'space' | 'reliability';
  constraints?: string[];
  // Additional requirements
  electricityRate?: number; // $/kWh
  consumptionProfile?: 'residential' | 'commercial' | 'industrial';
  desiredSelfConsumption?: number; // percentage
  backupRequirements?: {
    criticalLoads: number; // kW
    backupDuration: number; // hours
  };
}

export interface ArrayConfigurationStepData {
  panelId: number;
  inverterId: number;
  panelsPerString: number;
  parallelStrings: number;
  tiltAngle: number; // degrees
  azimuth: number; // degrees (180 = south)
  mountingType: 'roof-mounted' | 'ground-mounted' | 'carport' | 'floating';
  // Additional configuration
  panelSpacing?: number; // mm
  rackingType?: string;
  moduleLayout?: {
    rows: number;
    columns: number;
    orientation: 'portrait' | 'landscape';
  };
}

export interface ElectricalParametersStepData {
  systemVoltage: '230V' | '400V' | '480V';
  phaseType: 'single-phase' | 'three-phase';
  backupPower: boolean;
  batteryStorage: boolean;
  evCharging: boolean;
  // Additional electrical parameters
  mainBreakerSize?: number; // Amps
  cableType?: string;
  groundingType?: string;
  surgeProtection?: boolean;
  monitoringSystem?: boolean;
}

export interface ProjectInfoStepData {
  name: string;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  expectedStartDate?: string;
  projectType: 'residential' | 'commercial' | 'industrial' | 'utility';
  // Additional project details
  companyName?: string;
  projectReference?: string;
  installerNotes?: string;
  customerRequirements?: string[];
  complianceStandards?: string[];
}

// Complete wizard data
export interface CompleteWizardData {
  location: LocationStepData;
  systemRequirements: SystemRequirementsStepData;
  arrayConfiguration: ArrayConfigurationStepData;
  electricalParameters: ElectricalParametersStepData;
  projectInfo: ProjectInfoStepData;
}

// AI Wizard specific data
export interface AIWizardInput {
  location: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  requirements: {
    targetPower: number;
    budget: number;
    roofType: string;
    orientation: string;
    priority: string;
    constraints?: string[];
  };
}

export interface AIWizardResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    recommendedEquipment: {
      panel: PVPanel;
      inverter: Inverter;
      configuration: ArrayConfigurationStepData;
    };
    performanceAnalysis: {
      annualProduction: number;
      performanceRatio: number;
      specificYield: number;
      monthlyProduction: number[];
      financialMetrics: {
        systemCost: number;
        paybackPeriod: number;
        roi: number;
        npv: number;
        lcoe: number;
      };
    };
    complianceValidation: {
      isCompliant: boolean;
      warnings: string[];
      errors: string[];
      standards: string[];
    };
    environmentalImpact: {
      co2Savings: number;
      treesEquivalent: number;
      renewableEnergyPercentage: number;
    };
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Wizard state management
export interface WizardState {
  // Navigation
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  isStepValid: Record<WizardStep, boolean>;
  stepErrors: Record<WizardStep, string[]>;
  stepWarnings: Record<WizardStep, string[]>;

  // Form data
  formData: Partial<CompleteWizardData>;
  isDirty: boolean;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  isCalculating: boolean;

  // Data states
  availablePanels: PVPanel[];
  availableInverters: Inverter[];
  selectedPanel: PVPanel | null;
  selectedInverter: Inverter | null;

  // AI specific states
  aiResult: AIWizardResult | null;
  aiProcessing: boolean;
  aiProgress: number;

  // Results
  calculationResults: {
    arrayConfiguration?: ArrayConfigurationResult;
    systemSizing?: SystemSizingResult;
    financialAnalysis?: FinancialAnalysisResult;
    performanceSimulation?: PerformanceSimulationResult;
    complianceValidation?: ComplianceValidationResult;
  } | null;

  // Utility states
  showPreview: boolean;
  showAdvancedOptions: boolean;
  saveProgress: boolean;
}

// Wizard actions
export interface WizardActions {
  // Navigation
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetWizard: () => void;

  // Form data management
  updateFormData: <K extends keyof CompleteWizardData>(
    step: K,
    data: Partial<CompleteWizardData[K]>
  ) => void;
  validateCurrentStep: () => Promise<boolean>;
  validateAllSteps: () => Promise<boolean>;

  // Data fetching
  fetchPanels: () => Promise<void>;
  fetchInverters: () => Promise<void>;
  selectPanel: (panel: PVPanel) => void;
  selectInverter: (inverter: Inverter) => void;

  // Calculations
  calculateArrayConfiguration: () => Promise<void>;
  calculateSystemSizing: () => Promise<void>;
  calculateFinancialAnalysis: () => Promise<void>;
  simulatePerformance: () => Promise<void>;

  // AI actions
  startAIProcessing: (input: AIWizardInput) => Promise<void>;
  pollAIProgress: (designId: string) => Promise<void>;
  cancelAIProcessing: () => void;

  // Project actions
  saveProject: () => Promise<void>;
  loadProject: (projectId: number) => Promise<void>;
  generateReport: () => Promise<Blob | null>;
  submitProject: () => Promise<void>;

  // Utility actions
  togglePreview: () => void;
  toggleAdvancedOptions: () => void;
  exportData: () => Promise<void>;
  importData: (data: Record<string, unknown>) => Promise<void>;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface StepValidation {
  step: WizardStep;
  result: ValidationResult;
  isValid: boolean;
}

// Calculation result types
export interface ArrayConfigurationResult {
  maxPanelsInSeries: number;
  maxParallelStrings: number;
  optimalConfiguration: {
    seriesPerString: number;
    parallelStrings: number;
    totalPanels: number;
  };
  temperatureData: {
    voltageAtMinus10: number;
    currentAt85: number;
  };
  compatibility: ValidationResult;
}

export interface SystemSizingResult {
  requiredPanels: number;
  requiredInverter: number;
  roofAreaNeeded: number;
  systemSizekW: number;
  annualProduction: number;
  co2Savings: number;
  feasibility: ValidationResult;
}

export interface FinancialAnalysisResult {
  systemCost: number;
  installationCost: number;
  totalCost: number;
  paybackPeriod: number;
  roi: number;
  npv: number;
  irr: number;
  lcoe: number;
  monthlySavings: number[];
  cumulativeSavings: number[];
}

export interface PerformanceSimulationResult {
  hourlyProduction: number[];
  monthlyProduction: number[];
  annualProduction: number;
  performanceRatio: number;
  specificYield: number;
  temperatureLosses: number;
  systemLosses: number[];
}

export interface ComplianceValidationResult {
  isCompliant: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
  checkedStandards: string[];
  documentationRequired: string[];
}

// Report generation types
export interface ReportConfiguration {
  includeTechnical: boolean;
  includeFinancial: boolean;
  includeCompliance: boolean;
  includeEnvironmental: boolean;
  includeDrawings: boolean;
  format: 'pdf' | 'word' | 'html';
  language: string;
  branding?: {
    logo?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

export interface GeneratedReport {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  expiresAt?: string;
}

// Progress tracking types
export interface WizardProgress {
  totalSteps: number;
  completedSteps: number;
  currentStepIndex: number;
  percentageComplete: number;
  estimatedTimeRemaining: number; // minutes
  stepTimes: Record<WizardStep, number>; // seconds spent on each step
}

// Error handling types
export interface WizardError {
  type: 'validation' | 'calculation' | 'api' | 'network' | 'ai';
  message: string;
  details?: Record<string, unknown>;
  step?: WizardStep;
  recoverable: boolean;
  suggestedAction?: string;
}

// Analytics tracking types
export interface WizardAnalytics {
  sessionStarted: string;
  sessionCompleted?: string;
  totalDuration?: number; // seconds
  stepTransitions: Array<{
    from: WizardStep;
    to: WizardStep;
    timestamp: string;
    duration: number; // seconds
  }>;
  calculationsPerformed: number;
  errorsEncountered: WizardError[];
  finalResult?: {
    projectSize: number;
    estimatedCost: number;
    completed: boolean;
  };
}

// Export utility functions
export const getWizardSteps = (mode: WizardMode): WizardStep[] => {
  const regularSteps: WizardStep[] = [
    'location',
    'system-requirements',
    'array-configuration',
    'electrical-parameters',
    'project-info',
    'review',
  ];

  const aiSteps: WizardStep[] = [
    'location',
    'system-requirements',
    'results',
    'project-info',
  ];

  return mode === 'ai' ? aiSteps : regularSteps;
};

export const getStepTitle = (step: WizardStep): string => {
  const titles: Record<WizardStep, string> = {
    'location': 'Project Location',
    'system-requirements': 'System Requirements',
    'array-configuration': 'Array Configuration',
    'electrical-parameters': 'Electrical Parameters',
    'project-info': 'Project Information',
    'review': 'Review & Submit',
    'results': 'AI Results',
  };

  return titles[step];
};

export const getStepDescription = (step: WizardStep): string => {
  const descriptions: Record<WizardStep, string> = {
    'location': 'Enter the project location and site details',
    'system-requirements': 'Specify your power requirements and constraints',
    'array-configuration': 'Configure the solar array layout and equipment',
    'electrical-parameters': 'Set up electrical system specifications',
    'project-info': 'Provide project and customer information',
    'review': 'Review all details before submission',
    'results': 'Review AI-generated system design and recommendations',
  };

  return descriptions[step];
};

export const isStepComplete = (
  step: WizardStep,
  formData: Partial<CompleteWizardData>
): boolean => {
  switch (step) {
    case 'location':
      return !!(formData.location?.address &&
               formData.location?.latitude !== undefined &&
               formData.location?.longitude !== undefined);

    case 'system-requirements':
      return !!(formData.systemRequirements?.targetPower &&
               formData.systemRequirements?.availableRoofArea &&
               formData.systemRequirements?.budget);

    case 'array-configuration':
      return !!(formData.arrayConfiguration?.panelId &&
               formData.arrayConfiguration?.inverterId &&
               formData.arrayConfiguration?.panelsPerString &&
               formData.arrayConfiguration?.parallelStrings);

    case 'electrical-parameters':
      return !!(formData.electricalParameters?.systemVoltage &&
               formData.electricalParameters?.phaseType);

    case 'project-info':
      return !!(formData.projectInfo?.name &&
               formData.projectInfo?.customerName &&
               formData.projectInfo?.customerEmail);

    case 'review':
    case 'results':
      return true; // These are display steps

    default:
      return false;
  }
};