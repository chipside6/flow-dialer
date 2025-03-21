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
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import { SidebarProvider } from '@/components/ui/sidebar';

// Pages that should be imported from the correct locations
import Dashboard from '@/pages/Dashboard';
import Campaign from '@/pages/Campaign';
import ContactLists from '@/pages/ContactLists'; 
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
  },
  {
    path: "/features",
    element: <PublicLayout><Features /></PublicLayout>,
  },
  {
    path: "/pricing",
    element: <PublicLayout><Pricing /></PublicLayout>,
  },
  {
    path: "/support",
    element: <PublicLayout><Support /></PublicLayout>,
  },
  {
    path: "/login",
    element: <PublicLayout><LoginPage /></PublicLayout>,
  },
  {
    path: "/signup",
    element: <PublicLayout><SignUpPage /></PublicLayout>,
  },
  {
    path: "/unauthorized",
    element: <PublicLayout><UnauthorizedPage /></PublicLayout>,
  },
  {
    path: "*",
    element: <PublicLayout><NotFound /></PublicLayout>,
  },
  
  // Dashboard routes with SidebarProvider
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaign",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <Campaign />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/campaigns",
    element: <Navigate to="/campaign" replace />,
  },
  {
    path: "/greetings",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <Greetings />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/contacts",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <ContactLists />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/transfers",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <Transfers />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/sip-providers",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <SipProviders />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <AdminPanel />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/upgrade",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <DashboardLayout>
            <UpgradePage />
          </DashboardLayout>
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
