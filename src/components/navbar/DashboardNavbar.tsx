
import { Link } from 'react-router-dom';
import { Menu, Phone, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from '@/components/LogoutButton';

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

export const DashboardNavbar = ({ toggleSidebar }: DashboardNavbarProps) => {
  const { profile } = useAuth();
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out px-4 py-2 bg-background border-b shadow-sm navbar-dashboard"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
          >
            <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <Phone size={16} />
            </span>
            <span className="md:inline hidden">Flow Dialer</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
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
