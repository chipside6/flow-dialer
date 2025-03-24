
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Upload } from "lucide-react";

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
    <div className="flex justify-end">
      <Button 
        type="submit" 
        disabled={isDisabled}
        variant={uploadMode === "csv" ? "default" : "success"}
        className="w-full md:w-auto"
      >
        {isSubmitting || isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            {isUploading ? "Uploading Contacts..." : "Creating..."}
          </>
        ) : (
          <>
            {uploadMode === "csv" ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create & Upload
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create List
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
};

export default FormActions;
