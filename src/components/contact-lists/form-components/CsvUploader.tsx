
import React from "react";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { FormField } from "@/components/ui/FormField"; // Import FormField
import { Input } from "@/components/ui/input"; // Custom Input component

interface CsvUploaderProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isDisabled: boolean;
  control: any; // The control from react-hook-form, passed from parent
}

const FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CsvUploader: React.FC<CsvUploaderProps> = ({
  selectedFile,
  setSelectedFile,
  isDisabled,
  control
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
    <FormField
      control={control} // Pass the control to the FormField component
      name="csvFile" // The name of the form field for file input
      render={({ field }) => (
        <div className="space-y-4">
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
                onChange={(e) => handleFileChange(e)} // Handle file change event
                className="hidden"
                disabled={isDisabled} // Disable the file input if required
                {...field} // Pass the field props for react-hook-form integration
              />
            </label>
          </div>

          {/* Form Description */}
          <div className="text-xs text-muted-foreground mt-2">
            CSV should have headers: first_name, last_name, phone_number, email (optional)
          </div>
        </div>
      )}
    />
  );
};

export default CsvUploader;
