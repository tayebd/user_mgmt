import React from "react";
import InverterList from "./InverterList";

export default function InvertersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inverter Configuration</h1>
      <InverterList />
    </div>
  );
}
