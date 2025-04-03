
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReadinessCheckerHeaderProps {
  isRetrying: boolean;
  onRetry: () => void;
  showConfigButton: boolean;
}

const ReadinessCheckerHeader = ({ isRetrying, onRetry, showConfigButton }: ReadinessCheckerHeaderProps) => {
  const navigate = useNavigate();
  
  const handleConfigClick = () => {
    navigate('/asterisk-config', { state: { tab: 'config' } });
  };
  
  const handleManualVerification = () => {
    // This function enables the manual verification override
    window.forceAsteriskSuccess?.();
    toast.info("Manual verification enabled. Click 'Check Again' to apply.");
  };
  
  const handleResetVerification = () => {
    // This function removes the manual verification override
    window.resetAsteriskOverride?.();
    toast.info("Manual verification reset. Checks will run normally.");
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">System Readiness Check</h2>
        <p className="text-sm text-gray-500">
          Verify that your Asterisk server is correctly configured
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-2">
        {showConfigButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleConfigClick}
          >
            <Settings className="h-4 w-4" />
            <span>Configure</span>
          </Button>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <Terminal className="h-4 w-4" />
              <span>Advanced</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced Verification Options</DialogTitle>
              <DialogDescription>
                If you've manually verified your Asterisk configuration but the checker
                can't connect (for example, due to firewall rules), you can use these options.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-sm">
                Before using these options, verify your Asterisk server is working correctly by
                checking the dialplan with:
                <code className="block bg-gray-100 p-2 my-2 rounded text-xs">
                  sudo asterisk -rx "dialplan show user-campaign-router"
                </code>
              </p>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleResetVerification}>
                  Reset Verification
                </Button>
                <Button onClick={handleManualVerification}>
                  Manual Verification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking...' : 'Check Again'}</span>
        </Button>
      </div>
    </div>
  );
};

export default ReadinessCheckerHeader;
