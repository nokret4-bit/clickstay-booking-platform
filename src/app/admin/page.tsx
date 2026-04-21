import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Banknote, Users, Building2 } from "lucide-react";
import { BookingStatus } from "@prisma/client";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminProfileSection from "@/components/admin-profile-section";
import { BookingsList } from "@/components/bookings-list";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Verify user is logged in and is ADMIN or STAFF
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  // Non-authenticated or guest users
  if (session.user?.role !== "ADMIN" && session.user?.role !== "STAFF") {
    redirect("/login");
  }

  // Get full user data including profile image
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  // Note: profileImage will be available after running: npx prisma migrate dev
  const userWithProfile = user ? { ...user, profileImage: null as string | null } : null;

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
    prisma.booking.count({
      where: { customerName: { not: "Temporary Lock" } }
    }),
    prisma.booking.count({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED],
        },
        customerName: { not: "Temporary Lock" }
      },
    }),
    prisma.booking.aggregate({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CHECKED_OUT],
        },
        customerName: { not: "Temporary Lock" }
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.facility.count({
      where: { isActive: true },
    }),
  ]);

  // Fetch ALL bookings (not just recent ones)
  const allBookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      customerName: { not: "Temporary Lock" },
    },
    include: {
      facility: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header with User Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {userWithProfile?.name || 'Admin'}, welcome to the portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your resort operations
          </p>
        </div>

        {/* Profile Section */}
        <div className="mb-8">
          <AdminProfileSection user={userWithProfile} />
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
        <BookingsList bookings={allBookings.map(b => ({
          ...b,
          totalAmount: Number(b.totalAmount),
          depositAmount: b.depositAmount ? Number(b.depositAmount) : null,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
          confirmedAt: b.confirmedAt?.toISOString() ?? null,
          cancelledAt: b.cancelledAt?.toISOString() ?? null,
          checkedInAt: b.checkedInAt?.toISOString() ?? null,
          checkedOutAt: b.checkedOutAt?.toISOString() ?? null,
          lockedUntil: b.lockedUntil?.toISOString() ?? null,
        }))} />
      </div>
    </div>
  );
}
