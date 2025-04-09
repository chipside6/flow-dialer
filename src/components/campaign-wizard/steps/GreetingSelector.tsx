
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2, Play, Pause } from 'lucide-react';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface GreetingSelectorProps {
  selectedGreetingId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const GreetingSelector: React.FC<GreetingSelectorProps> = ({
  selectedGreetingId,
  onSelect,
  onNext,
  onBack
}) => {
  const { greetingFiles, isLoading } = useGreetingFiles();
  const { isPlaying, currentAudioId, togglePlayback } = useAudioPlayer();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading greeting files...</span>
      </div>
    );
  }

  if (!greetingFiles || greetingFiles.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">No greeting files found. Upload a greeting first.</p>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select a Greeting</h3>
      
      <div className="grid gap-3">
        {greetingFiles.map((file) => (
          <Card 
            key={file.id} 
            className={`cursor-pointer transition-colors ${
              selectedGreetingId === file.id 
                ? 'border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(file.id)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{file.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {file.duration ? `${file.duration}s` : 'Unknown duration'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayback(file.id, file.url);
                  }}
                >
                  {isPlaying && currentAudioId === file.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                {selectedGreetingId === file.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedGreetingId}
        >
          Next: Set Transfer Options
        </Button>
      </div>
    </div>
  );
};
