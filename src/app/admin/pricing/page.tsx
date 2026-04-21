import { getServerSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Banknote, Building2 } from "lucide-react";
import { EditFacilityPricingButton } from "@/components/edit-facility-pricing-button";

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session.user.role, session.user.permissions, "manage_pricing")) {
    redirect("/");
  }

  // Get all facilities with their pricing info
  const facilities = await prisma.facility.findMany({
    select: {
      id: true,
      name: true,
      kind: true,
      price: true,
      pricingType: true,
      capacity: true,
      isActive: true,
      extraAdultRate: true,
      extraChildRate: true,
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate some stats
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter((f) => f.isActive).length;
  const avgPrice = facilities.length > 0 
    ? (facilities.reduce((sum, f) => sum + Number(f.price), 0) / facilities.length).toFixed(2)
    : '0';

  const getPricingTypeLabel = (type: string, kind: string) => {
    if (type === 'PER_HEAD') return 'Price per Head';
    if (type === 'PER_USE') return 'Price per Use';
    return 'Price per Night';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-3">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage facility prices and pricing models</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalFacilities}</div>
              <p className="text-xs text-gray-500 mt-1">{activeFacilities} active</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">₱{avgPrice}</div>
              <p className="text-xs text-gray-500 mt-1">Across all facilities</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {facilities.reduce((sum, f) => sum + f._count.bookings, 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all facilities</p>
            </CardContent>
          </Card>
        </div>

        {/* Facilities List */}
        {facilities.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="pt-12 pb-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No Facilities Found</p>
              <p className="text-sm text-gray-500">Create your first facility to manage its pricing</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {facilities.map((facility) => (
              <Card key={facility.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Facility info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg p-2">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{facility.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                              {facility.kind.charAt(0).toUpperCase() + facility.kind.slice(1).toLowerCase()}
                            </span>
                            {!facility.isActive && (
                              <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Base Price</p>
                          <p className="text-xl font-bold text-gray-900">
                            ₱{Number(facility.price).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Pricing Model</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {getPricingTypeLabel(facility.pricingType, facility.kind)}
                          </p>
                        </div>
                        {facility.extraAdultRate && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Extra Adult</p>
                            <p className="text-sm font-semibold text-gray-900">
                              ₱{Number(facility.extraAdultRate).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {facility.extraChildRate && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Extra Child</p>
                            <p className="text-sm font-semibold text-gray-900">
                              ₱{Number(facility.extraChildRate).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Capacity and bookings */}
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        <span className="text-gray-600">
                          <span className="font-semibold">Capacity:</span> {facility.capacity} {facility.kind === 'ROOM' ? 'guests' : facility.kind === 'COTTAGE' ? 'guests' : 'people'}
                        </span>
                        <span className="text-gray-600">
                          <span className="font-semibold">Bookings:</span> {facility._count.bookings}
                        </span>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex-shrink-0">
                      <EditFacilityPricingButton facilityId={facility.id} facilityName={facility.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Pricing System Overview</CardTitle>
            <CardDescription className="text-blue-700">
              How pricing works in your facility
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-3">
            <div>
              <strong>Per Night:</strong> Guests pay per night of stay
            </div>
            <div>
              <strong>Per Head:</strong> Guests pay per person (ideal for events/halls)
            </div>
            <div>
              <strong>Per Use:</strong> One-time fee per booking (ideal for equipment/cottages)
            </div>
            <div>
              <strong>Extra Rates:</strong> Additional charges for extra guests beyond standard capacity
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
