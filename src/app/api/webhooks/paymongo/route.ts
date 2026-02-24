import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, parseEvent } from "@/lib/payments/paymongo";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "@/lib/email/mailer";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paymongo-signature") || "";

    // Verify webhook signature (optional in development)
    if (process.env.NODE_ENV === "production" && !verifyWebhookSignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = parseEvent(payload);

    console.log("[WEBHOOK] PayMongo event received:", {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString(),
    });

    // Handle payment success events
    // PayMongo sends 'source.chargeable' for GCash payments when they're paid
    if (
      event.type === "source.chargeable" ||
      event.type === "payment.paid" ||
      event.type === "payment.succeeded"
    ) {
      console.log("[WEBHOOK] Processing payment success for:", event.id);
      await handlePaymentSuccess(event.id);
    } else {
      console.log("[WEBHOOK] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(transactionId: string) {
  try {
    console.log("[WEBHOOK] Looking up payment for transaction:", transactionId);
    
    // Find payment by transaction ID
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
      include: {
        booking: {
          include: {
            facility: true,
          },
        },
      },
    });

    if (!payment) {
      console.error("[WEBHOOK] ❌ Payment not found for transaction:", transactionId);
      return;
    }

    console.log("[WEBHOOK] Found payment:", {
      paymentId: payment.id,
      bookingCode: payment.booking.code,
      currentStatus: payment.status,
    });

    // Check if already processed
    if (payment.status === PaymentStatus.PAID) {
      console.log("[WEBHOOK] ⚠️ Payment already processed:", transactionId);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        updatedAt: new Date(),
      },
      include: {
        facility: true,
      },
    });

    console.log(`[WEBHOOK] ✅ Payment and booking status updated:`, {
      bookingCode: updatedBooking.code,
      bookingStatus: updatedBooking.status,
      paymentStatus: PaymentStatus.PAID,
    });

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(
      updatedBooking.customerEmail,
      updatedBooking.code,
      `₱${Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      payment.paymentMethod || "GCash"
    );

    // Send booking confirmation email with QR code
    await sendBookingConfirmationEmail({
      bookingCode: updatedBooking.code,
      customerName: updatedBooking.customerName,
      customerEmail: updatedBooking.customerEmail,
      facilityName: updatedBooking.facility.name,
      checkInDate: format(updatedBooking.startDate, 'MMMM dd, yyyy'),
      checkOutDate: format(updatedBooking.endDate, 'MMMM dd, yyyy'),
      totalAmount: `₱${Number(updatedBooking.totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      guests: updatedBooking.guests,
      status: updatedBooking.status,
    });

    console.log(`[WEBHOOK] ✅ Confirmation emails sent to ${updatedBooking.customerEmail}`);
  } catch (error) {
    console.error("[WEBHOOK] ❌ Error handling payment success:", error);
    if (error instanceof Error) {
      console.error("[WEBHOOK] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}
