'use client';

import React from "react";
import { z } from "zod";
import { AutoForm, FormField, FormSection } from "@/components/shared/forms/AutoForm";
import type { Inverter } from "@/../../server/shared/types";

const InverterSchema = z.object({
  maker: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  maxOutputPower: z.number().min(1, "Power rating is required"),
  efficiency: z.number().min(0).max(100, "Efficiency must be between 0 and 100"),
  phaseType: z.string().min(1, "Phase type is required"),
  outputVoltage: z.number().min(1, "Output voltage is required"),
  maxOutputCurrent: z.number().min(1, "Max output current is required"),
  maxInputVoltage: z.number().min(1, "Max input voltage is required"),
  minInputVoltage: z.number().min(1, "Min input voltage is required"),
  warranty: z.number().min(1, "Warranty is required"),
  description: z.string().optional(),
});

type InverterFormValues = z.infer<typeof InverterSchema>;

interface InverterFormEnhancedProps {
  initialData?: Partial<Inverter>;
  onSubmit: (data: InverterFormValues) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  title?: string;
}

export default function InverterFormEnhanced({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  title = "Inverter Specifications"
}: InverterFormEnhancedProps) {
  const formSections: FormSection[] = [
    {
      title: "Basic Information",
      description: "Enter basic specifications of the inverter",
      fields: [
        {
          name: "maker",
          label: "Manufacturer",
          type: "text",
          placeholder: "Enter manufacturer name",
          required: true,
          description: "The company that manufactured the inverter"
        },
        {
          name: "model",
          label: "Model Number",
          type: "text",
          placeholder: "Enter model number",
          required: true,
          description: "The specific model identifier"
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Enter inverter description",
          description: "Additional details about the inverter"
        }
      ]
    },
    {
      title: "Power Specifications",
      description: "Enter power and efficiency specifications",
      fields: [
        {
          name: "maxOutputPower",
          label: "Max Output Power (W)",
          type: "number",
          placeholder: "Enter maximum output power",
          required: true,
          description: "Maximum continuous power output in watts"
        },
        {
          name: "efficiency",
          label: "Efficiency (%)",
          type: "number",
          placeholder: "Enter efficiency",
          required: true,
          description: "Conversion efficiency percentage"
        },
        {
          name: "phaseType",
          label: "Phase Type",
          type: "select",
          required: true,
          options: [
            { value: "Single Phase", label: "Single Phase" },
            { value: "Three Phase", label: "Three Phase" },
            { value: "Split Phase", label: "Split Phase" }
          ],
          description: "The electrical phase configuration"
        }
      ]
    },
    {
      title: "Voltage Specifications",
      description: "Enter input and voltage specifications",
      fields: [
        {
          name: "outputVoltage",
          label: "Output Voltage (V)",
          type: "number",
          placeholder: "Enter output voltage",
          required: true,
          description: "AC output voltage"
        },
        {
          name: "maxInputVoltage",
          label: "Max Input Voltage (V)",
          type: "number",
          placeholder: "Enter maximum input voltage",
          required: true,
          description: "Maximum DC input voltage"
        },
        {
          name: "minInputVoltage",
          label: "Min Input Voltage (V)",
          type: "number",
          placeholder: "Enter minimum input voltage",
          required: true,
          description: "Minimum DC input voltage for MPPT operation"
        }
      ]
    },
    {
      title: "Current Specifications",
      description: "Enter current specifications",
      fields: [
        {
          name: "maxOutputCurrent",
          label: "Max Output Current (A)",
          type: "number",
          placeholder: "Enter maximum output current",
          required: true,
          description: "Maximum continuous output current"
        }
      ]
    },
    {
      title: "Warranty Information",
      description: "Enter warranty details for the inverter",
      fields: [
        {
          name: "warranty",
          label: "Warranty Period (years)",
          type: "number",
          placeholder: "Enter warranty period",
          required: true,
          description: "Manufacturer warranty duration in years"
        }
      ]
    }
  ];

  const handleSubmit = async (data: InverterFormValues) => {
    await onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AutoForm
        schema={InverterSchema}
        sections={formSections}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        initialData={initialData}
        loading={loading}
        title={title}
        description="Add or edit inverter specifications"
        submitText="Save Inverter"
        cancelText="Cancel"
      />
    </div>
  );
}