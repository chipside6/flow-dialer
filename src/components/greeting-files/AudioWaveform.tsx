
import { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  isPlaying: boolean;
  isActive: boolean;
  durationSeconds: number;
}

export const AudioWaveform = ({ isPlaying, isActive, durationSeconds }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Generate a static waveform pattern based on durationSeconds
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate number of bars based on duration
    const numBars = Math.max(10, Math.min(50, Math.floor(durationSeconds * 2)));
    const barWidth = (canvas.width / numBars) * 0.8;
    const spacing = (canvas.width - (barWidth * numBars)) / (numBars + 1);
    let x = spacing;
    
    // Color based on active/playing state
    const barColor = isActive 
      ? isPlaying 
        ? 'rgba(79, 70, 229, 0.9)' // Bright color when playing
        : 'rgba(79, 70, 229, 0.6)' // Medium color when active but paused
      : 'rgba(79, 70, 229, 0.3)';  // Dim color when not active
    
    ctx.fillStyle = barColor;
    
    // Generate random height bars for the waveform
    for (let i = 0; i < numBars; i++) {
      // Create a pattern that looks like an audio waveform
      // Higher in the middle, lower at the ends
      let heightMultiplier;
      
      if (i < numBars / 3) {
        // First third: gradually increase
        heightMultiplier = 0.3 + (i / (numBars / 3)) * 0.7;
      } else if (i < (numBars * 2) / 3) {
        // Middle third: stay high
        heightMultiplier = 1.0 - (Math.random() * 0.3);
      } else {
        // Last third: gradually decrease
        heightMultiplier = 0.3 + ((numBars - i) / (numBars / 3)) * 0.7;
      }
      
      // Add some randomness for a more natural look
      const randomness = Math.random() * 0.4;
      const barHeight = (canvas.height * 0.7) * (heightMultiplier - randomness);
      
      ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
      
      x += barWidth + spacing;
    }
    
    // If playing, animate the waveform
    if (isPlaying && isActive) {
      const animate = () => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let x = spacing;
        
        for (let i = 0; i < numBars; i++) {
          // Create a more dynamic animation when playing
          const time = Date.now() / 1000;
          const heightMultiplier = 0.3 + Math.abs(Math.sin(time * 3 + i * 0.2)) * 0.7;
          
          const barHeight = (canvas.height * 0.7) * heightMultiplier;
          
          ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
          
          x += barWidth + spacing;
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isActive, durationSeconds]);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        width={300} 
        height={80}
      />
    </div>
  );
};
