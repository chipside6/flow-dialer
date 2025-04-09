
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import { touchSession } from '@/services/auth/session';

// Page imports
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUp';  // Using the direct import to SignUp.tsx
import DashboardPage from '@/pages/DashboardPage';
import ContactsPage from '@/pages/ContactsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import CampaignDetailPage from '@/pages/CampaignDetailPage';
import CampaignDialer from '@/pages/CampaignDialer';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import ContactListPage from '@/pages/ContactListPage';
import AsteriskConfigPage from '@/pages/AsteriskConfigPage';
import GoipSetup from '@/pages/GoipSetup';
import TransfersPage from '@/pages/TransfersPage';
import GreetingsPage from '@/pages/GreetingsPage';

import PublicLayout from '@/components/layout/PublicLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  // Touch session periodically at the app level
  useEffect(() => {
    // Initial touch
    touchSession();
    
    // Set up interval for periodic touches
    const intervalId = setInterval(() => {
      touchSession();
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes with PublicLayout wrapper that includes the header */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
          <Route path="/contacts/:listId" element={<ProtectedRoute><ContactListPage /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId" element={<ProtectedRoute><CampaignDetailPage /></ProtectedRoute>} />
          <Route path="/campaigns/:campaignId/dialer" element={<ProtectedRoute><CampaignDialer /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/goip-setup" element={<ProtectedRoute><GoipSetup /></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
          <Route path="/greetings" element={<ProtectedRoute><GreetingsPage /></ProtectedRoute>} />
          
          {/* Admin-only routes */}
          <Route path="/asterisk-config" element={<ProtectedRoute requireAdmin={true}><AsteriskConfigPage /></ProtectedRoute>} />
          
          {/* Redirect for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
