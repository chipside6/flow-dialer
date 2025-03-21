
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from '@/contexts/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import UpgradePage from './pages/UpgradePage';

// Pages that should be imported from the correct locations
import Dashboard from '@/pages/Dashboard';
import Campaign from '@/pages/Campaign';
import ContactLists from '@/pages/ContactLists'; // Fixed import path
import Greetings from '@/pages/GreetingFiles';
import Transfers from '@/pages/TransferNumbers';
import SipProviders from '@/pages/SipProviders';
import Profile from '@/pages/Profile';
import AdminPanel from '@/pages/AdminPanel';
import LandingPage from '@/pages/Index';
import LoginPage from '@/pages/Login';
import SignUpPage from '@/pages/SignUp';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Support from '@/pages/Support';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/NotFound'; // Using NotFound as fallback for Unauthorized

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout><LandingPage /></PublicLayout>,
    children: [
      {
        path: "/features",
        element: <Features />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/support",
        element: <Support />,
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
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/campaign",
    element: <ProtectedRoute><Campaign /></ProtectedRoute>,
  },
  {
    path: "/campaigns",
    element: <Navigate to="/campaign" replace />,
  },
  {
    path: "/greetings",
    element: <ProtectedRoute><Greetings /></ProtectedRoute>,
  },
  {
    path: "/contacts",
    element: <ProtectedRoute><ContactLists /></ProtectedRoute>,
  },
  {
    path: "/transfers",
    element: <ProtectedRoute><Transfers /></ProtectedRoute>,
  },
  {
    path: "/sip-providers",
    element: <ProtectedRoute><SipProviders /></ProtectedRoute>,
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/admin",
    element: <ProtectedRoute><AdminPanel /></ProtectedRoute>,
  },
  {
    path: "/upgrade",
    element: <ProtectedRoute><UpgradePage /></ProtectedRoute>,
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
