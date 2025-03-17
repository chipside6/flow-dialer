
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Phone, Download, Plus, Trash } from "lucide-react";

interface PhoneNumberListProps {
  campaignId?: string;
}

const PhoneNumberList: React.FC<PhoneNumberListProps> = ({ campaignId }) => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [bulkNumbers, setBulkNumbers] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

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

  const handleExportForAsterisk = () => {
    if (phoneNumbers.length === 0) {
      toast({
        title: "No numbers to export",
        description: "Add phone numbers to the list first",
        variant: "destructive",
      });
      return;
    }
    
    // Format for Asterisk dialplan
    const formattedNumbers = phoneNumbers.map(num => {
      // Remove non-numeric characters for Asterisk
      const cleanNumber = num.replace(/[^0-9+]/g, '');
      return `exten => s,n,Dial(SIP/${cleanNumber},30)`;
    }).join('\n');
    
    // Add common Asterisk dialplan structure
    const dialplan = `
[campaign-${campaignId || 'unknown'}]
exten => s,1,Answer()
${formattedNumbers}
exten => s,n,Hangup()
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
    
    toast({
      title: "Dialplan exported",
      description: "Asterisk dialplan file has been downloaded",
    });
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
