
import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Trash2, PlayCircle, PauseCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useGreetingFiles, GreetingFile } from "@/hooks/useGreetingFiles";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth";
import { supabase } from '@/integrations/supabase/client';

const GreetingFiles = () => {
  const [uploading, setUploading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { greetingFiles, isLoading, refreshGreetingFiles, deleteGreetingFile } = useGreetingFiles();

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP3, WAV, or OGG audio file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio files must be less than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('greetings')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('greetings')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Create database record
      const { error: dbError } = await supabase
        .from('greeting_files')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          url: urlData.publicUrl
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: "Your audio file has been uploaded."
      });

      // Refresh the files list
      refreshGreetingFiles();

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file deletion
  const handleDelete = async (fileId: string) => {
    if (!user) return;

    // If this file is currently playing, stop it
    if (playingId === fileId && currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingId(null);
    }

    try {
      await deleteGreetingFile(fileId);
      
      toast({
        title: "File deleted",
        description: "The audio file has been removed."
      });
    } catch (error) {
      console.error("Deletion error:", error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle audio playback
  const handlePlayPause = (file: GreetingFile) => {
    // If there's already something playing, pause it
    if (currentAudio) {
      currentAudio.pause();
      
      // If we're clicking the same file that's already playing, just stop it
      if (playingId === file.id) {
        setCurrentAudio(null);
        setPlayingId(null);
        return;
      }
    }

    // Create new audio element
    const audio = new Audio(file.url);
    audio.onended = () => {
      setCurrentAudio(null);
      setPlayingId(null);
    };
    
    audio.play();
    setCurrentAudio(audio);
    setPlayingId(file.id);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Audio Files</h1>
            <p className="text-muted-foreground">
              Upload and manage greeting messages for your campaigns
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => refreshGreetingFiles()}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            
            <div className="relative">
              <Input
                type="file"
                ref={fileInputRef}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <Button disabled={uploading}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Audio"}
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="bg-muted h-12"></CardHeader>
                <CardContent className="h-24 flex items-center justify-center">
                  <div className="w-full h-8 bg-muted rounded"></div>
                </CardContent>
                <CardFooter className="bg-muted h-12"></CardFooter>
              </Card>
            ))}
          </div>
        ) : greetingFiles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No audio files found</h3>
            <p className="text-muted-foreground mb-6">
              Upload greeting messages for your campaigns.
            </p>
            <div className="relative inline-block">
              <Input
                type="file"
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <Button disabled={uploading}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Your First Audio"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {greetingFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base truncate" title={file.filename}>
                    {file.filename}
                  </CardTitle>
                  <CardDescription>
                    {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : "Unknown size"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePlayPause(file)}
                      className="h-12 w-12"
                    >
                      {playingId === file.id ? (
                        <PauseCircle className="h-10 w-10" />
                      ) : (
                        <PlayCircle className="h-10 w-10" />
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GreetingFiles;
