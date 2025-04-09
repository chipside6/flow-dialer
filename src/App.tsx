
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth/AuthProvider';
// Page imports
import Home from '@/pages/Home';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage'; // Ensure correct case sensitivity
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
import { RequireAuth } from '@/components/auth/RequireAuth';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/contacts" element={<RequireAuth><ContactsPage /></RequireAuth>} />
          <Route path="/contacts/:listId" element={<RequireAuth><ContactListPage /></RequireAuth>} />
          <Route path="/campaigns" element={<RequireAuth><CampaignsPage /></RequireAuth>} />
          <Route path="/campaigns/:campaignId" element={<RequireAuth><CampaignDetailPage /></RequireAuth>} />
          <Route path="/campaigns/:campaignId/dialer" element={<RequireAuth><CampaignDialer /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/asterisk-config" element={<RequireAuth><AsteriskConfigPage /></RequireAuth>} />
          <Route path="/goip-setup" element={<RequireAuth><GoipSetup /></RequireAuth>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
