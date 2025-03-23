
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MobileSidebarButtonProps {
  onClick: () => void;
}

export const MobileSidebarButton = ({ onClick }: MobileSidebarButtonProps) => {
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Make the button visible when:
      // 1. User scrolls to the top (currentScrollPos <= 10)
      // 2. User is scrolling upward (currentScrollPos < prevScrollPos)
      const isVisible = currentScrollPos <= 10 || currentScrollPos < prevScrollPos;
      
      setVisible(isVisible);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    console.log("Mobile sidebar button clicked");
  };
  
  return (
    <div 
      className={`fixed top-5 left-4 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
      }`}
    >
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-lg w-12 h-12 flex items-center justify-center mobile-sidebar-button border border-gray-200" 
        onClick={handleClick}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </Button>
    </div>
  );
};
