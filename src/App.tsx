
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPanelPage from '@/pages/AdminPanelPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AsteriskConfigPage from '@/pages/AsteriskConfigPage';
import UpgradePage from '@/pages/UpgradePage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminPanelPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/asterisk-config" 
          element={
            <ProtectedRoute requireAdmin>
              <AsteriskConfigPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/upgrade" 
          element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
}

export default App;
