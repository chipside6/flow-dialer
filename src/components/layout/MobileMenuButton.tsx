
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  onClick: () => void;
}

export const MobileMenuButton = ({ onClick }: MobileMenuButtonProps) => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md" 
        onClick={() => {
          console.log('Menu button clicked, toggling sidebar');
          onClick();
        }}
      >
        <Menu size={20} />
      </Button>
    </div>
  );
};
