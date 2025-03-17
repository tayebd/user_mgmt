'use client'

import { useState, useEffect } from 'react';
import { useForm, FormProvider, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SolarProject, projectValidationSchema } from '@/types';
import { z } from 'zod';
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
import { useApiStore } from '@/state/api'; 
import { INITIAL_SOLARPROJECT_DATA } from '@/types/initialData'
import { getPVPanels, getInverters } from '@/services/equipment';
import { PVPanel, Inverter } from '@/types';

const stepValidationFields: Record<number, Path<SolarProject>[]> = {
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
  const [projectData, setSolarProject] = useState<SolarProject>(INITIAL_SOLARPROJECT_DATA);
  const { fetchSolarProject, createSolarProject } = useApiStore();
  const [pvPanels, setPVPanels] = useState<PVPanel[]>([]);
  const [inverters, setInverters] = useState<Inverter[]>([]);

  useEffect(() => {
    fetchSolarProject();
    getPVPanels().then(setPVPanels);
    getInverters().then(setInverters);
  }, [fetchSolarProject]);

  // Define the type from the Zod schema
  type ProjectFormValues = z.infer<typeof projectValidationSchema>;

  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(projectValidationSchema),
    // defaultValues: {
    //   ...INITIAL_PROJECT_DATA,
    //   id: INITIAL_PROJECT_DATA.id || 0,
    // },
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
      const formValues = methods.getValues();
      console.log('Saving project:', formValues);
      
      // Convert form values to SolarProject type
      const solarProject: SolarProject = {
        ...formValues,
        id: formValues.id || 0, // Ensure id is always set
      };
      
      await createSolarProject(solarProject);
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
              projectData={projectData}
              setSolarProject={setSolarProject}
              pvPanels={pvPanels}
              inverters={inverters}
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
  );
}
