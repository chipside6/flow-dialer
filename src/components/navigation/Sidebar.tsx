
import React from "react"
import {
  Home,
  ListChecks,
  Users,
  Mic2,
  PhoneForwarded,
  Settings,
  LayoutDashboard,
  User,
  CreditCard,
  CircleUserRound,
  Headphones,
  MessageSquarePlus,
  MessagesSquare,
  Smartphone,
  Server,
  Activity,
  AlertCircle,
  HelpCircle,
} from "lucide-react"
import { NavItem } from "@/components/navigation/NavItem"
import { useAuth } from "@/contexts/auth"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

// Placeholder component for UpgradeButton
const UpgradeButton = () => {
  return (
    <Button variant="outline" className="w-full">
      <CreditCard className="h-4 w-4 mr-2" />
      Upgrade
    </Button>
  );
};

// Placeholder component for AffiliateStatus
const AffiliateStatus = () => null;

export function Sidebar() {
  const { user, signOut } = useAuth()
  const subscription = null; // Placeholder until we implement subscription hook

  return (
    <aside className="pb-12 w-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={<Home />}>
              Home
            </NavItem>
            <NavItem to="/campaigns" icon={<ListChecks />}>
              Campaigns
            </NavItem>
            <NavItem to="/contact-lists" icon={<Users />}>
              Contact Lists
            </NavItem>
            <NavItem to="/greeting-files" icon={<Mic2 />}>
              Greeting Files
            </NavItem>
            <NavItem to="/transfer-numbers" icon={<PhoneForwarded />}>
              Transfer Numbers
            </NavItem>
            <NavItem to="/phone-list" icon={<Smartphone />}>
              Phone List
            </NavItem>
            <NavItem to="/goip-devices" icon={<Server />}>
              GoIP Devices
            </NavItem>
            <NavItem to="/goip-setup" icon={<Settings />}>
              GoIP Setup
            </NavItem>
            <NavItem to="/dialer" icon={<Headphones />}>
              Background Dialer
            </NavItem>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Account
          </h2>
          <div className="space-y-1">
            <NavItem to="/profile" icon={<CircleUserRound />}>
              Profile
            </NavItem>
            <NavItem to="/upgrade" icon={<CreditCard />}>
              {subscription ? "Manage Subscription" : "Upgrade"}
            </NavItem>
            <AffiliateStatus />
          </div>
        </div>
        {user && user.role === 'admin' && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Admin
            </h2>
            <div className="space-y-1">
              <NavItem to="/admin" icon={<LayoutDashboard />}>
                Dashboard
              </NavItem>
              <NavItem to="/admin/users" icon={<Users />}>
                Users
              </NavItem>
              <NavItem to="/admin/asterisk" icon={<Server />}>
                Asterisk
              </NavItem>
              <NavItem to="/admin/readiness" icon={<Activity />}>
                Readiness
              </NavItem>
            </div>
          </div>
        )}
        <div className="mt-6 px-6">
          <Button variant="outline" className="w-full" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  )
}
