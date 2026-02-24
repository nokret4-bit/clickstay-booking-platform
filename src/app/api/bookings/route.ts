import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { CreateBookingSchema } from "@/schemas/booking";
import { BookingStatus } from "@prisma/client";
import { calculatePrice } from "@/lib/pricing";
import { generateBookingCode } from "@/lib/utils";
import crypto from "crypto";
import { parseISO, format } from "date-fns";
import { checkAvailability } from "@/lib/availability";
import { sendBookingConfirmationEmail } from "@/lib/email/mailer";

export async function POST(request: NextRequest) {
  try {
    // Clean up expired temporary locks to free database space
    await prisma.booking.deleteMany({
      where: {
        customerName: "Temporary Lock",
        OR: [
          {
            lockedUntil: {
              lt: new Date(),
            },
          },
          {
            lockedUntil: null,
            createdAt: {
              lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            },
          },
        ],
      },
    });

    const body = await request.json();
    const validated = CreateBookingSchema.parse(body);
    const session = await getServerSession();

    const startDate = parseISO(validated.startDate);
    const endDate = parseISO(validated.endDate);

    // Check availability
    const isAvailable = await checkAvailability(validated.unitId, startDate, endDate);
    if (!isAvailable) {
      return NextResponse.json(
        { error: "Facility not available" },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricing = await calculatePrice(validated.unitId, startDate, endDate);

    // Create booking with AWAITING_PAYMENT status
    const bookingCode = generateBookingCode();

    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        code: bookingCode,
        userId: session?.user?.id,
        facilityId: validated.unitId,
        startDate,
        endDate,
        guests: 1,
        status: BookingStatus.PENDING,
        customerName: validated.customerName,
        customerEmail: validated.customerEmail,
        customerPhone: validated.customerPhone,
        totalAmount: pricing.totalAmount,
        paymentType: validated.paymentType || "FULL",
        depositAmount: validated.depositAmount ? validated.depositAmount.toString() : null,
        notes: validated.specialRequests,
        updatedAt: new Date(),
      },
      include: {
        facility: true,
      },
    });

    // Log audit (only for authenticated users)
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE_BOOKING",
          entity: "Booking",
          entityId: booking.id,
          data: { bookingCode, status: booking.status },
        },
      });
    }

    // Send booking confirmation email
    try {
      await sendBookingConfirmationEmail({
        bookingCode: booking.code,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        facilityName: booking.facility.name,
        checkInDate: format(booking.startDate, 'MMMM dd, yyyy'),
        checkOutDate: format(booking.endDate, 'MMMM dd, yyyy'),
        totalAmount: `₱${Number(booking.totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        guests: booking.guests,
        status: booking.status,
      });
      console.log(`✅ Booking confirmation email sent to ${booking.customerEmail}`);
    } catch (emailError) {
      console.error("⚠️ Failed to send booking confirmation email:", emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      bookingId: booking.id,
      code: booking.code,
      status: booking.status,
      totalAmount: booking.totalAmount,
    });
  } catch (error) {
    console.error("Create booking API error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        facility: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Get bookings API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
