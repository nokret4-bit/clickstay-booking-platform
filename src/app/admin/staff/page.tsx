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

export default async function StaffManagementPage() {
  const session = await getServerSession();

  // Check if user is authenticated
  if (!session) {
    redirect("/login");
  }

  // Get all users including staff and admins
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
              <p className="text-muted-foreground mt-1">Manage staff accounts and permissions</p>
            </div>
            <div className="flex gap-3">
              <CreateStaffButton />
              <Link href="/admin">
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
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl">Staff & Admin Users</CardTitle>
            <CardDescription>
              Manage staff accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No staff users found</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border-2 rounded-xl p-6 hover:shadow-md hover:border-orange-400 transition-all duration-200 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-xl">{user.name || "No Name"}</h3>
                          <Badge 
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                            className="text-xs font-semibold"
                          >
                            {user.role}
                          </Badge>
                          {!user.isActive && (
                            <Badge variant="destructive" className="text-xs font-semibold">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {formatDateTime(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <EditStaffButton user={{...user, permissions: {}}} />
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
