"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PERMISSIONS = [
  { key: "view_bookings", label: "View Bookings" },
  { key: "manage_bookings", label: "Manage Bookings" },
  { key: "view_facilities", label: "View Facilities" },
  { key: "manage_facilities", label: "Manage Facilities" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_pricing", label: "Manage Pricing" },
];

interface EditStaffButtonProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    permissions: unknown;
    isActive: boolean;
  };
}

export function EditStaffButton({ user }: EditStaffButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    permissions: (user.permissions as Record<string, boolean>) || {},
    isActive: user.isActive,
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/staff/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Staff Updated",
          description: `${formData.name} has been updated successfully.`,
        });
        setShowForm(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update staff account.",
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Staff Account</CardTitle>
              <CardDescription>Update staff member details and permissions</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Account Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <p className="text-sm text-muted-foreground">
                Configure what this staff member can access
              </p>
              <div className="space-y-2">
                {PERMISSIONS.map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between">
                    <Label htmlFor={perm.key} className="cursor-pointer">
                      {perm.label}
                    </Label>
                    <Switch
                        id={perm.key}
                        checked={formData.permissions[perm.key] || false}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: { ...formData.permissions, [perm.key]: checked },
                          })
                        }
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Account"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
