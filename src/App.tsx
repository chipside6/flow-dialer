
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import DashboardPage from "@/pages/DashboardPage";
import CampaignPage from "@/pages/CampaignPage";
import ProfilePage from "@/pages/ProfilePage";
import ContactsPage from "@/pages/ContactsPage";
import GreetingsPage from "@/pages/GreetingsPage";
import TransfersPage from "@/pages/TransfersPage";
import SipProvidersPage from "@/pages/SipProvidersPage";
import AdminPanelPage from "@/pages/AdminPanelPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import FeaturesPage from "@/pages/FeaturesPage";
import PricingPage from "@/pages/PricingPage";
import SupportPage from "@/pages/SupportPage";
import DiagnosticPage from "@/pages/DiagnosticPage";
import UpgradePage from "@/pages/UpgradePage";

// Import components
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="flow-dialer-theme">
        <AuthProvider>
          <Router>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/upgrade" element={<UpgradePage />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/campaign/:id" element={<CampaignPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/greetings" element={<GreetingsPage />} />
                  <Route path="/transfers" element={<TransfersPage />} />
                  <Route path="/sip-providers" element={<SipProvidersPage />} />
                  <Route path="/diagnostic" element={<DiagnosticPage />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminPanelPage />} />
                </Route>
                
                {/* Error routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
