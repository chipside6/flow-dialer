
import { useState, useEffect, useRef } from 'react';

interface UseAudioVisualizationOptions {
  audioUrl: string;
  isPlaying: boolean;
}

export function useAudioVisualization({ audioUrl, isPlaying }: UseAudioVisualizationOptions) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContext) {
      const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const newAnalyser = newAudioContext.createAnalyser();
      newAnalyser.fftSize = 256;
      
      const bufferLength = newAnalyser.frequencyBinCount;
      const newDataArray = new Uint8Array(bufferLength);
      
      setAudioContext(newAudioContext);
      setAnalyser(newAnalyser);
      setDataArray(newDataArray);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      // We don't close the AudioContext to avoid issues with reusing it
    };
  }, [audioContext]);

  // Setup audio element and connect to analyser
  useEffect(() => {
    if (!audioContext || !analyser || !dataArray || !canvasRef.current || !audioUrl) return;

    // Create audio element and connect to analyser
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    
    const connectAudio = () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      sourceRef.current = audioContext.createMediaElementSource(audio);
      sourceRef.current.connect(analyser);
      analyser.connect(audioContext.destination);
    };

    // Only connect the first time
    if (audioContext.state === "suspended") {
      audioContext.resume().then(connectAudio);
    } else {
      connectAudio();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [audioUrl, audioContext, analyser, dataArray]);

  // Animation and drawing logic
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !analyser || !dataArray) return;
    
    const draw = () => {
      if (!canvasRef.current || !analyser || !dataArray) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw waveform
      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;
      
      ctx.fillStyle = 'rgba(79, 70, 229, 0.6)'; // Indigo color with transparency
      
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 2;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, analyser, dataArray]);

  // Utility function to clear the canvas
  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return { canvasRef, clearCanvas };
}
