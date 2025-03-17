
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Phone, Download, Plus, Trash, AudioLines, Upload, Server } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <div className="flex gap-2">
          <Input
            placeholder="Enter phone number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddNumber}>
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
        
        {/* IVR Configuration Section */}
        <div className="border rounded-md p-4 space-y-3">
          <h3 className="font-medium flex items-center">
            <AudioLines className="h-4 w-4 mr-2" />
            Call Flow Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Pre-recorded Message</FormLabel>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Input
                  placeholder="Select greeting audio file"
                  value={recordingFile}
                  onChange={(e) => setRecordingFile(e.target.value)}
                  className="flex-1"
                  readOnly={!!audioFile}
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
              </div>
              <FormDescription>
                Upload an audio file for greeting (WAV or MP3)
              </FormDescription>
            </FormItem>
            
            <FormItem>
              <FormLabel>Transfer Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter transfer destination"
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Where to transfer calls when recipient presses 1
              </FormDescription>
            </FormItem>
          </div>
        </div>
        
        {/* SIP Trunk Configuration */}
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <Server className="h-4 w-4 mr-2" />
              SIP Trunk Configuration
            </h3>
            <Button 
              variant="ghost" 
              onClick={() => setShowSipConfig(!showSipConfig)}
              size="sm"
            >
              {showSipConfig ? "Hide" : "Show"}
            </Button>
          </div>
          
          {showSipConfig && (
            <div className="space-y-4">
              <FormItem>
                <FormLabel>SIP Trunk Provider</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter provider name (e.g., twilio, voip.ms)"
                    value={sipTrunkProvider}
                    onChange={(e) => setSipTrunkProvider(e.target.value)}
                  />
                </FormControl>
              </FormItem>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>SIP Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username/Account ID"
                      value={sipUsername}
                      onChange={(e) => setSipUsername(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>SIP Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password/API Key"
                      value={sipPassword}
                      onChange={(e) => setSipPassword(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>SIP Host</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Host/Server (e.g., sip.provider.com)"
                      value={sipHost}
                      onChange={(e) => setSipHost(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>SIP Port</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Port (default: 5060)"
                      value={sipPort}
                      onChange={(e) => setSipPort(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowBulkInput(!showBulkInput)}
          >
            {showBulkInput ? "Hide Bulk Input" : "Bulk Add Numbers"}
          </Button>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={phoneNumbers.length === 0}
            >
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
            <Button 
              onClick={handleExportForAsterisk}
              disabled={phoneNumbers.length === 0}
            >
              <Download className="h-4 w-4 mr-2" /> Asterisk Dialplan
            </Button>
          </div>
        </div>
        
        {showBulkInput && (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter multiple phone numbers (separated by newlines, commas, or semicolons)"
              value={bulkNumbers}
              onChange={(e) => setBulkNumbers(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleBulkAdd}>Add All Numbers</Button>
          </div>
        )}
        
        {phoneNumbers.length > 0 ? (
          <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
            <ul className="divide-y">
              {phoneNumbers.map((number, index) => (
                <li key={index} className="py-2 flex justify-between items-center">
                  <span>{number}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveNumber(index)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No phone numbers added yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneNumberList;
