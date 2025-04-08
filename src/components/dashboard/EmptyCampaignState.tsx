
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmptyCampaignState = () => {
  const navigate = useNavigate();
  
  const handleCreateCampaign = () => {
    navigate('/campaign', { state: { showCreateWizard: true } });
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/20 min-h-[200px]">
      <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        You haven't created any campaigns yet. Create your first campaign to get started with automated calling.
      </p>
      <Button 
        variant="success" 
        onClick={handleCreateCampaign}
        className="mx-auto"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Your First Campaign
      </Button>
    </div>
  );
};
