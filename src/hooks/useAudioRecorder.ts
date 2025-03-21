
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      setAudioBlob(null);
      setRecordingDuration(0);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
        }
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start duration timer
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: 'Recording started',
        description: 'Speak now to record your greeting.',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording error',
        description: 'Could not access your microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: 'Recording stopped',
        description: 'Your recording is ready for preview and upload.',
      });
    }
  }, [isRecording, toast]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    chunksRef.current = [];
    setAudioBlob(null);
    setIsRecording(false);
    setRecordingDuration(0);
    
    toast({
      title: 'Recording cancelled',
      description: 'Your recording has been discarded.',
    });
  }, [isRecording, toast]);

  // Cleanup on unmount
  useCallback(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format duration as MM:SS
  const formattedDuration = useCallback(() => {
    const minutes = Math.floor(recordingDuration / 60);
    const seconds = recordingDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recordingDuration]);

  return {
    isRecording,
    audioBlob,
    recordingDuration,
    formattedDuration,
    startRecording,
    stopRecording,
    cancelRecording
  };
}
