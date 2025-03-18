
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server, Plus, Edit, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { SipProvider } from "@/types/sipProviders";

interface SipProviderFormProps {
  onSubmit: (provider: Omit<SipProvider, 'id' | 'dateAdded' | 'isActive'>) => void;
  editingProvider: SipProvider | null;
  onCancel: () => void;
}

export const SipProviderForm: React.FC<SipProviderFormProps> = ({
  onSubmit,
  editingProvider,
  onCancel
}) => {
  const [name, setName] = useState(editingProvider?.name || "");
  const [host, setHost] = useState(editingProvider?.host || "");
  const [port, setPort] = useState(editingProvider?.port || "5060");
  const [username, setUsername] = useState(editingProvider?.username || "");
  const [password, setPassword] = useState(editingProvider?.password || "");
  const [description, setDescription] = useState(editingProvider?.description || "");
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = () => {
    if (!name || !host || !username || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({
      name,
      host,
      port,
      username,
      password,
      description: description || "No description provided"
    });
  };
  
  return (
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
            <Button onClick={handleSubmit}>
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
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
