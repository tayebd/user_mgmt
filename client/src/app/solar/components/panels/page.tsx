import React from "react";
import SolarPanel from "@/components/solar/components/SolarPanel";

export default function SolarPanelsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Solar Panel Configuration</h1>
      <SolarPanel />
    </div>
  );
}
