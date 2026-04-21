"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EditFacilityPricingButtonProps {
  facilityId: string;
  facilityName: string;
}

interface FacilityData {
  price: string | number;
  extraAdultRate: string | number | null;
  extraChildRate: string | number | null;
}

export function EditFacilityPricingButton({
  facilityId,
  facilityName,
}: EditFacilityPricingButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState<FacilityData>({
    price: "",
    extraAdultRate: "",
    extraChildRate: "",
  });
  const router = useRouter();
  const { toast } = useToast();

  const handleOpen = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`/api/admin/facilities/${facilityId}`);
      if (response.ok) {
        const facility = await response.json();
        setFormData({
          price: facility.price || "",
          extraAdultRate: facility.extraAdultRate || "",
          extraChildRate: facility.extraChildRate || "",
        });
        setShowForm(true);
      } else {
        throw new Error("Failed to load facility data");
      }
    } catch (error) {
      console.error("Error loading facility:", error);
      toast({
        title: "Error",
        description: "Failed to load facility data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const priceNum = parseFloat(String(formData.price));
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Error",
        description: "Base price must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        price: priceNum,
        extraAdultRate: formData.extraAdultRate ? parseFloat(String(formData.extraAdultRate)) : null,
        extraChildRate: formData.extraChildRate ? parseFloat(String(formData.extraChildRate)) : null,
      };

      const response = await fetch(`/api/admin/facilities/${facilityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Pricing for ${facilityName} has been updated.`,
        });
        setShowForm(false);
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update pricing");
      }
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setFormData({
      price: "",
      extraAdultRate: "",
      extraChildRate: "",
    });
  };

  if (!showForm) {
    return (
      <Button 
        onClick={handleOpen} 
        variant="outline" 
        size="sm" 
        className="gap-2"
        disabled={loadingData}
      >
        <Edit className="h-4 w-4" />
        Edit Pricing
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <Card className="w-full max-w-md shadow-2xl my-8">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Edit Pricing</CardTitle>
              <CardDescription className="mt-1">{facilityName}</CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={loading}
              className="hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="font-semibold text-gray-700">
                Base Price (₱) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                disabled={loading}
                placeholder="Enter base price"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-500">
                The main price for this facility
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extraAdult" className="font-semibold text-gray-700">
                Extra Adult Rate (₱)
              </Label>
              <Input
                id="extraAdult"
                type="number"
                step="0.01"
                min="0"
                value={formData.extraAdultRate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, extraAdultRate: e.target.value || "" })
                }
                disabled={loading}
                placeholder="Optional: charge per extra adult"
              />
              <p className="text-xs text-gray-500">
                Leave empty if not applicable
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extraChild" className="font-semibold text-gray-700">
                Extra Child Rate (₱)
              </Label>
              <Input
                id="extraChild"
                type="number"
                step="0.01"
                min="0"
                value={formData.extraChildRate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, extraChildRate: e.target.value || "" })
                }
                disabled={loading}
                placeholder="Optional: charge per extra child"
              />
              <p className="text-xs text-gray-500">
                Leave empty if not applicable
              </p>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Pricing"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
