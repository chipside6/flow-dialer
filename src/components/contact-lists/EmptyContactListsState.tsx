
import React from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmptyContactListsStateProps {
  onCreateClick?: () => void;
}

const EmptyContactListsState = ({ onCreateClick }: EmptyContactListsStateProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mb-2 text-center">No Contact Lists Yet</CardTitle>
        <CardDescription className="text-center mb-4">
          Create your first contact list to start adding phone numbers
        </CardDescription>
        {onCreateClick && (
          <Button 
            onClick={onCreateClick}
            className={`${isMobile ? "w-full" : ""} bg-[#8643FF] hover:bg-[#7635e8]`}
          >
            Create your first list
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyContactListsState;
