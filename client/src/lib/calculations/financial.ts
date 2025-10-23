/**
 * Pure Financial Calculations
 * Mathematical functions for solar PV financial analysis
 * No UI dependencies, pure functions only
 */

import type { FinancialInputs, FinancialCalculationResult } from './types';

/**
 * Calculate financial metrics for solar PV system
 */
export function calculateFinancialMetrics(inputs: FinancialInputs): FinancialCalculationResult {
  const {
    systemCost,
    installationCost,
    electricityRate,
    systemSize,
    annualProduction,
    discountRate,
    projectLifetime,
    maintenanceCost
  } = inputs;

  // Calculate total system cost
  const totalSystemCost = systemCost * systemSize * 1000; // Convert kW to W
  const totalInstallationCost = installationCost * systemSize * 1000;
  const totalCost = totalSystemCost + totalInstallationCost;

  // Calculate annual savings from electricity generation
  const annualSavings = annualProduction * electricityRate;

  // Calculate annual maintenance cost
  const annualMaintenanceCost = totalCost * (maintenanceCost / 100);

  // Calculate net annual cash flow
  const netAnnualCashFlow = annualSavings - annualMaintenanceCost;

  // Calculate payback period (handle zero or negative cash flow)
  const paybackPeriod = netAnnualCashFlow <= 0 ? Infinity : totalCost / netAnnualCashFlow;

  // Calculate ROI (simple return on investment)
  const roi = (netAnnualCashFlow * projectLifetime / totalCost) * 100;

  // Calculate Net Present Value (NPV)
  const npv = calculateNPV(netAnnualCashFlow, discountRate, projectLifetime, totalCost);

  // Calculate Internal Rate of Return (IRR)
  const irr = calculateIRR(netAnnualCashFlow, projectLifetime, totalCost);

  // Calculate Levelized Cost of Energy (LCOE)
  const lcoe = calculateLCOE(totalCost, annualProduction, discountRate, projectLifetime, maintenanceCost);

  return {
    systemCost: totalSystemCost,
    installationCost: totalInstallationCost,
    totalCost,
    paybackPeriod,
    roi,
    npv,
    irr,
    lcoe
  };
}

/**
 * Calculate Net Present Value (NPV)
 */
function calculateNPV(
  annualCashFlow: number,
  discountRate: number,
  years: number,
  initialInvestment: number
): number {
  let npv = -initialInvestment;
  const discountFactor = discountRate / 100;

  for (let year = 1; year <= years; year++) {
    npv += annualCashFlow / Math.pow(1 + discountFactor, year);
  }

  return npv;
}

/**
 * Calculate Internal Rate of Return (IRR)
 * Using Newton-Raphson method for approximation
 */
function calculateIRR(
  annualCashFlow: number,
  years: number,
  initialInvestment: number,
  precision: number = 0.0001,
  maxIterations: number = 100
): number {
  let rate = 0.1; // Initial guess (10%)
  let iteration = 0;

  while (iteration < maxIterations) {
    const npvAtRate = calculateNPV(annualCashFlow, rate * 100, years, initialInvestment);

    if (Math.abs(npvAtRate) < precision) {
      return rate * 100; // Return as percentage
    }

    // Calculate derivative using finite difference
    const h = 0.001;
    const npvAtRatePlusH = calculateNPV(annualCashFlow, (rate + h) * 100, years, initialInvestment);
    const derivative = (npvAtRatePlusH - npvAtRate) / h;

    if (Math.abs(derivative) < precision) {
      break; // Avoid division by very small numbers
    }

    // Newton-Raphson update
    rate = rate - npvAtRate / derivative;

    // Ensure rate stays reasonable
    if (rate < 0) rate = 0.01;
    if (rate > 1) rate = 0.99;

    iteration++;
  }

  return rate * 100; // Return as percentage
}

/**
 * Calculate Levelized Cost of Energy (LCOE)
 */
