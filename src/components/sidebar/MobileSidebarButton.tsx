
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MobileSidebarButtonProps {
  onClick: () => void;
}

export const MobileSidebarButton = ({ onClick }: MobileSidebarButtonProps) => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md" 
        onClick={onClick}
      >
        <Menu size={20} />
      </Button>
    </div>
  );
};
