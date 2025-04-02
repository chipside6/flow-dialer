
import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

export interface SystemCheck {
  name: string;
  status: "checking" | "success" | "error" | "warning";
  message: string;
}

interface SystemCheckItemProps {
  check: SystemCheck;
}

const SystemCheckItem = ({ check }: SystemCheckItemProps) => {
  return (
    <div 
      key={check.name} 
      className="flex items-start p-3 border rounded-md"
    >
      <div className="mr-3 mt-0.5">
        {check.status === "checking" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
        {check.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        {check.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
        {check.status === "warning" && <AlertCircle className="h-5 w-5 text-amber-500" />}
      </div>
      <div>
        <p className="font-medium">{check.name}</p>
        <p className={`text-sm ${
          check.status === "error" ? "text-red-500" : 
          check.status === "warning" ? "text-amber-500" : 
          check.status === "success" ? "text-green-500" : 
          "text-gray-500"
        }`}>
          {check.message}
        </p>
      </div>
    </div>
  );
};

export default SystemCheckItem;
