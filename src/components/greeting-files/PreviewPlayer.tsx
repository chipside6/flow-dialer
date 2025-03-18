
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AudioWaveform } from './AudioWaveform';

interface PreviewPlayerProps {
  audioBlob: Blob | null;
  isUploading: boolean;
}

export const PreviewPlayer = ({ audioBlob, isUploading }: PreviewPlayerProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Create a temporary object URL for preview
  useEffect(() => {
    if (audioBlob) {
      // Revoke old URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create new URL
      const url = URL.createObjectURL(audioBlob);
      setPreviewUrl(url);
      
      // Create audio element for preview
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(url);
        previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
      } else {
        previewAudioRef.current.src = url;
      }
    }

    // Cleanup function
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [audioBlob]);

  // Toggle preview playback
  const togglePreview = () => {
    if (!previewAudioRef.current || !previewUrl) return;
    
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play()
        .then(() => setIsPreviewPlaying(true))
        .catch(error => {
          console.error('Preview playback error:', error);
        });
    }
  };

  if (!previewUrl || !audioBlob) return null;

  return (
    <div className="my-4">
      <AudioWaveform 
        audioUrl={previewUrl} 
        isPlaying={isPreviewPlaying}
      />
      <div className="mt-2">
        <Button
          onClick={togglePreview}
          variant="secondary"
          disabled={isUploading}
        >
          {isPreviewPlaying ? 'Pause' : 'Play'} Preview
        </Button>
      </div>
    </div>
  );
};
