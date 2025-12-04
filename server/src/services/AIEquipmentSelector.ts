import { prisma } from '../config/db';
import { PVPanel, Inverter, AiPanelIntelligence, AiInverterIntelligence, AiCompatibilityMatrix } from '@prisma/client';

export interface DesignRequirements {
  location: string;
  latitude: number;
  longitude: number;
  climateZone?: string;
  powerTarget: number; // Watts
  budget?: number;
  roofType?: string;
  orientation?: string;
  tilt?: number;
  shading?: string[];
  constraints?: string[];
  priority?: 'cost' | 'efficiency' | 'reliability' | 'space';
}

export interface EquipmentSelection {
  panel: PVPanel & { aiIntelligence?: AiPanelIntelligence };
  inverter: Inverter & { aiIntelligence?: AiInverterIntelligence };
  compatibility: AiCompatibilityMatrix | null;
  configuration: ArrayConfiguration;
  totalCost: number;
  roi: number;
  annualProduction: number;
  co2Offset: number;
}

export interface ArrayConfiguration {
  panelsPerString: number;
  numberOfStrings: number;
  totalPanels: number;
  totalPowerDC: number;
  stringConfiguration: string;
  voltageRange: {
    vocAtMinus10: number;
    vmpAtMinus10: number;
    vmpAt85C: number;
    minVoltage: number;
    maxVoltage: number;
  };
  currentRange: {
    iscAt85C: number;
    impAt85C: number;
    maxCurrent: number;
  };
  powerRatio: number;
  compatible: boolean;
}

export interface LocationFactors {
  solarIrradiance: number; // kWh/m²/year
  temperatureCoefficients: {
    highTemp: number; // Performance factor in hot climates
    lowTemp: number; // Performance factor in cold climates
  };
  climateAdjustments: {
    degradationRate: number;
    soilingLosses: number;
    availability: number;
  };
}

export class AIEquipmentSelector {
  /**
   * Main AI equipment selection algorithm
   */
  async selectOptimalEquipment(requirements: DesignRequirements): Promise<EquipmentSelection> {
    console.log('🤖 Starting AI equipment selection for:', requirements);

    // Step 1: Get location-specific factors
    const locationFactors = this.calculateLocationFactors(requirements);

    // Step 2: Filter and rank panels based on requirements
    const candidatePanels = await this.getCandidatePanels(requirements, locationFactors);

    // Step 3: Filter and rank inverters based on requirements
    const candidateInverters = await this.getCandidateInverters(requirements, locationFactors);

    // Step 4: Find optimal combinations
    const optimalCombination = await this.findOptimalCombination(
      candidatePanels,
      candidateInverters,
      requirements,
      locationFactors
    );

    console.log('✅ AI equipment selection completed');
    return optimalCombination;
  }

  /**
   * Calculate location-specific performance factors
   */
  private calculateLocationFactors(requirements: DesignRequirements): LocationFactors {
    // Base solar irradiance by climate zone
    const climateIrradiance: Record<string, number> = {
      'Cfb': 1230, // Temperate oceanic (France)
      'Csa': 1800, // Hot-summer Mediterranean
      'Cfa': 1600, // Humid subtropical
      'BSk': 2000, // Cold semi-arid
      'BWh': 2300, // Hot desert
      'Dfa': 1400, // Hot-summer humid continental
      'Dfc': 900,  // Subarctic
    };

    // Temperature performance factors based on latitude
    const latitude = requirements.latitude;
    let highTempFactor = 1.0;
    let lowTempFactor = 1.0;

    if (latitude > 45) { // High latitude - cold climate
      highTempFactor = 0.95;
      lowTempFactor = 1.05;
    } else if (latitude < 30) { // Low latitude - hot climate
      highTempFactor = 0.92;
      lowTempFactor = 1.02;
    }

    return {
      solarIrradiance: climateIrradiance[requirements.climateZone || 'Cfb'] || 1200,
      temperatureCoefficients: {
        highTemp: highTempFactor,
        lowTemp: lowTempFactor,
      },
      climateAdjustments: {
        degradationRate: 0.005, // 0.5% per year
        soilingLosses: 0.02, // 2% losses
        availability: 0.98, // 98% availability
      },
    };
  }

