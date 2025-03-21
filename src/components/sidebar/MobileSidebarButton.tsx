
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
        className="bg-white rounded-full shadow-md w-12 h-12 flex items-center justify-center mobile-sidebar-button" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        aria-label="Open Menu"
        style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
      >
        <Menu size={24} />
      </Button>
    </div>
  );
};
