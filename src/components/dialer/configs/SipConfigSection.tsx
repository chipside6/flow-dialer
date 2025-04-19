
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Download, CheckCircle } from 'lucide-react';
import { useConfigActions } from '@/hooks/useConfigActions';

interface SipConfigSectionProps {
  sipConfig: string;
}

export const SipConfigSection = ({ sipConfig }: SipConfigSectionProps) => {
  const { copied, handleCopy, handleDownload } = useConfigActions();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add this configuration to <code>/etc/asterisk/sip.conf</code> on your Asterisk server:
      </p>
      <div className="relative">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted">
          <pre className="text-xs">{sipConfig}</pre>
        </ScrollArea>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => handleCopy(sipConfig)}
          >
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => handleDownload(sipConfig, 'sip_goip.conf')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
