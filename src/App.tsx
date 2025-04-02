import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { CampaignProvider } from './contexts/campaign/CampaignContext';
import './App.css';
import Dashboard from './pages/Dashboard';
import CampaignPage from './pages/CampaignPage';
import ContactListsPage from './pages/ContactListsPage';
import GreetingPage from './pages/GreetingPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PricingPage from './pages/PricingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPage from './pages/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { PricingProvider } from './contexts/pricing/PricingProvider';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CampaignProvider>
          <PricingProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/campaigns" element={<ProtectedRoute><CampaignPage /></ProtectedRoute>} />
              <Route path="/contact-lists" element={<ProtectedRoute><ContactListsPage /></ProtectedRoute>} />
              <Route path="/greetings" element={<ProtectedRoute><GreetingPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            </Routes>
            <Toaster />
          </PricingProvider>
        </CampaignProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
