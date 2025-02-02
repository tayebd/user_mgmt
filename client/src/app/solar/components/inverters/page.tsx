import React from "react";
import Inverter from "@/components/solar/components/Inverter";

export default function InvertersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inverter Configuration</h1>
      <Inverter />
    </div>
  );
}
