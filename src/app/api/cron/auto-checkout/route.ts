import { NextResponse } from "next/server";

/**
 * Cron job endpoint for auto-checkout
 * This should be called periodically (e.g., every hour) by a cron service
 * You can use services like:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron services (cron-job.org)
 */
export async function GET() {
  try {
    // Call the auto-checkout API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/bookings/auto-checkout`, {
      method: "POST",
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...data,
    });
  } catch (error) {
    console.error("[CRON AUTO-CHECKOUT] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run auto-checkout cron job",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
