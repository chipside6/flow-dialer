import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from '@/contexts/auth';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import DashboardPage from '@/pages/DashboardPage';
import CampaignPage from '@/pages/CampaignPage';
import GreetingsPage from '@/pages/GreetingsPage';
import ContactsPage from '@/pages/ContactsPage';
import TransfersPage from '@/pages/TransfersPage';
import SipProvidersPage from '@/pages/SipProvidersPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPanelPage from '@/pages/AdminPanelPage';
import FeaturesPage from '@/pages/FeaturesPage';
import PricingPage from '@/pages/PricingPage';
import SupportPage from '@/pages/SupportPage';
import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import UpgradePage from './pages/UpgradePage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, initialized } = useAuth();
  
  if (!initialized) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/features",
        element: <FeaturesPage />,
      },
      {
        path: "/pricing",
        element: <PricingPage />,
      },
      {
        path: "/support",
        element: <SupportPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignUpPage />,
      },
      {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout><DashboardPage /></DashboardLayout>,
      },
      {
        path: "/campaign",
        element: <DashboardLayout><CampaignPage /></DashboardLayout>,
      },
      {
        path: "/campaigns",
        element: <Navigate to="/campaign" replace />,
      },
      {
        path: "/greetings",
        element: <DashboardLayout><GreetingsPage /></DashboardLayout>,
      },
      {
        path: "/contacts",
        element: <DashboardLayout><ContactsPage /></DashboardLayout>,
      },
      {
        path: "/transfers",
        element: <DashboardLayout><TransfersPage /></DashboardLayout>,
      },
      {
        path: "/sip-providers",
        element: <DashboardLayout><SipProvidersPage /></DashboardLayout>,
      },
      {
        path: "/profile",
        element: <DashboardLayout><ProfilePage /></DashboardLayout>,
      },
      {
        path: "/admin",
        element: <DashboardLayout><AdminPanelPage /></DashboardLayout>,
      },
      {
        path: "/upgrade",
        element: <DashboardLayout><UpgradePage /></DashboardLayout>,
      },
    ],
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
