
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
import GreetingFiles from "./pages/GreetingFiles";
import ContactLists from "./pages/ContactLists";
import TransferNumbers from "./pages/TransferNumbers";
import SipProviders from "./pages/SipProviders";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import UpgradePage from "./pages/UpgradePage";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Import the App.css for styling
import "./App.css"; 

const App = () => (
  <TooltipProvider>
    <SidebarProvider defaultOpen>
      <AuthProvider>
        <BrowserRouter>
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/support" element={<Support />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            
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
                  <GreetingFiles />
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
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } 
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
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SidebarProvider>
  </TooltipProvider>
);

export default App;
