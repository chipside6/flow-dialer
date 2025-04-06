
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  withText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", withText = true, className }: LogoProps) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
    "2xl": "h-16 w-16",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
    "2xl": "text-3xl",
  };

  const logoSize = sizes[size];
  const textSize = textSizes[size];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(logoSize, "relative overflow-hidden rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center")}>
        <img 
          src="/lovable-uploads/3b232783-6db7-4692-bf2e-eeadcc07ea17.png" 
          alt="Flow Dialer" 
          className="w-full h-full object-cover" 
        />
      </div>
      {withText && (
        <span className={cn(`font-display ${textSize} font-bold tracking-tight drop-shadow-sm whitespace-nowrap flex-shrink-0`, 
          className?.includes("text-white") ? "text-white" : "text-foreground")}>
          Flow Dialer
        </span>
      )}
    </div>
  );
};
