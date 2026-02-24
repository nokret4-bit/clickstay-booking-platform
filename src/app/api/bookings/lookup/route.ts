import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Booking code is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { code: code.trim() },
      select: {
        id: true,
        code: true,
        status: true,
        // Only return basic info for security
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Booking lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup booking" },
      { status: 500 }
    );
  }
}
