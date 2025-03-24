
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, List, FilePlus2, Share2, Loader2 } from "lucide-react";

interface PhoneListActionsProps {
  showBulkInput: boolean;
  setShowBulkInput: (value: boolean) => void;
  handleExportCSV: () => void;
  handleExportForAsterisk: () => void;
  phoneNumbers: string[];
  isActionInProgress: boolean;
}

export const PhoneListActions: React.FC<PhoneListActionsProps> = ({
  showBulkInput,
  setShowBulkInput,
  handleExportCSV,
  handleExportForAsterisk,
  phoneNumbers,
  isActionInProgress,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => setShowBulkInput(!showBulkInput)}
        disabled={isActionInProgress}
      >
        {showBulkInput ? (
          <>Hide Bulk Input</>
        ) : (
          <>
            <List className="h-4 w-4 mr-2" />
            Bulk Add
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleExportCSV}
        disabled={phoneNumbers.length === 0 || isActionInProgress}
      >
        {isActionInProgress ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        onClick={handleExportForAsterisk}
        disabled={phoneNumbers.length === 0 || isActionInProgress}
      >
        {isActionInProgress ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 mr-2" />
            Export for Asterisk
          </>
        )}
      </Button>
    </div>
  );
};
