import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getServerSession } from "@/lib/auth";
import { CashierScanner } from "@/components/cashier-scanner";
import { prisma } from "@/lib/prisma";
import { BookingsList } from "@/components/bookings-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';

export default async function CashierDashboard() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch ALL bookings for viewing
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
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="inline-block rounded-2xl bg-white/90 px-6 py-4 shadow-lg">
              <h1 className="text-4xl font-bold mb-2 text-black">Cashier Portal</h1>
              <p className="text-black/70">
                Check-in and check-out guests, and view all bookings
              </p>
            </div>
          </div>

          <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scanner">Check-in/Check-out</TabsTrigger>
              <TabsTrigger value="bookings">View Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="scanner" className="mt-6">
              <CashierScanner />
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
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
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