  /**
   * Get and rank candidate panels based on requirements
   */
  private async getCandidatePanels(
    requirements: DesignRequirements,
    locationFactors: LocationFactors
  ): Promise<(PVPanel & { aiIntelligence?: AiPanelIntelligence })[]> {
    const panels = await prisma.pVPanel.findMany();

    // Get AI intelligence for panels separately
    const panelIds = panels.map(p => p.id);
    const aiIntelligence = await prisma.aiPanelIntelligence.findMany({
      where: { panelId: { in: panelIds } },
    });

    // Merge AI intelligence with panel data
    const panelsWithAI = panels.map(panel => ({
      ...panel,
      aiIntelligence: aiIntelligence.find(ai => ai.panelId === panel.id),
    }));

    // Score each panel based on requirements
    const scoredPanels = panelsWithAI.map(panel => {
      let score = 0;

      // Efficiency priority
      if (requirements.priority === 'efficiency' && panel.efficiency) {
        score += panel.efficiency * 10;
      }

      // Cost priority
      if (requirements.priority === 'cost' && panel.aiIntelligence) {
        const marketIntelligence = panel.aiIntelligence.marketIntelligence as any;
        if (marketIntelligence?.averagePrice) {
          const pricePerWatt = marketIntelligence.averagePrice / (panel.maxPower || 1);
          score += Math.max(0, 100 - pricePerWatt * 10);
        }
      }

      // Space priority
      if (requirements.priority === 'space' && panel.efficiency) {
        score += panel.efficiency * 15; // Higher weight for space-constrained installations
      }

      // Reliability priority
      if (requirements.priority === 'reliability' && panel.aiIntelligence) {
        score += panel.aiIntelligence.reliabilityScore;
      }

      // Climate-specific scoring
      if (locationFactors.temperatureCoefficients.highTemp < 0.95) {
        // Hot climate - prefer panels with better temperature performance
        const tempPerf = panel.aiIntelligence?.temperaturePerformance as any;
        if (tempPerf?.hotClimatePerformance) {
          score += tempPerf.hotClimatePerformance * 20;
        }
      }

      return { panel, score };
    });

    // Sort by score (descending) and take top candidates
    scoredPanels.sort((a, b) => b.score - a.score);

    return scoredPanels.slice(0, 10).map(item => item.panel);
  }

  /**
   * Get and rank candidate inverters based on requirements
   */
  private async getCandidateInverters(
    requirements: DesignRequirements,
    locationFactors: LocationFactors
  ): Promise<(Inverter & { aiIntelligence?: AiInverterIntelligence })[]> {
    const inverters = await prisma.inverter.findMany();

    // Get AI intelligence for inverters separately
    const inverterIds = inverters.map(i => i.id);
    const aiIntelligence = await prisma.aiInverterIntelligence.findMany({
      where: { inverterId: { in: inverterIds } },
    });

    // Merge AI intelligence with inverter data
    const invertersWithAI = inverters.map(inverter => ({
      ...inverter,
      aiIntelligence: aiIntelligence.find(ai => ai.inverterId === inverter.id),
    }));

    // Score each inverter based on requirements
    const scoredInverters = invertersWithAI.map(inverter => {
      let score = 0;

      // Efficiency priority
      if (requirements.priority === 'efficiency' && inverter.europeanEfficiency) {
        score += inverter.europeanEfficiency;
      }

      // Cost priority
      if (requirements.priority === 'cost' && inverter.aiIntelligence) {
        const marketIntelligence = inverter.aiIntelligence.marketIntelligence as any;
        if (marketIntelligence?.averagePrice) {
          const pricePerWatt = marketIntelligence.averagePrice / (inverter.maxOutputPower || 1);
          score += Math.max(0, 100 - pricePerWatt * 5);
        }
      }

      // Reliability priority
      if (requirements.priority === 'reliability' && inverter.aiIntelligence) {
        score += inverter.aiIntelligence.reliabilityScore;
      }

      // Power matching - prefer inverters close to target power
      const powerDiff = Math.abs((inverter.maxOutputPower || 0) - requirements.powerTarget);
      const powerScore = Math.max(0, 100 - (powerDiff / requirements.powerTarget) * 100);
      score += powerScore * 0.5;

      return { inverter, score };
    });

    // Sort by score (descending) and take top candidates
    scoredInverters.sort((a, b) => b.score - a.score);

    return scoredInverters.slice(0, 10).map(item => item.inverter);
  }

