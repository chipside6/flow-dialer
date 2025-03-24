
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PhoneListActionsProps {
  showBulkInput: boolean;
  setShowBulkInput: (value: boolean) => void;
  handleExportCSV: () => void;
  handleExportForAsterisk: () => void;
  phoneNumbers: string[];
}

export const PhoneListActions: React.FC<PhoneListActionsProps> = ({
  showBulkInput,
  setShowBulkInput,
  handleExportCSV,
  handleExportForAsterisk,
  phoneNumbers,
}) => {
  return (
    <div className="flex justify-between">
      <Button 
        variant="outline" 
        onClick={() => setShowBulkInput(!showBulkInput)}
      >
        {showBulkInput ? "Hide Bulk Input" : "Bulk Add Numbers"}
      </Button>
      
      <div className="space-x-2">
        <Button 
          variant="outline" 
          onClick={handleExportCSV}
          disabled={phoneNumbers.length === 0}
        >
          <Download className="h-4 w-4 mr-2" /> CSV
        </Button>
        <Button 
          onClick={handleExportForAsterisk}
          disabled={phoneNumbers.length === 0}
        >
          <Download className="h-4 w-4 mr-2" /> Asterisk Dialplan
        </Button>
      </div>
    </div>
  );
};
