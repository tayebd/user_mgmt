'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mountingHardwareSchema = z.object({
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Mounting type is required"),
  material: z.string().min(1, "Material is required"),
  tiltAngle: z.string().min(1, "Tilt angle is required"),
  windRating: z.string().min(1, "Wind rating is required"),
  warranty: z.string().min(1, "Warranty information is required"),
  quantity: z.string().min(1, "Quantity is required"),
});

type MountingHardwareFormValues = z.infer<typeof mountingHardwareSchema>;

export default function MountingHardware() {
  const form = useForm<MountingHardwareFormValues>({
    resolver: zodResolver(mountingHardwareSchema),
    defaultValues: {
      manufacturer: "",
      model: "",
      type: "",
      material: "",
      tiltAngle: "",
      windRating: "",
      warranty: "",
      quantity: "",
    },
  });

  async function onSubmit(data: MountingHardwareFormValues) {
    try {
      // TODO: Implement API call to save mounting hardware data
      console.log(data);
    } catch (error) {
      console.error("Error saving mounting hardware data:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mounting Hardware Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manufacturer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mounting Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mounting type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Mount</SelectItem>
                        <SelectItem value="adjustable">Adjustable Mount</SelectItem>
                        <SelectItem value="tracking">Tracking System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aluminum">Aluminum</SelectItem>
                        <SelectItem value="steel">Steel</SelectItem>
                        <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiltAngle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tilt Angle (degrees)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tilt angle" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="windRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Rating (mph)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter wind rating" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warranty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty (years)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter warranty period" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter quantity" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Save Mounting Hardware
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
