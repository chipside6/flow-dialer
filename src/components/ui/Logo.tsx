
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  withText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", withText = true, className }: LogoProps) => {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
    "2xl": "h-12 w-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const logoSize = sizes[size];
  const textSize = textSizes[size];
  
  return (
    <div className={cn("flex items-center gap-2 whitespace-nowrap", className)}>
      <div className={cn(logoSize, "relative rounded-full bg-primary/10 flex-shrink-0")}>
        <img 
          src="/lovable-uploads/3b232783-6db7-4692-bf2e-eeadcc07ea17.png" 
          alt="Flow Dialer" 
          className="w-full h-full object-contain" 
        />
      </div>
      {withText && (
        <span className={cn(`font-display ${textSize} font-bold tracking-tight drop-shadow-sm whitespace-nowrap`, 
          className?.includes("text-white") ? "text-white" : "text-foreground")}>
          Flow Dialer
        </span>
      )}
    </div>
  );
};
