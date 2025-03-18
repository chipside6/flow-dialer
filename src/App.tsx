
import React, { useEffect, useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from '@/pages/Index';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Support from '@/pages/Support';
import Dashboard from '@/pages/Dashboard';
import Campaign from '@/pages/Campaign';
import Billing from '@/pages/Billing';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import GreetingFiles from '@/pages/GreetingFiles';
import ContactLists from '@/pages/ContactLists';
import SipProviders from '@/pages/SipProviders';
import TransferNumbers from '@/pages/TransferNumbers';

// Styles
import './App.css';
import '@/styles/dashboard.css';
import '@/styles/dashboard-layout.css';
import '@/styles/dashboard-sidebar.css';
import '@/styles/sidebar-mobile.css';
import '@/styles/mobile.css';
import '@/styles/mobile-menu.css';
import '@/styles/responsive-layout.css';
import '@/styles/dashboard-z-index.css';
import '@/styles/base.css';

function App() {
  const location = useLocation();
  
  // Add route-specific class to body
  useEffect(() => {
    // First remove any existing route classes
    document.body.classList.forEach(cls => {
      if (cls.startsWith('route-')) {
        document.body.classList.remove(cls);
      }
    });
    
    // Get the current route path and add appropriate class
    const path = location.pathname.split('/')[1] || 'home';
    document.body.classList.add(`route-${path}`);
    
    return () => {
      document.body.classList.remove(`route-${path}`);
    };
  }, [location.pathname]);
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/support" element={<Support />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/campaign/:id" element={<ProtectedRoute><Campaign /></ProtectedRoute>} />
          <Route path="/greeting-files" element={<ProtectedRoute><GreetingFiles /></ProtectedRoute>} />
          <Route path="/contact-lists" element={<ProtectedRoute><ContactLists /></ProtectedRoute>} />
          <Route path="/transfer-numbers" element={<ProtectedRoute><TransferNumbers /></ProtectedRoute>} />
          <Route path="/sip-providers" element={<ProtectedRoute><SipProviders /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <Sonner position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
