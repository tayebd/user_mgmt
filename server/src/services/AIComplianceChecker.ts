import { ArrayConfiguration } from './AIEquipmentSelector';

export interface ComplianceResult {
  electricalCodeCompliant: boolean;
  buildingCodeCompliant: boolean;
  utilityCompliant: boolean;
  issues: ComplianceIssue[];
  recommendations: string[];
  complianceScore: number;
  protectionRequirements: ProtectionRequirements;
}

export interface ComplianceIssue {
  type: 'voltage' | 'current' | 'power' | 'safety' | 'wiring' | 'mounting';
  severity: 'warning' | 'error' | 'critical';
  description: string;
  standard: string;
  recommendation: string;
}

export interface ProtectionRequirements {
  dcSide: {
    fuse: {
      voltage: number;
      current: number;
      type: string;
    };
    disconnectSwitch: {
      voltage: number;
      current: number;
      type: string;
    };
    surgeProtection: {
      voltage: number;
      dischargeCurrent: number;
      type: string;
    };
  };
  acSide: {
    circuitBreaker: {
      voltage: number;
      current: number;
      type: string;
    };
    surgeProtection: {
      voltage: number;
      dischargeCurrent: number;
      type: string;
    };
    disconnectSwitch: {
      voltage: number;
      current: number;
      type: string;
    };
  };
  cableSizing: {
    dc: {
      section: number;
      currentRating: number;
      voltageDrop: number;
    };
    ac: {
      section: number;
      currentRating: number;
      voltageDrop: number;
    };
  };
}

export class AIComplianceChecker {
  /**
   * Check system compliance against UTE 15-712-1 and other standards
   */
  checkCompliance(
    configuration: ArrayConfiguration,
    panel: any,
    inverter: any,
    requirements: any
  ): ComplianceResult {
    console.log('🔍 Starting compliance check for system configuration');

    const issues: ComplianceIssue[] = [];
    const recommendations: string[] = [];

    // Electrical code compliance (UTE 15-712-1)
    const electricalCompliance = this.checkElectricalCompliance(
      configuration,
      panel,
      inverter,
      issues,
      recommendations
    );

    // Building code compliance
    const buildingCompliance = this.checkBuildingCompliance(
      configuration,
      requirements,
      issues,
      recommendations
    );

    // Utility compliance
    const utilityCompliance = this.checkUtilityCompliance(
      configuration,
      inverter,
      issues,
      recommendations
    );

    // Calculate overall compliance score
    const complianceScore = this.calculateComplianceScore(issues);

    // Determine protection requirements
    const protectionRequirements = this.calculateProtectionRequirements(
      configuration,
      panel,
      inverter
    );

    const result: ComplianceResult = {
      electricalCodeCompliant: electricalCompliance,
      buildingCodeCompliant: buildingCompliance,
      utilityCompliant: utilityCompliance,
      issues,
      recommendations,
      complianceScore,
      protectionRequirements,
    };

    console.log('✅ Compliance check completed');
    return result;
  }

