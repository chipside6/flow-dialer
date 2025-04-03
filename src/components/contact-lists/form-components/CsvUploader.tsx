
import React, { useCallback, memo } from "react";
import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CsvUploaderProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isDisabled: boolean;
  required?: boolean;
}

// File validation constants
const FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Use memo to prevent unnecessary re-renders
const CsvUploader: React.FC<CsvUploaderProps> = memo(({
  selectedFile,
  setSelectedFile,
  isDisabled,
  required = false
}) => {
  // Use useCallback to memoize the file change handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
  }, [setSelectedFile]);

  return (
    <FormItem>
      <FormLabel>
        Upload Contacts (CSV) {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <FormControl>
        <div className={`border ${selectedFile ? 'border-green-500' : required && !selectedFile ? 'border-red-500' : 'border-input'} bg-background rounded-md px-3 py-2`}>
          <label className="flex flex-col items-center justify-center cursor-pointer py-4">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm font-medium mb-1 text-center">
              {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
            </span>
            <span className="text-xs text-muted-foreground text-center">
              CSV files only (max 5MB)
            </span>
            {required && !selectedFile && (
              <span className="text-xs text-red-500 mt-1 text-center">
                Required - Please upload a contact file
              </span>
            )}
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={isDisabled}
              required={required}
            />
          </label>
        </div>
      </FormControl>
      <FormDescription>
        CSV should have headers: first_name, last_name, phone_number, email (optional)
      </FormDescription>
    </FormItem>
  );
});

// Add display name for debugging purposes
CsvUploader.displayName = "CsvUploader";

export default CsvUploader;
