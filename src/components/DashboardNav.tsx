
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import {
  BarChart3,
  Phone,
  FileAudio,
  Users,
  PhoneForwarded,
  Server,
  CreditCard,
  Settings,
  ShieldCheck,
  Activity,
  Network,
  Smartphone
} from "lucide-react";

interface DashboardNavProps {
  isCollapsed: boolean;
}

export function DashboardNav({ isCollapsed }: DashboardNavProps) {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: BarChart3,
    },
    {
      href: "/campaign",
      label: "Campaigns",
      icon: Phone,
    },
    {
      href: "/greetings",
      label: "Audio Files",
      icon: FileAudio,
    },
    {
      href: "/contacts",
      label: "Leads",
      icon: Users,
    },
    {
      href: "/transfers",
      label: "Transfers",
      icon: PhoneForwarded,
    },
    {
      href: "/goip-setup",
      label: "GoIP Setup",
      icon: Smartphone,
    },
    {
      href: "/upgrade",
      label: "Upgrade",
      icon: CreditCard,
    },
    {
      href: "/profile",
      label: "Settings",
      icon: Settings,
    },
    {
      href: "/diagnostics",
      label: "Diagnostics",
      icon: Activity,
    },
    // Asterisk Config is already available to all users
    {
      href: "/asterisk-config",
      label: "Asterisk Config",
      icon: Phone,
    }
  ];

  // Add admin-only route if user is admin
  if (isAdmin) {
    routes.push({
      href: "/admin",
      label: "Admin Panel",
      icon: ShieldCheck,
    });
  }

  return (
    <ScrollArea className="h-full py-4">
      <div className="flex flex-col gap-2 px-2">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "secondary" : "ghost"}
            size={isCollapsed ? "icon" : "default"}
            className={cn(
              "justify-start",
              isCollapsed && "h-10 w-10 p-0"
            )}
            asChild
          >
            <Link to={route.href}>
              <route.icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
