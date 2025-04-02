
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export function useErrorHandling(error: Error | null) {
  // Set up error handling separately using useEffect
  useEffect(() => {
    if (error) {
      console.error("Error in greeting files query:", error);
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: error instanceof Error ? error.message : "Failed to load greeting files. Please try again."
      });
    }
  }, [error]);
}
