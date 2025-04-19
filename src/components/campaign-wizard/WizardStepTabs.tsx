import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicsIcon, ContactsIcon, AudioIcon, ReviewIcon, Server } from "./WizardIcons";
import { WizardStep, CampaignData } from "./types";

interface WizardStepTabsProps {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  isStepAvailable: { [key: string]: boolean };
}

export const WizardStepTabs = ({
  currentStep,
  setStep,
  isStepAvailable
}: WizardStepTabsProps) => {
  return (
    <TabsList className="grid grid-cols-6 bg-muted w-full rounded-none border-b">
      <TabsTrigger
        value="basics"
        disabled={!isStepAvailable.basics}
        onClick={() => setStep('basics')}
        className="data-[state=active]:bg-background"
      >
        <BasicsIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Basics</span>
      </TabsTrigger>

      <TabsTrigger
        value="contacts"
        disabled={!isStepAvailable.contacts}
        onClick={() => setStep('contacts')}
        className="data-[state=active]:bg-background"
      >
        <ContactsIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Contacts</span>
      </TabsTrigger>

      <TabsTrigger
        value="audio"
        disabled={!isStepAvailable.audio}
        onClick={() => setStep('audio')}
        className="data-[state=active]:bg-background"
      >
        <AudioIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Audio</span>
      </TabsTrigger>
      
      <TabsTrigger
        value="goip"
        disabled={!isStepAvailable.goip}
        onClick={() => setStep('goip')}
        className="data-[state=active]:bg-background"
      >
        <Server className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">GoIP Device</span>
      </TabsTrigger>

      <TabsTrigger
        value="transfers"
        disabled={!isStepAvailable.transfers}
        onClick={() => setStep('transfers')}
        className="data-[state=active]:bg-background"
      >
        <ReviewIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Transfers</span>
      </TabsTrigger>

      <TabsTrigger
        value="review"
        disabled={!isStepAvailable.review}
        onClick={() => setStep('review')}
        className="data-[state=active]:bg-background"
      >
        <ReviewIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Review</span>
      </TabsTrigger>
    </TabsList>
  );
};
