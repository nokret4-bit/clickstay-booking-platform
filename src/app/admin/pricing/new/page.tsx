"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface FacilityType {
  id: string;
  name: string;
  kind: string;
}

interface FacilityUnit {
  id: string;
  name: string;
  facilityTypeId: string;
}

export default function NewRatePlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [facilityUnits, setFacilityUnits] = useState<FacilityUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<FacilityUnit[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceType: "PER_NIGHT",
    basePrice: "",
    currency: "PHP",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    isActive: true,
    applyTo: "TYPE", // TYPE or UNIT
    facilityTypeId: "",
    facilityUnitId: "",
  });

  useEffect(() => {
    // Fetch facility types and units
    Promise.all([
      fetch("/api/admin/facility-types").then((r) => r.json()),
      fetch("/api/admin/facilities").then((r) => r.json()),
    ]).then(([types, units]) => {
      setFacilityTypes(types.facilityTypes || []);
      setFacilityUnits(units.facilities || []);
    });
  }, []);

  useEffect(() => {
    if (formData.applyTo === "UNIT" && formData.facilityTypeId) {
      setFilteredUnits(facilityUnits.filter((u) => u.facilityTypeId === formData.facilityTypeId));
    }
  }, [formData.applyTo, formData.facilityTypeId, facilityUnits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure effectiveFrom has a value
      const effectiveFromDate = (formData.effectiveFrom || new Date().toISOString().split("T")[0]) as string;
      
      const payload = {
        name: formData.name,
        description: formData.description,
        priceType: formData.priceType,
        basePrice: parseFloat(formData.basePrice),
        currency: formData.currency,
        effectiveFrom: new Date(effectiveFromDate).toISOString(),
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
        isActive: formData.isActive,
        facilityTypeId: formData.applyTo === "TYPE" ? formData.facilityTypeId : null,
        facilityUnitId: formData.applyTo === "UNIT" ? formData.facilityUnitId : null,
      };

      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create rate plan");
      }

      toast({
        title: "Success",
        description: "Rate plan created successfully",
      });

      router.push("/admin/pricing");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create rate plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">New Rate Plan</h1>
            <Link href="/admin/pricing">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Rate Plan</CardTitle>
            <CardDescription>Set pricing for facilities or facility types</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Promo, Standard Room Rate"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceType">Price Type *</Label>
                  <Select
                    value={formData.priceType}
                    onValueChange={(value) => setFormData({ ...formData, priceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PER_NIGHT">Per Night</SelectItem>
                      <SelectItem value="PER_SLOT">Per Slot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Effective Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="effectiveFrom">Effective From *</Label>
                  <Input
                    id="effectiveFrom"
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveTo">Effective To (Optional)</Label>
                  <Input
                    id="effectiveTo"
                    type="date"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Apply To */}
              <div className="space-y-2">
                <Label>Apply To *</Label>
                <Select
                  value={formData.applyTo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, applyTo: value, facilityTypeId: "", facilityUnitId: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TYPE">All Facilities of a Type</SelectItem>
                    <SelectItem value="UNIT">Specific Facility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Facility Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="facilityTypeId">
                  {formData.applyTo === "TYPE" ? "Facility Type *" : "Facility Type (for filtering) *"}
                </Label>
                <Select
                  value={formData.facilityTypeId}
                  onValueChange={(value) => setFormData({ ...formData, facilityTypeId: value, facilityUnitId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility type" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Selection (if UNIT mode) */}
              {formData.applyTo === "UNIT" && (
                <div className="space-y-2">
                  <Label htmlFor="facilityUnitId">Specific Facility *</Label>
                  <Select
                    value={formData.facilityUnitId}
                    onValueChange={(value) => setFormData({ ...formData, facilityUnitId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Rate Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
