
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  isUploading: boolean;
  uploadMode: "manual" | "csv";
  hasSelectedFile: boolean;
  requireFile?: boolean;
}

// Use memo to prevent unnecessary re-renders
const FormActions: React.FC<FormActionsProps> = memo(({
  isSubmitting,
  isUploading,
  uploadMode,
  hasSelectedFile,
  requireFile = false
}) => {
  const [isStuck, setIsStuck] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use useCallback to memoize the reset function
  const resetStuckState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsStuck(false);
  }, []);
  
  useEffect(() => {
    // If submission starts, set a timeout to detect if it gets stuck
    if (isSubmitting || isUploading) {
      // Clear any existing timeout to prevent memory leaks
      resetStuckState();
      
      timeoutRef.current = setTimeout(() => {
        setIsStuck(true);
      }, 8000); // Consider it stuck after 8 seconds
    } else {
      // If submission ends, clear the timeout and reset the stuck state
      resetStuckState();
    }
    
    // Cleanup function
    return resetStuckState;
  }, [isSubmitting, isUploading, resetStuckState]);
  
  // Memoize the disabled state calculation to avoid recalculations
  const isDisabled = ((isSubmitting || isUploading) && !isStuck) || 
                     (requireFile && !hasSelectedFile) || 
                     (uploadMode === "csv" && !hasSelectedFile);
  
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
        requireFile || uploadMode === "csv" ? "Create & Upload Contacts" : "Create Contact List"
      )}
    </Button>
  );
});

// Add display name for debugging purposes
FormActions.displayName = "FormActions";

export default FormActions;
