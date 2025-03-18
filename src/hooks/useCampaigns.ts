
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setCampaigns(data || []);
      } catch (error: any) {
        console.error('Error fetching campaigns:', error.message);
        toast({
          title: "Error loading campaigns",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [user, toast]);

  return { campaigns, isLoading };
};
