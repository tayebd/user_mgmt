import { ArrayConfiguration } from './AIEquipmentSelector';
import { LocationFactors } from './AIEquipmentSelector';

export interface PVLibPerformanceEstimates {
  annualProduction: number; // kWh/year
  monthlyProduction: number[]; // kWh/month
  specificYield: number; // kWh/kWp/year
  performanceRatio: number; // %
  systemEfficiency: number; // %
  capacityFactor: number; // %
  peakPower: number; // kW
  lifetimeProduction: number[]; // kWh/year for 25 years
  degradationProfile: number[]; // % of original capacity
  financialMetrics: {
    npv: number; // Net Present Value
    irr: number; // Internal Rate of Return
    paybackPeriod: number; // years
    lcoe: number; // Levelized Cost of Energy (€/kWh)
  };
  environmentalBenefits: {
    co2Offset: number; // tons/year
    equivalentTrees: number; // number of trees
    coalDisplacement: number; // tons of coal
  };
}

export interface PVLibSimulationRequest {
  site: {
    latitude: number;
    longitude: number;
    altitude?: number;
    timezone?: string;
    albedo?: number;
  };
  panel: {
    max_power: number;
    open_circuit_voltage: number;
    short_circuit_current: number;
    voltage_at_pmax: number;
    current_at_pmax: number;
    temp_coeff_voc?: number;
    temp_coeff_isc?: number;
  };
  array: {
    modules_per_string: number;
    strings_in_parallel: number;
    tilt_angle: number;
    azimuth_angle: number;
    mounting_height?: number;
    ground_coverage_ratio?: number;
  };
  inverter: {
    nominal_output_power: number;
    max_dc_voltage: number;
    max_input_current: number;
    efficiency?: number;
  };
  year?: number;
}

export class PVLibPerformanceSimulator {
  private readonly PVLIB_API_URL = 'http://localhost:8001';

  /**
   * Run comprehensive performance simulation using PVLib Python API
   */
  async simulatePerformance(
    configuration: ArrayConfiguration,
    panel: any,
    inverter: any,
    locationFactors: LocationFactors,
    requirements: any
  ): Promise<PVLibPerformanceEstimates> {
    console.log('📊 Starting PVLib performance simulation');

    try {
      // Build PVLib API request
      const simulationRequest: PVLibSimulationRequest = {
        site: {
          latitude: requirements.latitude || 48.8566,
          longitude: requirements.longitude || 2.3522,
          altitude: 35, // Default altitude for Paris
          timezone: 'Europe/Paris',
          albedo: 0.25
        },
        panel: {
          max_power: panel.maxPower,
          open_circuit_voltage: panel.openCircuitVoltage,
          short_circuit_current: panel.shortCircuitCurrent,
          voltage_at_pmax: panel.voltageAtPmax,
          current_at_pmax: panel.currentAtPmax,
          temp_coeff_voc: (panel.tempCoeffVoc || -0.3) / 100, // Convert %/°C to decimal
          temp_coeff_isc: (panel.tempCoeffIsc || 0.05) / 100
        },
        array: {
          modules_per_string: configuration.panelsPerString,
          strings_in_parallel: configuration.numberOfStrings,
          tilt_angle: requirements.tilt || 30,
          azimuth_angle: this.getAzimuthFromOrientation(requirements.orientation || 'south'),
          mounting_height: 2.0,
          ground_coverage_ratio: 0.3
        },
        inverter: {
          nominal_output_power: inverter.maxOutputPower,
          max_dc_voltage: inverter.maxDcVoltage,
          max_input_current: inverter.maxInputCurrentPerMppt,
          efficiency: (inverter.europeanEfficiency || 97) / 100
        },
        year: 2023
      };

      console.log('🔍 Calling PVLib API with system configuration...');

      // Call PVLib API
      const response = await fetch(`${this.PVLIB_API_URL}/simulate/year`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulationRequest)
      });

