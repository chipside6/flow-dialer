
import { Link } from 'react-router-dom';
import { Menu, Phone } from 'lucide-react';

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

export const DashboardNavbar = ({ toggleSidebar }: DashboardNavbarProps) => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-3 bg-background border-b shadow-sm navbar-dashboard"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          {/* Hide the logo text in dashboard mode on mobile to prevent overlap */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
          >
            <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <Phone size={18} />
            </span>
            <span className="md:inline hidden">Flow Dialer</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dashboard actions could go here */}
        </div>
      </div>
    </header>
  );
};
