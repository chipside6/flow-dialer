
import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ProfilePage from '@/pages/ProfilePage';
import PricingPage from '@/pages/PricingPage';
import UpgradePage from '@/pages/UpgradePage';
import SettingsPage from '@/pages/SettingsPage';
import SipProvidersPage from '@/pages/SipProvidersPage';
import TransfersPage from '@/pages/TransfersPage';
import SupportPage from '@/pages/SupportPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { Suspense } from 'react';

export const Routes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterRoutes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sip-providers" element={<SipProvidersPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </RouterRoutes>
      </Suspense>
    </BrowserRouter>
  );
};
