
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { CampaignProvider } from './contexts/campaign/CampaignContext';
import './App.css';
import Dashboard from './pages/Dashboard';
import CampaignPage from './pages/CampaignPage';
import ContactsPage from './pages/ContactsPage';
import GreetingsPage from './pages/GreetingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import PricingPage from './pages/PricingPage';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CampaignProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><CampaignPage /></ProtectedRoute>} />
            <Route path="/contact-lists" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
            <Route path="/greetings" element={<ProtectedRoute><GreetingsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
          </Routes>
          <Toaster />
        </CampaignProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
