
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { FileText, Download, Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfigActions } from '@/hooks/useConfigActions';
import { supabase } from '@/integrations/supabase/client';

interface AsteriskConfigSectionProps {
  userId: string;
  campaignId?: string;
}

export const AsteriskConfigSection = ({ userId, campaignId }: AsteriskConfigSectionProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { copied, handleCopy, handleDownload } = useConfigActions();
  const [configContent, setConfigContent] = useState('');

  const generateConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-campaign-dialplan', {
        body: { userId, campaignId }
      });

      if (error) throw error;

      if (data?.dialplanConfig) {
        setConfigContent(data.dialplanConfig);
        toast({
          title: "Configuration Generated",
          description: "Asterisk configuration has been generated successfully",
        });
      }
    } catch (error) {
      console.error('Error generating config:', error);
      toast({
        title: "Error",
        description: "Failed to generate Asterisk configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Asterisk Configuration
        </CardTitle>
        <CardDescription>
          Generate and manage your Asterisk server configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={generateConfig} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Configuration'
              )}
            </Button>
          </div>
          {configContent && (
            <div className="relative">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted font-mono">
                <pre className="text-xs whitespace-pre-wrap">{configContent}</pre>
              </ScrollArea>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  onClick={() => handleCopy(configContent)}
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  onClick={() => handleDownload(configContent, 'asterisk-config.conf')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
