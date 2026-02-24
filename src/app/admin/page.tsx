import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Banknote, Users, Building2 } from "lucide-react";
import { BookingStatus } from "@prisma/client";

export default async function AdminDashboard() {

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

  // Fetch dashboard stats
  const [totalBookings, activeBookings, totalRevenue, totalFacilities] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED],
        },
      },
    }),
    prisma.booking.aggregate({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.facility.count({
      where: { isActive: true },
    }),
  ]);

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    where: {
      customerName: { not: "Temporary Lock" },
    },
    include: {
      facility: true,
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your resort operations
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">All time reservations</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently confirmed</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                ₱{Number(totalRevenue._sum.totalAmount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Facilities</CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFacilities}</div>
              <p className="text-xs text-muted-foreground mt-1">Available properties</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest reservations in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-semibold">{booking.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.facility.name} - {booking.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₱{Number(booking.totalAmount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{booking.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
