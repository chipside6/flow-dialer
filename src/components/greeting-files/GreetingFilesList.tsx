
import React, { useState, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Trash, Music } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { GreetingFile } from '@/hooks/greeting-files/types';

interface GreetingFilesListProps {
  files: GreetingFile[];
  onDelete: (fileId: string) => void;
  isDeleting: boolean;
}

export const GreetingFilesList = ({ 
  files,
  onDelete,
  isDeleting
}: GreetingFilesListProps) => {
  const { toast } = useToast();
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (file: GreetingFile) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    if (currentPlaying === file.id) {
      // Pause current audio
      audioRef.current.pause();
      setCurrentPlaying(null);
    } else {
      // Play new audio
      audioRef.current.src = file.url;
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "There was an error playing this audio file."
        });
      });
      setCurrentPlaying(file.id);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Music className="h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-lg font-medium mb-2">No audio files yet</div>
        <p className="text-muted-foreground mb-4">
          Upload your first audio greeting to get started
        </p>
      </div>
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
                {formatDistance(new Date(file.created_at), new Date(), { addSuffix: true })}
              </span>
            </div>
            
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Duration: {file.duration_seconds ? `${file.duration_seconds.toFixed(1)}s` : 'Unknown'}</p>
            </div>
            
            <div className="mt-4 h-12 bg-secondary/30 rounded-md flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Audio waveform</span>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-2 flex justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => handlePlay(file)}
            >
              {currentPlaying === file.id ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(file.id)}
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
