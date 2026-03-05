import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SubscriptionState {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setSubscription(null);
    }
  }, [user?.id, session?.access_token]);

  return { subscription, loading, refresh: checkSubscription };
}
