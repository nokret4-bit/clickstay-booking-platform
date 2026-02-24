import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TropicalCard } from "@/components/tropical/tropical-card";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { FacilityCardWithAvailability } from "@/components/facility-card-with-availability";
import { Search, Palmtree, Calendar, Users, Filter } from "lucide-react";
import Link from "next/link";

// Search params interface
interface SearchParams {
  from: string;
  to: string;
  types: string;
  capacity?: string;
}

async function getAvailableFacilities(searchParams: SearchParams) {
  const { from, to, types, capacity } = searchParams;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const queryParams = new URLSearchParams();
    
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (types) {
      const typeArray = types.split(',');
      if (typeArray[0]) queryParams.append('type', typeArray[0]);
    }
    if (capacity) queryParams.append('capacity', capacity);

    const response = await fetch(`${baseUrl}/api/facilities?${queryParams.toString()}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch facilities:', response.status);
      return { facilities: [], availability: {}, error: 'Failed to fetch facilities' };
    }

    const data = await response.json();
    return { facilities: data.items || [], availability: data.availability || {}, error: null };
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return { facilities: [], availability: {}, error: 'Network error' };
  }
}

async function FacilitiesList({ searchParams }: { searchParams: SearchParams }) {
  const { facilities, availability, error } = await getAvailableFacilities(searchParams);
  
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <Palmtree className="h-20 w-20 text-tropical-tan mx-auto mb-4 opacity-50" />
        </div>
        <p className="text-xl text-tropical-black font-bold mb-2 drop-shadow-md">Unable to load facilities</p>
        <p className="text-tropical-black/80 mb-6 font-medium drop-shadow-sm">{error}</p>
        <Link href="/book">
          <TropicalButton variant="outline">
            Try Again
          </TropicalButton>
        </Link>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <Calendar className="h-20 w-20 text-tropical-tan mx-auto mb-4 opacity-50" />
        </div>
        <p className="text-xl text-tropical-black font-bold mb-2 drop-shadow-md">No Available Facilities</p>
        <p className="text-tropical-black/80 mb-6 font-medium drop-shadow-sm">
          No facilities are available for your selected dates. Try different dates or contact us directly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/book">
            <TropicalButton variant="outline">
              Change Dates
            </TropicalButton>
          </Link>
          <a href="tel:+631234567890">
            <TropicalButton variant="primary">
              Call Us
            </TropicalButton>
          </a>
        </div>
      </div>
    );
  }

  // Filter facilities by selected types and check availability
  const selectedTypes = searchParams.types.split(',');
  const filteredFacilities = facilities.filter(facility => 
    selectedTypes.includes(facility.kind)
  );

  // Check which facilities are available for the entire date range
  const availableFacilities = filteredFacilities.filter(facility => {
    const facilityAvailability = availability[facility.id];
    if (!facilityAvailability || facilityAvailability.length === 0) {
      return true; // Assume available if no availability data
    }
    
    // Check if all dates in the range are available
    return facilityAvailability.every(day => day.available);
  });

  if (availableFacilities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <Filter className="h-20 w-20 text-tropical-tan mx-auto mb-4 opacity-50" />
        </div>
        <p className="text-xl text-tropical-black font-bold mb-2 drop-shadow-md">No Available Facilities</p>
        <p className="text-tropical-black/80 mb-6 font-medium drop-shadow-sm">
          Facilities matching your criteria are not available for the selected dates.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/book">
            <TropicalButton variant="outline">
              Modify Search
            </TropicalButton>
          </Link>
          <a href="tel:+631234567890">
            <TropicalButton variant="primary">
              Call Us
            </TropicalButton>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <p className="text-tropical-black font-medium">
            Found <span className="font-bold text-tropical-green">{availableFacilities.length}</span> available facilities
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableFacilities.map((facility) => (
          <FacilityCardWithAvailability 
            key={facility.id} 
            facility={facility}
            availability={availability[facility.id] || []}
            searchParams={searchParams}
          />
        ))}
      </div>
    </div>
  );
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // Validate required parameters
  if (!params.from || !params.to || !params.types) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center py-16">
            <p className="text-xl text-tropical-black/70 font-medium mb-6">Invalid Search Parameters</p>
            <Link href="/book">
              <TropicalButton>
                Start New Search
              </TropicalButton>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const selectedTypes = params.types.split(',');
  const typeLabels = {
    'ROOM': 'Rooms',
    'COTTAGE': 'Cottages', 
    'HALL': 'Function Halls'
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tropical-green-soft/20 via-tropical-yellow/10 to-tropical-red/10 py-16 overflow-hidden">
        <div className="absolute top-10 right-20 w-48 h-48 bg-tropical-red/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-tropical-green/10 rounded-full blur-3xl" style={{animationDelay: '1.5s'}} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-tropical-black px-6 py-2 rounded-full mb-6 shadow-lg">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">
              {formatDate(params.from)} - {formatDate(params.to)}
            </span>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl px-8 py-6 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent">
                Available Facilities
              </span>
            </h1>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {selectedTypes.map(type => (
                <span key={type} className="bg-tropical-green/20 text-tropical-green-deep px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                  {typeLabels[type as keyof typeof typeLabels]}
                </span>
              ))}
            </div>
            
            <p className="text-lg text-tropical-black/80 max-w-2xl mx-auto font-medium">
              Showing only facilities available for your selected dates
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-16">
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
          <FacilitiesList searchParams={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
