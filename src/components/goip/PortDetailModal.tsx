
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServerIcon, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PortDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  port: any;
  deviceIp?: string;
  onRegenerateCredentials: () => void;
}

export const PortDetailModal: React.FC<PortDetailModalProps> = ({
  isOpen,
  onClose,
  port,
  deviceIp,
  onRegenerateCredentials
}) => {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegenerateCredentials = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateCredentials();
    } finally {
      setIsRegenerating(false);
      onClose();
    }
  };

  const copyCredentials = () => {
    const serverIp = import.meta.env.VITE_ASTERISK_SERVER_IP || 'your-asterisk-server.com';
    const credentials = `
SIP Server: ${serverIp}
SIP Port: 5060
Username: ${port.sip_user}
Password: ${port.sip_pass}
`;
    
    navigator.clipboard.writeText(credentials);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "SIP credentials have been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ServerIcon className="h-5 w-5 mr-2" />
            Port {port.port_number} Details
          </DialogTitle>
          <DialogDescription>
            SIP credentials and configuration details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <Badge variant={port.status === 'active' ? 'outline' : 'secondary'}>
                {port.status === 'active' ? 'Online' : port.status === 'busy' ? 'In Call' : 'Offline'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Port</p>
              <p className="text-sm">{port.port_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Device IP</p>
              <p className="text-sm">{deviceIp || 'Unknown'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">SIP Credentials</p>
            <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span>Server:</span>
                <span>{import.meta.env.VITE_ASTERISK_SERVER_IP || 'your-asterisk-server.com'}</span>
              </div>
              <div className="flex justify-between">
                <span>Port:</span>
                <span>5060</span>
              </div>
              <div className="flex justify-between">
                <span>Username:</span>
                <span>{port.sip_user}</span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span>{port.sip_pass}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Instructions</p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Login to your GoIP device admin panel</li>
              <li>Go to SIP Settings for port {port.port_number}</li>
              <li>Enter the credentials shown above</li>
              <li>Save configuration and restart the device</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between sm:flex-row flex-col gap-2">
          <Button variant="outline" onClick={copyCredentials}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Credentials
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button 
              variant="default" 
              onClick={handleRegenerateCredentials} 
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
