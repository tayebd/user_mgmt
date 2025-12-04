'use client';

import React from "react";
import { z } from "zod";
import { AutoForm, FormField, FormSection } from "@/components/shared/forms/AutoForm";
import type { Organization } from "@/types";

const OrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  address: z.string().min(1, "Address is required"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  iconUrl: z.string().url("Invalid icon URL").optional().or(z.literal("")),
  capabilities: z.string().min(1, "Capabilities are required"),
  established: z.date().optional(),
  badge: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

type OrganizationFormValues = z.infer<typeof OrganizationSchema>;

interface OrganizationFormEnhancedProps {
  initialData?: Partial<Organization>;
  onSubmit: (data: OrganizationFormValues) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  title?: string;
}

export default function OrganizationFormEnhanced({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  title = "Organization Information"
}: OrganizationFormEnhancedProps) {
  const formSections: FormSection[] = [
    {
      title: "Basic Information",
      description: "Enter basic details about the organization",
      fields: [
        {
          name: "name",
          label: "Organization Name",
          type: "text",
          placeholder: "Enter organization name",
          required: true,
          description: "The official name of the organization"
        },
        {
          name: "address",
          label: "Address",
          type: "text",
          placeholder: "Enter organization address",
          required: true,
          description: "Physical location or headquarters address"
        },
        {
          name: "website",
          label: "Website",
          type: "text",
          placeholder: "https://example.com",
          description: "Official website URL",
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "text",
          placeholder: "+1 (555) 123-4567",
          required: true,
          description: "Contact phone number"
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          placeholder: "contact@example.com",
          description: "General contact email address"
        }
      ]
    },
    {
      title: "Branding",
      description: "Upload organization logo and set visual identity",
      fields: [
        {
          name: "iconUrl",
          label: "Logo URL",
          type: "text",
          placeholder: "https://example.com/logo.png",
          description: "URL to the organization's logo image"
        },
        {
          name: "badge",
          label: "Status Badge",
          type: "select",
          options: [
            { value: "Verified", label: "Verified" },
            { value: "Screened", label: "Screened" },
            { value: "Pending", label: "Pending" }
          ],
          description: "Verification status of the organization"
        }
      ]
    },
    {
      title: "Business Information",
      description: "Enter details about the organization's capabilities and history",
      fields: [
        {
          name: "capabilities",
          label: "Capabilities",
          type: "textarea",
          placeholder: "Enter organization capabilities and services",
          required: true,
          description: "Describe what the organization specializes in"
        },
        {
          name: "established",
          label: "Established Date",
          type: "date",
          description: "When the organization was founded"
        },
        {
          name: "rating",
          label: "Rating (1-5)",
          type: "number",
          placeholder: "5",
          description: "Organization rating on a scale of 1-5"
        }
      ]
    }
  ];

  const handleSubmit = async (data: OrganizationFormValues) => {
    await onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AutoForm
        schema={OrganizationSchema}
        sections={formSections}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        initialData={initialData}
        loading={loading}
        title={title}
        description="Add or edit organization information"
        submitText="Save Organization"
        cancelText="Cancel"
      />
    </div>
  );
}