import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditBookingButton } from "@/components/edit-booking-button";
import { DeleteBookingButton } from "@/components/delete-booking-button";

export default async function AdminReservationsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    include: {
      facility: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
              <p className="text-muted-foreground mt-1">Manage all bookings and reservations</p>
            </div>
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl">All Reservations</CardTitle>
            <CardDescription>Manage all bookings in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">No reservations found</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border-2 rounded-xl p-6 hover:shadow-md hover:border-blue-400 transition-all duration-200 bg-card"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1">{booking.code}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-semibold">{booking.customerName}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.customerEmail}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Facility</p>
                        <p className="font-bold text-base">{booking.facility.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Check-in</p>
                        <p className="font-bold text-base">{formatDate(booking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Check-out</p>
                        <p className="font-bold text-base">{formatDate(booking.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg text-primary">
                            {formatCurrency(Number(booking.totalAmount))}
                          </p>
                          {booking.isCustomPrice && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-semibold">
                              Custom
                            </span>
                          )}
                        </div>
                        {booking.paymentType === "PARTIAL" && booking.depositAmount && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Deposit: {formatCurrency(Number(booking.depositAmount))} (50%)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Link href={`/booking/${booking.code}`}>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold"
                        >
                          View Details
                        </Button>
                      </Link>
                      <EditBookingButton
                            booking={{
                              id: booking.id,
                              code: booking.code,
                              customerName: booking.customerName,
                              customerEmail: booking.customerEmail,
                              customerPhone: booking.customerPhone,
                              startDate: booking.startDate,
                              endDate: booking.endDate,
                              specialRequests: booking.notes,
                              status: booking.status,
                              totalAmount: Number(booking.totalAmount),
                              isCustomPrice: booking.isCustomPrice,
                            }}
                          />
                      <DeleteBookingButton
                        bookingId={booking.id}
                        bookingCode={booking.code}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
