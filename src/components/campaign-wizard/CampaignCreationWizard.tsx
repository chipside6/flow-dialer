
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BasicsStep } from "./BasicsStep";
import { ContactsStep } from "./ContactsStep";
import { AudioStep } from "./AudioStep";
import { TransfersStep } from "./TransfersStep";
import { ScheduleStep } from "./ScheduleStep";
import { ReviewStep } from "./ReviewStep";
import { WizardStepTabs } from "./WizardStepTabs";
import { WizardNavigation } from "./WizardNavigation";
import { CampaignData, WizardStep, ContactList, GreetingFile } from "./types";

interface CampaignCreationWizardProps {
  onComplete: (campaign: CampaignData) => void;
  onCancel: () => void;
}

export const CampaignCreationWizard = ({ onComplete, onCancel }: CampaignCreationWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<WizardStep>("basics");
  const [campaign, setCampaign] = useState<CampaignData>({
    title: "",
    description: "",
    contactListId: "",
    greetingFileId: "",
    transferNumber: "",
    schedule: {
      startDate: new Date().toISOString().split("T")[0],
      timezone: "America/New_York",
      maxConcurrentCalls: 5
    }
  });

  // Mock data for selections
  const contactLists: ContactList[] = [
    { id: "list-1", name: "Main Customer List (250 contacts)" },
    { id: "list-2", name: "VIP Customers (50 contacts)" }
  ];

  const greetingFiles: GreetingFile[] = [
    { id: "greeting-1", name: "Welcome-Message.wav" },
    { id: "greeting-2", name: "After-Hours.mp3" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: value
      }
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "timezone") {
      setCampaign(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          timezone: value
        }
      }));
    } else {
      setCampaign(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (step === "basics") {
      if (!campaign.title) {
        toast({
          title: "Missing information",
          description: "Please provide a campaign title",
          variant: "destructive",
        });
        return;
      }
      setStep("contacts");
    } else if (step === "contacts") {
      if (!campaign.contactListId) {
        toast({
          title: "Missing information",
          description: "Please select a contact list",
          variant: "destructive",
        });
        return;
      }
      setStep("audio");
    } else if (step === "audio") {
      if (!campaign.greetingFileId) {
        toast({
          title: "Missing information",
          description: "Please select a greeting audio file",
          variant: "destructive",
        });
        return;
      }
      setStep("transfers");
    } else if (step === "transfers") {
      if (!campaign.transferNumber) {
        toast({
          title: "Missing information",
          description: "Please provide a transfer number",
          variant: "destructive",
        });
        return;
      }
      setStep("schedule");
    } else if (step === "schedule") {
      setStep("review");
    }
  };

  const handlePrevious = () => {
    if (step === "contacts") setStep("basics");
    else if (step === "audio") setStep("contacts");
    else if (step === "transfers") setStep("audio");
    else if (step === "schedule") setStep("transfers");
    else if (step === "review") setStep("schedule");
  };

  const handleComplete = () => {
    // Format campaign data for submission
    const newCampaign = {
      ...campaign,
      id: `camp-${Date.now().toString(36)}`,
      status: "pending",
      progress: 0,
      totalCalls: contactLists.find(list => list.id === campaign.contactListId)?.name.includes("250") ? 250 : 50,
      answeredCalls: 0,
      transferredCalls: 0,
      failedCalls: 0,
      createdAt: new Date().toISOString()
    };
    
    onComplete(newCampaign);
    
    toast({
      title: "Campaign Created",
      description: "Your new campaign has been created successfully",
    });
  };

  // Determine which steps are available based on completed prior steps
  const isStepAvailable = {
    contacts: !!campaign.title,
    audio: !!campaign.contactListId,
    transfers: !!campaign.greetingFileId,
    schedule: !!campaign.transferNumber,
    review: !!campaign.schedule.startDate
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={step} className="w-full">
          <WizardStepTabs 
            currentStep={step} 
            setStep={setStep} 
            isStepAvailable={isStepAvailable} 
          />
          
          <TabsContent value="basics">
            <BasicsStep campaign={campaign} onChange={handleInputChange} />
          </TabsContent>
          
          <TabsContent value="contacts">
            <ContactsStep 
              campaign={campaign}
              contactLists={contactLists}
              onSelectChange={handleSelectChange}
            />
          </TabsContent>
          
          <TabsContent value="audio">
            <AudioStep 
              campaign={campaign}
              greetingFiles={greetingFiles}
              onSelectChange={handleSelectChange}
            />
          </TabsContent>
          
          <TabsContent value="transfers">
            <TransfersStep campaign={campaign} onChange={handleInputChange} />
          </TabsContent>
          
          <TabsContent value="schedule">
            <ScheduleStep 
              campaign={campaign}
              onChange={handleScheduleChange}
              onSelectChange={handleSelectChange}
            />
          </TabsContent>
          
          <TabsContent value="review">
            <ReviewStep 
              campaign={campaign}
              contactLists={contactLists}
              greetingFiles={greetingFiles}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <WizardNavigation 
          step={step}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onCancel={onCancel}
          onComplete={handleComplete}
        />
      </CardFooter>
    </Card>
  );
};
