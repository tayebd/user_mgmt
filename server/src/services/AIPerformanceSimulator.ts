import { ArrayConfiguration } from './AIEquipmentSelector';
import { LocationFactors } from './AIEquipmentSelector';

export interface PerformanceEstimates {
  annualProduction: number; // kWh/year
  monthlyProduction: number[]; // kWh/month
  specificYield: number; // kWh/kWp/year
  performanceRatio: number; // %
  systemEfficiency: number; // %
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
  shadingLosses: {
    monthlyLosses: number[]; // % loss per month
    annualLoss: number; // % annual loss
  };
  temperatureLosses: {
    summerLoss: number; // % loss in summer
    winterGain: number; // % gain in winter
    annualLoss: number; // % annual loss
  };
}

export interface SimulationParameters {
  panelEfficiency: number;
  inverterEfficiency: number;
  temperatureCoefficients: {
    power: number; // %/°C
    voltage: number; // %/°C
    current: number; // %/°C
  };
  systemLosses: {
    wiring: number; // %
    inverter: number; // %
    soiling: number; // %
    shading: number; // %
    mismatch: number; // %
    availability: number; // %
    degradation: number; // %/year
  };
  financial: {
    electricityPrice: number; // €/kWh
    feedInTariff: number; // €/kWh
    inflationRate: number; // %/year
    discountRate: number; // %/year
    o_mCost: number; // €/year/kWp
  };
}

export class AIPerformanceSimulator {
  /**
   * Run comprehensive performance simulation
   */
  simulatePerformance(
    configuration: ArrayConfiguration,
    panel: any,
    inverter: any,
    locationFactors: LocationFactors,
    requirements: any
  ): PerformanceEstimates {
    console.log('📊 Starting performance simulation');

    const simulationParams = this.getSimulationParameters(panel, inverter, requirements);
    const hourlyData = this.generateHourlyIrradianceData(locationFactors);

    // Calculate detailed performance
    const hourlyProduction = this.calculateHourlyProduction(
      hourlyData,
      configuration,
      simulationParams,
      locationFactors
    );

    // Aggregate to monthly and annual values
    const monthlyProduction = this.aggregateMonthlyProduction(hourlyProduction);
    const annualProduction = monthlyProduction.reduce((a, b) => a + b, 0);

    // Calculate performance metrics
    const specificYield = annualProduction / (configuration.totalPowerDC / 1000); // kWh/kWp
    const performanceRatio = this.calculatePerformanceRatio(
      annualProduction,
      configuration.totalPowerDC,
      locationFactors.solarIrradiance
    );

    // Calculate lifetime production with degradation
    const lifetimeProduction = this.calculateLifetimeProduction(
      annualProduction,
      simulationParams.systemLosses.degradation
    );

    // Calculate financial metrics
    const financialMetrics = this.calculateFinancialMetrics(
      annualProduction,
      configuration,
      simulationParams.financial
    );

    // Calculate environmental benefits
    const environmentalBenefits = this.calculateEnvironmentalBenefits(annualProduction);

    // Calculate shading and temperature effects
    const shadingLosses = this.calculateShadingLosses(requirements.shading, hourlyData);
    const temperatureLosses = this.calculateTemperatureLosses(
      hourlyData,
      simulationParams.temperatureCoefficients.power,
      locationFactors
    );

    const result: PerformanceEstimates = {
      annualProduction,
      monthlyProduction,
      specificYield,
      performanceRatio,
      systemEfficiency: performanceRatio * (simulationParams.inverterEfficiency / 100),
      lifetimeProduction,
      degradationProfile: this.calculateDegradationProfile(
        simulationParams.systemLosses.degradation
      ),
      financialMetrics,
      environmentalBenefits,
      shadingLosses,
      temperatureLosses,
    };

    console.log('✅ Performance simulation completed');
    return result;
  }

  /**
   * Get simulation parameters from equipment data
   */
  private getSimulationParameters(panel: any, inverter: any, requirements: any): SimulationParameters {
    return {
      panelEfficiency: panel.efficiency || 20,
      inverterEfficiency: inverter.europeanEfficiency || 97,
      temperatureCoefficients: {
        power: panel.tempCoeffPmax || -0.4,
        voltage: panel.tempCoeffVoc || -0.3,
        current: panel.tempCoeffIsc || 0.05,
      },
      systemLosses: {
        wiring: 2, // 2% wiring losses
        inverter: 100 - (inverter.europeanEfficiency || 97), // Inverter losses
        soiling: 2, // 2% soiling losses
        shading: this.estimateShadingLosses(requirements.shading),
        mismatch: 1, // 1% mismatch losses
        availability: 98, // 98% availability
        degradation: 0.5, // 0.5% annual degradation
      },
      financial: {
        electricityPrice: requirements.locationContext?.electricityPrice || 0.25,
        feedInTariff: requirements.locationContext?.feedInTariff || 0.10,
        inflationRate: 2.5, // 2.5% inflation
        discountRate: 5.0, // 5% discount rate
        o_mCost: 20, // €20/year/kWp O&M cost
      },
    };
  }

