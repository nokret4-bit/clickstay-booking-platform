import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default async function LoginLogsPage() {
  const session = await getServerSession();

  // Check authentication
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Login Logs</h1>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle>Login Logs Not Available</CardTitle>
                <CardDescription>
                  This feature requires the login_logs table
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                The simplified schema doesn't include a login logs table. 
                Login activity tracking has been removed to keep the database simple.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Security Note:</h3>
                <p className="text-sm text-muted-foreground">
                  While login logs aren't stored in the database, you can still monitor 
                  authentication activity through your application logs or server logs.
                </p>
              </div>

              <Link href="/admin">
                <Button className="w-full">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
