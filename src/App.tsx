
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SubscriptionCheck } from "@/components/SubscriptionCheck";
import { Skeleton } from "@/components/ui/skeleton";

// Import the App.css for styling
import "./App.css"; 
// Import the header-fixes.css for header and logout button fixes
import "./styles/header-fixes.css";

// Import Login directly instead of lazy loading it
import Login from "./pages/Login";

// Lazy load other components for improved performance
const Index = lazy(() => import("./pages/Index"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Support = lazy(() => import("./pages/Support"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Campaign = lazy(() => import("./pages/Campaign"));
const GreetingsPage = lazy(() => import("./pages/GreetingsPage"));
const ContactLists = lazy(() => import("./pages/ContactLists"));
const TransferNumbers = lazy(() => import("./pages/TransferNumbers"));
const SipProviders = lazy(() => import("./pages/SipProviders"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UpgradePage = lazy(() => import("./pages/UpgradePage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DiagnosticPage = lazy(() => import("./pages/DiagnosticPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
// Fix the import to ensure proper loading
const AsteriskConfigPage = lazy(() => import("@/pages/AsteriskConfigPage"));
const QuickAdminSetup = lazy(() => import("./pages/QuickAdminSetup"));

// Loading fallback for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="w-full max-w-md space-y-4 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-64 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  </div>
);

const App = () => (
  <TooltipProvider>
    <AuthProvider>
      <BrowserRouter>
        <SidebarProvider defaultOpen>
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/support" element={<Support />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/quick-admin-setup" element={<QuickAdminSetup />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/campaign" 
                element={
                  <ProtectedRoute>
                    <Campaign />
                  </ProtectedRoute>
                } 
              />
              {/* Add campaigns route (plural) as an alias to campaign */}
              <Route 
                path="/campaigns" 
                element={
                  <ProtectedRoute>
                    <Campaign />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/greetings" 
                element={
                  <ProtectedRoute>
                    <GreetingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contacts" 
                element={
                  <ProtectedRoute>
                    <ContactLists />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/transfers" 
                element={
                  <ProtectedRoute>
                    <TransferNumbers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sip-providers" 
                element={
                  <ProtectedRoute>
                    <SipProviders />
                  </ProtectedRoute>
                } 
              />
              {/* Check subscription status before showing billing/upgrade pages */}
              <Route 
                path="/billing" 
                element={
                  <ProtectedRoute>
                    <SubscriptionCheck redirectTo="/dashboard" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upgrade" 
                element={
                  <ProtectedRoute>
                    <SubscriptionCheck redirectTo="/dashboard" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              {/* Admin route - requires admin privileges */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/diagnostics" 
                element={
                  <ProtectedRoute>
                    <DiagnosticPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Update Asterisk Configuration route to require admin privileges */}
              <Route 
                path="/asterisk-config" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AsteriskConfigPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </SidebarProvider>
      </BrowserRouter>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
