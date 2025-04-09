
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Phone, 
  FileAudio, 
  Users, 
  Settings, 
  ExternalLink,
  X,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import LogoutButton from '../LogoutButton';
import { SidebarNavItem } from './SidebarNavItem';
import { useAuth } from '@/contexts/auth';
import { useSidebar } from '@/components/ui/sidebar';

export const DashboardSidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [activeItem, setActiveItem] = useState('');
  const { openMobile, setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.includes('/campaigns') || path.includes('/campaign')) {
      setActiveItem('campaigns');
    } else if (path.includes('/contacts')) {
      setActiveItem('contacts');
    } else if (path.includes('/transfers')) {
      setActiveItem('transfers');
    } else if (path.includes('/greetings')) {
      setActiveItem('greetings');
    } else if (path.includes('/goip-setup')) {
      setActiveItem('goip');
    } else if (path.includes('/profile')) {
      setActiveItem('profile');
    } else if (path.includes('/settings')) {
      setActiveItem('settings');
    }
  }, [location]);

  const handleCloseSidebar = () => {
    if (setOpenMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div 
      data-sidebar="sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-transform duration-300 ease-in-out ${
        openMobile || !isMobile ? 'translate-x-0' : '-translate-x-full'
      } md:flex w-64`}
    >
      <div className="flex h-14 items-center px-4 border-b" data-sidebar="header">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-lg">VoIP Dialer</span>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={handleCloseSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2 py-4" data-sidebar="content">
        <nav className="flex flex-col gap-1">
          <SidebarNavItem
            icon={<LayoutDashboard className="h-4 w-4" />}
            href="/dashboard"
            label="Dashboard"
            isActive={activeItem === 'dashboard'}
            onClick={handleCloseSidebar}
          />
          <SidebarNavItem
            icon={<Phone className="h-4 w-4" />}
            href="/campaigns"
            label="Campaigns"
            isActive={activeItem === 'campaigns'}
            onClick={handleCloseSidebar}
          />
          <SidebarNavItem
            icon={<Users className="h-4 w-4" />}
            href="/contacts"
            label="Contact Lists"
            isActive={activeItem === 'contacts'}
            onClick={handleCloseSidebar}
          />
          <SidebarNavItem
            icon={<Phone className="h-4 w-4" />}
            href="/transfers"
            label="Transfer Numbers"
            isActive={activeItem === 'transfers'}
            onClick={handleCloseSidebar}
          />
          <SidebarNavItem
            icon={<FileAudio className="h-4 w-4" />}
            href="/greetings"
            label="Greeting Files"
            isActive={activeItem === 'greetings'}
            onClick={handleCloseSidebar}
          />
          <SidebarNavItem
            icon={<ExternalLink className="h-4 w-4" />}
            href="/goip-setup"
            label="GoIP Setup"
            isActive={activeItem === 'goip'}
            onClick={handleCloseSidebar}
          />
          {isAdmin && (
            <SidebarNavItem
              icon={<Settings className="h-4 w-4" />}
              href="/asterisk-config"
              label="Asterisk Config"
              isActive={activeItem === 'asterisk'}
              onClick={handleCloseSidebar}
            />
          )}
        </nav>
        <div className="mt-4 border-t pt-4">
          <SidebarNavItem
            icon={<UserCircle className="h-4 w-4" />}
            href="/profile"
            label="Profile"
            isActive={activeItem === 'profile'}
            onClick={handleCloseSidebar}
          />
          <SidebarNavItem
            icon={<Settings className="h-4 w-4" />}
            href="/settings"
            label="Settings"
            isActive={activeItem === 'settings'}
            onClick={handleCloseSidebar}
          />
          <div className="mt-4">
            <LogoutButton position="left" className="w-full justify-start" />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
