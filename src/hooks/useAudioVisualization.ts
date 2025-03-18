
import { useState, useEffect, useRef } from 'react';

interface UseAudioVisualizationOptions {
  audioUrl: string;
  isPlaying: boolean;
}

export function useAudioVisualization({ audioUrl, isPlaying }: UseAudioVisualizationOptions) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSourceConnectedRef = useRef<boolean>(false);

  // Initialize audio context
  useEffect(() => {
    const initContext = () => {
      try {
        const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const newAnalyser = newAudioContext.createAnalyser();
        newAnalyser.fftSize = 256;
        
        setAudioContext(newAudioContext);
        setAnalyser(newAnalyser);
        dataArrayRef.current = new Uint8Array(newAnalyser.frequencyBinCount);
        
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
          
          if (sourceRef.current) {
            sourceRef.current.disconnect();
            isSourceConnectedRef.current = false;
          }
          
          // Don't close the AudioContext to avoid issues with reusing it
        };
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    };
    
    return initContext();
  }, []);

  // Setup audio element and connect to analyser when URL changes
  useEffect(() => {
    if (!audioContext || !analyser || !audioUrl) return;
    
    const setupAudio = () => {
      try {
        // Clean up existing connections first
        if (sourceRef.current) {
          sourceRef.current.disconnect();
          isSourceConnectedRef.current = false;
        }
        
        // Create new audio element
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.src = audioUrl;
        audioRef.current = audio;
        
        // Connect audio to analyser only once
        if (!isSourceConnectedRef.current) {
          sourceRef.current = audioContext.createMediaElementSource(audio);
          sourceRef.current.connect(analyser);
          analyser.connect(audioContext.destination);
          isSourceConnectedRef.current = true;
        }
        
        // Resume audio context if suspended
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };
    
    setupAudio();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [audioUrl, audioContext, analyser]);

  // Control audio playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      // Make sure audio context is resumed
      if (audioContext?.state === "suspended") {
        audioContext.resume();
      }
      
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioContext]);

  // Animation and drawing logic
  useEffect(() => {
    if (!canvasRef.current || !analyser || !dataArrayRef.current) return;
    
    let animationFrameId: number | null = null;
    
    const draw = () => {
      if (!canvasRef.current || !analyser || !dataArrayRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get frequency data
      analyser.getByteFrequencyData(dataArrayRef.current);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw waveform
      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let x = 0;
      
      ctx.fillStyle = 'rgba(79, 70, 229, 0.6)'; // Indigo color with transparency
      
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = dataArrayRef.current[i] / 2;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    // Start or stop animation based on isPlaying
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(draw);
    } else {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // When stopped, draw a static waveform with minimal values
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, analyser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }
      }
    };
  }, []);

  return { canvasRef };
}
