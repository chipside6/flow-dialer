
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from '@/components/ui/sidebar';

interface MobileSidebarButtonProps {
  onClick: () => void;
}

export const MobileSidebarButton = ({ onClick }: MobileSidebarButtonProps) => {
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { openMobile } = useSidebar();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
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
  };
  
  // Don't show the button if the sidebar is already open
  if (openMobile) return null;
  
  return (
    <div 
      className={`fixed top-4 left-4 z-40 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
      }`}
    >
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:bg-slate-800/80 dark:border-slate-700 dark:hover:bg-slate-700" 
        onClick={handleClick}
        aria-label="Open sidebar"
        data-mobile-menu-trigger
      >
        <Menu size={20} />
      </Button>
    </div>
  );
};
