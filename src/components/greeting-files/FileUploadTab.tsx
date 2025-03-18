
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileUploadTabProps {
  userId: string | undefined;
}

export const FileUploadTab = ({ userId }: FileUploadTabProps) => {
  const { 
    file, 
    isUploading, 
    uploadProgress, 
    handleFileChange, 
    handleUpload 
  } = useFileUpload(userId);
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="greeting-file" className="text-sm font-medium block mb-1">Greeting audio file</Label>
        <Input
          id="greeting-file"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Accepted formats: MP3, WAV, M4A (Max 10MB)
        </p>
      </div>
      
      {file && (
        <div className="text-sm mt-2">
          Selected file: <span className="font-medium text-ellipsis overflow-hidden">{file.name}</span> <span className="whitespace-nowrap">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
        </div>
      )}
      
      {(isUploading || uploadProgress === 100) && (
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-xs">
            <span>{uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      <div className="pt-2">
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="whitespace-nowrap">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Upload File</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
