
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReadinessCheckerHeaderProps {
  isRetrying: boolean;
  onRetry: () => void;
  showConfigButton: boolean;
}

const ReadinessCheckerHeader = ({ isRetrying, onRetry, showConfigButton }: ReadinessCheckerHeaderProps) => {
  const navigate = useNavigate();
  
  const goToSipConfig = () => {
    navigate("/asterisk-config", { state: { tab: "config" } });
  };

  return (
    <div className="flex flex-row items-center justify-between">
      <CardTitle className="text-xl font-semibold">Launch Readiness Checker</CardTitle>
      <div className="flex gap-2">
        {showConfigButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToSipConfig}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Settings className="h-4 w-4" />
            Configure Asterisk
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          disabled={isRetrying}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          {isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Retry Checks
        </Button>
      </div>
    </div>
  );
};

export default ReadinessCheckerHeader;
