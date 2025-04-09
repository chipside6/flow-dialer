
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampaignForm } from './hooks/useCampaignForm';
import { BasicsForm } from './steps/BasicsForm';
import { ContactListSelector } from './steps/ContactListSelector';
import { GreetingSelector } from './steps/GreetingSelector';
import { TransferNumberStep } from './steps/TransferNumberStep';
import { ReviewStep } from './steps/ReviewStep';

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
            <TabsTrigger value="basics" onClick={() => setStep('basics')}>Basics</TabsTrigger>
            <TabsTrigger value="contacts" onClick={() => setStep('contacts')}>Contacts</TabsTrigger>
            <TabsTrigger value="greeting" onClick={() => setStep('greeting')}>Greeting</TabsTrigger>
            <TabsTrigger value="transfer" onClick={() => setStep('transfer')}>Transfer</TabsTrigger>
            <TabsTrigger value="review" onClick={() => setStep('review')}>Review</TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <BasicsForm
              campaign={campaign}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              onNext={() => setStep('contacts')}
            />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactListSelector
              selectedContactListId={campaign.contactListId}
              onSelect={(id) => handleSelectChange('contactListId', id)}
              onNext={() => setStep('greeting')}
              onBack={() => setStep('basics')}
            />
          </TabsContent>

          <TabsContent value="greeting">
            <GreetingSelector
              selectedGreetingId={campaign.greetingFileId}
              onSelect={(id) => handleSelectChange('greetingFileId', id)}
              onNext={() => setStep('transfer')}
              onBack={() => setStep('contacts')}
            />
          </TabsContent>

          <TabsContent value="transfer">
            <TransferNumberStep
              transferNumber={campaign.transferNumber}
              portNumber={campaign.portNumber}
              onTransferNumberChange={(value) => handleSelectChange('transferNumber', value)}
              onPortNumberChange={(value) => handleSelectChange('portNumber', value)}
              onNext={() => setStep('review')}
              onBack={() => setStep('greeting')}
            />
          </TabsContent>

          <TabsContent value="review">
            <ReviewStep
              campaign={campaign}
              onBack={() => setStep('transfer')}
              onComplete={handleFinish}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
