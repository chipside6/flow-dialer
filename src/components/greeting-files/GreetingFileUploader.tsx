
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GreetingFileUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  onCancel: () => void;
}

export const GreetingFileUploader: React.FC<GreetingFileUploaderProps> = ({
  onUpload,
  isUploading,
  onCancel
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave', 'audio/ogg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('File must be an audio file (MP3, WAV, or OGG)');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload Audio File</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload an MP3, WAV, or OGG audio file (max 10MB)
            </p>
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>Please wait</span>
              </div>
              <Progress value={50} className="h-2 animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className="flex-1"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
