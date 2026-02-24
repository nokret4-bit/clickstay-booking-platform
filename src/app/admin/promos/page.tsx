"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Upload, X, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Promo {
  id: string;
  title: string | null;
  description: string | null;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  bgColor: string;
  facilityLink: string | null;
  isActive: boolean;
  order: number;
}

interface PromoActivity {
  id: string;
  promoId: string;
  action: string;
  userId: string | null;
  userName: string | null;
  details: string | null;
  createdAt: string;
}

export default function PromoManagementPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewingActivityPromoId, setViewingActivityPromoId] = useState<string | null>(null);
  const [activities, setActivities] = useState<PromoActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    mediaUrl: "",
    mediaType: 'IMAGE' as 'IMAGE' | 'VIDEO',
    bgColor: "from-amber-100 to-yellow-50",
    facilityLink: "/browse",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const response = await fetch("/api/admin/promos");
      if (response.ok) {
        const data = await response.json();
        setPromos(data);
      }
    } catch (error) {
      console.error("Error fetching promos:", error);
      toast({
        title: "Error",
        description: "Failed to load promos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPromo
        ? `/api/admin/promos/${editingPromo.id}`
        : "/api/admin/promos";
      const method = editingPromo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingPromo ? "Promo updated" : "Promo created",
        });
        fetchPromos();
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to save promo (${response.status})`;
        console.error("API Error:", errorMessage, errorData);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving promo:", error);
      const message = error instanceof Error ? error.message : "Failed to save promo";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo?")) return;

    try {
      const response = await fetch(`/api/admin/promos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "Promo deleted" });
        fetchPromos();
      }
    } catch (error) {
      console.error("Error deleting promo:", error);
      toast({
        title: "Error",
        description: "Failed to delete promo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setFormData({
      mediaUrl: promo.mediaUrl,
      mediaType: promo.mediaType,
      bgColor: promo.bgColor,
      facilityLink: promo.facilityLink || "/browse",
      isActive: promo.isActive,
      order: promo.order,
    });
    setImagePreview(promo.mediaUrl);
    setIsCreating(true);
  };

  const resetForm = () => {
    setEditingPromo(null);
    setIsCreating(false);
    setImagePreview(null);
    setFormData({
      mediaUrl: "",
      mediaType: 'IMAGE',
      bgColor: "from-amber-100 to-yellow-50",
      facilityLink: "/browse",
      isActive: true,
      order: 0,
    });
  };

  const fetchActivities = async (promoId: string) => {
    setIsLoadingActivities(true);
    try {
      const response = await fetch(`/api/admin/promos/${promoId}/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to load activity logs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleViewActivity = (promoId: string) => {
    setViewingActivityPromoId(promoId);
    fetchActivities(promoId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast({
        title: "Error",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB for videos, 5MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: isVideo ? "Video must be less than 50MB" : "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData((prev) => ({ 
        ...prev, 
        mediaUrl: data.url,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE'
      }));
      setImagePreview(data.url);
      toast({
        title: "Success",
        description: isVideo ? "Video uploaded successfully" : "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, mediaUrl: "", mediaType: 'IMAGE' }));
    setImagePreview(null);
  };


  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const activePromos = promos.filter(p => p.isActive);
  const inactivePromos = promos.filter(p => !p.isActive);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promo Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activePromos.length} displayed • {inactivePromos.length} inactive • {promos.length} total
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Promo
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingPromo ? "Edit Promo Image" : "Upload Promo Image"}</CardTitle>
            <CardDescription>
              {editingPromo ? "Replace the promo image" : "Upload an image to create a new promo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Promo Media (Image or Video) *</Label>
                <p className="text-xs text-muted-foreground mb-1">
                  <strong>Recommended:</strong> 1920x480px (Desktop) or 1440x500px (Balanced)
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Images: Max 5MB • Videos: Max 50MB • Formats: PNG, JPG, GIF, WebP, SVG, MP4, WebM
                </p>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative w-full h-64 border-2 border-green-500 rounded-lg overflow-hidden">
                      {formData.mediaType === 'VIDEO' ? (
                        <video
                          src={imagePreview}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        ✓ Ready to upload
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <Label
                          htmlFor="image-upload"
                          className="cursor-pointer text-primary hover:underline text-lg font-semibold"
                        >
                          Click to upload image or video
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Images: 1920x480px • Max 5MB | Videos: Max 50MB
                        </p>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </div>
                  )}
                  {isUploading && (
                    <div className="text-center py-4">
                      <p className="text-sm font-medium text-primary">Uploading {formData.mediaType === 'VIDEO' ? 'video' : 'image'}...</p>
                      <p className="text-xs text-muted-foreground">Please wait</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={!formData.mediaUrl || isUploading}
                  size="lg"
                  className="flex-1"
                >
                  {editingPromo ? "Update Promo Media" : "Publish Promo"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} size="lg">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Promo List</h2>
        {promos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No promos yet</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Promo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {promos.map((promo) => (
              <Card key={promo.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Media Preview */}
                    <div className="flex-shrink-0">
                      <div className="w-48 h-32 rounded-lg overflow-hidden border">
                        {promo.mediaType === 'VIDEO' ? (
                          <video
                            src={promo.mediaUrl}
                            muted
                            loop
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={promo.mediaUrl}
                            alt="Promo media"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>

                    {/* Promo Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">Promo {promo.mediaType === 'VIDEO' ? 'Video' : 'Image'}</h3>
                            {promo.isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
                                DISPLAYED
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewActivity(promo.id)}
                          >
                            <History className="h-4 w-4 mr-2" />
                            Activity
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(promo)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(promo.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                promo.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {promo.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Order:</span>
                          <div className="mt-1 font-medium">{promo.order}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gradient:</span>
                          <div className="mt-1 text-xs truncate">{promo.bgColor}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Link:</span>
                          <div className="mt-1 text-xs truncate">
                            {promo.facilityLink || "/browse"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Activity Logs Modal */}
      {viewingActivityPromoId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>
                    History of actions for this promo
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewingActivityPromoId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 p-6">
              {isLoadingActivities ? (
                <div className="text-center py-8">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity logs yet
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.action === "CREATED"
                              ? "bg-green-100 text-green-700"
                              : activity.action === "UPDATED"
                              ? "bg-blue-100 text-blue-700"
                              : activity.action === "DELETED"
                              ? "bg-red-100 text-red-700"
                              : activity.action === "ACTIVATED"
                              ? "bg-emerald-100 text-emerald-700"
                              : activity.action === "DEACTIVATED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          <History className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {activity.action}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {activity.details && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.details}
                          </p>
                        )}
                        {activity.userName && (
                          <p className="text-xs text-muted-foreground">
                            By: {activity.userName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
