
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InstructionsPanelProps {
  serverInstructions?: string | string[] | null;
  troubleshootInstructions?: string | string[] | null;
  missingEnvVars?: string[];
  showConfigButton?: boolean;
}

const InstructionsPanel = ({ 
  serverInstructions, 
  troubleshootInstructions, 
  missingEnvVars = [],
  showConfigButton = false
}: InstructionsPanelProps) => {
  const navigate = useNavigate();
  
  const goToSipConfig = () => {
    navigate("/asterisk-config", { state: { tab: "config" } });
  };

  // Format instructions to handle both string and string[]
  const formatInstructions = (instructions: string | string[] | null | undefined): string | null => {
    if (!instructions) return null;
    if (Array.isArray(instructions)) return instructions.join("\n");
    return instructions;
  };

  const formattedServerInstructions = formatInstructions(serverInstructions);
  const formattedTroubleshootInstructions = formatInstructions(troubleshootInstructions);

  return (
    <>
      {missingEnvVars.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start gap-2 mb-2">
            <div>
              <h4 className="font-medium">Missing Environment Variables</h4>
              <p className="text-sm text-amber-700">
                The following environment variables are not set:
              </p>
              <ul className="list-disc pl-5 text-sm text-amber-800 mt-1">
                {missingEnvVars.map(varName => (
                  <li key={varName}>{varName}</li>
                ))}
              </ul>
              <p className="text-sm text-amber-700 mt-2">
                You can either set these as environment variables or configure them through the SIP Configuration tab.
              </p>
            </div>
          </div>
          {showConfigButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToSipConfig}
              className="mt-2 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Go to SIP Configuration
            </Button>
          )}
        </div>
      )}
      
      {formattedServerInstructions && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Server Setup Instructions</h3>
          <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border border-blue-100 overflow-x-auto text-blue-900">
            {formattedServerInstructions}
          </pre>
        </div>
      )}

      {formattedTroubleshootInstructions && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="text-lg font-medium text-amber-800 mb-2">Troubleshooting Guide</h3>
          <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border border-amber-100 overflow-x-auto text-amber-900">
            {formattedTroubleshootInstructions}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Supabase Setup</h3>
        <p className="text-sm mb-2">
          Your application is now configured to use Supabase exclusively as the backend. The Supabase integration provides:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Database storage (PostgreSQL)</li>
          <li>User authentication</li>
          <li>File storage</li>
          <li>Real-time functionality</li>
        </ul>
        <p className="text-sm mt-3">
          All necessary API endpoints are handled through the Supabase client, removing the need for a separate API server.
        </p>
      </div>
    </>
  );
};

export default InstructionsPanel;
