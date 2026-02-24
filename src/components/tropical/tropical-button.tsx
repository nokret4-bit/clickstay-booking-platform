import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TropicalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const TropicalButton = forwardRef<HTMLButtonElement, TropicalButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-xl active:scale-95";
    
    const variants = {
      primary: "bg-gradient-tropical text-white hover:scale-105",
      secondary: "bg-gradient-green text-white hover:scale-105",
      outline: "border-2 border-tropical-red text-tropical-red hover:bg-tropical-red hover:text-white",
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TropicalButton.displayName = "TropicalButton";
