
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PhoneOff, AlertCircle } from "lucide-react";
import { DialStatus } from "./types";

interface DialerStatusDisplayProps {
  jobId: string | null;
  dialStatus: DialStatus;
  onStop: () => void;
}

const DialerStatusDisplay: React.FC<DialerStatusDisplayProps> = ({
  jobId,
  dialStatus,
  onStop
}) => {
  // Calculate progress percentage
  const progressPercentage = dialStatus.totalCalls > 0 
    ? Math.round((dialStatus.completedCalls / dialStatus.totalCalls) * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Active Dialing Job</h3>
          <p className="text-sm text-muted-foreground">Job ID: {jobId}</p>
        </div>
        <Button variant="destructive" onClick={onStop}>
          <PhoneOff className="mr-2 h-4 w-4" />
          Stop Dialing
        </Button>
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm">Progress</span>
          <span className="text-sm">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted rounded-md p-3 text-center">
          <p className="text-muted-foreground text-sm">Total Calls</p>
          <p className="text-xl font-bold">{dialStatus.totalCalls}</p>
        </div>
        
        <div className="bg-muted rounded-md p-3 text-center">
          <p className="text-muted-foreground text-sm">Completed</p>
          <p className="text-xl font-bold">{dialStatus.completedCalls}</p>
        </div>
        
        <div className="bg-muted rounded-md p-3 text-center">
          <p className="text-muted-foreground text-sm">Answered</p>
          <p className="text-xl font-bold">{dialStatus.answeredCalls}</p>
        </div>
        
        <div className="bg-muted rounded-md p-3 text-center">
          <p className="text-muted-foreground text-sm">Failed</p>
          <p className="text-xl font-bold">{dialStatus.failedCalls}</p>
        </div>
      </div>
      
      {dialStatus.status === 'running' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Dialing in Progress</p>
              <p className="text-sm">The system is automatically dialing your contacts in the background.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialerStatusDisplay;
