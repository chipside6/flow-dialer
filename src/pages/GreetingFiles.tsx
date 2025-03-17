
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Trash2, Play, Pause, FileAudio } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const GreetingFiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useState<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  // Fetch greeting files
  const { data: greetingFiles, isLoading } = useQuery({
    queryKey: ['greetingFiles'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('greeting_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Delete greeting file mutation
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // First get the file info to get the path
      const { data: fileData, error: fetchError } = await supabase
        .from('greeting_files')
        .select('filename, url')
        .eq('id', fileId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage
      const filePath = `${user.id}/${fileData.filename}`;
      const { error: storageError } = await supabase.storage
        .from('greetings')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('greeting_files')
        .delete()
        .eq('id', fileId);
      
      if (deleteError) throw deleteError;
      
      return fileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greetingFiles'] });
      toast({
        title: 'File deleted',
        description: 'The greeting file has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting file',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an audio file (wav, mp3, etc.)',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    
    try {
      // Create form data for the Edge Function
      const formData = new FormData();
      formData.append('file', file);
      
      // Get the token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Call the Edge Function to upload the file
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-greeting`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }
      
      // Refresh the greeting files list
      queryClient.invalidateQueries({ queryKey: ['greetingFiles'] });
      
      toast({
        title: 'File uploaded',
        description: 'Your greeting file has been uploaded successfully.',
      });
      
      // Reset the file input
      setFile(null);
      
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle audio playback
  const togglePlayback = (url: string) => {
    if (activeAudio === url && isPlaying) {
      // Pause current audio
      if (audioRef[0]) {
        audioRef[0].pause();
      }
      setIsPlaying(false);
    } else {
      // Stop current audio if any
      if (audioRef[0] && isPlaying) {
        audioRef[0].pause();
      }
      
      // Play new audio
      setActiveAudio(url);
      const audio = new Audio(url);
      audioRef[0] = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      
      audio.play().catch(error => {
        toast({
          title: 'Playback error',
          description: 'There was an error playing this audio file.',
          variant: 'destructive',
        });
        console.error('Audio playback error:', error);
      });
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef[0]) {
        audioRef[0].pause();
        audioRef[0] = null;
      }
    };
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Greeting Audio Files</h1>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="files">My Greetings</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="files">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : greetingFiles && greetingFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {greetingFiles.map((file: any) => (
                <Card key={file.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileAudio className="h-5 w-5 mr-2 text-primary" />
                      {file.filename}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlayback(file.url)}
                      >
                        {activeAudio === file.url && isPlaying ? (
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
                        onClick={() => deleteGreetingFile.mutate(file.id)}
                        disabled={deleteGreetingFile.isPending}
                      >
                        {deleteGreetingFile.isPending ? (
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
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <FileAudio className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mb-2">No greeting files yet</CardTitle>
                <CardDescription className="text-center mb-4">
                  Upload greeting audio files to use in your campaigns
                </CardDescription>
                <Button
                  onClick={() => document.getElementById('tab-trigger-upload')?.click()}
                >
                  Upload your first greeting
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload a new greeting file</CardTitle>
              <CardDescription>
                Upload an audio file to use as your campaign greeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="greeting-file">Greeting audio file</Label>
                <Input
                  id="greeting-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground">
                  Accepted formats: MP3, WAV, M4A (Max 10MB)
                </p>
              </div>
              {file && (
                <div className="text-sm">
                  Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GreetingFiles;
