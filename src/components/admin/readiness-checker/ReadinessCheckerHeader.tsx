import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Terminal, Check, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReadinessCheckerHeaderProps {
  isRetrying: boolean;
  onRetry: () => void;
  showConfigButton: boolean;
}

const ReadinessCheckerHeader = ({ isRetrying, onRetry, showConfigButton }: ReadinessCheckerHeaderProps) => {
  const [manualVerified, setManualVerified] = React.useState<boolean>(
    localStorage.getItem('asterisk_force_success') === 'true'
  );
  
  const handleManualVerification = () => {
    // This function enables the manual verification override
    if (window.forceAsteriskSuccess) {
      window.forceAsteriskSuccess();
      localStorage.setItem('asterisk_force_success', 'true');
      setManualVerified(true);
      toast.info("Manual verification enabled. Click 'Check Again' to apply.");
    } else {
      console.error("forceAsteriskSuccess is not defined");
      toast.error("Unable to enable manual verification. Try refreshing the page.");
    }
  };
  
  const handleResetVerification = () => {
    // This function removes the manual verification override
    if (window.resetAsteriskOverride) {
      window.resetAsteriskOverride();
      localStorage.removeItem('asterisk_force_success');
      setManualVerified(false);
      toast.info("Manual verification reset. Checks will run normally.");
    } else {
      console.error("resetAsteriskOverride is not defined");
      toast.error("Unable to reset verification. Try refreshing the page.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">System Readiness Check</h2>
          <p className="text-sm text-gray-500">
            Verify that your Asterisk server is correctly configured
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant={manualVerified ? "default" : "ghost"}
                size="sm" 
                className="flex items-center gap-2"
              >
                <Terminal className="h-4 w-4" />
                <span>Advanced</span>
                {manualVerified && <Check className="h-3 w-3 ml-1" />}
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
                  
                  {manualVerified && (
                    <Alert className="mt-3 bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        Manual verification is currently enabled. The system will report a successful connection.
                      </AlertDescription>
                    </Alert>
                  )}
                </p>
                
                <div className="flex gap-2 justify-end">
                  {manualVerified ? (
                    <Button variant="outline" onClick={handleResetVerification}>
                      Reset Verification
                    </Button>
                  ) : (
                    <Button onClick={handleManualVerification}>
                      Manual Verification
                    </Button>
                  )}
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
      
      {manualVerified && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 flex items-center justify-between">
            <span>
              Manual verification is enabled. The system will override connection checks.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800"
              onClick={handleResetVerification}
            >
              Disable
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ReadinessCheckerHeader;
