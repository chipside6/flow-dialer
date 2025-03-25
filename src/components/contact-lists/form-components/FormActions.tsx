
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

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
  const [isStuck, setIsStuck] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // If submission starts, set a timeout to detect if it gets stuck
    if (isSubmitting || isUploading) {
      timeoutRef.current = setTimeout(() => {
        setIsStuck(true);
      }, 8000); // Consider it stuck after 8 seconds
    } else {
      // If submission ends, clear the timeout and reset the stuck state
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsStuck(false);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSubmitting, isUploading]);
  
  const isDisabled = (isSubmitting || isUploading) && !isStuck || (uploadMode === "csv" && !hasSelectedFile);
  
  return (
    <Button 
      type="submit" 
      disabled={isDisabled}
      className="w-full md:w-auto"
    >
      {(isSubmitting || isUploading) && !isStuck ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          {isUploading ? "Uploading Contacts..." : "Creating List..."}
        </>
      ) : isStuck ? (
        "Retry Submission"
      ) : (
        uploadMode === "csv" ? "Create & Upload Contacts" : "Create Contact List"
      )}
    </Button>
  );
};

export default FormActions;
