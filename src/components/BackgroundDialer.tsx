
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Loader2 } from "lucide-react";
import DialerForm from "./background-dialer/DialerForm";
import DialerStatusDisplay from "./background-dialer/DialerStatusDisplay";
import { useBackgroundDialer } from "@/hooks/background-dialer/useBackgroundDialer";

interface BackgroundDialerProps {
  campaignId: string;
}

const BackgroundDialer: React.FC<BackgroundDialerProps> = ({ campaignId }) => {
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
  
  return (
    <Card className="border-border/40 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          Background Dialer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isLoadingProviders || isLoadingLists) && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        
        {!isLoadingProviders && !isLoadingLists && (
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
