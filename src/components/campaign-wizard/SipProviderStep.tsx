
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignData } from "./types";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSipProviders } from "@/hooks/useSipProviders";

interface SipProviderStepProps {
  campaign: CampaignData;
  onSelectChange: (name: string, value: string) => void;
}

export const SipProviderStep: React.FC<SipProviderStepProps> = ({ campaign, onSelectChange }) => {
  const { providers, isLoading, error, hasInitiallyLoaded } = useSipProviders();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add timeout to handle persistent loading state
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // Show timeout message after 5 seconds
    } else {
      setLoadingTimeout(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);
  
  // Filter to only show active providers
  const activeProviders = providers.filter(provider => provider.isActive);
  
  const handleProviderChange = (value: string) => {
    onSelectChange("sipProviderId", value);
  };
  
  return (
    <Card>
      <CardContent className="pt-6 pb-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Select SIP Provider</h3>
            <p className="text-sm text-muted-foreground">
              Choose which SIP provider to use for this campaign.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>{loadingTimeout ? "Still loading... This is taking longer than expected." : "Loading SIP providers..."}</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Error loading SIP providers</p>
                <p className="text-sm text-destructive/90 mt-1">
                  {error.message || "Please try again or contact support."}
                </p>
              </div>
            </div>
          ) : activeProviders.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <p className="text-amber-800 font-medium">No active SIP providers found</p>
              <p className="text-sm text-amber-700 mt-1">
                You need to set up at least one active SIP provider in the SIP Providers section before creating a campaign.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sipProvider">SIP Provider</Label>
                <Select
                  value={campaign.sipProviderId || ""}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger id="sipProvider" className="w-full">
                    <SelectValue placeholder="Select a SIP provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {campaign.sipProviderId && (
                <div className="bg-muted/50 p-3 rounded-md text-sm">
                  <p className="font-medium">Selected Provider Details</p>
                  {activeProviders
                    .filter(p => p.id === campaign.sipProviderId)
                    .map(p => (
                      <div key={p.id} className="mt-2 space-y-1">
                        <p><span className="text-muted-foreground">Host:</span> {p.host}</p>
                        <p><span className="text-muted-foreground">Port:</span> {p.port}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
