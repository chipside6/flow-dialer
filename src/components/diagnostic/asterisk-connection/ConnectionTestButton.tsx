
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ConnectionTestButtonProps {
  isTestingConnection: boolean;
  onClick: () => void;
  variant?: "default" | "skyblue";
}

export const ConnectionTestButton: React.FC<ConnectionTestButtonProps> = ({
  isTestingConnection,
  onClick,
  variant = "default"
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isTestingConnection}
      className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
      size="lg"
    >
      {isTestingConnection ? (
        <>
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          Testing Connection...
        </>
      ) : (
        "Test Asterisk API Connection"
      )}
    </Button>
  );
};
