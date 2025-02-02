import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return the available component categories
    const components = [
      {
        id: "solar-panels",
        name: "Solar Panels",
        path: "/solar/components/panels"
      },
      {
        id: "inverters",
        name: "Inverters",
        path: "/solar/components/inverters"
      },
      {
        id: "mounting",
        name: "Mounting Hardware",
        path: "/solar/components/mounting"
      },
      {
        id: "mounting-cost",
        name: "Mounting Cost",
        path: "/solar/components/mounting-cost"
      }
    ];
    
    return NextResponse.json(components);
  } catch (error) {
    console.error("Error fetching component categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch component categories" },
      { status: 500 }
    );
  }
}
