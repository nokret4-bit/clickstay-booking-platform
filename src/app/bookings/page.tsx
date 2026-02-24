import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BookingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your reservations</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Bookings Yet</CardTitle>
              <CardDescription>You haven&apos;t made any bookings yet</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/browse">
                <Button>Browse Facilities</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.facility.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Booking Code: {booking.code}
                      </CardDescription>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in</p>
                      <p className="font-semibold">{formatDate(booking.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Check-out</p>
                      <p className="font-semibold">{formatDate(booking.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">
                        {formatCurrency(Number(booking.totalAmount))}
                      </p>
                    </div>
                  </div>
                  <Link href={`/booking/${booking.code}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
