import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateStaffButton } from "@/components/create-staff-button";
import { EditStaffButton } from "@/components/edit-staff-button";
import { DeleteStaffButton } from "@/components/delete-staff-button";
import { ImportStaffButton } from "@/components/import-staff-button";
import { ExportStaffButton } from "@/components/export-staff-button";
import { Users } from "lucide-react";
import { hasPermission } from "@/lib/permissions";

export const dynamic = 'force-dynamic';

export default async function StaffManagementPage() {
  const session = await getServerSession();

  // Check if user is authenticated
  if (!session) {
    redirect("/login");
  }
  if (!hasPermission(session.user.role, session.user.permissions, "manage_staff")) {
    redirect("/dashboard");
  }

  // Get all users including staff and admins
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Management</h1>
              <p className="text-muted-foreground mt-1">Manage staff accounts, roles, and permissions</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-end">
              <ExportStaffButton />
              <ImportStaffButton />
              <CreateStaffButton />
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900">Staff & Admin Users</CardTitle>
                <CardDescription className="text-blue-700">
                  {users.length} {users.length === 1 ? 'member' : 'members'} in the system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No staff users found</p>
                <p className="text-muted-foreground text-sm mt-2">Create the first staff member to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border-2 rounded-lg p-5 hover:shadow-md hover:border-blue-400 transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg text-gray-900">{user.name || "No Name"}</h3>
                          <Badge 
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                            className="text-xs font-semibold px-3 py-1"
                          >
                            {user.role}
                          </Badge>
                          {!user.isActive && (
                            <Badge variant="destructive" className="text-xs font-semibold px-3 py-1">
                              Inactive
                            </Badge>
                          )}
                          {user.isActive && (
                            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-green-50 border-green-200 text-green-700">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-1">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDateTime(user.createdAt)} • Updated: {formatDateTime(user.updatedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <EditStaffButton user={{...user, permissions: user.permissions || {}}} />
                        <DeleteStaffButton userId={user.id} userName={user.name || user.email} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
