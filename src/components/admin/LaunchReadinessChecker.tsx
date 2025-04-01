
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { API_URL } from "@/services/api/apiConfig";
import { ASTERISK_API_URL } from "@/utils/asteriskService";

interface SystemCheck {
  name: string;
  status: "checking" | "success" | "error" | "warning";
  message: string;
}

const LaunchReadinessChecker = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: "Supabase Connection", status: "checking", message: "Checking connection..." },
    { name: "API Connection", status: "checking", message: "Checking API..." },
    { name: "Asterisk Connection", status: "checking", message: "Checking Asterisk server..." },
    { name: "Environment Variables", status: "checking", message: "Checking configuration..." },
    { name: "Authentication", status: "checking", message: "Verifying authentication..." }
  ]);

  useEffect(() => {
    const runChecks = async () => {
      // Check Supabase Connection
      try {
        const { data, error } = await supabase.from('contact_lists').select('count').limit(1);
        if (error) throw error;
        updateCheck("Supabase Connection", "success", "Connected to Supabase successfully");
      } catch (error) {
        updateCheck("Supabase Connection", "error", `Failed to connect: ${error.message}`);
      }

      // Check API Connection
      try {
        const response = await fetch(`${API_URL}/health`, { method: 'GET' });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        updateCheck("API Connection", "success", "API is reachable");
      } catch (error) {
        updateCheck("API Connection", "error", `API unreachable: ${error.message}`);
      }

      // Check Asterisk Connection - Note: This is a mock check as we can't directly test from browser
      if (ASTERISK_API_URL && ASTERISK_API_URL !== "http://your-asterisk-server:8088/ari") {
        updateCheck("Asterisk Connection", "warning", "Asterisk URL configured, but connection can't be verified from browser");
      } else {
        updateCheck("Asterisk Connection", "error", "Asterisk URL not configured");
      }

      // Check Environment Variables
      const requiredVars = [
        "VITE_SUPABASE_URL", 
        "VITE_SUPABASE_PUBLISHABLE_KEY", 
        "VITE_API_URL", 
        "VITE_ASTERISK_API_URL"
      ];
      
      const missingVars = requiredVars.filter(v => !import.meta.env[v]);
      
      if (missingVars.length === 0) {
        updateCheck("Environment Variables", "success", "All required environment variables are set");
      } else {
        updateCheck("Environment Variables", "error", `Missing variables: ${missingVars.join(', ')}`);
      }

      // Check Authentication
      if (user) {
        updateCheck("Authentication", "success", "Authentication is working");
      } else {
        updateCheck("Authentication", "warning", "Not authenticated. Please login to verify authentication");
      }
    };

    runChecks();
  }, [user]);

  const updateCheck = (name: string, status: SystemCheck["status"], message: string) => {
    setChecks(prev => 
      prev.map(check => 
        check.name === name ? { ...check, status, message } : check
      )
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Launch Readiness Checker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check) => (
            <div 
              key={check.name} 
              className="flex items-start p-3 border rounded-md"
            >
              <div className="mr-3 mt-0.5">
                {check.status === "checking" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                {check.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {check.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                {check.status === "warning" && <AlertCircle className="h-5 w-5 text-amber-500" />}
              </div>
              <div>
                <p className="font-medium">{check.name}</p>
                <p className={`text-sm ${
                  check.status === "error" ? "text-red-500" : 
                  check.status === "warning" ? "text-amber-500" : 
                  check.status === "success" ? "text-green-500" : 
                  "text-gray-500"
                }`}>
                  {check.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchReadinessChecker;
