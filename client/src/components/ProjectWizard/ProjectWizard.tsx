'use client'

import { useState, useEffect } from 'react';
import { useForm, FormProvider, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PVProject } from '@/types/solar';
import { ProgressIndicator } from './ProgressIndicator';
import {
  LocationStep,
  ArrayStep,
  InverterStep,
  MountingStep,
  MiscEquipmentStep,
  ReportStep1
} from './steps/index';
import { useApiStore } from '@/state/api';
import { INITIAL_PVPROJECT } from '@/types/initialData'
import { PVProjectSchema } from '@/types/solar';

interface SimulationResults {
  success: boolean;
  message?: string;
  service_percentage?: number;
  overview?: {
    text: string;
  };
  monthly_performance?: {
    monthly_averages: Array<Record<string, unknown>>;
    best_day: Array<Record<string, unknown>>;
    worst_day: Array<Record<string, unknown>>;
  };
  power_flow?: {
    data: Array<Record<string, unknown>>;
  };
  powerOutput?: number[];
}

export function ProjectWizard() {
  const { createPVProject } = useApiStore();

  console.log('ProjectWizard rendering');
  const [currentStep, setCurrentStep] = useState(0);
  const [pvProject, setPVProject] = useState<PVProject>(INITIAL_PVPROJECT);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const methods = useForm<PVProject>({
    resolver: zodResolver(PVProjectSchema),
    defaultValues: {
      ...INITIAL_PVPROJECT,
      id: INITIAL_PVPROJECT.id || 0,
      arrays: INITIAL_PVPROJECT.arrays
    },
    mode: 'onChange'
  });

  // Validation functions for each step
  const validateLocationStep = async () => {
    return methods.trigger(['name'] as const);
  };

  const validateArrayStep = async () => {
    return methods.trigger(['arrays'] as const);
  };

  const validateInvertersStep = async () => {
    return methods.trigger(['inverters'] as const);
  };

  const validateMountingStep = async () => {
    return methods.trigger(['arrays'] as const);
  };

  const validateMiscEquipmentStep = async () => {
    return methods.trigger(['batteryBanks', 'chargeControllers', 'loads'] as const);
  };

  // No validation needed for report step
  const validateReportStep = async () => true;

  const stepValidationFunctions = [
    validateLocationStep,
    validateArrayStep,
    validateInvertersStep,
    validateMountingStep,
    validateMiscEquipmentStep,
    validateReportStep,
  ] as const;

  const steps = [
    { title: 'Location', component: LocationStep },
    { title: 'Array Attributes', component: ArrayStep },
    { title: 'Inverters', component: InverterStep },
    { title: 'Mounting', component: MountingStep },
    { title: 'Misc Equipment', component: MiscEquipmentStep },
    { title: 'Report', component: ReportStep1 },
  ];

  // Function to provide default values for missing components
  const getOrDefaultComponents = (project: PVProject) => {
    // Default panel (first from mock data)
    const defaultPanel = {
      id: 1,
      maker: 'LG',
      model: 'LG370Q1C-A5',
      description: 'High-efficiency monocrystalline panel',
      power: 370,
      shortCircuitCurrent: 9.8,
      openCircuitVoltage: 46.1,
      maxSeriesFuseRating: 20,
      currentAtPmax: 9.2,
      voltageAtPmax: 40.2,
      tempCoeffPmax: -0.36,
      tempCoeffIsc: 0.03,
      tempCoeffVoc: -0.27,
      length: 1700,
      width: 1016,
      height: 40,
      weight: 18.5,
      efficiency: 20.1,
      performanceWarranty: '25 years',
      productWarranty: '25 years',
      price: 300
    };

    // Default inverter (first from mock data)
    const defaultInverter = {
      maker: 'SolarEdge',
      model: 'SE3000H',
      description: 'High-efficiency single-phase inverter',
      phaseType: 'Single Phase',
      maxOutputPower: 3000,
      nominalOutputPower: 3000,
      efficiency: 97.7,
      minInputVoltage: 120,
      maxInputVoltage: 500,
      maxInputCurrent: 16,
      maxOutputCurrent: 14,
      outputVoltage: 240,
      maxStringVoltage: 500,
      maxStringCurrent: 16,
      mpptChannels: 1,
      productWarranty: '12 years',
      price: 1200,
      minInputCurrent: 0,
      maxShortCircuitCurrent: 0
    };

    // Default array configuration
    const defaultArray = {
      panelId: 1,
      quantity: 20,
      tilt: 30,
      azimuth: 180,
      losses: 14,
      racking: 'roof-top',
      bifacial: false
    };

    const array = project.arrays?.[0] || defaultArray;
    const panel = project.panels?.[0] || defaultPanel;
    const inverter = project.inverters?.[0] || defaultInverter;

    return { array, panel, inverter };
  };

  // Function to transform PVProject to the format expected by the API
  const transformPVProjectToAPIFormat = (project: PVProject) => {
    // Get components with fallback to defaults
    const { array, panel, inverter } = getOrDefaultComponents(project);

    console.log('Using components for simulation:', {
      arrayQuantity: array.quantity,
      panelModel: panel.model,
      panelPower: panel.power,
      inverterModel: inverter.model,
      inverterPower: inverter.maxOutputPower
    });

    // Calculate optimal series/parallel configuration
    const modulesPerString = Math.ceil(Math.sqrt(array.quantity));
    const stringsInParallel = Math.ceil(array.quantity / modulesPerString);

      const result: Record<string, unknown> = {
      site: {
        cntry: 'Canada',
        lat: project.latitude || 45.0,
        lon: project.longitude || -75.0,
        elev: project.elevation || 100,
        tz: 0  // UTC
      },
      panel: {
        Technology: 'Mono-c-Si',
        T_NOCT: 45,
        V_mp_ref: panel.voltageAtPmax || 30,
        I_mp_ref: panel.currentAtPmax || 8,
        V_oc_ref: panel.openCircuitVoltage || 38,
        I_sc_ref: panel.shortCircuitCurrent || 9,
        PTC: panel.power || 250,
        A_c: (panel.length * panel.width) / 1000000 || 1.6, // Convert mm² to m²
        N_s: 60, // Typical for 60-cell panels
        R_s: 0.3,
        R_sh_ref: 300,
        BIPV: false,
        alpha_sc: panel.tempCoeffIsc || 0.0005,
        beta_oc: panel.tempCoeffVoc || -0.003,
        a_ref: 1.8,
        I_L_ref: 9,
        I_o_ref: 1e-10,
        Adjust: 0,
        gamma_r: -0.004
      },
      array: {
        tilt: array.tilt || 30,
        azimuth: array.azimuth || 180,
        mtg_cnfg: 'Fixed',
        mtg_spc: 0.5,
        mtg_hgt: 2,
        gnd_cnd: 'Urban',
        albedo: array.albedo || 0.25,
        uis: modulesPerString,
        sip: stringsInParallel,
        ary_Vmp: panel.voltageAtPmax * modulesPerString,
        ary_Imp: panel.currentAtPmax * stringsInParallel,
        ary_tpnl: array.quantity
      },
      inverter: {
        Vac: inverter.outputVoltage || 120,
        Paco: inverter.maxOutputPower || panel.power * array.quantity,
        Pdco: inverter.maxOutputPower || panel.power * array.quantity,
        Vdco: panel.voltageAtPmax * modulesPerString,
        Pnt: 20,
        Vdcmax: inverter.maxInputVoltage || 400,
        Idcmax: inverter.maxInputCurrent || 20,
        Mppt_low: 100,
        Mppt_high: 400
      },
      load: {
        Type: 'Residential',
        Qty: 1,
        Use_Factor: 0.5,
        Hours: 24,
        Start_Hour: 0,
        Watts: 1000,
        Mode: 'AC'
      }
    };

    // Only include battery if user has selected battery banks in their project
    if (project.batteryBanks && project.batteryBanks.length > 0) {
      result.battery = {
        b_typ: 'Li-ion',
        b_nomv: 48,
        b_rcap: 100,
        b_rhrs: 20,
        b_ir: 0.01,
        b_stdTemp: 25,
        b_tmpc: 25,
        b_mxDschg: 80,
        b_mxDoD: 80
      };
    }

    return result;
  };

  const handleNext = async () => {
    const validateCurrentStep = stepValidationFunctions[currentStep];
    const isValid = await validateCurrentStep();
    console.log('Form state:', methods.formState);
    console.log('Current step errors:', methods.formState.errors);
    console.log('PV Project:', pvProject);

    if (isValid) {
      if (currentStep === steps.length - 1) {
        // On the report step, trigger simulation
        setIsSimulating(true);

        try {
          // Use pvProject state instead of form values for better data consistency
          console.log('PVProject structure for simulation:', {
            projectKeys: Object.keys(pvProject),
            arraysLength: pvProject.arrays?.length,
            panelsLength: pvProject.panels?.length,
            invertersLength: pvProject.inverters?.length,
            arrays: pvProject.arrays,
            panels: pvProject.panels,
            inverters: pvProject.inverters
          });

          // The simulation will use default values if any components are missing
          console.log('Preparing simulation with components (using defaults if needed)...');

          // Transform the PVProject data to the format expected by the API
          const apiRequestData = transformPVProjectToAPIFormat(pvProject);

          console.log('Sending simulation request:', apiRequestData);

          const response = await fetch('http://localhost:8001/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiRequestData)
          });

          if (!response.ok) {
            if (response.status === 0) {
              throw new Error('Cannot connect to simulation server. Please ensure the PV simulation server is running on port 8001.\n\nTo start the server, run:\ncd server/pvlib_api\n./run_api.sh');
            } else if (response.status === 404) {
              throw new Error('Simulation endpoint not found. Please check if the correct API server is running on port 8001.\n\nThe server should be started with: ./run_api.sh');
            } else if (response.status >= 500) {
              throw new Error(`Server error (${response.status}): The simulation server encountered an internal error. Please check the server logs.`);
            } else {
              throw new Error(`HTTP error! status: ${response.status}. Please check the server configuration.`);
            }
          }

          const result = await response.json();
          console.log('Simulation result:', result);
          console.log('Result structure:', {
            success: result.success,
            hasPowerOutput: !!result.powerOutput,
            powerOutputLength: result.powerOutput?.length,
            hasServicePercentage: !!result.service_percentage,
            hasOverview: !!result.overview,
            hasMonthlyPerformance: !!result.monthly_performance
          });

          if (result.success) {
            setSimulationResults(result);
            // Update project with simulation results
            setPVProject(prev => prev ? { ...prev, simulationData: result } : prev);
          } else {
            throw new Error(result.message || 'Simulation failed');
          }
        } catch (error) {
          console.error('Error running simulation:', error);

          let errorMessage = 'Unknown error occurred';
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
              errorMessage = 'Cannot connect to simulation server. Please ensure the PV simulation server is running on port 8001.\n\nTo start the server:\n1. Open terminal\n2. Navigate to: cd server/pvlib_api\n3. Run: ./run_api.sh\n\nThen try the simulation again.';
            } else {
              errorMessage = error.message;
            }
          }

          // Show error to user
          alert(`Simulation failed: ${errorMessage}`);
        } finally {
          setIsSimulating(false);
        }
      } else {
        setCurrentStep((prev: number) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev: number) => prev - 1);
    }
  };

  const handleSave = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      const formValues = methods.getValues();
      console.log('Saving project:', formValues);

      const project: PVProject = {
        ...formValues,
        id: formValues.id || 0,
      };

      await createPVProject(project);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
      <FormProvider {...methods}>
        <div className="max-w-4xl mx-auto p-6">
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
          />

          <Card className="p-6 mt-6">
            <CurrentStepComponent
              form={methods}
              pvProject={pvProject}
              setPVProject={setPVProject}
              simulationResults={simulationResults}
              isSimulating={isSimulating}
            />
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="space-x-4">
              <Button variant="outline" onClick={handleSave}>
                Save & Exit
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSimulating}
              >
                {isSimulating ? 'Simulating...' :
                 currentStep === steps.length - 1 ? 'Generate Simulation' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </FormProvider>
  );
}