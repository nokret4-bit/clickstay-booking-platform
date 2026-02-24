import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TropicalCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  variant?: "default" | "accent" | "green";
}

export function TropicalCard({ 
  children, 
  hover = true, 
  variant = "default",
  className, 
  ...props 
}: TropicalCardProps) {
  const variants = {
    default: "bg-white border-tropical-tan/20",
    accent: "bg-gradient-to-br from-tropical-yellow/10 to-tropical-red/10 border-tropical-red/30",
    green: "bg-gradient-to-br from-tropical-green-soft/10 to-tropical-green-deep/10 border-tropical-green/30",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-6 shadow-lg backdrop-blur-sm",
        hover && "tropical-hover cursor-pointer",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
