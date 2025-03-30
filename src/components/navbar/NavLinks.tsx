
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

export const NavLinks = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="hidden md:flex md:gap-10">
      <NavLink
        to="/features"
        className={({ isActive }) =>
          isActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
      >
        Features
      </NavLink>
      <NavLink
        to="/pricing"
        className={({ isActive }) =>
          isActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
      >
        Pricing
      </NavLink>
      <NavLink
        to="/support"
        className={({ isActive }) =>
          isActive
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
      >
        Support
      </NavLink>
      {isAuthenticated && (
        <NavLink
          to="/upgrade"
          className={({ isActive }) =>
            isActive
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground transition-colors"
          }
        >
          Upgrade
        </NavLink>
      )}
    </div>
  );
};
