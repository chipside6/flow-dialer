import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import Index from "./pages/Index";
import DiagnosticPage from "./pages/DiagnosticPage";

// Import the App.css for styling
import "./App.css"; 
// Import the header-fixes.css for header and logout button fixes
import "./styles/header-fixes.css";

console.log('🔍 App.tsx is initializing with simplified routes');

const App = () => {
  console.log('🔍 App component rendering - simplified version');
  
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <Sonner />
            <Routes>
              {/* Only include Index route for testing */}
              <Route path="/" element={<Index />} />
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              <Route path="*" element={<div>Not Found Page</div>} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  );
};

console.log('🔍 App.tsx finished initializing - simplified version');

export default App;
