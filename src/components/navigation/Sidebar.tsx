
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut, 
  PhoneCall,
  Server,
  FileAudio
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { to: '/campaigns', label: 'Campaigns', icon: <PhoneCall className="h-5 w-5" /> },
    { to: '/greetings', label: 'Audio Files', icon: <FileAudio className="h-5 w-5" /> },
    { to: '/contacts', label: 'Leads', icon: <Users className="h-5 w-5" /> },
    { to: '/goip-setup', label: 'Device Setup', icon: <Server className="h-5 w-5" /> },
    { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-white transition-all dark:bg-gray-950",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-14 items-center border-b px-4">
        {collapsed ? (
          <span className="mx-auto font-bold text-xl">A</span>
        ) : (
          <span className="font-bold text-xl">Autodialer</span>
        )}
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink 
                to={link.to} 
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  isActive && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
                  collapsed && "justify-center py-3"
                )}
              >
                {link.icon}
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            </li>
          ))}
          <li className="mt-4">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                collapsed && "justify-center py-3"
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Log Out</span>}
            </Button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
