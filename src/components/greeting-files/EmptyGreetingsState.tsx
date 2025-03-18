
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { FileAudio } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmptyGreetingsStateProps {
  onUploadClick: () => void;
}

export const EmptyGreetingsState = ({ onUploadClick }: EmptyGreetingsStateProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <FileAudio className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mb-2 text-center">No greeting files yet</CardTitle>
        <CardDescription className="text-center mb-4">
          Upload greeting audio files to use in your campaigns
        </CardDescription>
        <Button 
          onClick={onUploadClick}
          className={`relative ${isMobile ? "w-full" : ""} overflow-hidden group`}
        >
          <span className="relative z-10">Upload your first greeting</span>
          <span className="absolute inset-0 bg-primary group-hover:bg-primary/90 transition-colors"></span>
        </Button>
      </CardContent>
    </Card>
  );
};