  /**
   * Find optimal panel-inverter combination
   */
  private async findOptimalCombination(
    panels: (PVPanel & { aiIntelligence?: AiPanelIntelligence })[],
    inverters: (Inverter & { aiIntelligence?: AiInverterIntelligence })[],
    requirements: DesignRequirements,
    locationFactors: LocationFactors
  ): Promise<EquipmentSelection> {
    let bestCombination: EquipmentSelection | null = null;
    let bestScore = -Infinity;

    // Evaluate each combination
    for (const panel of panels.slice(0, 5)) { // Limit to top 5 panels for performance
      for (const inverter of inverters.slice(0, 5)) { // Limit to top 5 inverters
        const configuration = this.calculateArrayConfiguration(panel, inverter, requirements);

        if (!configuration.compatible) {
          continue; // Skip incompatible combinations
        }

        // Get compatibility analysis
        const compatibility = await this.getCompatibilityAnalysis(panel.id, inverter.id);

        // Calculate overall score
        const score = this.calculateCombinationScore(
          panel,
          inverter,
          configuration,
          compatibility,
          requirements,
          locationFactors
        );

        if (score > bestScore) {
          bestScore = score;
          bestCombination = {
            panel,
            inverter,
            compatibility,
            configuration,
            totalCost: this.calculateTotalCost(panel, inverter, configuration),
            roi: this.calculateROI(panel, inverter, configuration, locationFactors),
            annualProduction: this.calculateAnnualProduction(configuration, locationFactors),
            co2Offset: this.calculateCO2Offset(configuration, locationFactors),
          };
        }
      }
    }

    if (!bestCombination) {
      throw new Error('No compatible equipment combination found for the given requirements');
    }

    return bestCombination;
  }

