
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AudioWaveform } from './AudioWaveform';

interface AudioFileCardProps {
  file: {
    id: string;
    filename: string;
    url: string;
    created_at: string;
    duration_seconds?: number | null;
  };
  isPlaying: boolean;
  isActiveAudio: boolean;
  onPlayToggle: () => void;
  onDelete: () => void;
}

export const AudioFileCard: React.FC<AudioFileCardProps> = ({
  file,
  isPlaying,
  isActiveAudio,
  onPlayToggle,
  onDelete
}) => {
  const timeAgo = formatDistanceToNow(new Date(file.created_at), { addSuffix: true });
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-base line-clamp-1" title={file.filename}>
            {file.filename}
          </h3>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        
        <div className="mt-4 h-16 flex items-center justify-center">
          <AudioWaveform
            isPlaying={isPlaying}
            isActive={isActiveAudio}
            durationSeconds={file.duration_seconds || 0}
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1"
          onClick={onPlayToggle}
        >
          {isPlaying ? (
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
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
