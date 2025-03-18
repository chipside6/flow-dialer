
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
          className={`${isMobile ? "w-full" : ""} px-6`}
        >
          Upload your first greeting
        </Button>
      </CardContent>
    </Card>
  );
};