  /**
   * Generate hourly irradiance and temperature data for a year
   */
  private generateHourlyIrradianceData(locationFactors: LocationFactors): Array<{
    hour: number;
    irradiance: number;
    temperature: number;
  }> {
    const data = [];
    const baseIrradiance = locationFactors.solarIrradiance; // kWh/m²/year
    const dailyAverage = baseIrradiance / 365;

    for (let day = 0; day < 365; day++) {
      // Calculate day of year effects
      const dayOfYear = day + 1;
      const seasonFactor = this.calculateSeasonFactor(dayOfYear);

      // Generate hourly data for this day
      for (let hour = 0; hour < 24; hour++) {
        // Simplified daily irradiance profile (bell curve)
        const hourAngle = (hour - 12) * 15; // degrees
        const elevationAngle = 90 - Math.abs(hourAngle) * 0.5;

        if (elevationAngle > 0) {
          const hourlyIrradiance = dailyAverage * seasonFactor *
            Math.sin(elevationAngle * Math.PI / 180) * 2.5;

          // Temperature estimation based on irradiance and seasonal factors
          const baseTemp = 20; // Base temperature
          const tempIncrease = hourlyIrradiance * 0.025; // Temp increases with irradiance
          const seasonalTemp = 15 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
          const temperature = baseTemp + tempIncrease + seasonalTemp;

          data.push({
            hour: day * 24 + hour,
            irradiance: Math.max(0, hourlyIrradiance),
            temperature: Math.max(-10, Math.min(60, temperature)),
          });
        } else {
          data.push({
            hour: day * 24 + hour,
            irradiance: 0,
            temperature: 15 + 10 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365),
          });
        }
      }
    }

