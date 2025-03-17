
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Server, Trash, Plus, Calendar, Check, X, Edit, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SipProvider {
  id: string;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  description: string;
  dateAdded: Date;
  isActive: boolean;
}

const SipProviders = () => {
  const [providers, setProviders] = useState<SipProvider[]>([
    {
      id: "1",
      name: "Twilio SIP",
      host: "sip.twilio.com",
      port: "5060",
      username: "AC123456789",
      password: "••••••••••",
      description: "Main Twilio SIP trunk for outbound calls",
      dateAdded: new Date(2023, 4, 15),
      isActive: true
    },
    {
      id: "2",
      name: "Vonage API",
      host: "sip.vonage.com",
      port: "5060",
      username: "vonage_user",
      password: "••••••••",
      description: "Vonage SIP trunk for international calls",
      dateAdded: new Date(2023, 5, 10),
      isActive: false
    }
  ]);
  
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("5060");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editingProvider, setEditingProvider] = useState<SipProvider | null>(null);
  
  const resetForm = () => {
    setName("");
    setHost("");
    setPort("5060");
    setUsername("");
    setPassword("");
    setDescription("");
    setEditingProvider(null);
  };
  
  const handleAddProvider = () => {
    if (!name || !host || !username || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (editingProvider) {
      // Update existing provider
      setProviders(providers.map(provider => 
        provider.id === editingProvider.id 
          ? {
              ...provider,
              name,
              host,
              port,
              username,
              password: password === "••••••••" ? provider.password : password,
              description: description || "No description provided"
            }
          : provider
      ));
      
      toast({
        title: "Provider updated",
        description: `${name} has been updated successfully`,
      });
    } else {
      // Add new provider
      const newProvider: SipProvider = {
        id: Date.now().toString(),
        name,
        host,
        port,
        username,
        password,
        description: description || "No description provided",
        dateAdded: new Date(),
        isActive: true
      };
      
      setProviders([...providers, newProvider]);
      
      toast({
        title: "Provider added",
        description: `${name} has been added successfully`,
      });
    }
    
    resetForm();
  };
  
  const handleEditProvider = (provider: SipProvider) => {
    setName(provider.name);
    setHost(provider.host);
    setPort(provider.port);
    setUsername(provider.username);
    setPassword("••••••••");
    setDescription(provider.description);
    setEditingProvider(provider);
  };
  
  const handleDeleteProvider = (id: string) => {
    setProviders(providers.filter(provider => provider.id !== id));
    toast({
      title: "Provider deleted",
      description: "The SIP provider has been removed",
    });
  };
  
  const toggleProviderStatus = (id: string) => {
    setProviders(providers.map(provider => 
      provider.id === id 
        ? { ...provider, isActive: !provider.isActive }
        : provider
    ));
    
    const provider = providers.find(p => p.id === id);
    if (provider) {
      toast({
        title: provider.isActive ? "Provider deactivated" : "Provider activated",
        description: `${provider.name} has been ${provider.isActive ? "deactivated" : "activated"}`,
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <DashboardNav />
            </div>
            <div className="md:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">SIP Providers</h1>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    {editingProvider ? "Edit SIP Provider" : "Add New SIP Provider"}
                  </CardTitle>
                  <CardDescription>
                    {editingProvider 
                      ? `Editing ${editingProvider.name}` 
                      : "Configure a new SIP trunk provider for outgoing calls"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="provider-name">Provider Name*</Label>
                        <Input
                          id="provider-name"
                          placeholder="E.g., Twilio, Vonage, etc."
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider-host">Host/Server*</Label>
                        <Input
                          id="provider-host"
                          placeholder="E.g., sip.provider.com"
                          value={host}
                          onChange={(e) => setHost(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="provider-username">Username/Account ID*</Label>
                        <Input
                          id="provider-username"
                          placeholder="Enter SIP username or account ID"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider-port">Port</Label>
                        <Input
                          id="provider-port"
                          placeholder="Default: 5060"
                          value={port}
                          onChange={(e) => setPort(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="provider-password">Password/API Key*</Label>
                      <div className="relative">
                        <Input
                          id="provider-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter SIP password or API key"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="provider-description">Description</Label>
                      <Input
                        id="provider-description"
                        placeholder="Enter a description for this SIP provider"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={handleAddProvider}>
                        {editingProvider ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Update Provider
                          </>
                        ) : (
                          <>
                            <Server className="mr-2 h-4 w-4" />
                            Add Provider
                          </>
                        )}
                      </Button>
                      {editingProvider && (
                        <Button variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="mr-2 h-5 w-5" />
                    Your SIP Providers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {providers.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No SIP providers configured yet. Add your first provider.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Host</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Added</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {providers.map((provider) => (
                          <TableRow key={provider.id}>
                            <TableCell className="font-medium">{provider.name}</TableCell>
                            <TableCell>
                              {provider.host}:{provider.port}
                            </TableCell>
                            <TableCell>{provider.username}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDistanceToNow(provider.dateAdded, { addSuffix: true })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {provider.isActive ? (
                                  <span className="flex items-center text-green-600">
                                    <Check className="mr-1 h-4 w-4" /> Active
                                  </span>
                                ) : (
                                  <span className="flex items-center text-red-600">
                                    <X className="mr-1 h-4 w-4" /> Inactive
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => toggleProviderStatus(provider.id)}
                                >
                                  {provider.isActive ? (
                                    <X className="h-4 w-4 text-red-600" />
                                  ) : (
                                    <Check className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditProvider(provider)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteProvider(provider.id)}
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SipProviders;
