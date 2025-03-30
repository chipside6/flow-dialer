import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Link } from "react-router-dom";
import {
  CreditCard,
  DollarSign,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Star,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LogoutButton } from "../auth/LogoutButton";

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          size="icon"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            to="/features"
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Star className="h-5 w-5" />
            Features
          </Link>
          <Link
            to="/pricing"
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <DollarSign className="h-5 w-5" />
            Pricing
          </Link>
          <Link
            to="/support"
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <LifeBuoy className="h-5 w-5" />
            Support
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/upgrade"
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <CreditCard className="h-5 w-5" />
                Upgrade
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              <LogoutButton />
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Button asChild>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
