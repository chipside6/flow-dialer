import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ConnectionTestButtonProps {
  isTesting: boolean;
  onClick: () => void;
  variant?: "default" | "skyblue";
  label?: string;
  loadingLabel?: string;
}

export const ConnectionTestButton: React.FC<ConnectionTestButtonProps> = ({
  isTesting,
  onClick,
  variant = "default",
  label = "Test Connection",
  loadingLabel = "Testing Connection...",
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={isTesting}
      className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
      size="lg"
    >
      {isTesting ? (
        <>
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
};
