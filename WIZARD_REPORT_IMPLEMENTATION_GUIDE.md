# Wizard Report Step Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Entities & Data Structures](#core-entities--data-structures)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Template Interpolation System](#template-interpolation-system)
6. [Chart Rendering](#chart-rendering)
7. [Export Functionality](#export-functionality)
8. [Key Files Reference](#key-files-reference)
9. [Dependencies](#dependencies)

---

## Overview

The Report step is the **final step (Step 5)** in the wizard workflow at `http://localhost:3000/test/`. It displays a comprehensive technical report combining:

- **System Configuration Summary**: Panel, inverter, and array specifications
- **Simulation Results**: Annual energy, monthly/daily production charts
- **Technical Calculations**: Array configuration, protection devices, cable sizing
- **Exportable Markdown Report**: Complete technical documentation

### Wizard Flow
```
Step 0: Location → Step 1: Array → Step 2: Inverters → Step 3: Mounting → Step 4: Misc → Step 5: Report
```

---

## Core Entities & Data Structures

### 1. StepProps Interface

```typescript
interface StepProps {
  form: UseFormReturn<PVProject>;  // React Hook Form methods
  pvProject: PVProject;             // Main project data
  setPVProject: React.Dispatch<React.SetStateAction<PVProject>>;
  simulationResults?: SimulationResults | null;
  isSimulating?: boolean;
}
```

### 2. PVProject Type

```typescript
type PVProject = {
  // Project Identity
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;

  // Equipment Arrays
  panels: PVPanel[];           // Selected PV panels
  arrays: PVArray[];            // Array configurations
  inverters: Inverter[];        // Selected inverters

  // System Sizing
  numberInverters?: number;
  numberPanels?: number;

  // Optional Equipment
  batteryBanks?: BatteryBank[];
  chargeControllers?: ChargeController[];
  loads?: Load[];
  protectionDevices?: ProtectionDevice[];
  wires?: Wire[];
  mountingHardware?: MountingHardware[];

  // Project Status
  status: ProjectStatus;
};
```

### 3. PVPanel Type

```typescript
type PVPanel = {
  id?: number;
  maker: string;
  model: string;
  description?: string;
  power: number;
  shortCircuitCurrent: number;
  openCircuitVoltage: number;
  maxSeriesFuseRating?: number;
  currentAtPmax: number;
  voltageAtPmax: number;
  tempCoeffPmax: number;
  tempCoeffIsc: number;
  tempCoeffVoc: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  efficiency: number;
  performanceWarranty: string;
  productWarranty: string;
  price?: number;
};
```

### 4. Inverter Type

```typescript
type Inverter = {
  id?: number;
  maker: string;
  model: string;
  description?: string;
  phaseType: string;
  maxOutputPower: number;
  nominalOutputPower: number;
  efficiency: number;
  minInputVoltage: number;
  maxInputVoltage: number;
  maxInputCurrent: number;
  minInputCurrent: number;
  maxOutputCurrent: number;
  maxShortCircuitCurrent: number;
  outputVoltage: number;
  maxStringVoltage: number;
  maxStringCurrent: number;
  mpptChannels: number;
  productWarranty: string;
  price?: number;
};
```

### 5. SimulationResults Interface

```typescript
interface SimulationResults {
  success: boolean;
  message?: string;
  annual_energy?: number;
  capacity_factor?: number;
  peak_power?: number;
  performance_ratio?: number;
  monthly_energy?: Record<string, number>;
  daily_energy?: Record<string, number>;
  powerOutput?: number[];
  overview?: { text: string };
  monthly_performance?: {
    monthly_averages: Array<Record<string, unknown>>;
    best_day: Array<Record<string, unknown>>;
    worst_day: Array<Record<string, unknown>>;
  };
  power_flow?: { data: Array<Record<string, unknown>> };
  timestamp?: string;
  error_message?: string | null;
}
```

### 6. ArrayConfig Type

```typescript
type ArrayConfig = {
  // Voltage calculations at different temperatures
  Voc_10: number;       // Open circuit voltage at -10°C
  Vmp_10: number;       // Max power voltage at -10°C
  Vmp_85: number;       // Max power voltage at 85°C
  Isc_85: number;       // Short circuit current at 85°C
  Imp_85: number;       // Max power current at 85°C

  // String/parallel calculations
  Nsmax: number;        // Maximum panels in series
  Nsoptimal: number;    // Optimal panels in series
  Nsmin: number;        // Minimum panels in series
  Npmax: number;        // Maximum parallel strings
  Npoptimal: number;    // Optimal parallel strings

  // Power analysis
  power_ratio: number;  // DC/AC power ratio
  array_power: number;  // Total array power
  is_compatible: boolean; // Power ratio compatibility (0.9-1.3)

  // Calculation details
  Nsmax_calc?: number;
  Nsoptimal_calc?: number;
  Nsmin_calc?: number;
  Npmax_calc?: number;
  Npoptimal_calc?: number;
};
```

### 7. ProtectionCalc Type

```typescript
type ProtectionCalc = {
  fuse_Vocmax_val: number;
  fuse_IscSTC: number;
  switch_IscSTC: number;
  Vocmax: number;
  Iscmax: number;
  Ncmax_lmt: number;
  Npmax_lmt: number;
};
```

### 8. CableSizing Type

```typescript
type CableSizing = {
  Iz: number;
  section: number;
  length: number;
  Iz_prime_80C: number;
  Iz_prime_50C: number;
  Iz_prime_25C: number;
  delta_u: number;
  delta_u_perc: number;
};
```

### 9. ReportContext Type

```typescript
type ReportContext = {
  // Project specs
  project: ProjectSpecs;

  // Equipment
  panel: PVPanel;
  inverter: Inverter;

  // Protection systems
  dc_protection: ProtectionCalc;
  ac_protection: ProtectionCalc;
  protection: ProtectionCalc;

  // Cables
  dc_cable: Wire;
  ac_cable: Wire;
  dc_cable_sizing: CableSizing;
  ac1_cable_sizing: CableSizing;
  ac2_cable_sizing: CableSizing;

  // Array configuration
  array: ArrayConfig;

  // Constants
  constants: Constants;
};
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ReportStep1.tsx                               │
│                         (Main Component)                             │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
        ┌──────────────────────────────┐
        │    ArrayCalculatorUtils.tsx    │
        │   - calculateArrayConfiguration│
        │   - calculateProtectionDevices │
        │   - calculateDCCableSizing     │
        │   - calculateACCableSizing     │
        └────────────┬───────────────────┘
                     │
                     │ Returns
                     ▼
        ┌──────────────────────────────┐
        │       ReportContext           │
        │     (Rich Data Object)        │
        └────────────┬───────────────────┘
                     │
                     │ Feeds Into
                     ▼
        ┌──────────────────────────────┐
        │   interpolateTemplate()       │
        │   (Template System)           │
        └────────────┬───────────────────┘
                     │
                     │ Produces
                     ▼
        ┌──────────────────────────────┐
        │        Markdown Strings       │
        │  - Equipment template         │
        │  - Array configuration        │
        │  - Protection template        │
        │  - Cable sizing template      │
        └────────────┬───────────────────┘
                     │
                     │ Renders
                     ▼
        ┌──────────────────────────────┐
        │      ReactMarkdown            │
        │    (Visual Report)            │
        └──────────────────────────────┘
```

---

## Step-by-Step Implementation

### Section 1: System Configuration Summary

**Purpose**: Display a visual summary of the configured system with panel, inverter, and array details.

**Implementation in ReportStep1.tsx (lines 989-1155)**:

```typescript
function renderSystemSummary() {
  // Validate data exists
  if (!pvProject || !pvProject.panels || !pvProject.inverters || !pvProject.arrays) {
    return null;
  }

  // Extract first equipment (system assumes single array/inverter config)
  const panel = pvProject.panels[0];
  const inverter = pvProject.inverters[0];
  const array = pvProject.arrays[0];

  if (!panel || !inverter || !array) {
    return null;
  }

  // Calculate derived values
  const totalPanels = array.quantity || 0;
  const totalSystemPower = panel.power * totalPanels;
  const numberOfInverters = pvProject.numberInverters || pvProject.inverters?.length || 1;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-blue-800 mb-4">
        System Configuration Summary
      </h3>

      {/* Three-column grid: Panel, Array, Inverter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Panel Card */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Icon /> PV Panel Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{panel.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Power Rating:</span>
              <span className="font-medium">{panel.power} W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Efficiency:</span>
              <span className="font-medium">{panel.efficiency}%</span>
            </div>
          </div>
        </div>

        {/* Array Card */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Icon /> Array Configuration
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
          </div>
        </div>

        {/* Inverter Card */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Icon /> Inverter Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{inverter.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rated Power:</span>
              <span className="font-medium">{(inverter.maxOutputPower / 1000).toFixed(1)} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Efficiency:</span>
              <span className="font-medium">{inverter.efficiency}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="mt-4 bg-white rounded-lg p-4 shadow">
        <h4 className="font-semibold text-gray-800 mb-2">System Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{totalPanels}</div>
            <div className="text-gray-600">Total Panels</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {(totalSystemPower / 1000).toFixed(1)} kW
            </div>
            <div className="text-gray-600">Array Power</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-orange-600">{numberOfInverters}</div>
            <div className="text-gray-600">Inverters</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {(inverter.maxOutputPower / 1000).toFixed(1)} kW
            </div>
            <div className="text-gray-600">Inverter Capacity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Section 2: Simulation Results Display

**Purpose**: Display simulation results with interactive charts and metrics.

**Implementation in ReportStep1.tsx (lines 585-986)**:

#### 2A. Handle Multiple Simulation Data Formats

```typescript
const renderSimulationResults = () => {
  // Check if simulation was run
  if (!simulationResults) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Simulation Not Run
        </h3>
        <p className="text-yellow-700">
          Click "Generate Simulation" to run the production simulation.
        </p>
      </div>
    );
  }

  // Check for success
  if (!simulationResults.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Simulation Failed
        </h3>
        <p className="text-red-700">
          {simulationResults.message || 'An unknown error occurred.'}
        </p>
      </div>
    );
  }

  // Handle new format with annual_energy, monthly_energy
  if ((simulationResults as any).annual_energy !== undefined) {
    return renderEnhancedSimulationResults();
  }

  // Handle legacy format with powerOutput array
  if ((simulationResults as any).powerOutput && Array.isArray((simulationResults as any).powerOutput)) {
    return renderLegacySimulationResults();
  }

  // Fallback
  return <div>Unknown simulation result format</div>;
};
```

#### 2B. Enhanced Simulation Results with Charts

```typescript
function renderEnhancedSimulationResults() {
  const {
    success,
    timestamp,
    annual_energy,
    capacity_factor,
    peak_power,
    performance_ratio,
    monthly_energy,
    daily_energy,
  } = simulationResults as any;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-green-800 mb-4">
        Solar Simulation Results
      </h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Annual Energy</div>
            <Icon />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {(annual_energy || 0).toFixed(1)} kWh
          </div>
          <div className="text-xs text-gray-500 mt-1">Total annual production</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Capacity Factor</div>
          <div className="text-2xl font-bold text-blue-600">
            {((capacity_factor || 0) * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">System utilization</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-orange-500">
          <div className="text-sm text-gray-600">Peak Power</div>
          <div className="text-2xl font-bold text-orange-600">
            {(peak_power || 0).toFixed(0)} W
          </div>
          <div className="text-xs text-gray-500 mt-1">Maximum output</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Performance Ratio</div>
          <div className="text-2xl font-bold text-purple-600">
            {(performance_ratio || 0).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Efficiency ratio</div>
        </div>
      </div>

      {/* Monthly Production Chart */}
      {monthly_energy && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold text-gray-800 mb-4">
            Monthly Production
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processMonthlyEnergyData(monthly_energy)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} kWh`, 'Monthly Energy']} />
              <Bar dataKey="energy" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Production Chart */}
      {daily_energy && (
        <div className="bg-white rounded-lg p-4 shadow mt-6">
          <h4 className="font-semibold text-gray-800 mb-4">
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{ value: 'Day of Year', position: 'insideBottom', offset: -5 }}
                interval={29}
              />
              <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} kWh`, 'Daily Energy']} />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorDaily)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
```

#### 2C. Data Processing Utilities

```typescript
// Process monthly energy data from API
const processMonthlyEnergyData = (monthlyEnergy: Record<string, number> | undefined) => {
  if (!monthlyEnergy) return [];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Object.entries(monthlyEnergy).map(([month, energy], index) => ({
    month: monthNames[parseInt(month) - 1] || month,
    energy: parseFloat(energy.toFixed(1)),
    monthNumber: parseInt(month)
  }));
};

// Process daily energy data from API
const processDailyEnergyData = (dailyEnergy: Record<string, number> | undefined) => {
  if (!dailyEnergy) return [];

  return Object.entries(dailyEnergy).map(([day, energy]) => ({
    day: parseInt(day),
    date: `Day ${day}`,
    energy: parseFloat(energy.toFixed(1))
  }));
};
```

### Section 3: Markdown Report Generation

**Purpose**: Generate a comprehensive technical report using template interpolation.

**Implementation in ReportStep1.tsx (lines 335-366)**:

#### 3A. Calculate All System Parameters

```typescript
// Get first panel and inverter
const panel = {
  ...pvProject.panels[0],
  maxPower: pvProject.panels[0].power,
  tempCoeffVoc: pvProject.panels[0].tempCoeffVoc || -0.25,
  tempCoeffIsc: pvProject.panels[0].tempCoeffIsc || 0.05
};

const inverter = pvProject.inverters[0];

// Calculate derived values
const numPanels = pvProject.arrays.reduce((total, arr) => total + (arr.quantity || 0), 0);
const numberOfInverters = pvProject.numberInverters || pvProject.inverters?.length || 1;

// Run calculations
const array = calculateArrayConfiguration(panel, inverter, numPanels);
const protection = calculateProtectionDevices(panel, array);
const dc_cable_sizing = calculateDCCableSizing(cable, panel);
const ac1_cable_sizing = calculateACCableSizing(cable, inverter);
```

#### 3B. Build ReportContext Object

```typescript
const reportContext = {
  // Project specifications
  project: {
    arrayPowerkW: Math.round((panel.power * numPanels) / 1000 * 10) / 10,
    customer: pvProject.name || 'Default Customer',
    latitude: pvProject.latitude || 0,
    longitude: pvProject.longitude || 0,
    numberPanels: numPanels,
    numberInverters: numberOfInverters,
    reference: `PV-${pvProject.id || 1000}-${Date.now()}`,
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
  },

  // Equipment
  panel,
  inverter: {
    ...inverter,
    maxInputCurrentPerMppt: inverter.maxInputCurrent || 20,
    numberOfMpptTrackers: inverter.mpptChannels || 2,
    maxShortCircuitCurrent: inverter.maxShortCircuitCurrent || 45,
    maxDcVoltage: inverter.maxInputVoltage || 480,
    mpptVoltageRangeMin: inverter.minInputVoltage || 150,
    mpptVoltageRangeMax: inverter.maxInputVoltage || 480,
    maxApparentPower: Math.round((inverter.maxOutputPower / 0.8) / 100) / 100
  },

  // Protection devices
  dc_protection: {
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
  },

  ac_protection: {
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
  },

  // Cables
  dc_cable_sizing,
  ac1_cable_sizing,
  ac2_cable_sizing,

  // Calculated values
  array,
  protection,

  // Constants
  constants: PVCONSTANTS
};
```

#### 3C. Generate Markdown Report

```typescript
// Generate complete report by concatenating all template sections
const fullReport = `${interpolateTemplate(equipmentTemplate, reportContext)}

${interpolateTemplate(arrayConfigurationTemplate, reportContext)}

${interpolateTemplate(protectionTemplate, reportContext)}

${interpolateTemplate(cableSizingTemplate, reportContext)}

`;
```

#### 3D. Render with ReactMarkdown

```typescript
return (
  <div className="report-container space-y-6">
    {/* System Summary */}
    {renderSystemSummary()}

    {/* Simulation Results */}
    {renderSimulationResults()}

    {/* Technical Report */}
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({node, ...props}) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 border-b pb-2" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="text-xl font-semibold mt-5 mb-3 border-b pb-1" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-lg font-medium mt-4 mb-2" {...props} />
          ),
          p: ({node, ...props}) => <p className="my-3" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          th: ({node, ...props}) => (
            <th className="border border-gray-200 p-3 text-left bg-gray-50 font-semibold" {...props} />
          ),
          td: ({node, ...props}) => <td className="border border-gray-200 p-3" {...props} />,
        }}
      >
        {fullReport}
      </ReactMarkdown>
    </div>

    {/* Export Button */}
    <div className="export-buttons">
      <button onClick={exportMarkdown}>
        Export Markdown
      </button>
    </div>
  </div>
);
```

---

## Template Interpolation System

**Purpose**: Replace `{{variable.path}}` placeholders in templates with actual values from context.

### interpolateTemplate Function

**Implementation** (from ReportStep1.tsx lines 22-54):

```typescript
function interpolateTemplate<T extends Record<string, unknown>>(template: string, context: T): string {
  if (typeof template !== 'string') return '';

  // Replace {{variable.path}} with actual values from the context
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value: unknown = context;

    for (const key of keys) {
      // Check if value exists and is an object
      if (value === undefined || value === null) return '';
      if (typeof value !== 'object' && typeof value !== 'function') return '';

      // Navigate through the path
      if (value && typeof value === 'object' && key in value) {
        const nextValue = (value as Record<string, unknown>)[key];
        if (nextValue === undefined || nextValue === null) return '';
        value = nextValue;
      } else {
        return '';
      }
    }

    // Convert to string
    if (value === undefined || value === null) return '';
    try {
      if (typeof value === 'object' && value !== null && 'toString' in value) {
        return value.toString();
      }
      return String(value);
    } catch {
      return '';
    }
  });
}
```

### Template Usage Example

**Template string**:
```
| Marque | {{ panel.maker }} |
| Puissance | {{ panel.maxPower }} W |
| Efficacité | {{ panel.efficiency }}% |
```

**Context object**:
```typescript
{
  panel: {
    maker: 'LG',
    maxPower: 370,
    efficiency: 20.1
  }
}
```

**Result**:
```
| Marque | LG |
| Puissance | 370 W |
| Efficacité | 20.1% |
```

### Template Sections

#### 1. Equipment Template (equipment.ts)

Contains French technical documentation with:
- Project header (customer, reference, location, power)
- Equipment table (modules, inverter, protection devices)
- Panel specifications table
- Inverter specifications table

**Key placeholders**:
- `{{ project.customer }}` - Customer name
- `{{ project.arrayPowerkW }}` - System power in kW
- `{{ panel.maker }}` - Panel manufacturer
- `{{ inverter.model }}` - Inverter model
- `{{ dc_protection.fuse.maker }}` - DC fuse manufacturer

#### 2. Array Configuration Template (array_configuration.ts)

Contains technical calculations:
- Maximum panels in series (Nsmax)
- Optimal panels in series (Nsoptimal)
- Minimum panels in series (Nsmin)
- Maximum parallel strings (Npmax)
- Power compatibility ratio

**Key placeholders**:
- `{{ array.Voc_10 }}` - Open circuit voltage at -10°C
- `{{ array.Nsmax }}` - Maximum series panels
- `{{ array.power_ratio }}` - DC/AC power ratio
- `{{ inverter.maxDcVoltage }}` - Inverter max DC voltage

#### 3. Protection Template (protection.ts)

Contains protection device calculations:
- Maximum parallel strings without protection (Ncmax)
- DC fuse requirements
- DC disconnect switch
- DC surge protector
- AC circuit breaker
- AC surge protector

**Key placeholders**:
- `{{ protection.Ncmax_lmt }}` - Maximum parallel limit
- `{{ dc_protection.fuse.In }}` - Fuse current rating
- `{{ dc_protection.lightning.Ucpv }}` - Surge protector voltage

#### 4. Cable Sizing Template (cable_sizing.ts)

Contains cable calculations:
- DC cable current capacity with correction factors
- DC voltage drop calculation
- AC cable current capacity
- AC voltage drop calculation

**Key placeholders**:
- `{{ dc_cable_sizing.Iz }}` - Cable current capacity
- `{{ constants.K1 }}` - Installation method factor
- `{{ dc_cable_sizing.delta_u_perc }}` - Voltage drop percentage

#### 5. Grounding Template (grounding.ts)

Contains grounding system description:
- Panel grounding
- Structure grounding
- Mounting structure implementation

---

## Chart Rendering

The report uses **Recharts** library for interactive data visualization.

### Dependencies

```typescript
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
```

### Chart Types

#### 1. Monthly Production BarChart

```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={monthlyData}>
    <defs>
      <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
    <Tooltip formatter={(value) => [`${value} kWh`, 'Monthly Energy']} />
    <Bar dataKey="energy" fill="#10b981" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

