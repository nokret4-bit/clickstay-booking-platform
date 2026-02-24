import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentStatus } from "@/lib/payments/paymongo";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "@/lib/email/mailer";
import { format } from "date-fns";

/**
 * Check payment status and update booking if payment was successful
 * This serves as a fallback in case webhooks fail or are delayed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    console.log("[CHECK-STATUS] Checking payment status for booking:", bookingId);

    // Find the booking with payment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        facility: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (!booking.payment) {
      return NextResponse.json(
        { error: "No payment found for this booking" },
        { status: 404 }
      );
    }

    // If already confirmed, return success
    if (booking.status === BookingStatus.CONFIRMED && booking.payment.status === PaymentStatus.PAID) {
      console.log("[CHECK-STATUS] ✅ Booking already confirmed");
      return NextResponse.json({
        status: "confirmed",
        bookingStatus: booking.status,
        paymentStatus: booking.payment.status,
      });
    }

    // Check payment status with PayMongo
    if (!booking.payment.transactionId) {
      return NextResponse.json(
        { error: "No transaction ID found for this payment" },
        { status: 400 }
      );
    }
    
    const paymentStatus = await getPaymentStatus(booking.payment.transactionId);
    console.log("[CHECK-STATUS] PayMongo status:", paymentStatus);

    if (paymentStatus === "succeeded") {
      // Update payment status
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          updatedAt: new Date(),
        },
        include: {
          facility: true,
        },
      });

      console.log("[CHECK-STATUS] ✅ Payment confirmed, booking updated");

      // Send confirmation emails
      try {
        await sendPaymentConfirmationEmail(
          updatedBooking.customerEmail,
          updatedBooking.code,
          `₱${Number(booking.payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          booking.payment.paymentMethod || "GCash"
        );

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

        console.log("[CHECK-STATUS] ✅ Confirmation emails sent");
      } catch (emailError) {
        console.error("[CHECK-STATUS] ⚠️ Email sending failed:", emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        status: "confirmed",
        bookingStatus: updatedBooking.status,
        paymentStatus: PaymentStatus.PAID,
        message: "Payment confirmed successfully",
      });
    } else if (paymentStatus === "failed") {
      return NextResponse.json({
        status: "failed",
        bookingStatus: booking.status,
        paymentStatus: paymentStatus,
        message: "Payment failed",
      });
    } else {
      return NextResponse.json({
        status: "pending",
        bookingStatus: booking.status,
        paymentStatus: paymentStatus,
        message: "Payment is still pending",
      });
    }
  } catch (error) {
    console.error("[CHECK-STATUS] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to check payment status",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
