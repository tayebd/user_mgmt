'use client';

import React from "react";
import { z } from "zod";
import { AutoForm, FormField, FormSection } from "@/components/shared/forms/AutoForm";
import type { PVPanel } from "@/../../server/shared/types";

const PVPanelSchema = z.object({
  maker: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  power: z.number().min(1, "Power is required"),
  efficiency: z.number().min(0).max(100, "Efficiency must be between 0 and 100"),
  type: z.string().min(1, "Panel type is required"),
  length: z.number().min(1, "Length is required"),
  width: z.number().min(1, "Width is required"),
  warranty: z.number().min(1, "Warranty is required"),
  description: z.string().optional(),
});

type PVPanelFormValues = z.infer<typeof PVPanelSchema>;

interface PVPanelFormEnhancedProps {
  initialData?: Partial<PVPanel>;
  onSubmit: (data: PVPanelFormValues) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  title?: string;
}

export default function PVPanelFormEnhanced({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  title = "Solar Panel Specifications"
}: PVPanelFormEnhancedProps) {
  const formSections: FormSection[] = [
    {
      title: "Basic Information",
      description: "Enter the basic specifications of the solar panel",
      fields: [
        {
          name: "maker",
          label: "Manufacturer",
          type: "text",
          placeholder: "Enter manufacturer name",
          required: true,
          description: "The company that manufactured the solar panel"
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
          placeholder: "Enter panel description",
          description: "Additional details about the panel"
        }
      ]
    },
    {
      title: "Technical Specifications",
      description: "Enter the technical specifications of the solar panel",
      fields: [
        {
          name: "power",
          label: "Power Rating (W)",
          type: "number",
          placeholder: "Enter power rating",
          required: true,
          description: "Maximum power output in watts"
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
          name: "type",
          label: "Panel Type",
          type: "select",
          required: true,
          options: [
            { value: "monocrystalline", label: "Monocrystalline" },
            { value: "polycrystalline", label: "Polycrystalline" },
            { value: "thinfilm", label: "Thin Film" }
          ],
          description: "The technology type of the solar panel"
        }
      ]
    },
    {
      title: "Physical Dimensions",
      description: "Enter the physical dimensions of the solar panel",
      fields: [
        {
          name: "length",
          label: "Length (mm)",
          type: "number",
          placeholder: "Enter length",
          required: true,
          description: "Panel length in millimeters"
        },
        {
          name: "width",
          label: "Width (mm)",
          type: "number",
          placeholder: "Enter width",
          required: true,
          description: "Panel width in millimeters"
        }
      ]
    },
    {
      title: "Warranty Information",
      description: "Enter warranty details for the solar panel",
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

  const handleSubmit = async (data: PVPanelFormValues) => {
    await onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AutoForm
        schema={PVPanelSchema}
        sections={formSections}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        initialData={initialData}
        loading={loading}
        title={title}
        description="Add or edit solar panel specifications"
        submitText="Save Solar Panel"
        cancelText="Cancel"
      />
    </div>
  );
}