  /**
   * Check electrical code compliance (UTE 15-712-1)
   */
  private checkElectricalCompliance(
    configuration: ArrayConfiguration,
    panel: any,
    inverter: any,
    issues: ComplianceIssue[],
    recommendations: string[]
  ): boolean {
    let compliant = true;

    // 1. Voltage compliance checks
    if (configuration.voltageRange.maxVoltage > inverter.maxDcVoltage) {
      issues.push({
        type: 'voltage',
        severity: 'critical',
        description: `Maximum string voltage (${configuration.voltageRange.maxVoltage}V) exceeds inverter maximum DC voltage (${inverter.maxDcVoltage}V)`,
        standard: 'UTE 15-712-1 - 4.3.1',
        recommendation: 'Reduce number of panels per string or choose inverter with higher DC voltage rating',
      });
      compliant = false;
    }

    if (configuration.voltageRange.minVoltage < inverter.mpptVoltageRangeMin) {
      issues.push({
        type: 'voltage',
        severity: 'error',
        description: `Minimum string voltage (${configuration.voltageRange.minVoltage}V) is below inverter MPPT minimum voltage (${inverter.mpptVoltageRangeMin}V)`,
        standard: 'UTE 15-712-1 - 4.3.2',
        recommendation: 'Increase number of panels per string or choose inverter with lower MPPT voltage range',
      });
      compliant = false;
    }

    // 2. Current compliance checks
    if (configuration.currentRange.maxCurrent > inverter.maxInputCurrentPerMppt) {
      issues.push({
        type: 'current',
        severity: 'critical',
        description: `Maximum string current (${configuration.currentRange.maxCurrent}A) exceeds inverter MPPT current rating (${inverter.maxInputCurrentPerMppt}A)`,
        standard: 'UTE 15-712-1 - 4.3.3',
        recommendation: 'Reduce number of parallel strings or choose inverter with higher current rating',
      });
      compliant = false;
    }

    // 3. Power ratio compliance (0.9 to 1.3 per UTE 15-712-1)
    if (configuration.powerRatio < 0.9) {
      issues.push({
        type: 'power',
        severity: 'warning',
        description: `Power ratio (${configuration.powerRatio}) is below minimum recommended (0.9)`,
        standard: 'UTE 15-712-1 - 5.2.1',
        recommendation: 'Consider adding more panels or choosing smaller inverter',
      });
    } else if (configuration.powerRatio > 1.3) {
      issues.push({
        type: 'power',
        severity: 'warning',
        description: `Power ratio (${configuration.powerRatio}) exceeds maximum recommended (1.3)`,
        standard: 'UTE 15-712-1 - 5.2.1',
        recommendation: 'Consider reducing panels or choosing larger inverter',
      });
    }

    // 4. Temperature considerations
    const vocAtMinus10 = configuration.voltageRange.vocAtMinus10;
    if (vocAtMinus10 > inverter.maxDcVoltage) {
      issues.push({
        type: 'voltage',
        severity: 'critical',
        description: `Open circuit voltage at -10°C (${vocAtMinus10}V) exceeds inverter maximum DC voltage`,
        standard: 'UTE 15-712-1 - 4.3.1',
        recommendation: 'Critical: Reduce panels per string for cold climate operation',
      });
      compliant = false;
    }

    // 5. Short circuit current considerations
    const iscAt85C = configuration.currentRange.iscAt85C;
    const maxShortCircuitCurrent = inverter.maxShortCircuitCurrent || (inverter.maxInputCurrentPerMppt * 1.25);

    if (iscAt85C * configuration.numberOfStrings > maxShortCircuitCurrent) {
      issues.push({
        type: 'current',
        severity: 'error',
        description: `Short circuit current at 85°C exceeds inverter short circuit rating`,
        standard: 'UTE 15-712-1 - 4.3.3',
        recommendation: 'Reduce number of parallel strings',
      });
      compliant = false;
    }

    // 6. Grounding and safety requirements
    recommendations.push('Install proper grounding system according to UTE 15-712-1 section 7');
    recommendations.push('Ensure proper labeling of DC and AC circuits');
    recommendations.push('Install DC disconnect switch accessible from inverter location');

    return compliant;
  }

