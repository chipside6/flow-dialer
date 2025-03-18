import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Check, Play, BarChart3 } from "lucide-react";

interface CampaignCreationWizardProps {
  onComplete: (campaign: any) => void;
  onCancel: () => void;
}

export const CampaignCreationWizard = ({ onComplete, onCancel }: CampaignCreationWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"basics" | "contacts" | "audio" | "transfers" | "schedule" | "review">("basics");
  const [campaign, setCampaign] = useState({
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
  const contactLists = [
    { id: "list-1", name: "Main Customer List (250 contacts)" },
    { id: "list-2", name: "VIP Customers (50 contacts)" }
  ];

  const greetingFiles = [
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={step} className="w-full">
          {/* Fixed overlapping text by adding spacing and responsive class names */}
          <TabsList className="grid grid-cols-6 mb-6 gap-1 overflow-x-auto">
            <TabsTrigger value="basics" onClick={() => step !== "basics" && setStep("basics")} className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2">Basics</TabsTrigger>
            <TabsTrigger value="contacts" onClick={() => step !== "contacts" && campaign.title && setStep("contacts")} className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2">Contacts</TabsTrigger>
            <TabsTrigger value="audio" onClick={() => step !== "audio" && campaign.contactListId && setStep("audio")} className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2">Audio</TabsTrigger>
            <TabsTrigger value="transfers" onClick={() => step !== "transfers" && campaign.greetingFileId && setStep("transfers")} className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2">Transfers</TabsTrigger>
            <TabsTrigger value="schedule" onClick={() => step !== "schedule" && campaign.transferNumber && setStep("schedule")} className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2">Schedule</TabsTrigger>
            <TabsTrigger value="review" onClick={() => step !== "review" && campaign.schedule.startDate && setStep("review")} className="text-xs sm:text-sm whitespace-nowrap px-1 sm:px-2">Review</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics" className="space-y-4">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                name="title"
                value={campaign.title}
                onChange={handleInputChange}
                placeholder="Enter a title for your campaign"
              />
            </div>
            <div>
              <Label htmlFor="description">Campaign Description</Label>
              <Textarea
                id="description"
                name="description"
                value={campaign.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose of this campaign"
                rows={3}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-4">
            <div>
              <Label htmlFor="contactListId">Select Contact List</Label>
              <Select
                value={campaign.contactListId}
                onValueChange={(value) => handleSelectChange("contactListId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact list" />
                </SelectTrigger>
                <SelectContent>
                  {contactLists.map(list => (
                    <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <div>
              <Label htmlFor="greetingFileId">Select Greeting Audio</Label>
              <Select
                value={campaign.greetingFileId}
                onValueChange={(value) => handleSelectChange("greetingFileId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a greeting audio file" />
                </SelectTrigger>
                <SelectContent>
                  {greetingFiles.map(file => (
                    <SelectItem key={file.id} value={file.id}>{file.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="transfers" className="space-y-4">
            <div>
              <Label htmlFor="transferNumber">Transfer Number</Label>
              <Input
                id="transferNumber"
                name="transferNumber"
                value={campaign.transferNumber}
                onChange={handleInputChange}
                placeholder="Enter a phone number for transfers (e.g., +1 555-123-4567)"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This is the number that will receive calls when recipients request to speak with someone.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={campaign.schedule.startDate}
                  onChange={handleScheduleChange}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  When should this campaign begin?
                </p>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={campaign.schedule.timezone}
                  onValueChange={(value) => handleSelectChange("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="maxConcurrentCalls">Max Concurrent Calls</Label>
                <Input
                  id="maxConcurrentCalls"
                  name="maxConcurrentCalls"
                  type="number"
                  min={1}
                  max={50}
                  value={campaign.schedule.maxConcurrentCalls}
                  onChange={handleScheduleChange}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum number of simultaneous calls (1-50)
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> The campaign will run continuously until all contacts have been called.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Campaign Details</h3>
                    <p><span className="text-muted-foreground">Title:</span> {campaign.title}</p>
                    <p><span className="text-muted-foreground">Description:</span> {campaign.description || "None provided"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Contact List</h3>
                    <p>{contactLists.find(list => list.id === campaign.contactListId)?.name || "None selected"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Greeting Audio</h3>
                    <p>{greetingFiles.find(file => file.id === campaign.greetingFileId)?.name || "None selected"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Transfer Number</h3>
                    <p>{campaign.transferNumber}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Schedule</h3>
                  <p>
                    Start Date: {campaign.schedule.startDate}<br />
                    Timezone: {campaign.schedule.timezone}<br />
                    Max concurrent calls: {campaign.schedule.maxConcurrentCalls}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The campaign will run until all contacts have been called.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {step !== "basics" ? (
          <Button type="button" variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        {step !== "review" ? (
          <Button type="button" onClick={handleNext}>
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handleComplete}>
            <Check className="h-4 w-4 mr-2" /> Create Campaign
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
