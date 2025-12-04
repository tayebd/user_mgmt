/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import type { PVProject, PVPanel, Inverter } from '@/shared/types';
import type { ArrayConfig, ProtectionCalc, CableSizing, ReportContext, ProjectSpecs } from '../calculations/reportTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'


import { pvProject_mockData } from '../calculations/mockData';
// import { arrayConfigurationTemplate, cableSizingTemplate, 
//          calculationsTemplate, equipmentTemplate, 
//          protectionTemplate } from '../calculations/testTemplate';
import { arrayConfigurationTemplate, cableSizingTemplate, 
           equipmentTemplate, 
           protectionTemplate } from '../calculations/templates';

import { calculateArrayConfiguration, calculateProtectionDevices, 
    calculateDCCableSizing, calculateACCableSizing, PVCONSTANTS as constants } from '../calculations/ArrayCalculatorUtils';

// Helper function to interpolate values in our templates
function interpolateTemplate<T extends Record<string, unknown>>(template: string, context: T): string {
  if (typeof template !== 'string') return '';
  
  // Replace {{variable}} with actual values from the context
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value: unknown = context;
    
    for (const key of keys) {
      if (value === undefined || value === null) return '';
      if (typeof value !== 'object' && typeof value !== 'function') return '';
      
      // Check if the key exists in the value
      if (value && typeof value === 'object' && key in value) {
        const nextValue = (value as Record<string, unknown>)[key];
        if (nextValue === undefined || nextValue === null) return '';
        value = nextValue;
      } else {
        return '';
      }
    }
    
    if (value === undefined || value === null) return '';
    try {
      if (typeof value === 'object' && value !== null && 'toString' in value && typeof value.toString === 'function') {
        return value.toString();
      }
      return String(value);
    } catch {
      return '';
    }
  });
}
  
// Component for rendering individual sections
interface SectionProps {
  template: string;
  context: PVProject;
}
  
