
import { Link } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from '@/components/LogoutButton';
import { Logo } from '@/components/ui/Logo';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

export const DashboardNavbar = ({ toggleSidebar }: DashboardNavbarProps) => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  // Only render the navbar when not on mobile
  // On mobile, this content is shown in the sidebar header
  if (isMobile) {
    return null;
  }
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-3 bg-background border-b shadow-sm navbar-dashboard"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 flex items-center justify-center w-12 h-12 rounded-full hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2"
          >
            <Logo size="md" withText={true} />
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 relative">
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <LogoutButton variant="ghost" className="w-full justify-start p-0" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
