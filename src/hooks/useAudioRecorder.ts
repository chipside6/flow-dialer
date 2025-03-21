
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [error, setError] = useState<Error | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Format duration as MM:SS
  const formattedDuration = useCallback(() => {
    const minutes = Math.floor(recordingDuration / 60);
    const seconds = recordingDuration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recordingDuration]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingDuration(0);
      setRecordingStatus('recording');
      setError(null);
      
      // Request microphone permission
      console.log("Requesting microphone access");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Explicitly set mime type
      });
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        console.log("Data available from recorder, size:", e.data.size);
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, chunks:", chunksRef.current.length);
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          console.log("Created blob with size:", blob.size);
          setAudioBlob(blob);
          
          // Create audio URL for playback
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
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
        
        setRecordingStatus('inactive');
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data in chunks for more reliable recording
      setIsRecording(true);
      
      // Start duration timer
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      console.log("Recording started successfully");
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError(err);
      setRecordingStatus('error');
      toast({
        title: 'Recording error',
        description: err.message || 'Could not access your microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping recording");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Reset recording
  const resetRecording = useCallback(() => {
    console.log("Resetting recording state");
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
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
    setAudioUrl(null);
    setIsRecording(false);
    setRecordingDuration(0);
    setRecordingStatus('idle');
  }, [isRecording, audioUrl]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    recordingDuration,
    formattedDuration,
    recordingStatus,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
