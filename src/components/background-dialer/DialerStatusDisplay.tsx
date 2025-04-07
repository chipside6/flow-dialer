
import React from "react";
import { Button } from "@/components/ui/button";
import { DialStatus } from "./types";
import { Progress } from "@/components/ui/progress";
import { Clock, Phone, AlertCircle, CheckCircle2, PhoneOff } from "lucide-react";

interface DialerStatusDisplayProps {
  jobId: string | null;
  dialStatus: DialStatus;
  portNumber?: number;
  onStop: () => void;
}

const DialerStatusDisplay: React.FC<DialerStatusDisplayProps> = ({
  jobId,
  dialStatus,
  portNumber = 1,
  onStop
}) => {
  const isActive = dialStatus.status === 'running';
  const progress = dialStatus.totalCalls > 0
    ? Math.round((dialStatus.completedCalls / dialStatus.totalCalls) * 100)
    : 0;
  
  // Status icons
  const statusIcons = {
    running: <Clock className="h-5 w-5 text-blue-500 animate-spin" />,
    completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    failed: <AlertCircle className="h-5 w-5 text-red-500" />,
    stopped: <PhoneOff className="h-5 w-5 text-orange-500" />
  };
  
  // Status text
  const statusText = {
    running: "Active - Dialing in Progress",
    completed: "Completed Successfully",
    failed: "Failed - Error Occurred",
    stopped: "Stopped by User"
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {statusIcons[dialStatus.status as keyof typeof statusIcons] || statusIcons.running}
          <span className="font-medium">
            {statusText[dialStatus.status as keyof typeof statusText] || "Unknown Status"}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Port: {portNumber}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="border rounded-md p-3">
          <div className="text-xl font-bold">{dialStatus.totalCalls}</div>
          <div className="text-xs text-muted-foreground">Total Calls</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-xl font-bold">{dialStatus.answeredCalls}</div>
          <div className="text-xs text-muted-foreground">Answered</div>
        </div>
      </div>
      
      {isActive && (
        <Button 
          variant="outline" 
          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onStop}
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          Stop Dialing
        </Button>
      )}
    </div>
  );
};

export default DialerStatusDisplay;
