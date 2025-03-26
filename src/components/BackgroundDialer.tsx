
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Loader2, AlertCircle } from "lucide-react";
import DialerForm from "./background-dialer/DialerForm";
import DialerStatusDisplay from "./background-dialer/DialerStatusDisplay";
import { useBackgroundDialer } from "@/hooks/background-dialer/useBackgroundDialer";

interface BackgroundDialerProps {
  campaignId: string;
  sipProviderId?: string;
}

const BackgroundDialer: React.FC<BackgroundDialerProps> = ({ campaignId, sipProviderId }) => {
  const {
    sipProviders,
    contactLists,
    isLoadingProviders,
    isLoadingLists,
    formData,
    isDialing,
    currentJobId,
    dialStatus,
    handleFormChange,
    startDialing,
    stopDialing
  } = useBackgroundDialer(campaignId);
  
  const [isStuck, setIsStuck] = useState(false);
  
  // Set SIP provider if provided
  useEffect(() => {
    if (sipProviderId && formData.sipProviderId !== sipProviderId) {
      handleFormChange("sipProviderId", sipProviderId);
    }
  }, [sipProviderId, formData.sipProviderId]);
  
  // Check if loading is taking too long
  useEffect(() => {
    let stuckTimer: NodeJS.Timeout;
    
    if (isLoadingProviders || isLoadingLists) {
      stuckTimer = setTimeout(() => {
        setIsStuck(true);
      }, 10000); // 10 seconds before considering it stuck
    } else {
      setIsStuck(false);
    }
    
    return () => {
      if (stuckTimer) clearTimeout(stuckTimer);
    };
  }, [isLoadingProviders, isLoadingLists]);
  
  return (
    <Card className="border-border/40 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          Background Dialer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isLoadingProviders || isLoadingLists) && !isStuck ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>{isLoadingProviders ? "Loading SIP providers..." : "Loading contact lists..."}</span>
          </div>
        ) : isStuck ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-orange-500 mb-2" />
            <p className="text-orange-700 mb-3">Loading is taking longer than expected.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        ) : (
          <>
            {!isDialing ? (
              <DialerForm
                sipProviders={sipProviders}
                contactLists={contactLists}
                formData={formData}
                isLoadingProviders={isLoadingProviders}
                isLoadingLists={isLoadingLists}
                onChange={handleFormChange}
                onStart={startDialing}
                disableSipProviderSelect={!!sipProviderId}
              />
            ) : (
              <DialerStatusDisplay
                jobId={currentJobId}
                dialStatus={dialStatus}
                onStop={stopDialing}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BackgroundDialer;
