
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Download, CheckCircle } from 'lucide-react';
import { useConfigActions } from '@/hooks/useConfigActions';

interface ExtensionsSectionProps {
  extensionsConfig: string;
  agiScript: string;
}

export const ExtensionsSection = ({
  extensionsConfig,
  agiScript
}: ExtensionsSectionProps) => {
  const { copied, handleCopy, handleDownload } = useConfigActions();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add this dialplan to <code>/etc/asterisk/extensions.conf</code> on your Asterisk server:
      </p>
      <div className="relative">
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted">
          <pre className="text-xs">{extensionsConfig}</pre>
        </ScrollArea>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => handleCopy(extensionsConfig)}
          >
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => handleDownload(extensionsConfig, 'extensions_autodialer.conf')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">
          And this AGI script to <code>/var/lib/asterisk/agi-bin/autodialer.agi</code>:
        </p>
        <div className="relative">
          <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted">
            <pre className="text-xs">{agiScript}</pre>
          </ScrollArea>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button 
              size="icon" 
              variant="outline" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={() => handleCopy(agiScript)}
            >
              {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={() => handleDownload(agiScript, 'autodialer.agi')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Remember to make the AGI script executable with: <code>chmod +x /var/lib/asterisk/agi-bin/autodialer.agi</code>
        </p>
      </div>
    </div>
  );
};
