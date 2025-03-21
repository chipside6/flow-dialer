
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MobileSidebarButtonProps {
  onClick: () => void;
}

export const MobileSidebarButton = ({ onClick }: MobileSidebarButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };
  
  return (
    <div className="fixed top-4 left-4 z-45">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md w-12 h-12 flex items-center justify-center" 
        onClick={handleClick}
      >
        <Menu size={24} />
      </Button>
    </div>
  );
};
