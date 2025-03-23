import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, Loader2, Pause, Play, Trash2 } from 'lucide-react';

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
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Create audio element when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(file.url);
      setAudioElement(audio);
      
      const handleEnded = () => {
        if (isActiveAudio) {
          onPlayToggle(file.url); // This will set isPlaying to false
        }
      };
      
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.pause();
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [file.url, isActiveAudio, onPlayToggle]);
  
  // Keep audio state in sync with component props
  useEffect(() => {
    if (audioElement) {
      if (isActiveAudio && isPlaying) {
        audioElement.play().catch(err => console.error("Error playing audio:", err));
      } else {
        audioElement.pause();
      }
    }
  }, [isActiveAudio, isPlaying, audioElement]);
  
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
          <span className="truncate" title={file.filename}>
            {file.filename}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isActiveAudio && (
          <div className="aspect-square flex items-center justify-center p-0 pb-2">
            <audio 
              src={file.url} 
              controls
              className="w-full max-w-full" 
            />
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPlayToggle(file.url)}
          >
            {isActiveAudio && isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-1" /> <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" /> <span>Play</span>
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
