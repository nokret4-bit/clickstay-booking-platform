import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBookingQRCode } from "@/lib/qrcode";
import { format } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const session = await getServerSession();
    
    // Get booking code from query params for public access
    const { searchParams } = new URL(request.url);
    const bookingCode = searchParams.get("code");

    // Fetch booking with related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        facility: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Authorization check:
    // 1. If user is authenticated and owns the booking OR is admin/staff, allow access
    // 2. OR if valid booking code is provided (for public access), allow access
    let hasAccess = false;

    if (session?.user) {
      const isOwner = booking.userId === session.user.id;
      const isAdminOrStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
      hasAccess = isOwner || isAdminOrStaff;
    }

    // Public access with booking code
    if (!hasAccess && bookingCode) {
      hasAccess = booking.code === bookingCode;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized - Please provide valid credentials or booking code" },
        { status: 401 }
      );
    }

    // Generate QR code
    const qrCodeDataUrl = await generateBookingQRCode({
      bookingId: booking.id,
      bookingCode: booking.code,
      customerName: booking.customerName,
      facilityUnit: booking.facility.name,
      checkInDate: format(booking.startDate, "yyyy-MM-dd"),
    });

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      bookingCode: booking.code,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: "Failed to generate QR code",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
