
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { PhoneNumberBulkInput } from "./PhoneNumberBulkInput";
import { PhoneListActions } from "./PhoneListActions";
import { PhoneNumberDisplay } from "./PhoneNumberDisplay";
import { IvrConfigSection } from "./ivr-config/IvrConfigSection";
import { useAuth } from "@/contexts/auth";
import { usePhoneListState } from "./hooks/usePhoneListState";

interface PhoneNumberListProps {
  campaignId?: string;
}

const PhoneNumberList: React.FC<PhoneNumberListProps> = ({ campaignId }) => {
  const { user } = useAuth();
  const [state, actions] = usePhoneListState();

  return (
    <Card className="border-border/40 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          Campaign Phone List
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PhoneNumberInput 
          newNumber={state.newNumber}
          setNewNumber={actions.setNewNumber}
          handleAddNumber={actions.handleAddNumber}
          isActionInProgress={state.isActionInProgress}
        />
        
        <IvrConfigSection
          transferNumber={state.transferNumber}
          setTransferNumber={actions.setTransferNumber}
          recordingFile={state.recordingFile}
          setRecordingFile={actions.setRecordingFile}
          fileInputRef={state.fileInputRef}
          handleFileChange={actions.handleFileChange}
          audioFile={state.audioFile}
          isActionInProgress={state.isActionInProgress}
        />
        
        <PhoneListActions
          showBulkInput={state.showBulkInput}
          setShowBulkInput={actions.setShowBulkInput}
          handleExportCSV={actions.handleExportCSV}
          handleExportForAsterisk={actions.handleExportForAsterisk}
          phoneNumbers={state.phoneNumbers}
          isActionInProgress={state.isActionInProgress}
        />
        
        {state.showBulkInput && (
          <PhoneNumberBulkInput
            bulkNumbers={state.bulkNumbers}
            setBulkNumbers={actions.setBulkNumbers}
            handleBulkAdd={actions.handleBulkAdd}
            isActionInProgress={state.isActionInProgress}
          />
        )}
        
        <PhoneNumberDisplay
          phoneNumbers={state.phoneNumbers}
          handleRemoveNumber={actions.handleRemoveNumber}
          isActionInProgress={state.isActionInProgress}
        />
      </CardContent>
    </Card>
  );
};

export default PhoneNumberList;
