import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FacilityReviews } from "@/components/facility-reviews";
import { UnitBookingCard } from "@/components/unit-booking-card";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface UnitPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    types?: string;
  }>;
}

export default async function UnitPage({ params, searchParams }: UnitPageProps) {
  const { id } = await params;
  const search = await searchParams;
  
  const facility = await prisma.facility.findUnique({
    where: { id, isActive: true },
    include: {
      _count: {
        select: {
          reviews: {
            where: {
              status: "APPROVED"
            }
          }
        }
      }
    }
  });

  if (!facility) {
    notFound();
  }

  const photos = facility.photos || [];
  const amenities = facility.amenities || [];
  const rules = facility.rules || [];
  const freeAmenities = facility.freeAmenities || [];
  const averageRating = facility.averageRating || 0;
  const totalReviews = facility._count.reviews;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Photo Gallery */}
            {photos.length > 0 && (
              <div className="mb-8">
                <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-4 relative">
                  <img
                    src={photos[0] as string}
                    alt={facility.name}
                    className="object-cover w-full h-full"
                  />
                  {/* Dark overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  {/* Text overlay on hero image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-4xl font-bold text-white drop-shadow-lg">{facility.name}</h1>
                      <Badge className="bg-yellow-400 text-black font-bold border-0 shadow-lg">{facility.kind}</Badge>
                    </div>
                    
                    {/* Rating Display */}
                    {totalReviews > 0 && (
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= Math.round(averageRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-white/40"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold ml-2 text-white drop-shadow-md">
                            {averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-white/90 drop-shadow-md">
                          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                    
                    <p className="text-white/95 text-lg drop-shadow-md line-clamp-2">{facility.description}</p>
                  </div>
                </div>
                {photos.length > 1 && (
                  <div className="grid grid-cols-3 gap-4">
                    {photos.slice(1, 4).map((photo, idx) => (
                      <div key={idx} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={photo as string}
                          alt={`${facility.name} ${idx + 2}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Amenities */}
            {amenities.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-2 gap-3 list-disc list-inside">
                    {amenities.map((amenity, idx) => (
                      <li key={idx} className="text-sm">
                        {amenity as string}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Rules */}
            {rules.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Rules & Policies</CardTitle>
                  <CardDescription>
                    Please read and follow these rules during your stay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc list-inside">
                    {rules.map((rule, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {rule as string}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Free Amenities */}
            {freeAmenities.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Free When You Book</CardTitle>
                  <CardDescription>
                    Complimentary amenities included with your reservation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc list-inside">
                    {freeAmenities.map((amenity, idx) => (
                      <li key={idx} className="text-sm text-green-700 dark:text-green-400">
                        {amenity as string}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <FacilityReviews facilityId={facility.id} />
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <UnitBookingCard
              facilityId={facility.id}
              facilityName={facility.name}
              price={Number(facility.price)}
              capacity={facility.capacity}
              searchParams={search}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
