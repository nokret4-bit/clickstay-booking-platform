import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PricingPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pricing Management</h1>
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
              <span className="text-4xl font-bold text-muted-foreground">₱</span>
              <div>
                <CardTitle>Simplified Pricing</CardTitle>
                <CardDescription>
                  Pricing is now managed directly in facilities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                With the simplified schema, each facility has a direct price field. 
                There's no separate rate plans table.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">To manage pricing:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to <strong>Facilities</strong> page</li>
                  <li>Edit the facility you want to update</li>
                  <li>Change the <strong>Price</strong> field</li>
                  <li>Save changes</li>
                </ol>
              </div>

              <Link href="/admin/facilities">
                <Button className="w-full">Go to Facilities</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