#### 2. Daily Production AreaChart

```typescript
<ResponsiveContainer width="100%" height={250}>
  <AreaChart data={dailyData}>
    <defs>
      <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="day" interval={29} />
    <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
    <Tooltip formatter={(value) => [`${value} kWh`, 'Daily Energy']} />
    <Area
      type="monotone"
      dataKey="energy"
      stroke="#3b82f6"
      fillOpacity={1}
      fill="url(#colorDaily)"
    />
  </AreaChart>
</ResponsiveContainer>
```

#### 3. Daily Power Profile LineChart

```typescript
<ResponsiveContainer width="100%" height={250}>
  <LineChart data={sampledData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="hour" />
    <YAxis label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }} />
    <Tooltip formatter={(value) => [`${value} W`, 'Power Output']} />
    <Line
      type="monotone"
      dataKey="power"
      stroke="#f59e0b"
      strokeWidth={2}
      dot={false}
    />
  </LineChart>
</ResponsiveContainer>
```

### Data Processing for Charts

#### Processing Hourly to Daily Data

```typescript
const processHourlyData = (powerData: number[]) => {
  const dailyData = [];
  for (let day = 0; day < Math.floor(powerData.length / 24); day++) {
    const dayStart = day * 24;
    const dayEnd = Math.min(dayStart + 24, powerData.length);
    const dayHours = powerData.slice(dayStart, dayEnd);
    const dailyEnergy = dayHours.reduce((sum, power) => sum + power, 0) / 1000;
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
```

