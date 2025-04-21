
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { TransferNumber } from "@/types/transferNumber";

export const useTransferNumbers = () => {
  const { user } = useAuth();
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    supabase
      .from("transfer_numbers")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setTransferNumbers(data);
        }
        setIsLoading(false);
      });
  }, [user?.id]);

  return { transferNumbers, isLoading };
};
