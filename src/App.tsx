
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Support from "./pages/Support";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Campaign from "./pages/Campaign";
import GreetingFiles from "./pages/GreetingFiles";
import ContactLists from "./pages/ContactLists";
import TransferNumbers from "./pages/TransferNumbers";
import SipProviders from "./pages/SipProviders";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/support" element={<Support />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/campaign" element={<Campaign />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/greetings" element={<GreetingFiles />} />
          <Route path="/contacts" element={<ContactLists />} />
          <Route path="/transfers" element={<TransferNumbers />} />
          <Route path="/sip-providers" element={<SipProviders />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
