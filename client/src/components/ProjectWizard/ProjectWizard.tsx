'use client'

import { useState, useEffect } from 'react';
import { useForm, FormProvider, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PVProject } from '@/shared/types';
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
import { PVProjectSchema } from '@/shared/types';

export function ProjectWizard() {
  const { createPVProject } = useApiStore();
  
  console.log('ProjectWizard rendering');
  const [currentStep, setCurrentStep] = useState(0);
  const [pvProject, setPVProject] = useState<PVProject>(INITIAL_PVPROJECT);

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

  const handleNext = async () => {
    const validateCurrentStep = stepValidationFunctions[currentStep];
    const isValid = await validateCurrentStep();
    console.log('Form state:', methods.formState);
    console.log('Current step errors:', methods.formState.errors);
    console.log('PV Project:', pvProject);


    if (isValid) {
      if (currentStep === steps.length - 1) {
        // On the report step, trigger report generation
        const formValues = methods.getValues();
        try {
          const response = await fetch('http://localhost:8001/simulate-and-report', {
              method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sim_request: formValues,
              report_request: formValues
            })
          });
          if (!response.ok) throw new Error('Failed to generate report');
          const result = await response.json();
          if (!result.success) throw new Error(result.error);
          // Update project data with simulation results and report
          // setProjectData({
          //   ...formValues,
          //   simulationResults: result.simulation_results,
          //   reportContent: result.report_content
          // });
        } catch (error) {
          console.error('Error generating report:', error);
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
              >
                {currentStep === steps.length - 1 ? 'Generate Report' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </FormProvider>
  );
}
