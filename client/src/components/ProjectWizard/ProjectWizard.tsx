'use client'

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  timestamp?: string;
  annual_energy?: number;
  capacity_factor?: number;
  peak_power?: number;
  performance_ratio?: number;
  monthly_energy?: Record<string, number>;
  daily_energy?: Record<string, number>;
  error_message?: string | null;
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

  // Enhanced validation functions for each step
  const validateLocationStep = async () => {
    const nameValid = await methods.trigger(['name'] as const);
    const formData = methods.getValues();

    if (!formData.name || formData.name.trim().length < 3) {
      methods.setError('name', {
        type: 'manual',
        message: 'Project name must be at least 3 characters long'
      });
      return false;
    }

    if (!formData.address || formData.address.trim().length < 5) {
      methods.setError('name', {
        type: 'manual',
        message: 'Please enter a valid project address'
      });
      return false;
    }

    if (!formData.latitude || formData.latitude < -90 || formData.latitude > 90) {
      methods.setError('name', {
        type: 'manual',
        message: 'Please select a valid location on the map'
      });
      return false;
    }

    return nameValid;
  };

  const validateArrayStep = async () => {
    const basicValid = await methods.trigger(['arrays'] as const);
    const formData = methods.getValues();

    if (!formData.arrays || formData.arrays.length === 0) {
      toast.error('Please add at least one array configuration');
      return false;
    }

    const array = formData.arrays[0];
    if (!array.panelId) {
      toast.error('Please select a solar panel for your array');
      return false;
    }

    if (!array.quantity || array.quantity < 1) {
      toast.error('Please specify a valid number of panels (minimum 1)');
      return false;
    }

    if (array.quantity > 1000) {
      toast.error('Number of panels seems too high. Please verify your system size.');
      return false;
    }

    if (!array.tilt || array.tilt < 0 || array.tilt > 90) {
      toast.error('Please specify a valid tilt angle (0-90 degrees)');
      return false;
    }

    if (!array.azimuth || array.azimuth < 0 || array.azimuth > 360) {
      toast.error('Please specify a valid azimuth angle (0-360 degrees)');
      return false;
    }

    // Check for reasonable loss values
    if (array.losses && (array.losses < 0 || array.losses > 50)) {
      toast.error('System losses should be between 0% and 50%');
      return false;
    }

    return basicValid;
  };

  const validateInvertersStep = async () => {
    const basicValid = await methods.trigger(['inverters'] as const);
    const formData = methods.getValues();

    console.log('validateInvertersStep - formData:', formData);
    console.log('validateInvertersStep - inverters:', formData.inverters);
    console.log('validateInvertersStep - inverters.length:', formData.inverters?.length);

    if (!formData.inverters || formData.inverters.length === 0) {
      console.error('No inverters found in form data');
      toast.error('Please add at least one inverter to your system');
      return false;
    }

    const inverter = formData.inverters[0];
    console.log('validateInvertersStep - selected inverter:', inverter);

    if (!inverter) {
      console.error('Inverter at index 0 is undefined');
      toast.error('Please select an inverter for your system');
      return false;
    }

    if (!inverter.maker || !inverter.model) {
      console.error('Inverter missing maker or model:', inverter);
      toast.error('Please select an inverter for your system');
      return false;
    }

    // Calculate total array power
    const totalArrayPower = formData.arrays?.reduce((sum: number, arr: any) => {
      const panel = formData.panels?.find((p: any) => p.id === arr.panelId);
      return sum + ((panel?.power || 0) * arr.quantity);
    }, 0) || 0;

    // Check if inverter can handle the array power
    const totalInverterPower = formData.inverters.reduce((sum: number, inv: any) => {
      const power = inv?.maxOutputPower || 0;
      console.log('validateInvertersStep - inverter power:', inv?.model, power);
      return sum + power;
    }, 0);

    console.log('validateInvertersStep - totalArrayPower:', totalArrayPower);
    console.log('validateInvertersStep - totalInverterPower:', totalInverterPower);

    if (totalInverterPower < totalArrayPower * 0.8) {
      toast.warning('Inverter capacity seems low for your array size. This may affect system performance.');
    }

    if (totalInverterPower > totalArrayPower * 1.5) {
      toast.warning('Inverter capacity seems high for your array size. This may increase costs unnecessarily.');
    }

    return basicValid;
  };

  const validateMountingStep = async () => {
    const basicValid = await methods.trigger(['arrays'] as const);
    const formData = methods.getValues();

    if (!formData.arrays || formData.arrays.length === 0) {
      toast.error('Please complete the array configuration first');
      return false;
    }

    // Validate mounting type for each array
    for (const [index, array] of formData.arrays.entries()) {
      if (!array.racking) {
        toast.error(`Please select a mounting type for array ${index + 1}`);
        return false;
      }
    }

    return basicValid;
  };

  const validateMiscEquipmentStep = async () => {
    const basicValid = await methods.trigger(['batteryBanks', 'chargeControllers', 'loads'] as const);
    const formData = methods.getValues();

    // Validate battery banks if present
    if (formData.batteryBanks && formData.batteryBanks.length > 0) {
      for (const [index, battery] of formData.batteryBanks.entries()) {
        if (!battery.maker || !battery.model) {
          toast.error(`Please select a battery model for battery bank ${index + 1}`);
          return false;
        }
      }
    }

    // Validate charge controllers if present
    if (formData.chargeControllers && formData.chargeControllers.length > 0) {
      for (const [index, controller] of formData.chargeControllers.entries()) {
        if (!controller.maker || !controller.model) {
          toast.error(`Please select a charge controller ${index + 1}`);
          return false;
        }
      }
    }

    // Validate loads if present
    if (formData.loads && formData.loads.length > 0) {
      for (const [index, load] of formData.loads.entries()) {
        if (!load.name || load.name.trim().length < 2) {
          toast.error(`Please provide a name for load ${index + 1}`);
          return false;
        }

        if (!load.power || load.power <= 0) {
          toast.error(`Please specify a valid power for load ${index + 1}`);
          return false;
        }

        if (!load.hours || load.hours <= 0) {
          toast.error(`Please specify valid hours for load ${index + 1}`);
          return false;
        }
      }
    }

    return basicValid;
  };

  // No validation needed for report step
  const validateReportStep = async () => {
    const formData = methods.getValues();

    // Final validation before simulation
    if (!formData.arrays || formData.arrays.length === 0) {
      toast.error('Please complete array configuration before generating simulation');
      return false;
    }

    if (!formData.inverters || formData.inverters.length === 0) {
      toast.error('Please complete inverter configuration before generating simulation');
      return false;
    }

    return true;
  };

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

    const result = {
      site: {
        latitude: project.latitude || 45.0,
        longitude: project.longitude || -75.0,
        altitude: project.elevation || 100,
        timezone: 'UTC',
        albedo: array.albedo || 0.25
      },
      panel: {
        max_power: panel.power || 250,
        open_circuit_voltage: panel.openCircuitVoltage || 38,
        short_circuit_current: panel.shortCircuitCurrent || 9,
        voltage_at_pmax: panel.voltageAtPmax || 30,
        current_at_pmax: panel.currentAtPmax || 8,
        temp_coeff_voc: panel.tempCoeffVoc || -0.003,
        temp_coeff_isc: panel.tempCoeffIsc || 0.0005
      },
      array: {
        modules_per_string: modulesPerString,
        strings_in_parallel: stringsInParallel,
        tilt_angle: array.tilt || 30,
        azimuth_angle: array.azimuth || 180,
        mounting_height: 2,
        ground_coverage_ratio: 0.3
      },
      inverter: {
        nominal_output_power: inverter.maxOutputPower || (panel.power * array.quantity),
        max_dc_voltage: inverter.maxInputVoltage || (panel.voltageAtPmax * modulesPerString),
        max_input_current: inverter.maxInputCurrent || 20,
        efficiency: 0.96
      },
      year: 2023
    };

    // Fix: The API appears to interpret positive latitude as South instead of North
    // Negate the latitude to get correct seasonal patterns
    result.site.latitude = -(result.site.latitude);

    console.log('Sending to API - Fixed coordinates:', {
      originalLatitude: project.latitude,
      originalLongitude: project.longitude,
      sendingLatitude: result.site.latitude,
      sendingLongitude: result.site.longitude,
      note: 'Latitude negated to fix southern hemisphere bug in API'
    });

    const apiRequestData = result;

    // Only include battery if user has selected battery banks in their project
    if (project.batteryBanks && project.batteryBanks.length > 0) {
      (result as any).battery = {
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

    // Show loading state
    const loadingToastId = toast.loading('Validating your data...');

    try {
      console.log('handleNext - Starting validation for step:', currentStep, steps[currentStep].title);
      const isValid = await validateCurrentStep();
      console.log('handleNext - Validation result:', isValid);

      toast.dismiss(loadingToastId);

      if (!isValid) {
        console.log('handleNext - Validation failed, not proceeding to next step');
        // Find the first error field and focus on it
        const errors = methods.formState.errors;
        const firstErrorField = Object.keys(errors)[0];

        if (firstErrorField) {
          // Scroll to the error field
          const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }

        // Show error summary
        const errorCount = Object.keys(errors).length;
        toast.error(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before continuing`);

        return;
      }

      console.log('handleNext - Validation passed, proceeding to next step');
      // If validation passes, proceed to next step
      if (currentStep === steps.length - 1) {
        // On the report step, trigger simulation
        setIsSimulating(true);
        const simulationToastId = toast.loading('Running simulation... This may take a few seconds.');

        try {
          // Use pvProject state instead of form values for better data consistency
          console.log('PVProject structure for simulation:', {
            projectKeys: Object.keys(pvProject),
            arraysLength: pvProject.arrays?.length,
            panelsLength: pvProject.panels?.length,
            invertersLength: pvProject.inverters?.length,
          });

          // Transform the PVProject data to the format expected by the API
          const apiRequestData = transformPVProjectToAPIFormat(pvProject);

          console.log('Sending simulation request:', apiRequestData);

          // Add timeout to the simulation request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

          const response = await fetch('http://localhost:8001/simulate/year', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiRequestData),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          toast.dismiss(simulationToastId);

          if (!response.ok) {
            let errorMessage = 'Simulation request failed';

            if (response.status === 0) {
              errorMessage = 'Cannot connect to simulation server. Please ensure the PV simulation server is running on port 8001.\n\nTo start the server, run:\ncd server/pvlib_api && ./run_api.sh';
            } else if (response.status === 404) {
              errorMessage = 'Simulation endpoint not found. Please check if the correct API server is running on port 8001.\n\nThe server should be started with: ./run_api.sh';
            } else if (response.status === 408) {
              errorMessage = 'Simulation request timed out. The system may be overloaded. Please try again.';
            } else if (response.status >= 500) {
              errorMessage = `Server error (${response.status}): The simulation server encountered an internal error. Please check the server logs or try again later.`;
            } else if (response.status === 429) {
              errorMessage = 'Too many simulation requests. Please wait a moment and try again.';
            } else {
              errorMessage = `HTTP error! status: ${response.status}. Please check the server configuration.`;
            }

            throw new Error(errorMessage);
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
            toast.success('Simulation completed successfully!');
          } else {
            throw new Error(result.message || result.error_message || 'Simulation failed: The simulation engine could not process your system configuration. Please check your inputs and try again.');
          }
        } catch (error) {
          console.error('Error running simulation:', error);

          let errorMessage = 'An unexpected error occurred during simulation';

          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              errorMessage = 'Simulation timed out. The system may be overloaded. Please try again with a simpler configuration.';
            } else if (error.message.includes('fetch')) {
              errorMessage = 'Cannot connect to simulation server. Please ensure the PV simulation server is running on port 8001.\n\nTo start the server:\n1. Open terminal\n2. Navigate to: cd server/pvlib_api\n3. Run: ./run_api.sh\n\nThen try the simulation again.';
            } else {
              errorMessage = error.message;
            }
          }

          toast.error(`Simulation failed: ${errorMessage}`, {
            duration: 10000,
            action: {
              label: 'Troubleshoot',
              onClick: () => {
                window.open('/docs/troubleshooting', '_blank');
              }
            }
          });
        } finally {
          setIsSimulating(false);
        }
      } else {
        // Move to next step
        console.log('handleNext - Advancing to step:', currentStep + 1);
        setCurrentStep((prev: number) => {
          const next = prev + 1;
          console.log('handleNext - Current step changed from', prev, 'to', next);
          return next;
        });

        // Scroll to top of new step
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Show success message for completed steps
        toast.success(`Step completed: ${steps[currentStep].title}`, {
          duration: 2000
        });
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error('handleNext - Exception during validation or step advancement:', error);

      if (error instanceof Error) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error('An unexpected error occurred during validation');
      }

      console.error('Error in handleNext:', error);
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