import React from "react";
import PVPanel from "@/components/PVPanel";

export default function PVPanelsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Solar Panel Configuration</h1>
      <PVPanel />
    </div>
  );
}
