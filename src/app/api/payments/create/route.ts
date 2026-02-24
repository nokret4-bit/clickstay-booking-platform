import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent } from "@/lib/payments/paymongo";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, returnUrl } = body;

    if (!bookingId || !returnUrl) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId and returnUrl" },
        { status: 400 }
      );
    }

    // Find the booking
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

    // Check if booking is in valid status for payment
    if (booking.status !== BookingStatus.PENDING) {
      return NextResponse.json(
        { error: "Booking is not awaiting payment" },
        { status: 400 }
      );
    }

    // Determine payment amount based on payment type
    const paymentAmount = booking.paymentType === "PARTIAL" && booking.depositAmount
      ? Number(booking.depositAmount)
      : Number(booking.totalAmount);

    // Create payment intent with PayMongo (GCash)
    const paymentIntent = await createPaymentIntent({
      amount: paymentAmount,
      currency: "PHP",
      bookingId: booking.id,
      returnUrl,
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        id: crypto.randomUUID(),
        bookingId: booking.id,
        amount: paymentAmount.toString(),
        status: PaymentStatus.PENDING,
        paymentMethod: "GCASH",
        transactionId: paymentIntent.intentId,
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Payment created for booking ${booking.code}:`, payment.id);

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: paymentIntent.checkoutUrl,
      intentId: paymentIntent.intentId,
      amount: booking.totalAmount,
      currency: "PHP",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      return NextResponse.json(
        { error: error.message, details: error.stack },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create payment", details: String(error) },
      { status: 500 }
    );
  }
}
