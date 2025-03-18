
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, Loader2, Pause, Play, Trash2 } from 'lucide-react';

interface AudioFileCardProps {
  file: {
    id: string;
    filename: string;
    url: string;
    created_at: string;
  };
  isPlaying: boolean;
  isActiveAudio: boolean;
  onPlayToggle: (url: string) => void;
}

export const AudioFileCard = ({ 
  file, 
  isPlaying, 
  isActiveAudio,
  onPlayToggle 
}: AudioFileCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete greeting file mutation
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      const { data: fileData, error: fetchError } = await supabase
        .from('greeting_files')
        .select('filename, url')
        .eq('id', fileId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Parse filename from URL to get the storage path
      const urlPath = new URL(fileData.url).pathname;
      const filePath = urlPath.split('/').pop();
      const storagePath = `${file.id}/${filePath}`;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('greetings')
        .remove([storagePath]);
      
      if (storageError) {
        console.warn("Storage delete error (continuing anyway):", storageError);
        // We still continue with the database deletion even if storage fails
      }
      
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

  return (
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
            onClick={() => onPlayToggle(file.url)}
          >
            {isActiveAudio && isPlaying ? (
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
  );
};
