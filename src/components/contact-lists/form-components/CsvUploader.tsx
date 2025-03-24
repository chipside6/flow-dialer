
import React from "react";
import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CsvUploaderProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isDisabled: boolean;
}

const FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CsvUploader: React.FC<CsvUploaderProps> = ({
  selectedFile,
  setSelectedFile,
  isDisabled
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <FormItem>
      <FormLabel>Upload Contacts (CSV)</FormLabel>
      <FormControl>
        <div className="border border-input bg-background rounded-md px-3 py-2">
          <label className="flex flex-col items-center justify-center cursor-pointer py-4">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm font-medium mb-1">
              {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
            </span>
            <span className="text-xs text-muted-foreground">
              CSV files only (max 5MB)
            </span>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={isDisabled}
            />
          </label>
        </div>
      </FormControl>
      <FormDescription>
        CSV should have headers: first_name, last_name, phone_number, email (optional)
      </FormDescription>
    </FormItem>
  );
};

export default CsvUploader;
