
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampaignForm } from './hooks/useCampaignForm';
import { BasicsStep } from './BasicsStep';
import { ContactsStep } from './ContactsStep';
import { AudioStep } from './AudioStep';
import { TransfersStep } from './TransfersStep';
import { ReviewStep } from './ReviewStep';
import { useContactLists } from '@/hooks/useContactLists';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';

export interface CampaignCreationWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (campaign: any) => void;
}

export const CampaignCreationWizard: React.FC<CampaignCreationWizardProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const {
    campaign,
    step,
    setStep,
    handleInputChange,
    handleSelectChange,
    handleComplete
  } = useCampaignForm(onSuccess);

  const { lists: contactLists, isLoading: isLoadingLists } = useContactLists();
  const { greetingFiles, isLoading: isLoadingGreetings } = useGreetingFiles();

  const handleFinish = async () => {
    await handleComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up your campaign in a few easy steps.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={step} className="mt-4">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="basics" onClick={() => setStep("basics")}>Basics</TabsTrigger>
            <TabsTrigger value="contacts" onClick={() => setStep("contacts")}>Contacts</TabsTrigger>
            <TabsTrigger value="audio" onClick={() => setStep("audio")}>Audio</TabsTrigger>
            <TabsTrigger value="transfers" onClick={() => setStep("transfers")}>Transfer</TabsTrigger>
            <TabsTrigger value="review" onClick={() => setStep("review")}>Review</TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <BasicsStep
              campaign={campaign}
              onChange={handleInputChange}
            />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setStep("contacts")}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <ContactsStep
              campaign={campaign}
              contactLists={contactLists || []}
              onSelectChange={handleSelectChange}
              isLoading={isLoadingLists}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep("basics")}>Back</Button>
              <Button onClick={() => setStep("audio")}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="audio">
            <AudioStep
              campaign={campaign}
              greetingFiles={greetingFiles || []}
              onSelectChange={handleSelectChange}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep("contacts")}>Back</Button>
              <Button onClick={() => setStep("transfers")}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="transfers">
            <TransfersStep
              campaign={campaign}
              onChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep("audio")}>Back</Button>
              <Button onClick={() => setStep("review")}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <ReviewStep
              campaign={campaign}
              contactLists={contactLists || []}
              greetingFiles={greetingFiles || []}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep("transfers")}>Back</Button>
              <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">Create Campaign</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
