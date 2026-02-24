"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface RebookButtonProps {
  facilityId: string;
  facilityName: string;
}

export function RebookButton({ facilityId, facilityName }: RebookButtonProps) {
  const router = useRouter();

  const handleRebook = () => {
    // Redirect to checkout page with the same facility
    router.push(`/checkout?unitId=${facilityId}`);
  };

  return (
    <Button onClick={handleRebook} variant="default" className="w-full">
      <Calendar className="h-4 w-4 mr-2" />
      Rebook {facilityName}
    </Button>
  );
}