  /**
   * Check building code compliance
   */
  private checkBuildingCompliance(
    configuration: ArrayConfiguration,
    requirements: any,
    issues: ComplianceIssue[],
    recommendations: string[]
  ): boolean {
    let compliant = true;

    // 1. Roof load considerations
    const estimatedWeight = configuration.totalPanels * 20; // ~20kg per panel including mounting
    const maxLoadPerSqm = 100; // kg/m² typical roof limit

    recommendations.push(`Verify roof structural capacity for additional load of ~${estimatedWeight}kg`);

    // 2. Fire safety requirements
    recommendations.push('Maintain minimum 60cm clearance around arrays for fire department access');
    recommendations.push('Install fire-rated DC cables and conduits');
    recommendations.push('Provide rapid shutdown capability per fire code');

    // 3. Mounting system requirements
    if (requirements.roofType === 'flat') {
      recommendations.push('Use ballasted or mechanically attached mounting system for flat roof');
      recommendations.push('Ensure minimum 5° tilt angle for water drainage');
    } else if (requirements.roofType === 'tilted') {
      recommendations.push('Use roof-parallel mounting system with proper flashing');
      recommendations.push('Verify roof penetration weatherproofing');
    }

    // 4. Wind and snow loads
    recommendations.push('Verify mounting system certified for local wind and snow loads');
    recommendations.push('Consider wind tunnel testing for high-profile installations');

    // 5. Accessibility requirements
    recommendations.push('Ensure minimum 80cm walkway for maintenance access');
    recommendations.push('Install access ladders or walkways as required');

    return compliant;
  }

  /**
   * Check utility interconnection compliance
   */
  private checkUtilityCompliance(
    configuration: ArrayConfiguration,
    inverter: any,
    issues: ComplianceIssue[],
    recommendations: string[]
  ): boolean {
    let compliant = true;

    // 1. Grid voltage compatibility
    const gridVoltage = 230; // Standard European single-phase
    const inverterOutputVoltage = inverter.outputVoltage || 230;

    if (Math.abs(inverterOutputVoltage - gridVoltage) > 10) {
      issues.push({
        type: 'voltage',
        severity: 'error',
        description: `Inverter output voltage (${inverterOutputVoltage}V) does not match grid voltage (${gridVoltage}V)`,
        standard: 'Utility Interconnection Requirements',
        recommendation: 'Select inverter with compatible output voltage',
      });
      compliant = false;
    }

    // 2. Power rating limits
    const maxResidentialPower = 3600; // 3.6kW typical limit for single-phase residential
    if (configuration.totalPowerDC > maxResidentialPower) {
      recommendations.push(`System power (${configuration.totalPowerDC}W) exceeds typical residential limit (${maxResidentialPower}W)`);
      recommendations.push('Verify utility allows larger systems or consider three-phase connection');
    }

    // 3. Anti-islanding protection
    recommendations.push('Verify inverter has certified anti-islanding protection');
    recommendations.push('Ensure automatic disconnection capability during grid outages');

    // 4. Monitoring and reporting requirements
    recommendations.push('Install production metering as required by utility');
    recommendations.push('Provide remote monitoring capability for utility access');

    // 5. Interconnection agreement requirements
    recommendations.push('Obtain utility interconnection agreement before installation');
    recommendations.push('Submit detailed electrical schematic for utility approval');

    return compliant;
  }

