import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import DiagnosticPage from './pages/DiagnosticPage';
import GoipPage from './pages/GoipPage';
import AsteriskConnectionTestPage from "@/pages/AsteriskConnectionTestPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route path="/goip" element={<GoipPage />} />
        <Route path="/asterisk-connection-test" element={<AsteriskConnectionTestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
