import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavItem } from "@/components/navigation/NavItem";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLockBody } from "@/hooks/use-lock-body";
import { useAuth } from "@/contexts/auth";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Server } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname() || "/";
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  useLockBody(open);

  return (
    <div className={cn("pb-12", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
          >
            <Icons.menu className="h-5 w-5 rotate-0 lg:hidden" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="h-screen w-[200px] border-r px-0 pt-0"
        >
          <ScrollArea className="h-full py-6 pr-2">
            <SheetHeader className="px-4 pb-4">
              <SheetTitle className="text-lg font-semibold">Flow Dialer</SheetTitle>
              <SheetDescription>
                {user ? user.email : "Please sign in"}
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Account
              </h2>
              <div className="space-y-1">
                <div className="grid place-items-center gap-2 px-4">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
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
                  icon={<Icons.home className="h-4 w-4" />}
                >
                  Home
                </NavItem>
                <NavItem
                  to="/trunks"
                  icon={<Icons.phone className="h-4 w-4" />}
                >
                  Trunks
                </NavItem>
                <NavItem
                  to="/settings"
                  icon={<Icons.settings className="h-4 w-4" />}
                >
                  Settings
                </NavItem>
                <NavItem
                  to="/diagnostic"
                  icon={<Icons.bug className="h-4 w-4" />}
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
            <Separator />
            <div className="mt-auto px-3 py-2">
              <ModeToggle />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="hidden h-full flex-col justify-between space-y-2 py-4 md:flex">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Flow Dialer
          </h2>
          <div className="space-y-1">
            <div className="grid place-items-center gap-2 px-4">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
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
              icon={<Icons.home className="h-4 w-4" />}
            >
              Home
            </NavItem>
            <NavItem
              to="/trunks"
              icon={<Icons.phone className="h-4 w-4" />}
            >
              Trunks
            </NavItem>
            <NavItem
              to="/settings"
              icon={<Icons.settings className="h-4 w-4" />}
            >
              Settings
            </NavItem>
            <NavItem
              to="/diagnostic"
              icon={<Icons.bug className="h-4 w-4" />}
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
        <Separator />
        <div className="mt-auto px-3 py-2">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};