  /**
   * Calculate overall compliance score
   */
  private calculateComplianceScore(issues: ComplianceIssue[]): number {
    let score = 100;

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Calculate protection requirements per UTE 15-712-1
   */
  private calculateProtectionRequirements(
    configuration: ArrayConfiguration,
    panel: any,
    inverter: any
  ): ProtectionRequirements {
    // DC side protection calculations
    const iscSTC = panel.shortCircuitCurrent || 0;
    const vocSTC = panel.openCircuitVoltage || 0;
    const impSTC = panel.currentAtPmax || 0;
    const vmpSTC = panel.voltageAtPmax || 0;

    // Temperature corrections
    const betaFactor = (panel.tempCoeffVoc || -0.3) / 100;
    const alphaFactor = (panel.tempCoeffIsc || 0.05) / 100;

    const vocAtMinus10 = vocSTC * (1 + betaFactor * -35);
    const iscAt85C = iscSTC * (1 + alphaFactor * 60);
    const stringIscAt85C = iscAt85C * configuration.numberOfStrings;

    // DC Fuse requirements (1.25 × Isc per UTE 15-712-1)
    const fuseCurrentDC = Math.ceil(stringIscAt85C * 1.25);
    const fuseVoltageDC = Math.ceil(vocAtMinus10);

    // DC Disconnect switch requirements (1.25 × Isc)
    const switchCurrentDC = Math.ceil(stringIscAt85C * 1.25);

    // DC Surge protection requirements
    const surgeVoltageDC = Math.ceil(vocSTC * 1.2);

    // AC side protection calculations
    const inverterMaxCurrent = inverter.maxOutputCurrent || 20;
    const gridVoltage = 230;

    // AC Circuit breaker requirements
    const circuitBreakerCurrentAC = Math.ceil(inverterMaxCurrent * 1.25);

    // AC Surge protection
    const surgeVoltageAC = Math.ceil(gridVoltage * 1.1);

    // Cable sizing calculations
    const dcCableCurrent = Math.ceil(stringIscAt85C * 1.25);
    const acCableCurrent = Math.ceil(inverterMaxCurrent * 1.25);

    return {
      dcSide: {
        fuse: {
          voltage: fuseVoltageDC,
          current: fuseCurrentDC,
          type: 'DC Photovoltaic Fuse - gPV/gR',
        },
        disconnectSwitch: {
          voltage: fuseVoltageDC,
          current: switchCurrentDC,
          type: 'DC Disconnect Switch - Load Break',
        },
        surgeProtection: {
          voltage: surgeVoltageDC,
          dischargeCurrent: 20, // 20kA minimum
          type: 'Type 2 DC Surge Protector',
        },
      },
      acSide: {
        circuitBreaker: {
          voltage: gridVoltage,
          current: circuitBreakerCurrentAC,
          type: 'AC Circuit Breaker - Type B/C',
        },
        surgeProtection: {
          voltage: surgeVoltageAC,
          dischargeCurrent: 20, // 20kA minimum
          type: 'Type 2 AC Surge Protector',
        },
        disconnectSwitch: {
          voltage: gridVoltage,
          current: circuitBreakerCurrentAC,
          type: 'AC Main Disconnect Switch',
        },
      },
      cableSizing: {
        dc: {
          section: this.calculateCableSection(dcCableCurrent, 'DC'),
          currentRating: dcCableCurrent,
          voltageDrop: this.calculateVoltageDrop(dcCableCurrent, configuration.totalPanels, 'DC'),
        },
        ac: {
          section: this.calculateCableSection(acCableCurrent, 'AC'),
          currentRating: acCableCurrent,
          voltageDrop: this.calculateVoltageDrop(acCableCurrent, 1, 'AC'),
        },
      },
    };
  }

  /**
   * Calculate minimum cable section based on current
   */
  private calculateCableSection(current: number, type: 'DC' | 'AC'): number {
    // Simplified cable sizing calculation
    // In practice, this would consider installation method, ambient temperature, grouping factors, etc.

    if (current <= 16) return 2.5; // mm²
    if (current <= 25) return 4; // mm²
    if (current <= 35) return 6; // mm²
    if (current <= 50) return 10; // mm²
    if (current <= 70) return 16; // mm²
    if (current <= 90) return 25; // mm²
    if (current <= 120) return 35; // mm²
    return 50; // mm² for larger currents
  }

  /**
   * Calculate voltage drop
   */
  private calculateVoltageDrop(current: number, length: number, type: 'DC' | 'AC'): number {
    // Simplified voltage drop calculation
    // In practice, this would use actual cable length, resistance, and power factor

    const resistance = 0.0175; // Ω·mm²/m for copper
    const cableLength = 20; // meters (typical)
    const section = this.calculateCableSection(current, type);

    const voltageDrop = current * resistance * (2 * cableLength) / section;

    if (type === 'DC') {
      const operatingVoltage = 400; // Typical DC string voltage
      return (voltageDrop / operatingVoltage) * 100; // Percentage
    } else {
      const operatingVoltage = 230; // AC grid voltage
      return (voltageDrop / operatingVoltage) * 100; // Percentage
    }
  }
}