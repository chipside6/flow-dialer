
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  isUploading: boolean;
  uploadMode: "manual" | "csv";
  hasSelectedFile: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting,
  isUploading,
  uploadMode,
  hasSelectedFile
}) => {
  const isDisabled = isSubmitting || isUploading || (uploadMode === "csv" && !hasSelectedFile);
  
  return (
    <Button 
      type="submit" 
      disabled={isDisabled}
      className="w-full md:w-auto"
    >
      {isSubmitting || isUploading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          {isUploading ? "Uploading Contacts..." : "Creating List..."}
        </>
      ) : (
        uploadMode === "csv" ? "Create & Upload Contacts" : "Create Contact List"
      )}
    </Button>
  );
};

export default FormActions;
