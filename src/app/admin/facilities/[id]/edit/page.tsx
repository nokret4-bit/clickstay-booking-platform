"use client";
// Version: 2.1 - Added pricing type dropdown for per-head and per-night pricing

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

const sanitizeDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("")}`;
};

interface EditFacilityPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditFacilityPage({ params }: EditFacilityPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inactiveMode, setInactiveMode] = useState<"until" | "duration">("until");
  const [inactiveUntilLocal, setInactiveUntilLocal] = useState<string>("");
  const [inactiveDurationDays, setInactiveDurationDays] = useState<number>(7);
  
  const [formData, setFormData] = useState({
    name: "",
    kind: "ROOM",
    description: "",
    capacity: 1,
    price: "",
    pricingType: "PER_NIGHT" as "PER_NIGHT" | "PER_HEAD" | "PER_USE",
    photos: [] as string[],
    amenities: [] as string[],
    rules: [] as string[],
    freeAmenities: [] as string[],
    extraAdultRate: "",
    extraChildRate: "",
    isActive: true,
    inactiveUntil: null as string | null,
  });

  useEffect(() => {
    fetchFacility();
  }, [id]);

  const fetchFacility = async () => {
    try {
      const res = await fetch(`/api/admin/facilities/${id}`);
      if (res.ok) {
        const data = await res.json();
        const inactiveUntilIso: string | null = data.inactiveUntil ? new Date(data.inactiveUntil).toISOString() : null;
        const toDatetimeLocalValue = (iso: string | null) => {
          if (!iso) return "";
          const d = new Date(iso);
          const pad = (n: number) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        setFormData({
          name: data.name || "",
          kind: data.kind || "ROOM",
          description: data.description || "",
          capacity: data.capacity || 1,
          price: data.price ? String(Number(data.price)) : "",
          pricingType: data.pricingType || (data.kind === "HALL" ? "PER_HEAD" : "PER_NIGHT"),
          photos: data.photos || [],
          amenities: data.amenities || [],
          rules: data.rules || [],
          freeAmenities: data.freeAmenities || [],
          extraAdultRate: data.extraAdultRate ? String(Number(data.extraAdultRate)) : "",
          extraChildRate: data.extraChildRate ? String(Number(data.extraChildRate)) : "",
          isActive: data.isActive ?? true,
          inactiveUntil: inactiveUntilIso,
        });
        setInactiveUntilLocal(toDatetimeLocalValue(inactiveUntilIso));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load facility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const numericPrice = Number(formData.price);
      if (!formData.price || Number.isNaN(numericPrice) || numericPrice < 0) {
        throw new Error("Please enter a valid decimal price.");
      }

      let inactiveUntilToSend: string | null = null;
      if (!formData.isActive) {
        if (inactiveMode === "until") {
          inactiveUntilToSend = inactiveUntilLocal ? new Date(inactiveUntilLocal).toISOString() : null;
        } else {
          const days = Number(inactiveDurationDays);
          if (Number.isFinite(days) && days > 0) {
            const d = new Date();
            d.setDate(d.getDate() + Math.round(days));
            inactiveUntilToSend = d.toISOString();
          }
        }
      }

      const res = await fetch(`/api/admin/facilities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, price: numericPrice, inactiveUntil: inactiveUntilToSend }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Facility updated successfully",
        });
        router.push("/admin/facilities");
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update facility",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Facility</h1>
              <p className="text-muted-foreground mt-1">Update facility information</p>
            </div>
            <Link href="/admin/facilities">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold"
              >
                Back to Facilities
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl">Facility Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Facility Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11 text-base"
                  placeholder="e.g., Deluxe Ocean View Room"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kind" className="text-sm font-semibold">Facility Type</Label>
                <Select value={formData.kind} onValueChange={(value) => setFormData({ ...formData, kind: value })}>
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM">Room</SelectItem>
                    <SelectItem value="COTTAGE">Cottage</SelectItem>
                    <SelectItem value="HALL">Hall</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="text-base resize-none"
                  placeholder="Describe the facility features, amenities, and highlights..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-semibold">Guest Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                    className="h-11 text-base"
                    placeholder="Max guests"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricingType" className="text-sm font-semibold">Pricing Type</Label>
                  <select
                    id="pricingType"
                    value={formData.pricingType}
                    onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as "PER_NIGHT" | "PER_HEAD" | "PER_USE" })}
                    className="flex h-11 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-base font-medium cursor-pointer hover:border-primary transition-colors"
                    required
                  >
                    <option value="PER_NIGHT">Per Night</option>
                    <option value="PER_HEAD">Per Head</option>
                    <option value="PER_USE">Per Use (Day Use)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold">
                  {formData.pricingType === "PER_HEAD" ? "Price per Head (₱)" : formData.pricingType === "PER_USE" ? "Price per Use (₱)" : "Price per Night (₱)"}
                </Label>
                <Input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: sanitizeDecimalInput(e.target.value) })}
                  required
                  className="h-11 text-base"
                  placeholder="e.g., 1500.50"
                />
              </div>

              {/* Additional Guest Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extraAdultRate" className="text-sm font-semibold">Extra Adult Rate (₱)</Label>
                  <Input
                    id="extraAdultRate"
                    type="text"
                    inputMode="decimal"
                    value={formData.extraAdultRate}
                    onChange={(e) => setFormData({ ...formData, extraAdultRate: sanitizeDecimalInput(e.target.value) })}
                    className="h-11 text-base"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">Charge per extra adult per night</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraChildRate" className="text-sm font-semibold">Extra Child Rate (₱)</Label>
                  <Input
                    id="extraChildRate"
                    type="text"
                    inputMode="decimal"
                    value={formData.extraChildRate}
                    onChange={(e) => setFormData({ ...formData, extraChildRate: sanitizeDecimalInput(e.target.value) })}
                    className="h-11 text-base"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">Charge per extra child per night</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities" className="text-sm font-semibold">Amenities</Label>
                <Textarea
                  id="amenities"
                  value={formData.amenities.join(", ")}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="WiFi, AC, TV, Mini Fridge, Hot Shower"
                  className="min-h-[80px] text-base resize-none whitespace-normal break-words"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Separate amenities with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules" className="text-sm font-semibold">Rules & Policies</Label>
                <Textarea
                  id="rules"
                  value={formData.rules.join(", ")}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Casita, entrance to clubhouse, entrance to adventure park and theme gardens"
                  className="min-h-[80px] text-base resize-none whitespace-normal break-words"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Separate rules with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeAmenities" className="text-sm font-semibold">Free When You Book</Label>
                <Textarea
                  id="freeAmenities"
                  value={formData.freeAmenities.join(", ")}
                  onChange={(e) => setFormData({ ...formData, freeAmenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Breakfast, Parking, Pool Access, Beach Towels"
                  className="min-h-[80px] text-base resize-none whitespace-normal break-words"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Complimentary amenities included with booking</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos" className="text-sm font-semibold">Photos</Label>
                <div className="space-y-3">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        Array.from(files).forEach((file) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = reader.result as string;
                            setFormData(prev => ({
                              ...prev,
                              photos: [...prev.photos, base64]
                            }));
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload images or paste URLs below
                  </p>
                  <Textarea
                    id="photos"
                    value={formData.photos.join("\n")}
                    onChange={(e) => setFormData({ ...formData, photos: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })}
                    placeholder="Or paste image URLs (one per line)"
                    rows={3}
                  />
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {formData.photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Preview ${idx + 1}`} 
                            className="w-full h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                photos: prev.photos.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => {
                    const nextActive = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      isActive: nextActive,
                      inactiveUntil: nextActive ? null : prev.inactiveUntil,
                    }));
                    if (nextActive) {
                      setInactiveUntilLocal("");
                    }
                  }}
                  className="h-5 w-5 cursor-pointer"
                />
                <Label htmlFor="isActive" className="cursor-pointer font-medium text-base">
                  Active (visible to customers for booking)
                </Label>
              </div>

              {!formData.isActive && (
                <div className="space-y-3 p-4 bg-muted/20 rounded-lg border-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Auto-reactivate</p>
                    <p className="text-xs text-muted-foreground">
                      Set when this facility should become active again.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inactiveMode"
                        checked={inactiveMode === "until"}
                        onChange={() => setInactiveMode("until")}
                      />
                      <span className="text-sm font-medium">Until date/time</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inactiveMode"
                        checked={inactiveMode === "duration"}
                        onChange={() => setInactiveMode("duration")}
                      />
                      <span className="text-sm font-medium">For duration</span>
                    </label>
                  </div>

                  {inactiveMode === "until" ? (
                    <div className="space-y-2">
                      <Label htmlFor="inactiveUntil" className="text-sm font-semibold">
                        Inactive until
                      </Label>
                      <Input
                        id="inactiveUntil"
                        type="datetime-local"
                        value={inactiveUntilLocal}
                        onChange={(e) => setInactiveUntilLocal(e.target.value)}
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        The facility will be reactivated automatically once this date/time is reached.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="inactiveDurationDays" className="text-sm font-semibold">
                        Inactive for (days)
                      </Label>
                      <Input
                        id="inactiveDurationDays"
                        type="number"
                        min="1"
                        value={inactiveDurationDays}
                        onChange={(e) => setInactiveDurationDays(Number(e.target.value))}
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        This will set an “inactive until” date based on today.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={saving} 
                  size="lg" 
                  className="flex-1 font-bold shadow-lg hover:shadow-xl bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
                <Link href="/admin/facilities" className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="w-full font-semibold hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