function calculateLCOE(
  totalCost: number,
  annualProduction: number,
  discountRate: number,
  projectLifetime: number,
  maintenanceCostPercent: number
): number {
  const annualMaintenanceCost = totalCost * (maintenanceCostPercent / 100);
  const discountFactor = discountRate / 100;

  // Calculate present value of costs
  let presentValueOfCosts = totalCost;
  for (let year = 1; year <= projectLifetime; year++) {
    presentValueOfCosts += annualMaintenanceCost / Math.pow(1 + discountFactor, year);
  }

  // Calculate present value of energy production
  let presentValueOfEnergy = 0;
  for (let year = 1; year <= projectLifetime; year++) {
    presentValueOfEnergy += annualProduction / Math.pow(1 + discountFactor, year);
  }

  return presentValueOfCosts / presentValueOfEnergy; // $/kWh
}

/**
 * Calculate simple payback period (without considering discount rate)
 */
export function calculateSimplePaybackPeriod(
  totalCost: number,
  annualSavings: number,
  annualMaintenanceCost: number
): number {
  const netAnnualSavings = annualSavings - annualMaintenanceCost;
  return totalCost / netAnnualSavings;
}

/**
 * Calculate discounted payback period (considering discount rate)
 */
export function calculateDiscountedPaybackPeriod(
  totalCost: number,
  annualSavings: number,
  annualMaintenanceCost: number,
  discountRate: number
): number {
  const netAnnualCashFlow = annualSavings - annualMaintenanceCost;
  const discountFactor = discountRate / 100;
  let cumulativePresentValue = 0;

  for (let year = 1; year <= 30; year++) { // Maximum 30 years
    const presentValue = netAnnualCashFlow / Math.pow(1 + discountFactor, year);
    cumulativePresentValue += presentValue;

    if (cumulativePresentValue >= totalCost) {
      // Linear interpolation for more accurate payback period
      const previousYearValue = cumulativePresentValue - presentValue;
      const remainingCost = totalCost - previousYearValue;
      const fractionOfYear = remainingCost / presentValue;
      return year - 1 + fractionOfYear;
    }
  }

  return Infinity; // Never pays back within 30 years
}

/**
 * Calculate 25-year lifetime production and savings
 */
export function calculateLifetimeMetrics(
  initialAnnualProduction: number,
  degradationRate: number,
  electricityRateEscalation: number,
  projectLifetime: number = 25
): {
  totalProduction: number;
  totalSavings: number;
  productionByYear: number[];
  savingsByYear: number[];
} {
  const productionByYear: number[] = [];
  const savingsByYear: number[] = [];
  let totalProduction = 0;
  let totalSavings = 0;

  for (let year = 1; year <= projectLifetime; year++) {
    // Apply degradation rate
    const yearProduction = initialAnnualProduction * Math.pow(1 - degradationRate / 100, year - 1);
    productionByYear.push(yearProduction);

    // Apply electricity rate escalation
    const yearElectricityRate = 0.10 * Math.pow(1 + electricityRateEscalation / 100, year - 1); // Assuming base rate of $0.10/kWh
    const yearSavings = yearProduction * yearElectricityRate;
    savingsByYear.push(yearSavings);

    totalProduction += yearProduction;
    totalSavings += yearSavings;
  }

  return {
    totalProduction,
    totalSavings,
    productionByYear,
    savingsByYear
  };
}

/**
 * Calculate CO2 savings based on production
 */
export function calculateCO2Savings(
  annualProduction: number,
  gridEmissionFactor: number = 0.5 // kg CO2/kWh (typical mixed grid average)
): number {
  return annualProduction * gridEmissionFactor;
}

/**
 * Calculate equivalent trees planted
 */
export function calculateEquivalentTrees(
  co2Savings: number,
  co2PerTree: number = 22 // kg CO2/year per mature tree
): number {
  return co2Savings / co2PerTree;
}

/**
 * Calculate equivalent car emissions reduced
 */
export function calculateEquivalentCars(
  co2Savings: number,
  co2PerCar: number = 4600 // kg CO2/year per average car
): number {
  return co2Savings / co2PerCar;
}