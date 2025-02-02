import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    return NextResponse.json({ message: "Location saved successfully", data });
  } catch (error) {
    console.error("Error saving location:", error);
    return NextResponse.json(
      { error: "Failed to save location" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // In a real implementation, you would fetch location from your backend
    const location = null;
    return NextResponse.json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
