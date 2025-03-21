
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
    <div className="fixed top-2 left-2 z-50">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md w-10 h-10 flex items-center justify-center" 
        onClick={handleClick}
      >
        <Menu size={20} />
      </Button>
    </div>
  );
};
