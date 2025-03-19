import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Campaign from './pages/Campaign';
import ContactLists from './pages/ContactLists';
import GreetingFiles from './pages/GreetingFiles';
import TransferNumbers from './pages/TransferNumbers';
import SipProviders from './pages/SipProviders';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import AddContacts from './pages/AddContacts';

// Import components
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="autodial-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/support" element={<Support />} />
            <Route path="/404" element={<NotFound />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaign />} />
              <Route path="/campaigns/new" element={<Campaign />} />
              <Route path="/contact-lists" element={<ContactLists />} />
              <Route path="/contacts/add" element={<AddContacts />} />
              <Route path="/greeting-files" element={<GreetingFiles />} />
              <Route path="/transfer-numbers" element={<TransferNumbers />} />
              <Route path="/sip-providers" element={<SipProviders />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
