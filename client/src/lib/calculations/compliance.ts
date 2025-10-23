/**
 * Pure Compliance Calculations
 * UTE C 15-712-1 French electrical standards compliance checking
 * No UI dependencies, pure functions only
 */

import type {
  UTEComplianceInput,
  UTEComplianceResult,
  ComplianceRequirement,
  ArrayConfigurationResult
} from './types';

/**
 * Check UTE C 15-712-1 compliance for French electrical installations
 */
export function checkUTECompliance(input: UTEComplianceInput): UTEComplianceResult {
  const { arrayConfiguration, systemVoltage, systemCurrent, location, installationType } = input;

  const violations: ComplianceRequirement[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // UTE C 15-712-1 specific requirements
  const uteRequirements = generateUTERequirements(installationType);

  // Check voltage requirements
  checkVoltageRequirements(arrayConfiguration, systemVoltage, uteRequirements, violations, warnings);

  // Check current requirements
  checkCurrentRequirements(arrayConfiguration, systemCurrent, uteRequirements, violations, warnings);

  // Check array configuration requirements
  checkArrayConfigurationRequirements(arrayConfiguration, uteRequirements, violations, warnings);

  // Check location-specific requirements
  if (location === 'france') {
    checkFrenchSpecificRequirements(systemVoltage, installationType, recommendations);
  }

  // Generate ute-specific requirements
  const uteSpecificRequirements = {
    groundingRequired: systemVoltage >= 48,
    rapidShutdownRequired: systemVoltage >= 80 || installationType === 'residential',
    arcFaultProtectionRequired: systemVoltage >= 80,
    labelingRequirements: generateLabelingRequirements(installationType, systemVoltage),
    inspectionRequirements: generateInspectionRequirements(installationType)
  };

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
    recommendations,
    uteSpecificRequirements
  };
}

/**
 * Generate UTE C 15-712-1 requirements based on installation type
 */
function generateUTERequirements(installationType: string): ComplianceRequirement[] {
  const baseRequirements: ComplianceRequirement[] = [
    {
      rule: 'UTE C 15-712-1 § 411.3.1',
      description: 'Maximum DC system voltage 1500V for buildings',
      minPanels: 1,
      maxPanels: 100,
      voltageLimit: 1500,
      currentLimit: 200
    },
    {
      rule: 'UTE C 15-712-1 § 411.3.2',
      description: 'Maximum string current 125% of Isc at 85°C',
      minPanels: 1,
      maxPanels: 50,
      voltageLimit: 1000,
      currentLimit: 125
    },
    {
      rule: 'UTE C 15-712-1 § 523.8',
      description: 'Cable sizing with 1.25 safety factor',
      minPanels: 1,
      maxPanels: 100,
      voltageLimit: 1500,
      currentLimit: 200
    },
    {
      rule: 'UTE C 15-712-1 § 712.411',
      description: 'Overcurrent protection required',
      minPanels: 1,
      maxPanels: 100,
      voltageLimit: 1500,
      currentLimit: 200
    }
  ];

  // Add residential-specific requirements
  if (installationType === 'residential') {
    baseRequirements.push({
      rule: 'UTE C 15-712-1 § 712.411.3.1',
      description: 'Rapid shutdown required for residential systems',
      minPanels: 1,
      maxPanels: 100,
      voltageLimit: 80,
      currentLimit: 200
    });
  }

  return baseRequirements;
}

/**
 * Check voltage requirements against UTE standards
 */
function checkVoltageRequirements(
  arrayConfig: ArrayConfigurationResult,
  systemVoltage: number,
  requirements: ComplianceRequirement[],
  violations: ComplianceRequirement[],
  warnings: string[]
): void {
  const { temperatureData } = arrayConfig;
  const maxSystemVoltage = systemVoltage;

  requirements.forEach(req => {
    if (maxSystemVoltage > req.voltageLimit) {
      violations.push({
        ...req,
        description: `${req.description} - System voltage ${maxSystemVoltage}V exceeds limit ${req.voltageLimit}V`
      });
    } else if (maxSystemVoltage > req.voltageLimit * 0.9) {
      warnings.push(`System voltage ${maxSystemVoltage}V is close to UTE limit of ${req.voltageLimit}V (${req.rule})`);
    }
  });

  // Check temperature-corrected voltage
  if (temperatureData.voltageAtMinus10 > 1500) {
    violations.push({
      rule: 'UTE C 15-712-1 § 411.3.1',
      description: `Temperature-corrected Voc ${temperatureData.voltageAtMinus10.toFixed(1)}V exceeds 1500V limit`,
      minPanels: 1,
      maxPanels: 100,
      voltageLimit: 1500,
      currentLimit: 200
    });
  }
}

/**
 * Check current requirements against UTE standards
 */
function checkCurrentRequirements(
  arrayConfig: ArrayConfigurationResult,
  systemCurrent: number,
  requirements: ComplianceRequirement[],
  violations: ComplianceRequirement[],
  warnings: string[]
): void {
  const { temperatureData, optimalConfiguration } = arrayConfig;

  // Calculate maximum current with safety factors
  const maxStringCurrent = temperatureData.currentAt85 * 1.25;
  const maxSystemCurrent = maxStringCurrent * optimalConfiguration.parallelStrings;

  requirements.forEach(req => {
    if (maxSystemCurrent > req.currentLimit) {
      violations.push({
        ...req,
        description: `${req.description} - System current ${maxSystemCurrent.toFixed(2)}A exceeds limit ${req.currentLimit}A`
      });
    } else if (maxSystemCurrent > req.currentLimit * 0.9) {
      warnings.push(`System current ${maxSystemCurrent.toFixed(2)}A is close to UTE limit of ${req.currentLimit}A (${req.rule})`);
    }
  });

  // Check individual string current
  if (maxStringCurrent > 50) { // Typical limit for DC circuits
    warnings.push(`String current ${maxStringCurrent.toFixed(2)}A exceeds typical 50A DC limit`);
  }
}