  /**
   * Calculate array configuration using UTE 15-712-1 standards
   */
  private calculateArrayConfiguration(
    panel: PVPanel,
    inverter: Inverter,
    requirements: DesignRequirements
  ): ArrayConfiguration {
    // Temperature coefficients
    const betaFactor = (panel.tempCoeffVoc || -0.3) / 100; // %/°C
    const alphaFactor = (panel.tempCoeffIsc || 0.05) / 100; // %/°C

    // Voltage calculations at different temperatures (per UTE 15-712-1)
    const tempEffectCold = -35 * betaFactor; // -10°C - 25°C = -35°C
    const tempEffectHot = 60 * betaFactor; // 85°C - 25°C = 60°C

    const vocAtMinus10 = (panel.openCircuitVoltage || 0) * (1 + tempEffectCold);
    const vmpAtMinus10 = (panel.voltageAtPmax || 0) * (1 + tempEffectCold);
    const vmpAt85C = (panel.voltageAtPmax || 0) * (1 + tempEffectHot);

    // Current calculations at 85°C
    const tempEffectIsc = 60 * alphaFactor;
    const iscAt85C = (panel.shortCircuitCurrent || 0) * (1 + tempEffectIsc);
    const impAt85C = (panel.currentAtPmax || 0) * (1 + tempEffectIsc);

    // Calculate optimal configuration
    const maxPanelsInSeries = Math.floor((inverter.maxDcVoltage || 600) / vocAtMinus10);
    const minPanelsInSeries = Math.ceil((inverter.mpptVoltageRangeMin || 150) / vmpAt85C);
    const maxStringsParallel = Math.floor((inverter.maxShortCircuitCurrent || 25) / iscAt85C);

    // Calculate number of panels needed for target power
    const targetPanels = Math.ceil(requirements.powerTarget / (panel.maxPower || 1));

    // Find optimal configuration
    let bestConfiguration: ArrayConfiguration | null = null;
    let bestPowerRatio = 1.0;

    for (let panelsPerString = minPanelsInSeries; panelsPerString <= maxPanelsInSeries; panelsPerString++) {
      for (let strings = 1; strings <= maxStringsParallel; strings++) {
        const totalPanels = panelsPerString * strings;
        const totalPowerDC = totalPanels * (panel.maxPower || 1);
        const powerRatio = totalPowerDC / (inverter.maxOutputPower || 1);

        // Check if power ratio is within acceptable range (0.9 - 1.3 per UTE 15-712-1)
        if (powerRatio >= 0.9 && powerRatio <= 1.3 && totalPanels >= targetPanels) {
          const config: ArrayConfiguration = {
            panelsPerString,
            numberOfStrings: strings,
            totalPanels,
            totalPowerDC,
            stringConfiguration: `${strings} strings of ${panelsPerString} panels each`,
            voltageRange: {
              vocAtMinus10,
              vmpAtMinus10,
              vmpAt85C,
              minVoltage: vmpAt85C * panelsPerString,
              maxVoltage: vocAtMinus10 * panelsPerString,
            },
            currentRange: {
              iscAt85C,
              impAt85C,
              maxCurrent: iscAt85C * strings,
            },
            powerRatio,
            compatible: true,
          };

          // Prefer configurations closest to 1.1 power ratio
          const optimalRatio = 1.1;
          const ratioDiff = Math.abs(powerRatio - optimalRatio);
          const bestRatioDiff = Math.abs(bestPowerRatio - optimalRatio);

          if (ratioDiff < bestRatioDiff) {
            bestConfiguration = config;
            bestPowerRatio = powerRatio;
          }
        }
      }
    }

    if (!bestConfiguration) {
      // Return incompatible configuration if no valid combination found
      return {
        panelsPerString: 0,
        numberOfStrings: 0,
        totalPanels: 0,
        totalPowerDC: 0,
        stringConfiguration: 'No compatible configuration found',
        voltageRange: { vocAtMinus10, vmpAtMinus10, vmpAt85C, minVoltage: 0, maxVoltage: 0 },
        currentRange: { iscAt85C, impAt85C, maxCurrent: 0 },
        powerRatio: 0,
        compatible: false,
      };
    }

    return bestConfiguration;
  }

  /**
   * Get compatibility analysis from AI database
   */
  private async getCompatibilityAnalysis(panelId: number, inverterId: number): Promise<AiCompatibilityMatrix | null> {
    return await prisma.aiCompatibilityMatrix.findFirst({
      where: {
        panelId,
        inverterId,
      },
    });
  }

  /**
   * Calculate overall combination score
   */
  private calculateCombinationScore(
    panel: PVPanel & { aiIntelligence?: AiPanelIntelligence },
    inverter: Inverter & { aiIntelligence?: AiInverterIntelligence },
    configuration: ArrayConfiguration,
    compatibility: AiCompatibilityMatrix | null,
    requirements: DesignRequirements,
    locationFactors: LocationFactors
  ): number {
    let score = 0;

    // Power matching score (30% weight)
    const optimalPowerRatio = 1.1;
    const powerRatioScore = Math.max(0, 100 - Math.abs(configuration.powerRatio - optimalPowerRatio) * 50);
    score += powerRatioScore * 0.3;

    // Compatibility score (25% weight)
    const compatibilityScore = compatibility ? Number(compatibility.overallScore) : 85; // Default if no AI analysis
    score += compatibilityScore * 0.25;

    // Equipment quality scores (20% weight)
    const panelQuality = panel.aiIntelligence?.reliabilityScore || 90;
    const inverterQuality = inverter.aiIntelligence?.reliabilityScore || 90;
    const qualityScore = (panelQuality + inverterQuality) / 2;
    score += qualityScore * 0.2;

    // Priority-specific scoring (15% weight)
    let priorityScore = 50; // Base score
    if (requirements.priority === 'efficiency') {
      priorityScore = panel.efficiency ? panel.efficiency * 4 : 50;
    } else if (requirements.priority === 'cost') {
      // Lower cost per watt = higher score
      const panelCost = (panel.aiIntelligence?.marketIntelligence as any)?.averagePrice || 200;
      const inverterCost = (inverter.aiIntelligence?.marketIntelligence as any)?.averagePrice || 1000;
      const costPerWatt = (panelCost + inverterCost) / configuration.totalPowerDC;
      priorityScore = Math.max(0, 100 - costPerWatt * 5);
    } else if (requirements.priority === 'space') {
      priorityScore = panel.efficiency ? panel.efficiency * 5 : 50;
    } else if (requirements.priority === 'reliability') {
      priorityScore = qualityScore;
    }
    score += priorityScore * 0.15;

    // Location-specific adjustments (10% weight)
    let locationScore = 50;
    if (locationFactors.temperatureCoefficients.highTemp < 0.95) {
      // Hot climate bonus
      const tempPerf = panel.aiIntelligence?.temperaturePerformance as any;
      locationScore = tempPerf?.hotClimatePerformance ? tempPerf.hotClimatePerformance * 50 : 50;
    }
    score += locationScore * 0.1;

    return score;
  }