    return data;
  }

  /**
   * Calculate seasonal factor for irradiance
   */
  private calculateSeasonFactor(dayOfYear: number): number {
    // Simple sinusoidal model for seasonal variation
    const factor = 1 + 0.3 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
    return Math.max(0.3, factor); // Minimum 30% of average
  }

  /**
   * Calculate hourly power production
   */
  private calculateHourlyProduction(
    hourlyData: Array<{ hour: number; irradiance: number; temperature: number }>,
    configuration: ArrayConfiguration,
    params: SimulationParameters,
    locationFactors: LocationFactors
  ): number[] {
    return hourlyData.map(data => {
      if (data.irradiance < 0.05) return 0; // Night time

      // Calculate DC power with temperature effects
      const temperatureEffect = 1 + (params.temperatureCoefficients.power / 100) *
        (data.temperature - 25);

      const dcPower = configuration.totalPowerDC *
        (data.irradiance / 1000) * // Convert W/m² to kW/m²
        temperatureEffect *
        (params.panelEfficiency / 100) *
        locationFactors.temperatureCoefficients.highTemp;

      // Calculate AC power with inverter efficiency
      const acPower = dcPower * (params.inverterEfficiency / 100);

      // Apply system losses
      const systemLosses = 1 - (
        params.systemLosses.wiring / 100 +
        params.systemLosses.soiling / 100 +
        params.systemLosses.mismatch / 100
      );

      return acPower * systemLosses * (params.systemLosses.availability / 100);
    });
  }

  /**
   * Aggregate hourly production to monthly values
   */
  private aggregateMonthlyProduction(hourlyProduction: number[]): number[] {
    const monthlyProduction = new Array(12).fill(0);
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (let month = 0; month < 12; month++) {
      const startHour = month * 24 * daysPerMonth[month];
      const endHour = startHour + (24 * daysPerMonth[month]);

      for (let hour = startHour; hour < endHour && hour < hourlyProduction.length; hour++) {
        monthlyProduction[month] += hourlyProduction[hour];
      }
    }

    return monthlyProduction;
  }

  /**
   * Calculate performance ratio
   */
  private calculatePerformanceRatio(
    annualProduction: number,
    systemPowerDC: number,
    annualIrradiance: number
  ): number {
    const theoreticalProduction = systemPowerDC * annualIrradiance / 1000; // kWh
    return (annualProduction / theoreticalProduction) * 100;
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
    financial: any
  ): PerformanceEstimates['financialMetrics'] {
    const systemSizeKW = configuration.totalPowerDC / 1000;
    const annualRevenue = annualProduction * financial.electricityPrice;
    const annualCost = financial.o_mCost * systemSizeKW;

    // Simple cash flow analysis (excluding initial CAPEX for now)
    const cashFlows = [];
    let cumulativeCashFlow = 0;
    let paybackPeriod = 0;

    for (let year = 1; year <= 25; year++) {
      const production = annualProduction * Math.pow(1 - 0.005, year - 1); // Include degradation
      const revenue = production * financial.electricityPrice * Math.pow(1 + financial.inflationRate / 100, year - 1);
      const cost = financial.o_mCost * systemSizeKW * Math.pow(1 + financial.inflationRate / 100, year - 1);
      const cashFlow = revenue - cost;

      cashFlows.push(cashFlow);
      cumulativeCashFlow += cashFlow;

      if (cumulativeCashFlow > 0 && paybackPeriod === 0) {
        paybackPeriod = year;
      }
    }

    // Calculate NPV
    let npv = 0;
    for (let year = 1; year <= 25; year++) {
      npv += cashFlows[year - 1] / Math.pow(1 + financial.discountRate / 100, year);
    }

    // Calculate IRR (simplified)
    let irr = 0;
    let npvHigh = npv;
    let npvLow = -npv;
    let rateLow = 0;
    let rateHigh = financial.discountRate * 2;

    // Simple IRR calculation using bisection method
    for (let i = 0; i < 20; i++) {
      irr = (rateLow + rateHigh) / 2;
      let testNpv = 0;

      for (let year = 1; year <= 25; year++) {
        testNpv += cashFlows[year - 1] / Math.pow(1 + irr / 100, year);
      }

      if (testNpv > 0) {
        rateLow = irr;
        npvLow = testNpv;
      } else {
        rateHigh = irr;
        npvHigh = testNpv;
      }

      if (Math.abs(testNpv) < 100) break; // Close enough
    }

    // Calculate LCOE
    let totalProduction = 0;
    for (let year = 1; year <= 25; year++) {
      totalProduction += annualProduction * Math.pow(1 - 0.005, year - 1);
    }

    const totalCosts = annualCost * 25; // Simplified - should include CAPEX
    const lcoe = totalCosts / totalProduction;

    return {
      npv,
      irr,
      paybackPeriod: paybackPeriod || 25,
      lcoe,
    };
  }

  /**
   * Calculate environmental benefits
   */
  private calculateEnvironmentalBenefits(annualProduction: number): PerformanceEstimates['environmentalBenefits'] {
    // Emission factors
    const gridEmissionFactor = 0.5; // kg CO2/kWh (European average)
    const coalEmissionFactor = 0.98; // kg CO2/kWh for coal
    const treeAbsorption = 22; // kg CO2/year per tree

    const co2Offset = (annualProduction * gridEmissionFactor) / 1000; // tons
    const equivalentTrees = co2Offset * 1000 / treeAbsorption;
    const coalDisplacement = (annualProduction * coalEmissionFactor) / 1000; // tons

    return {
      co2Offset,
      equivalentTrees,
      coalDisplacement,
    };
  }

  /**
   * Estimate shading losses
   */
  private estimateShadingLosses(shading: string[] = []): number {
    if (!shading || shading.length === 0) return 0;

    let totalLoss = 0;
    for (const shade of shading) {
      switch (shade.toLowerCase()) {
        case 'trees':
          totalLoss += 5;
          break;
        case 'buildings':
          totalLoss += 8;
          break;
        case 'chimney':
          totalLoss += 3;
          break;
        case 'mountains':
          totalLoss += 10;
          break;
        case 'self_shading':
          totalLoss += 2;
          break;
        default:
          totalLoss += 5;
      }
    }

    return Math.min(25, totalLoss); // Cap at 25% loss
  }

  /**
   * Calculate detailed shading losses
   */
  private calculateShadingLosses(
    shading: string[] = [],
    hourlyData: Array<{ hour: number; irradiance: number; temperature: number }>
  ): PerformanceEstimates['shadingLosses'] {
    const baseShadingLoss = this.estimateShadingLosses(shading) / 100;
    const monthlyLosses = new Array(12).fill(0);

    // Apply seasonal variation to shading losses
    for (let month = 0; month < 12; month++) {
      // Shading is more significant in winter (lower sun angle)
      const seasonalFactor = 1 + 0.3 * Math.sin((month - 2) * 2 * Math.PI / 12);
      monthlyLosses[month] = baseShadingLoss * seasonalFactor * 100;
    }

    return {
      monthlyLosses,
      annualLoss: baseShadingLoss * 100,
    };
  }

  /**
   * Calculate temperature effects
   */
  private calculateTemperatureLosses(
    hourlyData: Array<{ hour: number; irradiance: number; temperature: number }>,
    powerTempCoeff: number,
    locationFactors: LocationFactors
  ): PerformanceEstimates['temperatureLosses'] {
    let summerLoss = 0;
    let winterGain = 0;
    let summerHours = 0;
    let winterHours = 0;

    for (const data of hourlyData) {
      if (data.irradiance > 0.1) { // Daylight hours only
        const tempEffect = (powerTempCoeff / 100) * (data.temperature - 25);

        if (data.temperature > 25) {
          summerLoss += tempEffect;
          summerHours++;
        } else {
          winterGain += Math.abs(tempEffect);
          winterHours++;
        }
      }
    }

    const avgSummerLoss = summerHours > 0 ? summerLoss / summerHours : 0;
    const avgWinterGain = winterHours > 0 ? winterGain / winterHours : 0;

    return {
      summerLoss: avgSummerLoss * 100,
      winterGain: avgWinterGain * 100,
      annualLoss: (avgSummerLoss - avgWinterGain) * 100,
    };
  }
}