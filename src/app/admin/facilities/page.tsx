import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, Eye, Edit, Plus } from "lucide-react";
import { DeleteFacilityButton } from "@/components/delete-facility-button";

export default async function AdminFacilitiesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const facilities = await prisma.facility.findMany({
    where: {
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: facilities.length,
    active: facilities.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Facility Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage rooms, cottages, and function halls
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold" 
                asChild
              >
                <Link href="/admin">Back to Dashboard</Link>
              </Button>
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer font-bold" 
                asChild
              >
                <Link href="/admin/facilities/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Facility
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="mb-8">
          <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Facilities</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Available for booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Facilities List */}
        <Card>
          <CardHeader>
            <CardTitle>All Facilities</CardTitle>
            <CardDescription>
              View and manage all facilities in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {facilities.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No facilities found</p>
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer font-bold"
                  asChild
                >
                  <Link href="/admin/facilities/new">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Facility
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {facilities.map((facility) => {
                  const photos = Array.isArray(facility.photos) ? facility.photos : [];
                  const firstPhoto = photos[0] as string | undefined;

                  return (
                    <div
                      key={facility.id}
                      className="border-2 rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all duration-200 bg-card"
                    >
                      <div className="flex items-start gap-6">
                        {/* Photo Thumbnail */}
                        {firstPhoto ? (
                          <div className="w-64 h-48 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-lg border-2 hover:shadow-xl transition-shadow duration-300 group">
                            <img
                              src={firstPhoto}
                              alt={facility.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-64 h-48 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0 border-2 shadow-lg">
                            <Building2 className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}

                        {/* Facility Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold mb-2">{facility.name}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs font-semibold">
                                  {facility.kind}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {facility.description || "No description"}
                          </p>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-muted/30 rounded-lg border">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Capacity</p>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-lg font-bold">
                                  {facility.capacity} guests
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">{facility.pricingType === 'PER_HEAD' || facility.kind === 'HALL' ? 'Price per Head' : facility.pricingType === 'PER_USE' || facility.kind === 'COTTAGE' ? 'Price per Use' : 'Price per Night'}</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-primary">
                                  ₱{Number(facility.price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              size="lg" 
                              className="flex-1 font-semibold hover:bg-accent hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2" 
                              asChild
                            >
                              <Link href={`/unit/${facility.id}`}>
                                <Eye className="h-5 w-5 mr-2" />
                                View Details
                              </Link>
                            </Button>
                            <Button 
                              size="lg" 
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer" 
                              asChild
                            >
                              <Link href={`/admin/facilities/${facility.id}/edit`}>
                                <Edit className="h-5 w-5 mr-2" />
                                Edit Facility
                              </Link>
                            </Button>
                            <DeleteFacilityButton 
                              facilityId={facility.id} 
                              facilityName={facility.name} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
