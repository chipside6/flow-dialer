
import { useState, useEffect } from "react";
import { SipProvider } from "@/types/sipProviders";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useFetchSipProviders = () => {
  const [providers, setProviders] = useState<SipProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProviders = async () => {
      if (!user) {
        setProviders([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sip_providers')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Transform data to match SipProvider interface
        const transformedData = (data || []).map((provider: any) => ({
          id: provider.id,
          name: provider.name,
          host: provider.host,
          port: provider.port.toString(),
          username: provider.username,
          password: provider.password,
          description: provider.description || "",
          dateAdded: new Date(provider.created_at),
          isActive: provider.active
        }));
        
        setProviders(transformedData);
      } catch (err: any) {
        console.error("Error fetching SIP providers:", err);
        setError(err);
        toast({
          title: "Error loading providers",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [user]);

  return { providers, setProviders, isLoading, error };
};
