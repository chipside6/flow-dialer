
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavItem } from "@/components/navigation/NavItem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  Phone, 
  Settings, 
  Bug, 
  Server, 
  Menu 
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Sidebar = ({ className }: SidebarProps) => {
  const [open, setOpen] = React.useState(false);
  
  // Mock user data for now - you should replace this with your auth context
  const user = { email: "user@example.com" };

  return (
    <div className={`pb-12 ${className || ''}`}>
      <div className="flex justify-between items-center py-2 px-4 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className={`${open ? 'block' : 'hidden'} md:block h-full flex-col justify-between space-y-2 py-4`}>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Flow Dialer
          </h2>
          <div className="space-y-1">
            <div className="grid place-items-center gap-2 px-4">
              <Avatar>
                <AvatarFallback>
                  {user?.email ? user.email[0].toUpperCase() : <Skeleton />}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                {user?.email || <Skeleton />}
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            <NavItem
              to="/"
              icon={<Home className="h-4 w-4" />}
            >
              Home
            </NavItem>
            <NavItem
              to="/settings"
              icon={<Settings className="h-4 w-4" />}
            >
              Settings
            </NavItem>
            <NavItem
              to="/diagnostic"
              icon={<Bug className="h-4 w-4" />}
            >
              Diagnostic
            </NavItem>
            <NavItem
              to="/asterisk-connection-test"
              icon={<Server className="h-4 w-4" />}
            >
              Asterisk Connection
            </NavItem>
          </div>
        </div>
      </div>
    </div>
  );
}
