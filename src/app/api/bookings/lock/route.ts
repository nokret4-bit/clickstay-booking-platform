import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const LockRequestSchema = z.object({
  facilityId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const LOCK_DURATION_MINUTES = 5; // 5 minutes lock - reduced to minimize database usage

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Lock request body:", body);
    
    const validated = LockRequestSchema.parse(body);
    console.log("Validated lock request:", validated);

    const startDate = new Date(validated.startDate);
    const endDate = new Date(validated.endDate);
    
    // Validate dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }
    
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);

    // Clean up expired locks first
    await prisma.booking.deleteMany({
      where: {
        lockedUntil: {
          lt: new Date(),
        },
        status: "PENDING",
        customerName: "Temporary Lock",
      },
    });

    // Check if facility exists
    const facility = await prisma.facility.findUnique({
      where: { id: validated.facilityId, isActive: true },
    });

    if (!facility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    // Check for existing bookings that conflict with the dates
    // Exclude temporary locks - they will be checked separately
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        facilityId: validated.facilityId,
        status: {
          in: ["CONFIRMED", "PENDING", "CHECKED_IN"],
        },
        customerName: {
          not: "Temporary Lock",
        },
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      console.log("[Lock API] Found conflicting bookings:", conflictingBookings.map(b => ({
        id: b.id,
        code: b.code,
        customerName: b.customerName,
        status: b.status,
      })));
      return NextResponse.json(
        { error: "Facility is already booked for these dates" },
        { status: 409 }
      );
    }

    // Check for existing locks that haven't expired
    const existingLocks = await prisma.booking.findMany({
      where: {
        facilityId: validated.facilityId,
        lockedUntil: {
          gt: new Date(),
        },
        status: "PENDING",
      },
    });

    if (existingLocks.length > 0) {
      return NextResponse.json(
        { 
          error: "Facility is temporarily reserved by another customer",
          availableAt: existingLocks[0].lockedUntil || new Date(),
        },
        { status: 409 }
      );
    }

    // Create a temporary lock record
    const lockId = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // We create a pending booking with lock details
    const lockedBooking = await prisma.booking.create({
      data: {
        id: lockId,
        code: `TEMP_${Date.now()}`,
        facilityId: validated.facilityId,
        startDate,
        endDate,
        status: "PENDING",
        customerName: "Temporary Lock",
        customerEmail: "lock@temp.com",
        totalAmount: 0, // Will be updated when actual booking is made
        updatedAt: new Date(),
        lockedUntil: lockUntil,
        lockedBy: lockId, // Use the lock ID as identifier
      },
    });

    return NextResponse.json({
      success: true,
      lockId: lockedBooking.id,
      lockedUntil: lockUntil,
      message: `Facility reserved for ${LOCK_DURATION_MINUTES} minutes`,
    });

  } catch (error) {
    console.error("Lock API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to lock facility" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lockId = searchParams.get("lockId");

    if (!lockId) {
      return NextResponse.json(
        { error: "Lock ID is required" },
        { status: 400 }
      );
    }

    // Remove the lock
    const deletedLock = await prisma.booking.deleteMany({
      where: {
        id: lockId,
        status: "PENDING",
        customerName: "Temporary Lock",
      },
    });

    if (deletedLock.count === 0) {
      return NextResponse.json(
        { error: "Lock not found or already removed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lock removed successfully",
    });

  } catch (error) {
    console.error("Unlock API error:", error);
    return NextResponse.json(
      { error: "Failed to remove lock" },
      { status: 500 }
    );
  }
}
