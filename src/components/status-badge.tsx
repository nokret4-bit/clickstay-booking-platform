import { BookingStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Partial<
    Record<
      BookingStatus,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    >
  > = {
    PENDING: { variant: "outline", label: "Pending" },
    CONFIRMED: { variant: "default", label: "Confirmed" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    COMPLETED: { variant: "secondary", label: "Completed" },
  };

  const config = variants[status];

  if (!config) {
    const fallbackLabel = typeof status === "string"
      ? status
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(" ")
      : "Unknown";

    return <Badge variant="outline">{fallbackLabel}</Badge>;
  }

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
