
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { PhoneForwarded, Trash, Plus, Calendar, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface TransferNumber {
  id: string;
  name: string;
  number: string;
  description: string;
  dateAdded: Date;
  callCount: number;
}

const TransferNumbers = () => {
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  
  const handleAddTransferNumber = () => {
    if (!name || !number) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and a number",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation for phone number format
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!phoneRegex.test(number)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    const newTransferNumber: TransferNumber = {
      id: Date.now().toString(),
      name,
      number,
      description: description || "No description provided",
      dateAdded: new Date(),
      callCount: 0
    };
    
    setTransferNumbers([...transferNumbers, newTransferNumber]);
    setName("");
    setNumber("");
    setDescription("");
    
    toast({
      title: "Transfer number added",
      description: `${name} (${number}) has been added successfully`,
    });
  };
  
  const handleDeleteTransferNumber = (id: string) => {
    setTransferNumbers(transferNumbers.filter(tn => tn.id !== id));
    toast({
      title: "Transfer number deleted",
      description: "The transfer number has been removed",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transfer Numbers</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Transfer Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transfer-name">Name</Label>
              <Input
                id="transfer-name"
                placeholder="Enter a name for this transfer destination"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transfer-number">Phone Number</Label>
              <Input
                id="transfer-number"
                placeholder="Enter the phone number (e.g., +1-555-123-4567)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transfer-description">Description</Label>
              <Input
                id="transfer-description"
                placeholder="Enter a description for this transfer number"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleAddTransferNumber}>
              <PhoneForwarded className="mr-2 h-4 w-4" />
              Add Transfer Number
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PhoneForwarded className="mr-2 h-5 w-5" />
            Your Transfer Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transferNumbers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No transfer numbers yet. Add your first transfer destination.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Call Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferNumbers.map((tn) => (
                  <TableRow key={tn.id}>
                    <TableCell className="font-medium">{tn.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-primary" />
                        {tn.number}
                      </div>
                    </TableCell>
                    <TableCell>{tn.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(tn.dateAdded, { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>{tn.callCount}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTransferNumber(tn.id)}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TransferNumbers;
