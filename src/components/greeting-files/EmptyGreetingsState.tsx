
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { FileAudio, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmptyGreetingsStateProps {
  onRefresh?: () => void;
  onUploadClick?: () => void;
}

export const EmptyGreetingsState = ({ onRefresh, onUploadClick }: EmptyGreetingsStateProps) => {
  const isMobile = useIsMobile();
  
  const handleUploadClick = () => {
    if (onUploadClick) {
      onUploadClick();
    }
  };
  
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 py-10">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <FileAudio className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="mb-2 text-center">No greeting files yet</CardTitle>
        <CardDescription className="text-center mb-6 max-w-xs">
          Upload greeting audio files to use in your campaigns
        </CardDescription>
        <Button onClick={handleUploadClick} className={isMobile ? "w-full" : ""}>
          <Plus className="h-4 w-4 mr-2" />
          Upload your first greeting
        </Button>
      </CardContent>
    </Card>
  );
};
