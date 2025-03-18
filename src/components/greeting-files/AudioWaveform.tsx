
import { useAudioVisualization } from '@/hooks/useAudioVisualization';

interface AudioWaveformProps {
  audioUrl: string;
  isPlaying: boolean;
}

export const AudioWaveform = ({ audioUrl, isPlaying }: AudioWaveformProps) => {
  const { canvasRef } = useAudioVisualization({ audioUrl, isPlaying });

  return (
    <div className="mt-2 mb-4 bg-secondary/20 rounded-md p-1 h-24 flex items-center justify-center">
      {audioUrl ? (
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          width={300} 
          height={80}
        />
      ) : (
        <div className="text-muted-foreground text-sm">No audio loaded</div>
      )}
    </div>
  );
};