/**
 * Check array configuration requirements
 */
function checkArrayConfigurationRequirements(
  arrayConfig: ArrayConfigurationResult,
  requirements: ComplianceRequirement[],
  violations: ComplianceRequirement[],
  warnings: string[]
): void {
  const { maxPanelsInSeries, optimalConfiguration } = arrayConfig;

  // Check maximum panels in series
  if (optimalConfiguration.seriesPerString > 20) {
    violations.push({
      rule: 'UTE C 15-712-1 § 411.3.1',
      description: `Too many panels in series (${optimalConfiguration.seriesPerString}) - UTE recommends maximum 20`,
      minPanels: 1,
      maxPanels: 20,
      voltageLimit: 1000,
      currentLimit: 200
    });
  } else if (optimalConfiguration.seriesPerString > 15) {
    warnings.push(`Series string has ${optimalConfiguration.seriesPerString} panels - consider reducing for better performance`);
  }

  // Check minimum panels per string
  if (optimalConfiguration.seriesPerString < 5) {
    warnings.push(`Series string has only ${optimalConfiguration.seriesPerString} panels - may affect inverter MPPT efficiency`);
  }

  // Check parallel string balance
  if (optimalConfiguration.parallelStrings > 1) {
    const idealPanelsPerString = Math.floor(optimalConfiguration.totalPanels / optimalConfiguration.parallelStrings);
    const remainder = optimalConfiguration.totalPanels % optimalConfiguration.parallelStrings;

    if (remainder !== 0) {
      warnings.push(`Uneven panel distribution across ${optimalConfiguration.parallelStrings} strings - ${remainder} panels need to be redistributed`);
    }
  }
}

/**
 * Check France-specific requirements
 */
function checkFrenchSpecificRequirements(
  systemVoltage: number,
  installationType: string,
  recommendations: string[]
): void {
  // French regulations
  if (systemVoltage >= 48) {
    recommendations.push('Install DC grounding per NF C 15-100 requirements');
  }

  if (installationType === 'residential') {
    recommendations.push('Ensure system is registered with French grid operator (Enedis)');
    recommendations.push('Install production meter for feed-in tariff calculation');
  }

  if (systemVoltage >= 80) {
    recommendations.push('Install arc fault protection (AFCI) per recent French regulations');
    recommendations.push('Implement rapid shutdown solution accessible from outside');
  }

  // Additional French recommendations
  recommendations.push('Ensure proper labeling in French per NF C 15-100');
  recommendations.push('Schedule periodic inspection by qualified electrician');
  recommendations.push('Maintain system documentation on-site for inspection');
}

/**
 * Generate labeling requirements
 */
function generateLabelingRequirements(installationType: string, systemVoltage: number): string[] {
  const labels = [
    'PV Array DC Disconnect - Warning: High Voltage',
    'Inverter AC Disconnect - Main Power',
    'Combiner Box - DC Input from Array',
    'Grounding Connection Point',
    'Emergency Shutdown Procedure'
  ];

  if (systemVoltage >= 80) {
    labels.push('Rapid Shutdown Device - Activated by Fire Department');
  }

  if (installationType === 'residential') {
    labels.push('Production Meter - Grid Connection Point');
    labels.push('System Information Panel - Owner Contact');
  }

  return labels;
}

/**
 * Generate inspection requirements
 */
function generateInspectionRequirements(installationType: string): string[] {
  const inspections = [
    'Initial commissioning and startup test',
    'Visual inspection of all electrical connections',
    'Insulation resistance test (megger test)',
    'Continuity test of grounding system',
    'Inverter functional test with grid simulation'
  ];

  if (installationType === 'commercial' || installationType === 'industrial') {
    inspections.push('Load bank test for system performance verification');
    inspections.push('Arc flash analysis and labeling');
  }

  inspections.push('Documentation review and compliance certificate');

  return inspections;
}

/**
 * Calculate required documentation for French regulations
 */
export function calculateDocumentationRequirements(
  installationType: string,
  systemPower: number // kW
): {
  required: string[];
  recommended: string[];
  periodic: string[];
} {
  const required = [
    'System schematic diagrams',
    'Equipment specifications and data sheets',
    'Installation photographs (before and after)',
    'Test results and commissioning reports',
    'Grid connection agreement',
    'Electrical inspection certificate'
  ];

  const recommended = [
    'Maintenance schedule and logbook',
    'Performance monitoring data',
    'Warranty documentation',
    'Emergency contact information',
    'System owner manual'
  ];

  const periodic = [
    'Annual visual inspection',
    'Biennial electrical testing',
    'Periodic cleaning schedule',
    'Performance review and optimization',
    'Documentation updates'
  ];

  // Add specific requirements based on system size and type
  if (systemPower > 100) { // > 100kW
    required.push('Arc flash study report');
    required.push('Qualified electrician certification');
    periodic.push('Quarterly performance monitoring');
  }

  if (installationType === 'industrial') {
    required.push('Occupational safety documentation');
    required.push('Lockout/tagout procedures');
    periodic.push('Monthly thermal imaging of connections');
  }

  return { required, recommended, periodic };
}