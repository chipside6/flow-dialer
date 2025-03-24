
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  isUploading: boolean;
  uploadMode: "manual" | "csv";
  hasSelectedFile: boolean;
  onSubmit: () => void; // Make sure to call this in the parent to trigger form submission/upload
}

const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting,
  isUploading,
  uploadMode,
  hasSelectedFile,
  onSubmit, // Pass the onSubmit function from the parent component
}) => {
  const isDisabled = isSubmitting || isUploading || (uploadMode === "csv" && !hasSelectedFile);

  const handleClick = () => {
    if (!isDisabled) {
      onSubmit(); // Trigger the parent onSubmit function when the button is clicked
    }
  };

  return (
    <Button
      type="button" // Change to "button" to avoid automatic form submission (controlled manually)
      disabled={isDisabled}
      onClick={handleClick} // Handle the click event
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
