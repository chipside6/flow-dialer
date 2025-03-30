
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", withText = true, className }: LogoProps) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const logoSize = sizes[size];
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(logoSize, "relative overflow-hidden rounded-full bg-primary/10")}>
        <img 
          src="/lovable-uploads/3b232783-6db7-4692-bf2e-eeadcc07ea17.png" 
          alt="Flow Dialer" 
          className="w-full h-full object-contain" 
        />
      </div>
      {withText && (
        <span className={cn("font-display text-xl font-bold tracking-tight drop-shadow-sm", 
          className?.includes("text-white") ? "text-white" : "text-foreground")}>
          Flow Dialer
        </span>
      )}
    </div>
  );
};
