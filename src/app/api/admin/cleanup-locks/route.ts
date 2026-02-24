import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Delete all expired temporary locks
    const result = await prisma.booking.deleteMany({
      where: {
        customerName: "Temporary Lock",
        OR: [
          {
            // Expired locks (past lockedUntil time)
            lockedUntil: {
              lt: new Date(),
            },
          },
          {
            // Old locks without lockedUntil (created more than 1 hour ago)
            lockedUntil: null,
            createdAt: {
              lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            },
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Cleaned up ${result.count} expired temporary locks`,
    });
  } catch (error) {
    console.error("Error cleaning up temporary locks:", error);
    return NextResponse.json(
      { error: "Failed to cleanup temporary locks" },
      { status: 500 }
    );
  }
}

// Also allow GET for manual cleanup
export async function GET() {
  return POST();
}
