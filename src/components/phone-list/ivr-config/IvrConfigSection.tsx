
import React from "react";
import { AudioLines, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";

interface IvrConfigSectionProps {
  transferNumber: string;
  setTransferNumber: (value: string) => void;
  recordingFile: string;
  setRecordingFile: (value: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  audioFile: File | null;
}

export const IvrConfigSection: React.FC<IvrConfigSectionProps> = ({
  transferNumber,
  setTransferNumber,
  recordingFile,
  setRecordingFile,
  fileInputRef,
  handleFileChange,
  audioFile,
}) => {
  return (
    <div className="border rounded-md p-4 space-y-3">
      <h3 className="font-medium flex items-center">
        <AudioLines className="h-4 w-4 mr-2" />
        Call Flow Configuration
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Pre-recorded Message</FormLabel>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="audio/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Input
              placeholder="Select greeting audio file"
              value={recordingFile}
              onChange={(e) => setRecordingFile(e.target.value)}
              className="flex-1"
              readOnly={!!audioFile}
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Upload className="h-4 w-4 mr-2" /> Upload
            </Button>
          </div>
          <FormDescription>
            Upload an audio file for greeting (WAV or MP3)
          </FormDescription>
        </FormItem>
        
        <FormItem>
          <FormLabel>Transfer Number</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter transfer destination"
              value={transferNumber}
              onChange={(e) => setTransferNumber(e.target.value)}
            />
          </FormControl>
          <FormDescription>
            Where to transfer calls when recipient presses 1
          </FormDescription>
        </FormItem>
      </div>
    </div>
  );
};
