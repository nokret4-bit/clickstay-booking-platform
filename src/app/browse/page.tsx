import { Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { TropicalCard } from "@/components/tropical/tropical-card";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { FacilityCard } from "@/components/facility-card";
import { Search, Palmtree } from "lucide-react";

async function FacilitiesList({ search }: { search: string | undefined }) {
  const facilities = await prisma.facility.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  const q = (search || "").toLowerCase().trim();
  const filtered = q
    ? facilities.filter(
        (f) => f.name.toLowerCase().includes(q) || f.kind.toLowerCase().includes(q)
      )
    : facilities;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <Palmtree className="h-20 w-20 text-tropical-tan mx-auto mb-4 opacity-50" />
        </div>
        <p className="text-xl text-tropical-black/70 font-medium">No facilities found matching your search.</p>
        <p className="text-tropical-black/50 mt-2">Try adjusting your search terms or browse all facilities.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((facility) => (
        <FacilityCard 
          key={facility.id} 
          facility={{
            id: facility.id,
            name: facility.name,
            kind: facility.kind,
            description: facility.description,
            capacity: facility.capacity,
            price: Number(facility.price),
            photos: facility.photos,
          }} 
        />
      ))}
    </div>
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tropical-green-soft/20 via-tropical-yellow/10 to-tropical-red/10 py-20 overflow-hidden">
        <div className="absolute top-10 right-20 w-48 h-48 bg-tropical-red/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-tropical-green/10 rounded-full blur-3xl" style={{animationDelay: '1.5s'}} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Palmtree className="h-12 w-12 text-tropical-green-deep mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent">
              Facilities
            </span>
          </h1>
          <p className="text-xl text-tropical-black font-semibold mb-8 max-w-2xl mx-auto px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
            Discover our collection of luxurious rooms, cottages, and elegant function halls
          </p>
          
          <form action="/browse" method="get" className="max-w-2xl mx-auto">
            <div className="flex gap-3 bg-white rounded-full p-2 shadow-xl border-2 border-tropical-tan/20">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="h-5 w-5 text-tropical-green" />
                <Input 
                  name="search" 
                  placeholder="Search by name or type (rooms, cottages, halls...)" 
                  defaultValue={search}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                />
              </div>
              <TropicalButton type="submit" size="lg" className="rounded-full">
                Search
              </TropicalButton>
            </div>
          </form>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-16">

        {search && (
          <div className="mb-8 text-center">
            <p className="text-tropical-black/70">
              Showing results for: <span className="font-bold text-tropical-red">"{search}"</span>
            </p>
          </div>
        )}
        
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TropicalCard key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-tropical-tan/20 rounded-t-2xl" />
                  <div className="p-5">
                    <div className="h-6 bg-tropical-tan/30 rounded-lg w-3/4 mb-3" />
                    <div className="h-4 bg-tropical-tan/20 rounded w-full mb-2" />
                    <div className="h-4 bg-tropical-tan/20 rounded w-2/3 mb-4" />
                    <div className="h-10 bg-tropical-tan/30 rounded-full" />
                  </div>
                </TropicalCard>
              ))}
            </div>
          }
        >
          <FacilitiesList search={search} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
