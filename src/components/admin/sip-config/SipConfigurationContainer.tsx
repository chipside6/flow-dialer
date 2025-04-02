import React, { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { fetchSipProviders } from '@/services/api/sipProvidersService';
import { SipProvider } from '@/types/sipProvider';
import { useAuth } from '@/contexts/auth';
import { updateSipProvider } from '@/services/api/sipProvidersService';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  host: z.string().min(2, {
    message: "Host must be at least 2 characters.",
  }),
  port: z.string().regex(/^[0-9]+$/, {
    message: "Port must be a number.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  secret: z.string().min(2, {
    message: "Secret must be at least 2 characters.",
  }),
  registerString: z.string().optional(),
  qualifyFrequency: z.string().optional(),
  context: z.string().optional(),
  directMedia: z.boolean().default(false).optional(),
})

interface SipConfigurationContainerProps {
  sipProviderId?: string;
  onConfigSaved?: () => void;
}

export function SipConfigurationContainer({ sipProviderId, onConfigSaved }: SipConfigurationContainerProps) {
  const [sipProvider, setSipProvider] = useState<SipProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadSipProvider = async () => {
      if (sipProviderId && user?.id) {
        setIsLoading(true);
        try {
          const providers = await fetchSipProviders(user.id);
          const provider = providers.find(p => p.id === sipProviderId);
          if (provider) {
            setSipProvider(provider);
          } else {
            toast({
              title: "Error",
              description: "SIP Provider not found.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSipProvider();
  }, [sipProviderId, user?.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: sipProvider?.name || "",
      host: sipProvider?.host || "",
      port: sipProvider?.port?.toString() || "5060",
      username: sipProvider?.username || "",
      secret: sipProvider?.secret || "",
      registerString: sipProvider?.registerString || "",
      qualifyFrequency: sipProvider?.qualifyFrequency || "",
      context: sipProvider?.context || "",
      directMedia: sipProvider?.directMedia || false,
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (sipProvider) {
      form.reset({
        name: sipProvider.name || "",
        host: sipProvider.host || "",
        port: sipProvider.port?.toString() || "5060",
        username: sipProvider.username || "",
        secret: sipProvider.secret || "",
        registerString: sipProvider.registerString || "",
        qualifyFrequency: sipProvider.qualifyFrequency || "",
        context: sipProvider.context || "",
        directMedia: sipProvider.directMedia || false,
      });
    }
  }, [sipProvider, form.reset]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!sipProviderId || !user?.id) {
        throw new Error("SIP Provider ID or User ID is missing.");
      }

      const updatedProvider: SipProvider = {
        id: sipProviderId,
        user_id: user.id,
        name: values.name,
        host: values.host,
        port: parseInt(values.port, 10),
        username: values.username,
        secret: values.secret,
        registerString: values.registerString,
        qualifyFrequency: values.qualifyFrequency,
        context: values.context,
        directMedia: values.directMedia,
      };

      const result = await updateSipProvider(sipProviderId, updatedProvider);

      toast({
        title: "Success",
        description: result.message || (result.error ? `Error: ${result.error}` : "Configuration saved successfully")
      });

      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIP Provider Configuration</CardTitle>
        <CardDescription>Configure your SIP provider settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Provider Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name of your SIP provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input placeholder="sip.example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The hostname or IP address of your SIP provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input placeholder="5060" {...field} />
                  </FormControl>
                  <FormDescription>
                    The port number used for SIP communication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your SIP username provided by your provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your SIP password provided by your provider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registerString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register String</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional Register String" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional register string for advanced configuration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualifyFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualify Frequency</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional Qualify Frequency" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional qualify frequency for connection monitoring.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional Context" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional context for dialplan configuration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="directMedia"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Direct Media</FormLabel>
                    <FormDescription>Enable or disable direct media.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
