
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, Loader2, Pause, Play, Trash2 } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

interface AudioFileCardProps {
  file: {
    id: string;
    filename: string;
    url: string;
    created_at: string;
  };
  isPlaying: boolean;
  isActiveAudio: boolean;
  onPlayToggle: (url: string) => void;
  onDelete: (fileId: string) => void;
}

export const AudioFileCard = ({ 
  file, 
  isPlaying, 
  isActiveAudio,
  onPlayToggle,
  onDelete
}: AudioFileCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(file.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card key={file.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <FileAudio className="h-5 w-5 mr-2 text-primary" />
          {file.filename}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isActiveAudio && (
          <AudioWaveform 
            audioUrl={file.url} 
            isPlaying={isPlaying} 
          />
        )}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPlayToggle(file.url)}
          >
            {isActiveAudio && isPlaying ? (
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
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Added on {new Date(file.created_at).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};
