
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ConnectionTestButtonProps {
  isLoading: boolean;
  onClick: () => void;
  variant?: "default" | "skyblue";
  label: string;
  loadingLabel?: string;
}

export const ConnectionTestButton: React.FC<ConnectionTestButtonProps> = ({
  isLoading,
  onClick,
  variant = "default",
  label,
  loadingLabel
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading}
      className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
      size="lg"
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          {loadingLabel || "Processing..."}
        </>
      ) : (
        label
      )}
    </Button>
  );
};
