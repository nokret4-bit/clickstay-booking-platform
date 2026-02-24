import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getServerSession } from "@/lib/auth";
import { CashierScanner } from "@/components/cashier-scanner";

export default async function CashierDashboard() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-block rounded-2xl bg-white/90 px-6 py-4 shadow-lg">
              <h1 className="text-4xl font-bold mb-2 text-black">Cashier</h1>
              <p className="text-black/70">
                Check-in and check-out guests using QR code or booking ID
              </p>
            </div>
          </div>

          <CashierScanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}
