import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pricing feature is not implemented yet
    return NextResponse.json(
      { error: "Pricing management feature is not yet implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Create rate plan error:", error);
    return NextResponse.json({ error: "Failed to create rate plan" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return empty array for now
    return NextResponse.json({ ratePlans: [] });
  } catch (error) {
    console.error("Get rate plans error:", error);
    return NextResponse.json({ error: "Failed to fetch rate plans" }, { status: 500 });
  }
}