  /**
   * Calculate total system cost
   */
  private calculateTotalCost(
    panel: PVPanel & { aiIntelligence?: AiPanelIntelligence },
    inverter: Inverter & { aiIntelligence?: AiInverterIntelligence },
    configuration: ArrayConfiguration
  ): number {
    const panelCost = (panel.aiIntelligence?.marketIntelligence as any)?.averagePrice || 200;
    const inverterCost = (inverter.aiIntelligence?.marketIntelligence as any)?.averagePrice || 1000;

    const equipmentCost = (panelCost * configuration.totalPanels) + inverterCost;
    const installationCost = equipmentCost * 0.25; // 25% installation cost
    const balanceOfSystemCost = equipmentCost * 0.15; // 15% BOS cost

    return equipmentCost + installationCost + balanceOfSystemCost;
  }

  /**
   * Calculate Return on Investment
   */
  private calculateROI(
    panel: PVPanel & { aiIntelligence?: AiPanelIntelligence },
    inverter: Inverter & { aiIntelligence?: AiInverterIntelligence },
    configuration: ArrayConfiguration,
    locationFactors: LocationFactors
  ): number {
    const totalCost = this.calculateTotalCost(panel, inverter, configuration);
    const annualProduction = this.calculateAnnualProduction(configuration, locationFactors);

    // Assume average electricity price of €0.25/kWh
    const annualRevenue = annualProduction * 0.25;
    const simplePaybackYears = totalCost / annualRevenue;

    // ROI as percentage over 25 years (system lifetime)
    const totalRevenue = annualRevenue * 25;
    const roi = ((totalRevenue - totalCost) / totalCost) * 100;

    return roi;
  }

  /**
   * Calculate annual energy production
   */
  private calculateAnnualProduction(
    configuration: ArrayConfiguration,
    locationFactors: LocationFactors
  ): number {
    // Base production calculation
    const systemEfficiency = 0.85; // 85% system efficiency (inverter + losses)
    const performanceRatio = 0.82; // 82% performance ratio

    const annualProduction =
      configuration.totalPowerDC *
      locationFactors.solarIrradiance *
      systemEfficiency *
      performanceRatio *
      locationFactors.climateAdjustments.availability *
      (1 - locationFactors.climateAdjustments.soilingLosses);

    return annualProduction / 1000; // Convert to kWh
  }

  /**
   * Calculate CO2 offset in tons per year
   */
  private calculateCO2Offset(
    configuration: ArrayConfiguration,
    locationFactors: LocationFactors
  ): number {
    const annualProduction = this.calculateAnnualProduction(configuration, locationFactors);

    // Grid emission factor: average 0.5 kg CO2/kWh for Europe
    const emissionFactor = 0.5; // kg CO2/kWh

    return (annualProduction * emissionFactor) / 1000; // Convert to tons
  }
}