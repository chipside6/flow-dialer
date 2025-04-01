
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Campaign from "./pages/Campaign";
import GreetingsPage from "./pages/GreetingsPage";
import ContactLists from "./pages/ContactLists";
import TransferNumbers from "./pages/TransferNumbers";
import SipProviders from "./pages/SipProviders";
import Dashboard from "./pages/Dashboard";
import UpgradePage from "./pages/UpgradePage";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DiagnosticPage from "./pages/DiagnosticPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Import the App.css for styling
import "./App.css"; 
// Import the header-fixes.css for header and logout button fixes
import "./styles/header-fixes.css";

console.log('🔍 App.tsx is initializing');

const App = () => {
  console.log('🔍 App component rendering');
  
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <SidebarProvider defaultOpen>
            {/* Properly moved console.log statements outside of JSX rendering */}
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/support" element={<Support />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
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
              <Route 
                path="/billing" 
                element={<Navigate to="/upgrade" replace />} 
              />
              <Route 
                path="/upgrade" 
                element={
                  <ProtectedRoute>
                    <UpgradePage />
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
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  );
};

console.log('🔍 App.tsx finished initializing');

export default App;
