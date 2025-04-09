
import React from 'react';
import { Button } from '@/components/ui/button';
import { useContactLists } from '@/hooks/useContactLists';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { Badge } from '@/components/ui/badge';

interface ReviewStepProps {
  campaign: any;
  onBack: () => void;
  onComplete: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  campaign,
  onBack,
  onComplete
}) => {
  const { lists } = useContactLists();
  const { greetingFiles } = useGreetingFiles();
  
  const selectedList = lists?.find(list => list.id === campaign.contactListId);
  const selectedGreeting = greetingFiles?.find(file => file.id === campaign.greetingFileId);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Campaign</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 border-b pb-2">
          <div className="font-medium">Campaign Name:</div>
          <div className="col-span-2">{campaign.name}</div>
        </div>
        
        {campaign.description && (
          <div className="grid grid-cols-3 gap-2 border-b pb-2">
            <div className="font-medium">Description:</div>
            <div className="col-span-2">{campaign.description}</div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 border-b pb-2">
          <div className="font-medium">Contact List:</div>
          <div className="col-span-2">
            {selectedList ? (
              <div className="flex items-center">
                {selectedList.name}
                <Badge variant="outline" className="ml-2">
                  {selectedList.count || 0} contacts
                </Badge>
              </div>
            ) : (
              <span className="text-red-500">Not selected</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 border-b pb-2">
          <div className="font-medium">Greeting:</div>
          <div className="col-span-2">
            {selectedGreeting ? selectedGreeting.name : <span className="text-red-500">Not selected</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 border-b pb-2">
          <div className="font-medium">Transfer Number:</div>
          <div className="col-span-2">
            {campaign.transferNumber || <span className="text-muted-foreground">None selected</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 border-b pb-2">
          <div className="font-medium">Port Number:</div>
          <div className="col-span-2">
            {campaign.portNumber || <span className="text-muted-foreground">Default</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700"
          disabled={!campaign.name || !campaign.contactListId || !campaign.greetingFileId}
        >
          Create Campaign
        </Button>
      </div>
    </div>
  );
};
