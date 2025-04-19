import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage'; // Corrected import path
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import NewCampaignPage from './pages/Campaign';
import CampaignDetailPage from './pages/CampaignDetailPage';
import ContactListsPage from './pages/ContactLists';
import ContactListDetailPage from './pages/ContactListPage';
import GreetingFilesPage from './pages/GreetingsPage';
import TransferNumbersPage from './pages/TransfersPage';
import ProfilePage from './pages/ProfilePage';
import UpgradePage from './pages/UpgradePage';
import AdminDashboardPage from './pages/AdminPanel';
import AdminUsersPage from './pages/AdminPanel';
import AdminAsteriskPage from './pages/AsteriskConfigPage';
import AdminReadinessPage from './pages/AdminPanel';
import BackgroundDialerPage from './pages/CampaignDialer';
import PhoneListPage from './pages/SipProvidersPage';
import DiagnosticPage from './pages/DiagnosticPage';
import GoipSetup from './pages/GoipSetup';
import GoipDevicesPage from './pages/GoipDevicesPage';

// Update the routes to include the new GoIP Devices page
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} /> {/* Updated route */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/new" element={<NewCampaignPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/contact-lists" element={<ContactListsPage />} />
          <Route path="/contact-lists/:id" element={<ContactListDetailPage />} />
          <Route path="/greeting-files" element={<GreetingFilesPage />} />
          <Route path="/transfer-numbers" element={<TransferNumbersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/asterisk" element={<AdminAsteriskPage />} />
          <Route path="/admin/readiness" element={<AdminReadinessPage />} />
          <Route path="/dialer" element={<BackgroundDialerPage />} />
          <Route path="/phone-list" element={<PhoneListPage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/goip-setup" element={<GoipSetup />} />
          <Route path="/goip-devices" element={<GoipDevicesPage />} /> {/* Add this new route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
