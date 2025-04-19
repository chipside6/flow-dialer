
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { FileText, Copy } from 'lucide-react';
import { useConfigActions } from '@/hooks/useConfigActions';
import { dialplanGenerator } from '@/utils/asterisk/generators/dialplanGenerator';

interface DialplanSectionProps {
  campaignId: string;
  userId: string;
}

export const DialplanSection = ({ campaignId, userId }: DialplanSectionProps) => {
  const [config, setConfig] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { handleCopy } = useConfigActions();

  const generateDialplan = async () => {
    setIsLoading(true);
    try {
      const result = await dialplanGenerator.generateCampaignDialplan(campaignId, userId);
      
      if (result.success && result.config) {
        setConfig(result.config);
        toast({
          title: 'Dialplan Generated',
          description: 'Configuration has been generated successfully'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error generating dialplan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate dialplan',
        variant: 'destructive'
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
          Dialplan Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={generateDialplan}
              disabled={isLoading}
            >
              Generate Dialplan
            </Button>
          </div>

          {config && (
            <div className="relative">
              <pre className="p-4 bg-secondary rounded-lg overflow-x-auto">
                <code className="text-sm">{config}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(config)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!config && !isLoading && (
            <p className="text-center text-muted-foreground py-8">
              Click 'Generate Dialplan' to create the Asterisk configuration for this campaign
            </p>
          )}

          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
