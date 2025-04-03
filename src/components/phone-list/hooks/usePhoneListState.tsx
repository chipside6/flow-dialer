
import { useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

export interface PhoneListState {
  phoneNumbers: string[];
  newNumber: string;
  bulkNumbers: string;
  showBulkInput: boolean;
  transferNumber: string;
  recordingFile: string;
  audioFile: File | null;
  sipTrunkProvider: string;
  sipUsername: string;
  sipPassword: string;
  sipHost: string;
  sipPort: string;
  showSipConfig: boolean;
  isActionInProgress: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export interface PhoneListActions {
  setPhoneNumbers: (numbers: string[]) => void;
  setNewNumber: (number: string) => void;
  setBulkNumbers: (numbers: string) => void;
  setShowBulkInput: (show: boolean) => void;
  setTransferNumber: (number: string) => void;
  setRecordingFile: (file: string) => void;
  setAudioFile: (file: File | null) => void;
  setSipTrunkProvider: (provider: string) => void;
  setSipUsername: (username: string) => void;
  setSipPassword: (password: string) => void;
  setSipHost: (host: string) => void;
  setSipPort: (port: string) => void;
  setShowSipConfig: (show: boolean) => void;
  setIsActionInProgress: (inProgress: boolean) => void;
  handleAddNumber: () => void;
  handleRemoveNumber: (index: number) => void;
  handleBulkAdd: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExportForAsterisk: () => void;
  handleExportCSV: () => void;
}

export function usePhoneListState(): [PhoneListState, PhoneListActions] {
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
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNumber = () => {
    if (!newNumber) {
      toast({
        title: "Empty number",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }
    
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
    
    setIsActionInProgress(true);
    
    // Simulate network delay for better UX feedback
    setTimeout(() => {
      setPhoneNumbers(prev => [...prev, newNumber]);
      setNewNumber("");
      
      toast({
        title: "Number added",
        description: "Phone number has been added to the list",
      });
      
      setIsActionInProgress(false);
    }, 300);
  };

  const handleRemoveNumber = (index: number) => {
    setIsActionInProgress(true);
    
    // Simulate network delay for better UX feedback
    setTimeout(() => {
      const updatedNumbers = [...phoneNumbers];
      updatedNumbers.splice(index, 1);
      setPhoneNumbers(updatedNumbers);
      
      setIsActionInProgress(false);
    }, 300);
  };

  const handleBulkAdd = () => {
    if (!bulkNumbers.trim()) {
      toast({
        title: "No numbers provided",
        description: "Please enter phone numbers to add",
        variant: "destructive",
      });
      return;
    }
    
    // Split by newlines, commas, or semicolons
    const numbers = bulkNumbers
      .split(/[\n,;]+/)
      .map(num => num.trim())
      .filter(num => num.length > 0);
    
    if (numbers.length === 0) {
      toast({
        title: "No valid numbers found",
        description: "Please enter valid phone numbers to add",
        variant: "destructive",
      });
      return;
    }
    
    setIsActionInProgress(true);
    
    // Basic validation
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    const validNumbers = numbers.filter(num => phoneRegex.test(num));
    
    // Simulate network delay for better UX feedback
    setTimeout(() => {
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
      
      setPhoneNumbers(prev => [...prev, ...validNumbers]);
      setBulkNumbers("");
      setShowBulkInput(false);
      setIsActionInProgress(false);
    }, 800);
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
    
    setIsActionInProgress(true);
    
    setTimeout(() => {
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

[campaign-${Math.random().toString(36).substring(2, 8)}]
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
      a.download = `campaign-dialer.conf`;
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
      
      setIsActionInProgress(false);
    }, 1000);
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
    
    setIsActionInProgress(true);
    
    setTimeout(() => {
      // Create CSV content
      const csvContent = "phone_number\n" + phoneNumbers.join("\n");
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-numbers.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "CSV exported",
        description: "Phone numbers have been exported as CSV",
      });
      
      setIsActionInProgress(false);
    }, 800);
  };

  return [
    {
      phoneNumbers,
      newNumber,
      bulkNumbers,
      showBulkInput,
      transferNumber,
      recordingFile,
      audioFile,
      sipTrunkProvider,
      sipUsername,
      sipPassword,
      sipHost,
      sipPort,
      showSipConfig,
      isActionInProgress,
      fileInputRef
    },
    {
      setPhoneNumbers,
      setNewNumber,
      setBulkNumbers,
      setShowBulkInput,
      setTransferNumber,
      setRecordingFile,
      setAudioFile,
      setSipTrunkProvider,
      setSipUsername,
      setSipPassword,
      setSipHost,
      setSipPort,
      setShowSipConfig,
      setIsActionInProgress,
      handleAddNumber,
      handleRemoveNumber,
      handleBulkAdd,
      handleFileChange,
      handleExportForAsterisk,
      handleExportCSV
    }
  ];
}