      if (!response.ok) {
        throw new Error(`PVLib API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(`PVLib simulation failed: ${result.error_message}`);
      }

      console.log('✅ PVLib simulation completed successfully');
      console.log(`📈 Annual Production: ${result.annual_energy} kWh`);
      console.log(`⚡ Capacity Factor: ${(result.capacity_factor * 100).toFixed(1)}%`);
      console.log(`🎯 Performance Ratio: ${(result.performance_ratio * 100).toFixed(1)}%`);

      // Convert PVLib results to our format
      const monthlyProduction = this.convertMonthlyEnergyToArray(result.monthly_energy);
      const annualProduction = result.annual_energy;
      const systemSizeKW = configuration.totalPowerDC / 1000;
      const specificYield = annualProduction / systemSizeKW;
      const performanceRatio = result.performance_ratio * 100;
      const systemEfficiency = performanceRatio * (inverter.europeanEfficiency / 100);
      const capacityFactor = result.capacity_factor * 100;
      const peakPower = result.peak_power / 1000; // Convert to kW

      // Calculate lifetime production with degradation
      const lifetimeProduction = this.calculateLifetimeProduction(
        annualProduction,
        0.5 // 0.5% annual degradation (industry standard)
      );

      // Calculate financial metrics
      const financialMetrics = this.calculateFinancialMetrics(
        annualProduction,
        configuration,
        requirements
      );

      // Calculate environmental benefits
      const environmentalBenefits = this.calculateEnvironmentalBenefits(annualProduction);

      return {
        annualProduction,
        monthlyProduction,
        specificYield,
        performanceRatio,
        systemEfficiency,
        capacityFactor,
        peakPower,
        lifetimeProduction,
        degradationProfile: this.calculateDegradationProfile(0.5),
        financialMetrics,
        environmentalBenefits,
      };

    } catch (error) {
      console.error('❌ PVLib simulation failed:', error);
      throw new Error(`PVLib simulation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert orientation string to azimuth angle in degrees
   */
  private getAzimuthFromOrientation(orientation: string): number {
    const orientationMap: Record<string, number> = {
      'south': 180,
      'southeast': 135,
      'southwest': 225,
      'east': 90,
      'west': 270,
      'northeast': 45,
      'northwest': 315,
      'north': 0
    };

    return orientationMap[orientation.toLowerCase()] || 180; // Default to south
  }

  /**
   * Convert monthly energy object to array
   */
  private convertMonthlyEnergyToArray(monthlyEnergy: Record<string, number>): number[] {
    const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    return months.map(month => monthlyEnergy[month] || 0);
  }

  /**
   * Calculate lifetime production with degradation
   */
  private calculateLifetimeProduction(
    firstYearProduction: number,
    degradationRate: number
  ): number[] {
    const lifetimeProduction = new Array(25).fill(0);

    for (let year = 0; year < 25; year++) {
      const degradationFactor = Math.pow(1 - degradationRate / 100, year);
      lifetimeProduction[year] = firstYearProduction * degradationFactor;
    }

    return lifetimeProduction;
  }

  /**
   * Calculate degradation profile
   */
  private calculateDegradationProfile(degradationRate: number): number[] {
    const profile = new Array(25).fill(0);

    for (let year = 0; year < 25; year++) {
      profile[year] = Math.pow(1 - degradationRate / 100, year) * 100;
    }

    return profile;
  }

  /**
   * Calculate financial metrics
   */
  private calculateFinancialMetrics(
    annualProduction: number,
    configuration: ArrayConfiguration,
    requirements: any
  ): PVLibPerformanceEstimates['financialMetrics'] {
    const systemSizeKW = configuration.totalPowerDC / 1000;
    const electricityPrice = 0.25; // €/kWh (average European price)
    const annualRevenue = annualProduction * electricityPrice;
    const annualCost = 20 * systemSizeKW; // €20/year/kWp O&M cost

    // Simple cash flow analysis
    const cashFlows = [];
    let cumulativeCashFlow = 0;
    let paybackPeriod = 0;

    // Estimate system cost (€/W installed)
    const systemCostPerWatt = 1.5; // Average €1.5/W including installation
    const totalSystemCost = configuration.totalPowerDC * systemCostPerWatt;

    for (let year = 1; year <= 25; year++) {
      const production = annualProduction * Math.pow(1 - 0.005, year - 1); // Include degradation
      const revenue = production * electricityPrice * Math.pow(1 + 0.025, year - 1); // 2.5% inflation
      const cost = annualCost * Math.pow(1 + 0.025, year - 1);
      const cashFlow = revenue - cost;

      // Add initial investment in year 0
      if (year === 1) {
        cashFlows.push(-totalSystemCost); // Initial investment
      }
      cashFlows.push(cashFlow);

      cumulativeCashFlow += cashFlow;
      if (cumulativeCashFlow > 0 && paybackPeriod === 0) {
        paybackPeriod = year;
      }
    }

    // Calculate NPV
    let npv = 0;
    for (let year = 0; year < cashFlows.length; year++) {
      npv += cashFlows[year] / Math.pow(1 + 0.05, year); // 5% discount rate
    }

    // Calculate IRR (simplified)
    let irr = 0;
    let rateLow = -0.1;
    let rateHigh = 0.3;

    for (let i = 0; i < 20; i++) {
      irr = (rateLow + rateHigh) / 2;
      let testNpv = 0;

      for (let year = 0; year < cashFlows.length; year++) {
        testNpv += cashFlows[year] / Math.pow(1 + irr, year);
      }

      if (testNpv > 0) {
        rateLow = irr;
      } else {
        rateHigh = irr;
      }

      if (Math.abs(testNpv) < 1000) break; // Close enough
    }

    // Calculate LCOE
    let totalProduction = 0;
    for (let year = 1; year <= 25; year++) {
      totalProduction += annualProduction * Math.pow(1 - 0.005, year - 1);
    }

    const totalCosts = totalSystemCost + (annualCost * 25);
    const lcoe = totalCosts / totalProduction;

    return {
      npv,
      irr: irr * 100, // Convert to percentage
      paybackPeriod: paybackPeriod || 25,
      lcoe,
    };
  }

  /**
   * Calculate environmental benefits
   */
  private calculateEnvironmentalBenefits(annualProduction: number): PVLibPerformanceEstimates['environmentalBenefits'] {
    // Emission factors
    const gridEmissionFactor = 0.5; // kg CO2/kWh (European average)
    const coalEmissionFactor = 0.98; // kg CO2/kWh for coal
    const treeAbsorption = 22; // kg CO2/year per tree

    const co2Offset = (annualProduction * gridEmissionFactor) / 1000; // tons
    const equivalentTrees = co2Offset * 1000 / treeAbsorption;
    const coalDisplacement = (annualProduction * coalEmissionFactor) / 1000; // tons

    return {
      co2Offset,
      equivalentTrees: Math.round(equivalentTrees),
      coalDisplacement,
    };
  }

  /**
   * Quick simulation for initial estimates
   */
  async quickSimulation(latitude: number, longitude: number, systemSizeKW: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.PVLIB_API_URL}/simulate/quick?latitude=${latitude}&longitude=${longitude}&system_size_kw=${systemSizeKW}`
      );

      if (!response.ok) {
        throw new Error(`PVLib API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(`PVLib quick simulation failed: ${result.error_message}`);
      }

      return result;
    } catch (error) {
      console.error('❌ PVLib quick simulation failed:', error);
      throw error;
    }
  }
}