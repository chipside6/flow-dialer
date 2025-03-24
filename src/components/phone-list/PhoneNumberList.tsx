
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { PhoneNumberBulkInput } from "./PhoneNumberBulkInput";
import { PhoneListActions } from "./PhoneListActions";
import { PhoneNumberDisplay } from "./PhoneNumberDisplay";
import { IvrConfigSection } from "./ivr-config/IvrConfigSection";
import { SipTrunkSection } from "./sip-config/SipTrunkSection";

interface PhoneNumberListProps {
  campaignId?: string;
}

const PhoneNumberList: React.FC<PhoneNumberListProps> = ({ campaignId }) => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [bulkNumbers, setBulkNumbers] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [transferNumber, setTransferNumber] = useState("");
  const [recordingFile, setRecordingFile] = useState("greeting.wav");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sipTrunkProvider, setSipTrunkProvider] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipHost, setSipHost] = useState("");
  const [sipPort, setSipPort] = useState("5060");
  const [showSipConfig, setShowSipConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNumber = () => {
    if (!newNumber) return;
    
    // Basic validation for phone number format
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(newNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    setPhoneNumbers([...phoneNumbers, newNumber]);
    setNewNumber("");
    
    toast({
      title: "Number added",
      description: "Phone number has been added to the list",
    });
  };

  const handleRemoveNumber = (index: number) => {
    const updatedNumbers = [...phoneNumbers];
    updatedNumbers.splice(index, 1);
    setPhoneNumbers(updatedNumbers);
  };

  const handleBulkAdd = () => {
    if (!bulkNumbers.trim()) return;
    
    // Split by newlines, commas, or semicolons
    const numbers = bulkNumbers
      .split(/[\n,;]+/)
      .map(num => num.trim())
      .filter(num => num.length > 0);
    
    // Basic validation
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    const validNumbers = numbers.filter(num => phoneRegex.test(num));
    
    if (validNumbers.length !== numbers.length) {
      toast({
        title: "Some numbers were invalid",
        description: `Added ${validNumbers.length} out of ${numbers.length} numbers`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Numbers added",
        description: `Added ${validNumbers.length} phone numbers to the list`,
      });
    }
    
    setPhoneNumbers([...phoneNumbers, ...validNumbers]);
    setBulkNumbers("");
    setShowBulkInput(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (wav, mp3)",
          variant: "destructive",
        });
        return;
      }
      
      setAudioFile(file);
      setRecordingFile(file.name);
      
      toast({
        title: "Audio file selected",
        description: `File "${file.name}" will be used as the greeting`,
      });
    }
  };

  const handleExportForAsterisk = () => {
    if (phoneNumbers.length === 0) {
      toast({
        title: "No numbers to export",
        description: "Add phone numbers to the list first",
        variant: "destructive",
      });
      return;
    }
    
    if (!sipTrunkProvider || !sipUsername || !sipHost) {
      toast({
        title: "Missing SIP configuration",
        description: "Please provide SIP trunk configuration",
        variant: "destructive",
      });
      return;
    }
    
    // Format for Asterisk dialplan with IVR functionality
    const formattedNumbers = phoneNumbers.map(num => {
      // Remove non-numeric characters for Asterisk
      const cleanNumber = num.replace(/[^0-9+]/g, '');
      return `exten => s,n,Dial(SIP/${cleanNumber}@${sipTrunkProvider},30,g)`;
    }).join('\n');
    
    // Create SIP trunk configuration
    const sipConfig = `
[${sipTrunkProvider}]
type=peer
host=${sipHost}
port=${sipPort}
username=${sipUsername}
secret=${sipPassword}
fromuser=${sipUsername}
context=from-trunk
disallow=all
allow=ulaw
allow=alaw
    `.trim();
    
    // Create a dialplan with IVR functionality
    const dialplan = `
; SIP Provider Configuration
${sipConfig}

[campaign-${campaignId || 'unknown'}]
exten => s,1,Answer()
exten => s,n,Wait(1)
exten => s,n,Playback(${recordingFile})
exten => s,n,WaitExten(5)
${formattedNumbers}
exten => s,n,Hangup()

; Handle keypress 1 for transfer
exten => 1,1,NoOp(Transferring call to ${transferNumber})
exten => 1,n,Dial(SIP/${transferNumber},30)
exten => 1,n,Hangup()
    `.trim();
    
    // Create and download the file
    const blob = new Blob([dialplan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaignId || 'dialer'}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // If there's an audio file, create a zip file and include it
    if (audioFile) {
      toast({
        title: "Dialplan exported",
        description: "Remember to upload the audio file to your Asterisk server",
      });
    } else {
      toast({
        title: "Dialplan exported",
        description: "Asterisk dialplan file with IVR functionality has been downloaded",
      });
    }
  };

  const handleExportCSV = () => {
    if (phoneNumbers.length === 0) {
      toast({
        title: "No numbers to export",
        description: "Add phone numbers to the list first",
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV content
    const csvContent = "phone_number\n" + phoneNumbers.join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaignId || 'numbers'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "CSV exported",
      description: "Phone numbers have been exported as CSV",
    });
  };

  return (
    <Card className="border-border/40 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          Campaign Phone List
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PhoneNumberInput 
          newNumber={newNumber}
          setNewNumber={setNewNumber}
          handleAddNumber={handleAddNumber}
        />
        
        <IvrConfigSection
          transferNumber={transferNumber}
          setTransferNumber={setTransferNumber}
          recordingFile={recordingFile}
          setRecordingFile={setRecordingFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          audioFile={audioFile}
        />
        
        <SipTrunkSection
          showSipConfig={showSipConfig}
          setShowSipConfig={setShowSipConfig}
          sipTrunkProvider={sipTrunkProvider}
          setSipTrunkProvider={setSipTrunkProvider}
          sipUsername={sipUsername}
          setSipUsername={setSipUsername}
          sipPassword={sipPassword}
          setSipPassword={setSipPassword}
          sipHost={sipHost}
          setSipHost={setSipHost}
          sipPort={sipPort}
          setSipPort={setSipPort}
        />
        
        <PhoneListActions
          showBulkInput={showBulkInput}
          setShowBulkInput={setShowBulkInput}
          handleExportCSV={handleExportCSV}
          handleExportForAsterisk={handleExportForAsterisk}
          phoneNumbers={phoneNumbers}
        />
        
        {showBulkInput && (
          <PhoneNumberBulkInput
            bulkNumbers={bulkNumbers}
            setBulkNumbers={setBulkNumbers}
            handleBulkAdd={handleBulkAdd}
          />
        )}
        
        <PhoneNumberDisplay
          phoneNumbers={phoneNumbers}
          handleRemoveNumber={handleRemoveNumber}
        />
      </CardContent>
    </Card>
  );
};

export default PhoneNumberList;
