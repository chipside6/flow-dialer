
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { SipProvider } from "@/types/sipProviders";
import { FormField } from "./FormField";
import { PasswordField } from "./PasswordField";
import { FormActions } from "./FormActions";

interface SipProviderFormProps {
  onSubmit: (provider: SipProvider) => void;
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
  
  // Update form when editingProvider changes
  useEffect(() => {
    if (editingProvider) {
      setName(editingProvider.name);
      setHost(editingProvider.host);
      setPort(editingProvider.port);
      setUsername(editingProvider.username);
      setPassword(editingProvider.password);
      setDescription(editingProvider.description);
    }
  }, [editingProvider]);
  
  const handleSubmit = () => {
    if (!name || !host || !username || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Submitting SIP provider form:", { name, host, port, username, password });
    
    onSubmit({
      id: editingProvider?.id,
      name,
      host,
      port,
      username,
      password,
      description: description || "No description provided",
      dateAdded: editingProvider?.dateAdded || new Date(),
      isActive: editingProvider?.isActive || false
    });
  };
  
  return (
    <Card className="mb-8 w-full max-w-full overflow-hidden">
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
            <FormField
              id="provider-name"
              label="Provider Name"
              placeholder="E.g., Twilio, Vonage, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FormField
              id="provider-host"
              label="Host/Server"
              placeholder="E.g., sip.provider.com"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="provider-username"
              label="Username/Account ID"
              placeholder="Enter SIP username or account ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FormField
              id="provider-port"
              label="Port"
              placeholder="Default: 5060"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </div>
          
          <PasswordField
            id="provider-password"
            label="Password/API Key"
            placeholder="Enter SIP password or API key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <FormField
            id="provider-description"
            label="Description"
            placeholder="Enter a description for this SIP provider"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <FormActions 
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isEditing={!!editingProvider}
          />
        </div>
      </CardContent>
    </Card>
  );
};
