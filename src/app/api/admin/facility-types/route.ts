import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get distinct facility kinds as facility types
    const facilities = await prisma.facility.findMany({
      select: {
        kind: true,
      },
      distinct: ['kind'],
      orderBy: { kind: "asc" },
    });

    // Transform to match expected format
    const facilityTypes = facilities.map(f => ({
      id: f.kind,
      name: f.kind.charAt(0) + f.kind.slice(1).toLowerCase(),
      kind: f.kind
    }));

    return NextResponse.json({ facilityTypes });
  } catch (error) {
    console.error("Get facility types error:", error);
    return NextResponse.json({ error: "Failed to fetch facility types" }, { status: 500 });
  }
}
