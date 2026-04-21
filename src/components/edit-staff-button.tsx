"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit, Loader2, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PERMISSIONS = [
  { key: "cashier", label: "Cashier" },
  { key: "view_bookings", label: "View Bookings" },
  { key: "manage_bookings", label: "Manage Bookings" },
  { key: "view_facilities", label: "View Facilities" },
  { key: "manage_facilities", label: "Manage Facilities" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_pricing", label: "Manage Pricing" },
  { key: "manage_staff", label: "Manage Staff" },
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: user.name || "",
    permissions: (user.permissions as Record<string, boolean>) || {},
    isActive: user.isActive,
  });
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must not exceed 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/staff/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          isActive: formData.isActive,
          permissions: formData.permissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `${formData.name} has been updated successfully.`,
        });
        setShowForm(false);
        setErrors({});
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update staff account.",
          variant: "destructive",
        });
      }
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

  const handleClose = () => {
    setShowForm(false);
    setErrors({});
    setFormData({
      name: user.name || "",
      permissions: (user.permissions as Record<string, boolean>) || {},
      isActive: user.isActive,
    });
  };

  if (!showForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="font-medium">
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-900">Edit Staff Account</CardTitle>
              <CardDescription className="text-blue-700">Update staff member details and status</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={loading}
              className="hover:bg-blue-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors below before proceeding.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
                required
                disabled={loading}
                placeholder="Enter full name"
                className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email cannot be changed after account creation</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label htmlFor="isActive" className="font-semibold text-gray-900">Account Status</Label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.isActive ? "Active - Staff can access the system" : "Inactive - Staff cannot access"}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="font-semibold text-blue-900">Permissions</Label>
              <p className="text-sm text-blue-800">
                Configure what this staff member can access
              </p>
              <div className="space-y-3">
                {PERMISSIONS.map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between p-2 hover:bg-blue-100 rounded transition-colors">
                    <Label htmlFor={perm.key} className="cursor-pointer font-medium text-gray-700">
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

            <div className="flex gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold"
              >
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
                onClick={handleClose}
                disabled={loading}
                className="px-6 font-medium"
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
