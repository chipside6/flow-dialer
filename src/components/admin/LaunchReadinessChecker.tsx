
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import ReadinessCheckerHeader from "./readiness-checker/ReadinessCheckerHeader";
import ChecksList from "./readiness-checker/ChecksList";
import InstructionsPanel from "./readiness-checker/InstructionsPanel";
import { useReadinessChecker } from "./readiness-checker/useReadinessChecker";

const LaunchReadinessChecker = () => {
  const { user } = useAuth();
  const {
    checks,
    isRetrying,
    serverInstructions,
    troubleshootInstructions,
    missingEnvVars,
    runChecks,
    manualOverrideEnabled
  } = useReadinessChecker(user);

  // Determine if we should show the config button in the header
  // Don't show it if manual override is enabled, since we're bypassing real checks
  const showConfigButtonHeader = !manualOverrideEnabled && 
    checks.some(check => check.status === "error" && check.name === "Asterisk Connection");
  
  // Determine if we should show the config button in the missing env vars panel
  const showConfigButtonEnvVars = !manualOverrideEnabled && missingEnvVars.length > 0;

  // Only run checks on mount, not on every render
  useEffect(() => {
    // Initial check when component mounts
    if (manualOverrideEnabled) {
      // If manual override is enabled, don't need to run actual checks
      console.log("Manual override enabled, skipping automatic checks");
    } else {
      console.log("Running initial readiness checks");
      runChecks();
    }
    // We intentionally only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <ReadinessCheckerHeader 
          isRetrying={isRetrying} 
          onRetry={runChecks} 
          showConfigButton={showConfigButtonHeader}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ChecksList checks={checks} />
          
          <InstructionsPanel 
            serverInstructions={serverInstructions.join("\n")}
            troubleshootInstructions={troubleshootInstructions.join("\n")}
            missingEnvVars={missingEnvVars}
            showConfigButton={showConfigButtonEnvVars}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchReadinessChecker;
