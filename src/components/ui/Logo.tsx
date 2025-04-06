
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
    "2xl": "h-14 w-14",
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
      <div className={cn(logoSize, "relative rounded-full bg-[#0B1A23] flex-shrink-0 p-0 overflow-hidden flex items-center justify-center")}>
        <img 
          src="/lovable-uploads/f85026b8-e221-4dd4-bd5c-cfaba6c14f29.png" 
          alt="Flow Dialer" 
          className="w-[90%] h-[90%] object-contain transform scale-125" 
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
