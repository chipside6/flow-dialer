
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Trash, AlertCircle } from 'lucide-react';
import { GreetingFile } from '@/hooks/greeting-files/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import { formatDuration } from '@/lib/utils';

interface GreetingFileListProps {
  files: GreetingFile[];
  onDelete: (file: GreetingFile) => void;
  isDeleting: boolean;
}

export const GreetingFileList: React.FC<GreetingFileListProps> = ({ files, onDelete, isDeleting }) => {
  if (files.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No audio files found</AlertTitle>
        <AlertDescription>
          Upload an audio greeting to get started with your campaigns.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-base line-clamp-1" title={file.filename}>
                {file.filename}
              </h3>
              <span className="text-xs text-muted-foreground">
                {format(new Date(file.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Duration: {formatDuration(file.duration_seconds || 0)}</p>
            </div>
            
            <div className="mt-4 h-12 bg-secondary/30 rounded-md flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Audio waveform visualization</span>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-2 flex justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => window.open(file.url, '_blank')}
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(file)}
              className="text-destructive hover:text-destructive"
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
