import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useMyBusiness() {
  const { user } = useAuth();

  // Check if user is linked as a professional
  const { data: linkedProfessional } = useQuery({
    queryKey: ["my-professional-link", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("professionals")
        .select("*, businesses(*)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: business, isLoading, refetch } = useQuery({
    queryKey: ["my-business", user?.id, linkedProfessional?.business_id],
    queryFn: async () => {
      if (!user) return null;

      // If user is a linked professional, return their business
      if (linkedProfessional?.businesses) {
        return linkedProfessional.businesses as any;
      }

      // Otherwise check if owner
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    business,
    isLoading,
    refetch,
    isProfessional: !!linkedProfessional,
    professionalId: linkedProfessional?.id ?? null,
  };
}
