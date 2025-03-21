
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UpgradePage from './pages/UpgradePage';
import { AuthProvider, useAuth } from './contexts/auth';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Layout from './components/layout/Layout';
import SipProviders from './pages/SipProviders';
import ContactLists from './pages/ContactLists';
import BackgroundDialer from './pages/BackgroundDialer';
import "./index.css"; // Use index.css which already exists
import "./styles/plan-card.css"; // Add this line to import plan card styles

function AppRouter() {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();

  // Show a loading indicator if the session is still being checked
  if (isLoading && !sessionChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/verify-email" element={!isAuthenticated ? <VerifyEmail /> : <Navigate to="/dashboard" />} />
      
      {/* Protected routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/billing" element={isAuthenticated ? <UpgradePage /> : <Navigate to="/login" />} />
      <Route path="/sip-providers" element={isAuthenticated ? <SipProviders /> : <Navigate to="/login" />} />
      <Route path="/contact-lists" element={isAuthenticated ? <ContactLists /> : <Navigate to="/login" />} />
      <Route path="/background-dialer" element={isAuthenticated ? <BackgroundDialer /> : <Navigate to="/login" />} />

      {/* Catch-all route for 404 Not Found */}
      <Route path="*" element={<h1 className="text-center text-4xl font-bold">404 Not Found</h1>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Router>
          <AppRouter />
        </Router>
      </Layout>
    </AuthProvider>
  );
}

export default App;
