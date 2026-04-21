import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Cron job endpoint for facility auto-reactivation.
 * Call periodically (e.g., every 15-60 minutes) via:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron services
 */
export async function GET() {
  try {
    const now = new Date();

    const result = await prisma.facility.updateMany({
      where: {
        isActive: false,
        inactiveUntil: {
          not: null,
          lte: now,
        },
      },
      data: {
        isActive: true,
        inactiveUntil: null,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      reactivated: result.count,
    });
  } catch (error) {
    console.error("[CRON REACTIVATE-FACILITIES] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run facility reactivation cron job",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

