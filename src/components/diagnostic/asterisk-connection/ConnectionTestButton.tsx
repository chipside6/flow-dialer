
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
      className="w-full"
      variant={variant}
    >
      {isTestingConnection ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Testing Connection...
        </>
      ) : (
        "Test Asterisk API Connection"
      )}
    </Button>
  );
};
