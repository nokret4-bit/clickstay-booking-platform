import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!facilityId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check for active locks
    const activeLock = await prisma.booking.findFirst({
      where: {
        facilityId,
        status: "PENDING",
        customerName: "Temporary Lock",
        lockedUntil: {
          gt: new Date(),
        },
        AND: [
          {
            startDate: { lte: new Date(startDate) },
          },
          {
            endDate: { gte: new Date(endDate) },
          },
        ],
      },
      select: {
        id: true,
        lockedUntil: true,
        lockedBy: true,
      },
    });

    if (activeLock) {
      return NextResponse.json({
        hasLock: true,
        lockId: activeLock.id,
        lockedUntil: activeLock.lockedUntil,
        lockedBy: activeLock.lockedBy,
        expiresInSeconds: Math.floor((activeLock.lockedUntil.getTime() - Date.now()) / 1000),
      });
    }

    return NextResponse.json({
      hasLock: false,
    });

  } catch (error) {
    console.error("Lock status check error:", error);
    return NextResponse.json(
      { error: "Failed to check lock status" },
      { status: 500 }
    );
  }
}
