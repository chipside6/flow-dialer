import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useGreetingFiles() {
  const { user, sessionChecked } = useAuth();
  const [greetingFiles, setGreetingFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGreetingFiles = async () => {
      if (!user || !sessionChecked) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching greeting files:", error);
          if (isMounted) {
            setError(error);
            toast({
              title: "Error fetching greeting files",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          if (isMounted) {
            setGreetingFiles(data || []);
            setError(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGreetingFiles();

    return () => {
      isMounted = false;
    };
  }, [user, sessionChecked, toast]);

  const refreshGreetingFiles = async () => {
    if (!user || !sessionChecked) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('greeting_files')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error refreshing greeting files:", error);
        setError(error);
        toast({
          title: "Error refreshing greeting files",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setGreetingFiles(data || []);
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { greetingFiles, isLoading, error, refreshGreetingFiles };
}
