import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { FormActions } from "./FormActions";
import FormField from "@/components/ui/form-field"; // Ensure this exists
import PasswordField from "@/components/ui/password-field"; // Ensure this exists

interface SipProvider {
  id?: string;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  description?: string;
}

interface SipProviderFormProps {
  onSubmit: (provider: SipProvider) => Promise<void>;
  editingProvider: SipProvider | null;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SipProviderForm: React.FC<SipProviderFormProps> = ({
  onSubmit,
  editingProvider,
  onCancel,
  isSubmitting: externalIsSubmitting = false
}) => {
  const [name, setName] = useState(editingProvider?.name || "");
  const [host, setHost] = useState(editingProvider?.host || "");
  const [port, setPort] = useState(editingProvider?.port || "5060");
  const [username, setUsername] = useState(editingProvider?.username || "");
  const [password, setPassword] = useState(editingProvider?.password || "");
  const [description, setDescription] = useState(editingProvider?.description || "");

  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  // Ensure form updates when editingProvider changes
  useEffect(() => {
    if (editingProvider) {
      setName(editingProvider.name || "");
      setHost(editingProvider.host || "");
      setPort(editingProvider.port || "5060");
      setUsername(editingProvider.username || "");
      setPassword(editingProvider.password || "");
      setDescription(editingProvider.description || "");
    }
  }, [editingProvider]);

  // Combine internal and external submission states
  const isSubmitting = externalIsSubmitting || localIsSubmitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page reload

    setLocalIsSubmitting(true);

    try {
      console.log("Submitting SIP provider:", { name, host, port, username, password, description });
      await onSubmit({ name, host, port, username, password, description });
    } catch (error) {
      console.error("Error submitting SIP provider:", error);
    } finally {
      setLocalIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-end mt-4">
            <FormActions isEditing={!!editingProvider} onCancel={onCancel} isSubmitting={isSubmitting} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

