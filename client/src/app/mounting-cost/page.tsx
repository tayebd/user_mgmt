import React from "react";
import MountingCost from "@/components/MountingCost";

export default function MountingCostPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mounting Cost Calculator</h1>
      <MountingCost />
    </div>
  );
}