#### Processing Monthly Data

```typescript
const processMonthlyData = (powerData: number[]) => {
  const monthlyData = [];
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
      energy: parseFloat((monthlyEnergy / 1000).toFixed(1)),
      peakPower: parseFloat(monthlyPeak.toFixed(1)),
      avgPower: parseFloat(((monthlyEnergy / 1000) / daysInMonth).toFixed(1))
    });
  }
  return monthlyData;
};
```

---

## Export Functionality

### Markdown Export

**Implementation** (ReportStep1.tsx lines 1220-1237):

```typescript
const exportMarkdown = () => {
  // Create a Blob with the markdown content
  const blob = new Blob([fullReport], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  // Create a download link and trigger it
  const a = document.createElement('a');
  a.href = url;
  a.download = `pv_system_report_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show success notification
  toast.success('Report downloaded successfully');
};
```

**Usage in UI**:
```typescript
<div className="export-buttons">
  <button
    onClick={() => {
      const blob = new Blob([fullReport], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pv_system_report.md';
      a.click();
      URL.revokeObjectURL(url);
    }}
  >
    Export Markdown
  </button>
</div>
```

### AI Report Download (AIReportGenerator.tsx)

**Implementation** (lines 178-194):

```typescript
const downloadReport = () => {
  const reportContent = sections.map(section =>
    `# ${section.title}\n\n${section.content}\n\n---\n`
  ).join('\n');

  const blob = new Blob([reportContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `solar-ai-report-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success('Report downloaded successfully');
};
```

---

## Key Files Reference

### 1. ReportStep1.tsx
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/steps/ReportStep1.tsx`

**Main component** (90-1241 lines) containing:
- `renderSystemSummary()`: System configuration display
- `renderSimulationResults()`: Simulation results handling
- `renderEnhancedSimulationResults()`: Enhanced simulation with charts
- `processMonthlyEnergyData()`: Data transformation for charts
- `processDailyEnergyData()`: Data transformation for charts
- `interpolateTemplate()`: Template variable replacement

**Key Props**:
```typescript
interface StepProps {
  form: UseFormReturn<PVProject>;
  pvProject: PVProject;
  setPVProject: React.Dispatch<React.SetStateAction<PVProject>>;
  simulationResults?: SimulationResults | null;
  isSimulating?: boolean;
}
```

### 2. ArrayCalculatorUtils.tsx
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/ArrayCalculatorUtils.tsx`

**Exported Functions**:

#### calculateArrayConfiguration()
```typescript
function calculateArrayConfiguration(
  panel: PVPanel,
  inverter: Inverter,
  numPanels: number
): ArrayConfig
```

**Purpose**: Calculate array configuration parameters (voltages, currents, string/parallel counts).

**Algorithm**:
1. Calculate voltage at -10°C (cold condition): `Voc_10 = Voc * (1 + β * tempEffect)`
2. Calculate voltage at 85°C (hot condition): `Vmp_85 = Vmp * (1 + β * tempEffect)`
3. Calculate maximum panels in series: `Nsmax = floor(Udcmax / Voc_10)`
4. Calculate optimal panels in series: `Nsoptimal = floor(Umpptmax / Vmp_10)`
5. Calculate minimum panels in series: `Nsmin = ceil(Umpptmin / Vmp_85)`
6. Calculate maximum parallel strings: `Npmax = floor(Icconduleur / Isc_85)`
7. Calculate power ratio: `power_ratio = totalPower / nominalOutputPower`

#### calculateProtectionDevices()
```typescript
function calculateProtectionDevices(
  panel: PVPanel,
  arrayConfig: ArrayConfig
): ProtectionCalc
```

**Purpose**: Calculate protection device parameters for DC side.

**Algorithm**:
1. Maximum parallel without protection: `NcmaxLmt = (1 + Irm) / Isc`
2. Maximum parallel with protection: `NpmaxLmt = 0.5 * (1 + (Irm / Impp))`
3. Fuse current: `fuseIscSTC = Isc * 1.1 * 1.25`
4. Switch current: `switchIscSTC = Isc * 1.25`
5. Max voltage: `Vocmax = Voc * 1.2`

#### calculateDCCableSizing()
```typescript
function calculateDCCableSizing(
  cable: Wire,
  panel: PVPanel
): CableSizing
```

**Purpose**: Calculate DC cable current capacity and voltage drop.

**Algorithm**:
1. Current capacity: `Iz' = Iz * K1 * K2 * K3 * K4` (with correction factors)
2. Voltage drop: `Δu = 2 * ρ * (L/S) * ImpSTC`
3. Voltage drop percentage: `Δu% = 100 * Δu / Ump`

#### calculateACCableSizing()
```typescript
function calculateACCableSizing(
  cable: Wire,
  inverter: Inverter
): CableSizing
```

**Purpose**: Calculate AC cable current capacity and voltage drop.

**Algorithm**:
1. Current capacity: `Iz' = Iz * K1 * K2 * K3 * K4`
2. AC voltage drop: `Δu = 2 * ((ρ * (L/S) * cosΦ) + (λ * L * sinΦ)) * Imax`
3. Voltage drop percentage: `Δu% = 100 * Δu / Ve`

### 3. templates.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/templates.ts`

**Exports**:
```typescript
export { equipmentTemplate } from './equipment';
export { arrayConfigurationTemplate } from './array_configuration';
export { cableSizingTemplate } from './cable_sizing';
export { groundingTemplate } from './grounding';
export { protectionTemplate } from './protection';
```

### 4. equipment.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/equipment.ts`

**Content**: French technical documentation template including:
- Project header with customer, reference, GPS coordinates, power
- Table of contents for documentation
- Equipment list table (modules, inverter, protection devices, cables, etc.)
- Panel specifications table (voltage, current, temperature coefficients)
- Inverter specifications table (power, voltage, current, MPPT channels)

**Key placeholders**:
- `{{ project.customer }}` - Customer name
- `{{ project.reference }}` - Project reference
- `{{ panel.maker }}` - Panel manufacturer
- `{{ panel.maxPower }}` - Panel power in watts
- `{{ inverter.nominalOutputPower }}` - Inverter AC power
- `{{ dc_protection.fuse.In }}` - DC fuse current rating

### 5. array_configuration.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/array_configuration.ts`

**Content**: Technical calculations for array configuration:
- Maximum panels in series formula and calculation
- Optimal panels in series formula and calculation
- Minimum panels in series formula and calculation
- Maximum parallel strings formula and calculation
- Power compatibility ratio check

**Key placeholders**:
- `{{ array.Voc_10 }}` - Open circuit voltage at -10°C
- `{{ array.Vmp_10 }}` - Max power voltage at -10°C
- `{{ array.Vmp_85 }}` - Max power voltage at 85°C
- `{{ array.Nsmax }}` - Maximum panels in series
- `{{ array.Nsoptimal }}` - Optimal panels in series
- `{{ array.power_ratio }}` - DC/AC power ratio

### 6. protection.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/protection.ts`

**Content**: Protection device specifications and calculations:
- DC protection (fuses, disconnect switches, surge protectors)
- AC protection (circuit breakers, surge protectors, main disconnect)
- Technical requirements for each protection device type

**Key placeholders**:
- `{{ protection.Ncmax_lmt }}` - Maximum parallel without protection
- `{{ protection.Npmax_lmt }}` - Maximum parallel with protection
- `{{ dc_protection.fuse.Vn }}` - DC fuse voltage rating
- `{{ dc_protection.fuse.In }}` - DC fuse current rating
- `{{ ac_protection.lightning.Uc }}` - AC surge protector voltage

### 7. cable_sizing.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/cable_sizing.ts`

**Content**: Cable sizing calculations for DC and AC:
- Current capacity with correction factors (K1-K4)
- Voltage drop calculations
- Installation methods and environmental factors

**Key placeholders**:
- `{{ dc_cable_sizing.Iz }}` - Cable current capacity
- `{{ constants.K1 }}` - Installation method factor
- `{{ constants.K2 }}` - Circuit grouping factor
- `{{ dc_cable_sizing.delta_u_perc }}` - Voltage drop percentage
- `{{ ac_cable_sizing.section }}` - Cable cross-sectional area

### 8. grounding.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/grounding.ts`

**Content**: Grounding system description and mounting structure implementation.

### 9. reportTypes.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/components/ProjectWizard/calculations/reportTypes.ts`

**Type Definitions**:
- `ProjectSpecs` - Project specification interface
- `ArrayConfig` - Array configuration calculations
- `ProtectionCalc` - Protection device calculations
- `CableSizing` - Cable sizing calculations
- `ReportContext` - Complete context for template interpolation

### 10. types/solar.ts
**Location**: `/home/tayebd/apps/user_mgmt/client/src/types/solar.ts`

**Zod Schemas and Types**:
- `PVPanelSchema` - Panel data validation
- `InverterSchema` - Inverter data validation
- `PVArraySchema` - Array configuration validation
- `PVProjectSchema` - Complete project validation

---

## Dependencies

### React Dependencies
```typescript
// Core React
import React, { useState, useEffect } from 'react';

// Form handling
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Markdown rendering
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// UI Components (shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Notifications
import { toast } from 'sonner';

// Charts
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

// Icons
import { Download, FileText, Calculator, Shield, TrendingUp } from 'lucide-react';
```

### Calculation Dependencies
```typescript
// Import calculation utilities
import { calculateArrayConfiguration, calculateProtectionDevices,
         calculateDCCableSizing, calculateACCableSizing,
         PVCONSTANTS as constants } from '../calculations/ArrayCalculatorUtils';

// Import template modules
import { arrayConfigurationTemplate, cableSizingTemplate,
         equipmentTemplate, protectionTemplate } from '../calculations/templates';

// Import types
import type { PVProject, PVPanel, Inverter } from '@/shared/types';
import type { ArrayConfig, ProtectionCalc, CableSizing,
              ReportContext, ProjectSpecs } from '../calculations/reportTypes';
```

### Key NPM Packages
- `react` - Core React library
- `react-hook-form` - Form state management
- `@hookform/resolvers/zod` - Form validation with Zod
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown support
- `rehype-raw` - HTML in markdown support
- `recharts` - Chart library
- `sonner` - Toast notifications
- `zod` - Schema validation
- `typescript` - TypeScript support

---

## Summary

The Report step is a sophisticated component that:

1. **Receives data** from previous wizard steps (Location, Array, Inverters, Mounting, Misc Equipment)
2. **Performs calculations** using ArrayCalculatorUtils for array configuration, protection devices, and cable sizing
3. **Builds a ReportContext** object containing all necessary data
4. **Interpolates templates** using a custom `interpolateTemplate()` function
5. **Renders interactive charts** using Recharts for simulation data visualization
6. **Displays comprehensive report** using ReactMarkdown with custom components
7. **Provides export functionality** to download the report as Markdown

The architecture separates concerns clearly:
- **ReportStep1.tsx** handles rendering and data flow
- **ArrayCalculatorUtils.tsx** handles all calculations
- **Template files** contain static documentation content
- **reportTypes.ts** defines TypeScript interfaces

This modular approach makes the system maintainable and allows easy modification of templates, calculations, or rendering logic independently.
