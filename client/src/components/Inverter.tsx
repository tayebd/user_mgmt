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

const inverterSchema = z.object({
  maker: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Inverter type is required"),
  powerRating: z.string().min(1, "Power rating is required"),
  efficiency: z.string().min(1, "Efficiency is required"),
  inputVoltage: z.string().min(1, "Input voltage is required"),
  outputVoltage: z.string().min(1, "Output voltage is required"),
  warranty: z.string().min(1, "Warranty information is required"),
  quantity: z.string().min(1, "Quantity is required"),
});

type InverterFormValues = z.infer<typeof inverterSchema>;

export default function Inverter() {
  const form = useForm<InverterFormValues>({
    resolver: zodResolver(inverterSchema),
    defaultValues: {
      maker: "",
      model: "",
      type: "",
      powerRating: "",
      efficiency: "",
      inputVoltage: "",
      outputVoltage: "",
      warranty: "",
      quantity: "",
    },
  });

  async function onSubmit(data: InverterFormValues) {
    try {
      // TODO: Implement API call to save inverter data
      console.log(data);
    } catch (error) {
      console.error("Error saving inverter data:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inverter Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter maker" {...field} />
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
                    <FormLabel>Inverter Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inverter type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="string">String Inverter</SelectItem>
                        <SelectItem value="microinverter">Microinverter</SelectItem>
                        <SelectItem value="central">Central Inverter</SelectItem>
                        <SelectItem value="hybrid">Hybrid Inverter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="powerRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power Rating (kW)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter power rating" type="number" {...field} />
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
                name="inputVoltage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Voltage (V)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter input voltage" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outputVoltage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Voltage (V)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter output voltage" type="number" {...field} />
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
              Save Inverter
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
