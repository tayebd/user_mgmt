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

const solarPanelSchema = z.object({
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  wattage: z.string().min(1, "Wattage is required"),
  efficiency: z.string().min(1, "Efficiency is required"),
  type: z.string().min(1, "Panel type is required"),
  dimensions: z.string().min(1, "Dimensions are required"),
  warranty: z.string().min(1, "Warranty information is required"),
  quantity: z.string().min(1, "Quantity is required"),
});

type SolarPanelFormValues = z.infer<typeof solarPanelSchema>;

export default function SolarPanel() {
  const form = useForm<SolarPanelFormValues>({
    resolver: zodResolver(solarPanelSchema),
    defaultValues: {
      manufacturer: "",
      model: "",
      wattage: "",
      efficiency: "",
      type: "",
      dimensions: "",
      warranty: "",
      quantity: "",
    },
  });

  async function onSubmit(data: SolarPanelFormValues) {
    try {
      // TODO: Implement API call to save solar panel data
      console.log(data);
    } catch (error) {
      console.error("Error saving solar panel data:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solar Panel Specifications</CardTitle>
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
                name="wattage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wattage (W)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter wattage" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="efficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Efficiency (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter efficiency" type="number" {...field} />
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
                    <FormLabel>Panel Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select panel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monocrystalline">Monocrystalline</SelectItem>
                        <SelectItem value="polycrystalline">Polycrystalline</SelectItem>
                        <SelectItem value="thinfilm">Thin Film</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions (LxWxH)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter dimensions" {...field} />
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
              Save Solar Panel
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
