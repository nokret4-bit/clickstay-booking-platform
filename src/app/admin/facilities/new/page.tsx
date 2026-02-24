"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type FacilityType = { id: string; name: string };

export default function NewFacilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [form, setForm] = useState({
    name: "",
    kind: "ROOM",
    description: "",
    capacity: 1,
    price: 0,
    photos: [] as string[],
    amenities: [] as string[],
    rules: [] as string[],
    freeAmenities: [] as string[],
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch facility types (derived from existing types table)
    fetch("/api/admin/facilities")
      .then(() => fetch("/api/facilities"))
      .catch(() => null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create facility");
      }

      toast({ title: "Facility created" });
      router.push("/admin/facilities");
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const base64Images: string[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        base64Images.push(base64);
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...base64Images] }));
      toast({ title: "Uploaded", description: `${base64Images.length} file(s) uploaded` });
    } catch (err) {
      toast({ title: "Upload error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add New Facility</h1>
              <p className="text-muted-foreground mt-1">Create a new room, cottage, or hall</p>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2 font-semibold"
              onClick={() => router.push('/admin/facilities')}
            >
              Back to Facilities
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl">Facility Details</CardTitle>
            <CardDescription>Fill in the information for the new facility</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Facility Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="h-11 text-base"
                  placeholder="e.g., Deluxe Ocean View Room"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kind" className="text-sm font-semibold">Facility Type</Label>
                <select
                  id="kind"
                  value={form.kind}
                  onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
                  className="flex h-11 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-base font-medium cursor-pointer hover:border-primary transition-colors"
                  required
                >
                  <option value="ROOM">Room</option>
                  <option value="COTTAGE">Cottage</option>
                  <option value="HALL">Hall</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="flex min-h-[100px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-base resize-none"
                  placeholder="Describe the facility features, amenities, and highlights..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-semibold">Guest Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                    required
                    className="h-11 text-base"
                    placeholder="Max guests"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold">Price per Night (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    required
                    className="h-11 text-base"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">Photos</Label>
                <Input
                  id="photoFiles"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {form.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {form.photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Preview ${idx + 1}`} 
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm(f => ({
                              ...f,
                              photos: f.photos.filter((_, i) => i !== idx)
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

              <div className="space-y-2">
                <Label htmlFor="amenities" className="text-sm font-semibold">Amenities</Label>
                <Input
                  id="amenities"
                  placeholder="WiFi, AC, TV, Mini Fridge, Hot Shower"
                  value={form.amenities.join(", ")}
                  onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground">Separate amenities with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules" className="text-sm font-semibold">Rules & Policies</Label>
                <Input
                  id="rules"
                  placeholder="No smoking, No pets, Quiet hours after 10 PM"
                  value={form.rules.join(", ")}
                  onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground">Separate rules with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freeAmenities" className="text-sm font-semibold">Free When You Book</Label>
                <Input
                  id="freeAmenities"
                  placeholder="Breakfast, Parking, Pool Access, Beach Towels"
                  value={form.freeAmenities.join(", ")}
                  onChange={(e) => setForm((f) => ({ ...f, freeAmenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground">Complimentary amenities included with booking</p>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  size="lg" 
                  className="flex-1 font-bold shadow-lg hover:shadow-xl bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  {submitting ? "Creating Facility..." : "Create Facility"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 font-semibold hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2"
                  onClick={() => router.push('/admin/facilities')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
