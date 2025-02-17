'use client'

import { useState, useEffect } from 'react';
import { useForm, FormProvider, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectData, projectValidationSchema } from '@/types/project';
import { ProgressIndicator } from './ProgressIndicator';
import {
  LocationStep,
  SystemAttributesStep,
  PVPanelStep,
  InverterStep,
  MountingStep,
  MiscEquipmentStep,
  ReportStep
} from './steps/index';
import { GoogleMapsProvider } from '@/contexts/GoogleMapsContext';
import { useApiStore } from '@/state/api';

const INITIAL_PROJECT_DATA: ProjectData = {
  address: '',
  coordinates: { lat: 0, lng: 0 },
  dcSystemSize: 0,
  arrayType: 'Roof Mount',
  systemLosses: 14,
  tilt: 0,
  azimuth: 180,
  bifacial: false,
  // PV Panel Selection
  selectedPanelId: '',
  pvPanelQuantity: 1,
  // Inverter Selection
  selectedInverterId: '',
  inverterQuantity: 1,
  // Mounting
  mountingType: 'Flat Roof',
  roofMaterial: '',
  // Derived Equipment
  derivedEquipment: {
    fuses: 0,
    dcSurgeProtector: 0,
    dcDisconnectSwitches: 0,
    acSurgeProtector: 0,
    generalDisconnectSwitch: 0,
    residualCurrentBreaker: 0,
    generalCircuitBreaker: 0,
    dcCableLength: 0,
    acCableLength: 0,
    earthingCableLength: 0,
    mc4ConnectorPairs: 0,
    splitters: 0,
    cableTrayLength: 0
  }
};

const stepValidationFields: Record<number, Path<ProjectData>[]> = {
  0: ['address', 'coordinates'], // Location
  1: ['dcSystemSize', 'arrayType', 'systemLosses', 'tilt', 'azimuth', 'bifacial'], // System Attributes
  2: ['selectedPanelId', 'pvPanelQuantity'], // PV Panels
  3: ['selectedInverterId', 'inverterQuantity'], // Inverters
  4: ['mountingType'], // Mounting
  5: [], // Misc Equipment
  6: [], // Report
};

export function ProjectWizard() {
  console.log('ProjectWizard rendering');

  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>(INITIAL_PROJECT_DATA);
  const { fetchProject, createProject, updateProject } = useApiStore();

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const methods = useForm<ProjectData>({
    resolver: zodResolver(projectValidationSchema),
    defaultValues: INITIAL_PROJECT_DATA,
    mode: 'onChange'
  });

  const steps = [
    { title: 'Location', component: LocationStep },
    { title: 'System Attributes', component: SystemAttributesStep },
    { title: 'PV Panels', component: PVPanelStep },
    { title: 'Inverters', component: InverterStep },
    { title: 'Mounting', component: MountingStep },
    { title: 'Misc Equipment', component: MiscEquipmentStep },
    { title: 'Report', component: ReportStep },
  ];

  const handleNext = async () => {
    const fieldsToValidate = stepValidationFields[currentStep];
    const isValid = await methods.trigger(fieldsToValidate);
    console.log('Form state:', methods.formState);
    console.log('Current step errors:', methods.formState.errors);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSave = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      const values = methods.getValues();
      console.log('Saving project:', values);
      await createProject(values);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <GoogleMapsProvider>
      <FormProvider {...methods}>
        <div className="max-w-4xl mx-auto p-6">
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
          />

          <Card className="p-6 mt-6">
            <CurrentStepComponent
              form={methods}
              projectData={projectData}
              setProjectData={setProjectData}
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
                disabled={currentStep === steps.length - 1}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </FormProvider>
    </GoogleMapsProvider>
  );
}