const Section: React.FC<SectionProps> = ({ template, context }) => {
  const markdownContent = interpolateTemplate(template, context);
  
  return (
    <ReactMarkdown
      remarkPlugins={[]}
      rehypePlugins={[]}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};
  
import { StepProps } from './types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export function ReportStep1({ form, pvProject, setPVProject, simulationResults, isSimulating }: StepProps) {

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real application, you would fetch data from your API or use passed data
    if (pvProject) {
      setLoading(false);
    } else {
      // Mock data for demonstration purposes
      // In a real application, this would come from your database
      setPVProject?.(pvProject_mockData);
      setLoading(false);
    }
  }, [pvProject, setPVProject]);

  if (loading) {
    return <div>Loading report data...</div>;
  }

  if (isSimulating) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg font-medium">Running simulation...</p>
        <p className="text-sm text-gray-600 mt-2">This may take a few moments</p>
      </div>
    );
  }
  
  if (!pvProject) {
    return <div>Error loading report data</div>;
  }
  
  // Get first panel and inverter
  const panel = {
    ...pvProject.panels[0],
    maxPower: pvProject.panels[0].power,
    tempCoeffVoc: pvProject.panels[0].tempCoeffVoc || -0.25,
    tempCoeffIsc: pvProject.panels[0].tempCoeffIsc || 0.05
  };
  if (!panel) {
    return <div>Error: No panel data found</div>;
  }

  const inverter = pvProject.inverters[0];
  if (!inverter) {
    return <div>Error: No inverter data found</div>;
  }

  // Calculate total number of panels from arrays
  const numPanels = pvProject.arrays.reduce((total, arr) => total + (arr.quantity || 0), 0);

  // Calculate number of inverters from project data
  const numberOfInverters = pvProject.numberInverters || pvProject.inverters?.length || 1;

  // Calculate array configuration
  const array = calculateArrayConfiguration(panel, inverter, numPanels);
  
  // Calculate protection devices
  const protection = calculateProtectionDevices(panel, array);
  
  // Calculate cable sizing
  const defaultWire = {
    Iz: 43,
    section: 4,
    length: 10,
    maker: 'Default',
    type: 'DC',
    description: 'Default cable',
    price: 0,
    acFlag: false
  };

  const dc_cable_sizing = calculateDCCableSizing(
    pvProject.wires?.find(w => !w.acFlag) || defaultWire,
    panel
  );
  const ac1_cable_sizing = calculateACCableSizing(
    pvProject.wires?.find(w => w.acFlag) || {...defaultWire, type: 'AC', acFlag: true},
    inverter
  );
  const ac2_cable_sizing = calculateACCableSizing(
    {...defaultWire, type: 'AC', acFlag: true, length: 5, section: 6},
    inverter
  );

  // Create comprehensive project specs
  const project = {
    arrayPowerkW: Math.round((panel.power * numPanels) / 1000 * 10) / 10,
    customer: pvProject.name || 'Default Customer',
    latitude: pvProject.latitude || 0,
    longitude: pvProject.longitude || 0,
    numberPanels: numPanels,
    numberInverters: numberOfInverters,
    reference: `PV-${pvProject.id || 1000}-${Date.now()}`,
    dcCableLength: pvProject.wires?.find(w => !w.acFlag)?.length || 10,
    acCableLength_1: pvProject.wires?.find(w => w.acFlag)?.length || 10,
    acCableLength_2: 5,
    certifications: {
      panel: {
        standards: ['IEC 61215', 'IEC 61730', 'UL 1703'],
        warranty: {
          product: panel.productWarranty || '25',
          performance: panel.performanceWarranty || '25',
          type: 'Power output'
        }
      }
    }
  } as ProjectSpecs;

  // Create protection device data with realistic specs
  const dc_protection = {
    fuse: {
      maker: 'Littelfuse',
      ref_type: 'PV10-16',
      Vn: 1000,
      In: 16
    },
    lightning: {
      maker: 'Citel',
      ref_type: 'DS150PV-1000',
      Ucpv: 1000,
      Up: 2.5,
      In: 20,
      InUnit: 'kA',
      Iscpv: 25,
      IscpvUnit: 'kA'
    },
    switch: {
      maker: 'SMA',
      ref_type: 'Sunny-Boy-Switch',
      Usec: 1000,
      Isec: 32
    }
  };

  const ac_protection = {
    fuse: {
      maker: 'Schneider Electric',
      ref_type: 'Acti9 C60N',
      Vn: 240,
      In: 32,
      sensitivity: '30mA'
    },
    lightning: {
      maker: 'Citel',
      ref_type: 'DS240R',
      Uc: 255,
      Up: 1.5,
      In: 20,
      InUnit: 'kA',
      Isc: 25,
      IscUnit: 'kA'
    },
    switch: {
      maker: 'Schneider Electric',
      ref_type: 'Acti9 iC60',
      Usec: 240,
      Isec: 40
    }
  };

  // Add missing inverter properties
  const enhancedInverter = {
    ...inverter,
    maxInputCurrentPerMppt: inverter.maxInputCurrent || 20,
    numberOfMpptTrackers: inverter.mpptChannels || 2,
    maxShortCircuitCurrent: inverter.maxShortCircuitCurrent || 45,
    maxDcVoltage: inverter.maxInputVoltage || 480,
    mpptVoltageRangeMin: inverter.minInputVoltage || 150,
    mpptVoltageRangeMax: inverter.maxInputVoltage || 480,
    mpptRange: `${inverter.minInputVoltage}-${inverter.maxInputVoltage}V`,
    maxApparentPower: Math.round((inverter.maxOutputPower / 0.8) / 100) / 100
  };

  // Get cable data and ensure maker field is populated
  const found_dc_cable = pvProject.wires?.find(w => !w.acFlag);
  const dc_cable = {
    ...found_dc_cable,
    maker: found_dc_cable?.maker || 'Southwire',
    type: 'DC',
    acFlag: false
  } || defaultWire;

  const found_ac_cable = pvProject.wires?.find(w => w.acFlag);
  const ac_cable = {
    ...found_ac_cable,
    maker: found_ac_cable?.maker || 'General Cable',
    type: 'AC',
    acFlag: true
  } || {...defaultWire, maker: 'General Cable', type: 'AC', acFlag: true};

  // Create circuit breaker and other components
  const circuit_breaker = {
    maker: 'Schneider Electric',
    model: 'Acti9 C60N 32A'
  };

  const ground_cable = {
    maker: 'Southwire',
    section: '16 mm²'
  };

  const connector = {
    mc4: {
      maker: 'Multi-Contact',
      model: 'MC4-EVO2'
    }
  };

  const distributor = {
    maker: 'Bachmann',
    model: 'PV-JBox'
  };

  const cable_tray = {
    maker: 'Eaton',
    model: 'B-Line Series'
  };

  // Add cable installation data for templates
  const cable_installation_data = {
    dc_cable: {
      installationMethod: 'Câbles sur chemin de câbles exposé au soleil',
      referenceMethod: 'Méthode de référence F',
      circuitGrouping: 'Facteur de correction K2 = 0,94 (groupement de 2 circuits)',
      layerFactors: 'Facteur K4 = 0,41 (exposé au soleil - 80°C)',
      temperatureFactors: 'Facteur K3 = 0,80 (température ambiante 80°C)',
      numberLayers: '1 seule couche',
      soilResistivity: 'Non applicable (câbles aériens)',
      voltage: panel.voltageAtPmax || 61.8
    },
    ac_cable: {
      installationMethod: 'Câbles sur chemin de câbles non exposé au soleil',
      referenceMethod: 'Méthode de référence F',
      circuitGrouping: 'Facteur de correction K2 = 0,94 (groupement de 2 circuits)',
      layerFactors: 'Facteur K4 = 0,82 (non exposé - 50°C)',
      temperatureFactors: 'Facteur K3 = 0,80 (température ambiante 50°C)',
      numberLayers: '1 seule couche',
      soilResistivity: 'Non applicable (câbles aériens)',
      voltage: inverter.outputVoltage || 240
    }
  };

  // Create complete ReportContext
  const reportContext = {
    project,
    panel,
    inverter: enhancedInverter,
    dc_protection,
    ac_protection,
    dc_cable: { ...dc_cable, ...cable_installation_data.dc_cable },
    ac_cable: { ...ac_cable, ...cable_installation_data.ac_cable },
    array,
    protection,
    dc_cable_sizing,
    ac1_cable_sizing,
    ac2_cable_sizing,
    circuit_breaker,
    ground_cable,
    connector,
    distributor,
    cable_tray,
    constants
  };

  // Generate the complete report by concatenating all sections
  const fullReport = `${interpolateTemplate(equipmentTemplate, reportContext)}

${interpolateTemplate(arrayConfigurationTemplate, reportContext)}

${interpolateTemplate(protectionTemplate, reportContext)}

${interpolateTemplate(cableSizingTemplate, reportContext)}

`;
  
  // Process power data for charts
  const processHourlyData = (powerData: number[]) => {
    // Group hourly data into daily totals
    const dailyData = [];
    for (let day = 0; day < Math.floor(powerData.length / 24); day++) {
      const dayStart = day * 24;
      const dayEnd = Math.min(dayStart + 24, powerData.length);
      const dayHours = powerData.slice(dayStart, dayEnd);
      const dailyEnergy = dayHours.reduce((sum, power) => sum + power, 0) / 1000; // Convert to kWh
      const peakPower = Math.max(...dayHours);

      dailyData.push({
        day: day + 1,
        date: `Day ${day + 1}`,
        energy: parseFloat(dailyEnergy.toFixed(2)),
        peakPower: parseFloat(peakPower.toFixed(1)),
        avgPower: parseFloat((dailyEnergy * 1000 / 24).toFixed(1))
      });
    }
    return dailyData;
  };

  const processMonthlyData = (powerData: number[]) => {
    // Group data into monthly totals (assuming 8760 hours = 365 days)
    const monthlyData = [];
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let currentDay = 0;
    for (let month = 0; month < 12; month++) {
      const daysInMonth = daysPerMonth[month];
      let monthlyEnergy = 0;
      let monthlyPeak = 0;

      for (let day = 0; day < daysInMonth && currentDay * 24 < powerData.length; day++) {
        const dayStart = currentDay * 24;
        const dayEnd = Math.min(dayStart + 24, powerData.length);
        const dayHours = powerData.slice(dayStart, dayEnd);

        monthlyEnergy += dayHours.reduce((sum, power) => sum + power, 0);
        monthlyPeak = Math.max(monthlyPeak, ...dayHours);
        currentDay++;
      }

      monthlyData.push({
        month: monthNames[month],
        energy: parseFloat((monthlyEnergy / 1000).toFixed(1)), // Convert to kWh
        peakPower: parseFloat(monthlyPeak.toFixed(1)),
        avgPower: parseFloat(((monthlyEnergy / 1000) / daysInMonth).toFixed(1)) // Daily average
      });
    }
    return monthlyData;
  };

  // Daily Production Chart Component
  const renderDailyProductionChart = (powerData: number[]) => {
    const dailyData = processHourlyData(powerData);

    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <h4 className="font-semibold text-gray-800 mb-3">Daily Energy Production</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: unknown, name: string) => [
                `${value} kWh`,
                name === 'energy' ? 'Daily Energy' : name
              ]}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            />
            <Area
              type="monotone"
              dataKey="energy"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorEnergy)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 text-sm text-gray-600 text-center">
          Daily energy production in kilowatt-hours
        </div>
      </div>
    );
  };

  // Monthly Production Chart Component
  const renderMonthlyProductionChart = (powerData: number[]) => {
    const monthlyData = processMonthlyData(powerData);

    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <h4 className="font-semibold text-gray-800 mb-3">Monthly Energy Production</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: unknown, name: string) => [
                `${value} kWh`,
                name === 'energy' ? 'Monthly Energy' : name
              ]}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            />
            <Bar
              dataKey="energy"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-sm text-gray-600 text-center">
          Monthly energy production in kilowatt-hours
        </div>
      </div>
    );
  };

  // Power Output Profile Chart
  const renderPowerProfileChart = (powerData: number[]) => {
    // Sample every 24th hour to show daily pattern over a year
    const sampledData = [];
    for (let hour = 0; hour < powerData.length; hour += 24) {
      if (hour < powerData.length) {
        sampledData.push({
          hour: Math.floor(hour / 24) + 1,
          power: parseFloat(powerData[hour].toFixed(1))
        });
      }
    }

    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <h4 className="font-semibold text-gray-800 mb-3">Daily Power Profile (Sample)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={sampledData.slice(0, 365)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="hour"
              label={{ value: 'Day of Year', position: 'insideBottom', offset: -5 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: unknown) => [`${value} W`, 'Power Output']}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
            />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 text-sm text-gray-600 text-center">
          Daily power output pattern over the year (sampled at noon each day)
        </div>
      </div>
    );
  };

  // Helper function to process monthly energy data
  const processMonthlyEnergyData = (monthlyEnergy: Record<string, number> | undefined) => {
    if (!monthlyEnergy) return [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.entries(monthlyEnergy).map(([month, energy], index) => ({
      month: monthNames[parseInt(month) - 1] || month,
      energy: parseFloat(energy.toFixed(1)),
      monthNumber: parseInt(month)
    }));
  };

  // Helper function to process daily energy data
  const processDailyEnergyData = (dailyEnergy: Record<string, number> | undefined) => {
    if (!dailyEnergy) return [];

    return Object.entries(dailyEnergy).map(([day, energy]) => ({
      day: parseInt(day),
      date: `Day ${day}`,
      energy: parseFloat(energy.toFixed(1))
    }));
  };

  // Render comprehensive simulation results with new data structure
  const renderEnhancedSimulationResults = () => {
    const {
      success,
      timestamp,
      annual_energy,
      capacity_factor,
      peak_power,
      performance_ratio,
      monthly_energy,
      daily_energy,
      error_message
    } = simulationResults as any;

    // Calculate additional metrics
    const capacityFactorPercent = (capacity_factor || 0) * 100;
    const totalDailyEnergy = daily_energy
      ? (Object.values(daily_energy) as number[]).reduce((sum: number, val: number) => sum + val, 0)
      : 0;

    // Get best and worst performing months
    const monthlyData = processMonthlyEnergyData(monthly_energy);
    const bestMonth = monthlyData.reduce((best, month) =>
      month.energy > (best?.energy || 0) ? month : best, monthlyData[0]
    );
    const worstMonth = monthlyData.reduce((worst, month) =>
      month.energy < (worst?.energy || Infinity) ? month : worst, monthlyData[0]
    );

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Solar Simulation Results</h3>

        {/* Location Information */}
        <div className="bg-white rounded-lg p-4 shadow mb-6 border-l-4 border-blue-500">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            Simulation Location
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Project Name</div>
              <div className="font-semibold text-gray-900">{pvProject?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Address</div>
              <div className="font-semibold text-gray-900">{pvProject?.address || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Latitude</div>
              <div className="font-medium text-gray-700">{pvProject?.latitude?.toFixed(4) || 'N/A'}°</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Longitude</div>
              <div className="font-medium text-gray-700">{pvProject?.longitude?.toFixed(4) || 'N/A'}°</div>
            </div>
            {pvProject?.elevation && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Elevation</div>
                <div className="font-medium text-gray-700">{pvProject.elevation}m</div>
              </div>
            )}
            {pvProject?.timezone && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Timezone</div>
                <div className="font-medium text-gray-700">{pvProject.timezone}</div>
              </div>
            )}
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Annual Energy</div>
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {(annual_energy || 0).toFixed(1)} kWh
            </div>
            <div className="text-xs text-gray-500 mt-1">Total annual production</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Capacity Factor</div>
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {capacityFactorPercent.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">System utilization</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Peak Power</div>
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {(peak_power || 0).toFixed(0)} W
            </div>
            <div className="text-xs text-gray-500 mt-1">Maximum output</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Performance Ratio</div>
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {(performance_ratio || 0).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Efficiency ratio</div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            Production Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded p-3">
              <div className="text-gray-600 mb-1">Best Month</div>
              <div className="font-semibold text-green-600">{bestMonth?.month || 'N/A'}</div>
              <div className="text-xs text-gray-500">{(bestMonth?.energy || 0).toFixed(1)} kWh</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-gray-600 mb-1">Worst Month</div>
              <div className="font-semibold text-orange-600">{worstMonth?.month || 'N/A'}</div>
              <div className="text-xs text-gray-500">{(worstMonth?.energy || 0).toFixed(1)} kWh</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-gray-600 mb-1">Daily Average</div>
              <div className="font-semibold text-blue-600">
                {daily_energy ? (totalDailyEnergy / Object.keys(daily_energy).length).toFixed(1) : '0'} kWh
              </div>
              <div className="text-xs text-gray-500">Per day average</div>
            </div>
          </div>
        </div>

        {/* Production Charts */}
        {monthly_energy && (
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              Monthly Production
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: unknown) => [`${value} kWh`, 'Monthly Energy']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
                <Bar
                  dataKey="energy"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-sm text-gray-600 text-center">
              Monthly energy production distribution
            </div>
          </div>
        )}

        {daily_energy && (
          <div className="bg-white rounded-lg p-4 shadow mt-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
              </svg>
              Daily Production (Year View)
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={processDailyEnergyData(daily_energy)}>
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  label={{ value: 'Day of Year', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 10 }}
                  interval={29} // Show every 30th day
                />
                <YAxis
                  label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: unknown) => [`${value} kWh`, 'Daily Energy']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorDaily)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 text-sm text-gray-600 text-center">
              Daily energy production throughout the year
            </div>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Simulation completed on {new Date(timestamp).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  // Simulation Results Section
  const renderSimulationResults = () => {
    console.log('renderSimulationResults called with:', {
      simulationResults,
      hasResults: !!simulationResults,
      success: simulationResults?.success,
      hasPowerOutput: !!(simulationResults as any)?.powerOutput,
      powerOutputLength: (simulationResults as any)?.powerOutput?.length
    });

    if (!simulationResults) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Simulation Not Run</h3>
          <p className="text-yellow-700">Click &quot;Generate Simulation&quot; to run the production simulation and see results here.</p>
        </div>
      );
    }

    if (!simulationResults.success) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Simulation Failed</h3>
          <p className="text-red-700">{simulationResults.message || 'An unknown error occurred during simulation.'}</p>
        </div>
      );
    }

    // Handle new data structure with annual_energy, monthly_energy, daily_energy
    if ((simulationResults as any).annual_energy !== undefined || (simulationResults as any).monthly_energy) {
      return renderEnhancedSimulationResults();
    }

    // Handle basic power output data from API (legacy format)
    if ((simulationResults as any).powerOutput && Array.isArray((simulationResults as any).powerOutput)) {
      const powerData = (simulationResults as any).powerOutput;
      const totalHours = powerData.length;
      const totalEnergy = powerData.reduce((sum: number, power: number) => sum + power, 0);
      const averagePower = totalEnergy / totalHours;
      const peakPower = Math.max(...powerData);
      const energyProduced = totalEnergy / 1000; // Convert to kWh
      const productionDays = Math.floor(totalHours / 24);

      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Simulation Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Total Energy</div>
              <div className="text-2xl font-bold text-green-600">
                {energyProduced.toFixed(1)} kWh
              </div>
              <div className="text-xs text-gray-500">{productionDays} days production</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Average Power</div>
              <div className="text-2xl font-bold text-blue-600">
                {averagePower.toFixed(1)} W
              </div>
              <div className="text-xs text-gray-500">Mean output</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Peak Power</div>
              <div className="text-2xl font-bold text-orange-600">
                {peakPower.toFixed(0)} W
              </div>
              <div className="text-xs text-gray-500">Maximum output</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600 mb-1">Production Hours</div>
              <div className="text-2xl font-bold text-purple-600">
                {totalHours}
              </div>
              <div className="text-xs text-gray-500">Simulated hours</div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-semibold text-gray-800 mb-3">Power Production Analysis</h4>
            <div className="text-sm text-gray-700 mb-4">
              <p>System simulation completed for {totalHours} hours with detailed power output data.</p>
              <p className="mt-2">The system generated {energyProduced.toFixed(1)} kWh of energy with an average output of {averagePower.toFixed(1)}W.</p>
              <p className="mt-2">Peak production reached {peakPower.toFixed(0)}W during optimal conditions.</p>
            </div>

            {/* Production Charts */}
            <div className="mt-6 space-y-6">
              <h5 className="font-medium text-gray-800 mb-4">Production Analysis Charts</h5>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Production Chart */}
                {renderDailyProductionChart(powerData)}

                {/* Monthly Production Chart */}
                {renderMonthlyProductionChart(powerData)}
              </div>

              {/* Power Profile Chart */}
              <div className="grid grid-cols-1">
                {renderPowerProfileChart(powerData)}
              </div>
            </div>

            {/* Sample of hourly data */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-800 mb-2">Sample Hourly Data (First 24 hours)</h5>
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1 text-xs">
                  {powerData.slice(0, 24).map((power: number, hour: number) => (
                    <div key={hour} className="text-center">
                      <div className="bg-gray-100 rounded p-1">
                        <div className="font-medium">H{hour}</div>
                        <div>{power.toFixed(0)}W</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback for other data structures
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Simulation Results</h3>
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-gray-800 mb-2">Simulation Completed Successfully</h4>
          <div className="text-sm text-gray-700">
            <p>The simulation completed successfully, but the results format is not yet supported for display.</p>
            <p className="mt-2">Raw data:</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(simulationResults, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  // System Summary Component
  const renderSystemSummary = () => {
    if (!pvProject || !pvProject.panels || !pvProject.inverters || !pvProject.arrays) {
      return null;
    }

    const panel = pvProject.panels[0];
    const inverter = pvProject.inverters[0];
    const array = pvProject.arrays[0];

    if (!panel || !inverter || !array) {
      return null;
    }

    const totalPanels = array.quantity || 0;
    const totalSystemPower = panel.power * totalPanels;
    const numberOfInverters = pvProject.numberInverters || pvProject.inverters?.length || 1;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">System Configuration Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Panel Information */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              PV Panel Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{panel.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="font-medium">{panel.maker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Power Rating:</span>
                <span className="font-medium">{panel.power} W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Voltage (Vmp):</span>
                <span className="font-medium">{panel.voltageAtPmax} V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current (Imp):</span>
                <span className="font-medium">{panel.currentAtPmax} A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efficiency:</span>
                <span className="font-medium">{panel.efficiency}%</span>
              </div>
            </div>
          </div>

          {/* Array Information */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
                </svg>
              </div>
              Array Configuration
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Panels:</span>
                <span className="font-medium">{totalPanels} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Power:</span>
                <span className="font-medium">{(totalSystemPower / 1000).toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tilt Angle:</span>
                <span className="font-medium">{array.tilt}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Azimuth:</span>
                <span className="font-medium">{array.azimuth}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mounting:</span>
                <span className="font-medium">{array.racking?.replace('-', ' ') || 'Fixed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Losses:</span>
                <span className="font-medium">{array.losses}%</span>
              </div>
            </div>
          </div>

          {/* Inverter Information */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
              </div>
              Inverter Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{inverter.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="font-medium">{inverter.maker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rated Power:</span>
                <span className="font-medium">{(inverter.maxOutputPower / 1000).toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Output:</span>
                <span className="font-medium">{inverter.maxOutputPower} W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efficiency:</span>
                <span className="font-medium">{inverter.efficiency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phase Type:</span>
                <span className="font-medium">{inverter.phaseType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Output Voltage:</span>
                <span className="font-medium">{inverter.outputVoltage} V</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-4 bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-gray-800 mb-2">System Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{totalPanels}</div>
              <div className="text-gray-600">Total Panels</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">{(totalSystemPower / 1000).toFixed(1)} kW</div>
              <div className="text-gray-600">Array Power</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-orange-600">{numberOfInverters}</div>
              <div className="text-gray-600">Inverters</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{(inverter.maxOutputPower / 1000).toFixed(1)} kW</div>
              <div className="text-gray-600">Inverter Capacity</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="report-container space-y-6">
      <h1 className="text-3xl font-bold border-b pb-2 mb-4">PV System Design Report</h1>

      {/* System Summary Section */}
      {renderSystemSummary()}

      {/* Simulation Results Section */}
      {renderSimulationResults()}

      {/* Design Report */}
      <div className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
              components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 border-b pb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-3 border-b pb-1" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="my-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3" {...props} />,
            li: ({node, ...props}) => <li className="my-1" {...props} />,
            table: ({node, ...props}) => (
              <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 my-4">
                <table className="w-full border-collapse" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="border border-gray-200 p-3 text-left bg-gray-50 font-semibold" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-200 p-3" {...props} />,
            tr: ({node, ...props}) => <tr className="hover:bg-gray-50" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props} />,
            pre: ({node, ...props}) => <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm my-3" {...props} />,
          }}
        >
          {fullReport}
        </ReactMarkdown>
      </div>
      
      {/* Option 2: Render section by section */}
      {/* 
      <div className="section">
        <Section template={equipmentTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={arrayConfigurationTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={protectionTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={cableSizingTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={groundingTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={calculationsTemplate} context={reportData} />
      </div>
      */}
      
      {/* Export functionality */}
      <div className="export-buttons">
        <button onClick={() => {
          // Create a Blob with the markdown content
          const blob = new Blob([fullReport], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          
          // Create a download link and trigger it
          const a = document.createElement('a');
          a.href = url;
          a.download = 'pv_system_report.md';
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}>
          Export Markdown
        </button>
      </div>
    </div>
  );
};
