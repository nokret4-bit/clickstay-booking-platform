"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface DeleteFacilityButtonProps {
  facilityId: string;
  facilityName: string;
}

export function DeleteFacilityButton({ facilityId, facilityName }: DeleteFacilityButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm(`Delete ${facilityName}? This will hide it from customers.`)) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/facilities/${facilityId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Facility deleted successfully",
        });
        router.refresh();
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete facility",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="text-red-600 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 font-semibold hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer border-2"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-5 w-5 mr-2" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
