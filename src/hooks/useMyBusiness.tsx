import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useMyBusiness() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedBusinessId");
    }
    return null;
  });

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

  // Fetch all businesses owned by user
  const { data: ownedBusinesses = [], isLoading: loadingOwned, refetch: refetchOwned } = useQuery({
    queryKey: ["my-businesses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !linkedProfessional,
  });

  // Auto-select first business if none selected
  useEffect(() => {
    if (linkedProfessional?.business_id) {
      // Professional is always tied to one business
      setSelectedBusinessId(linkedProfessional.business_id);
      localStorage.setItem("selectedBusinessId", linkedProfessional.business_id);
    } else if (ownedBusinesses.length > 0 && !selectedBusinessId) {
      const firstId = ownedBusinesses[0].id;
      setSelectedBusinessId(firstId);
      localStorage.setItem("selectedBusinessId", firstId);
    } else if (ownedBusinesses.length > 0 && selectedBusinessId) {
      // Verify selected ID still exists
      const exists = ownedBusinesses.some(b => b.id === selectedBusinessId);
      if (!exists) {
        const firstId = ownedBusinesses[0].id;
        setSelectedBusinessId(firstId);
        localStorage.setItem("selectedBusinessId", firstId);
      }
    }
  }, [ownedBusinesses, selectedBusinessId, linkedProfessional]);

  const selectBusiness = useCallback((id: string) => {
    setSelectedBusinessId(id);
    localStorage.setItem("selectedBusinessId", id);
    // Invalidate queries that depend on business
    queryClient.invalidateQueries({ queryKey: ["biz-services"] });
    queryClient.invalidateQueries({ queryKey: ["biz-professionals"] });
    queryClient.invalidateQueries({ queryKey: ["biz-availability"] });
    queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
  }, [queryClient]);

  // Get the currently selected business
  const business = linkedProfessional?.businesses
    ? (linkedProfessional.businesses as any)
    : ownedBusinesses.find(b => b.id === selectedBusinessId) || ownedBusinesses[0] || null;

  return {
    business,
    ownedBusinesses,
    selectedBusinessId,
    selectBusiness,
    isLoading: loadingOwned,
    refetch: refetchOwned,
    isProfessional: !!linkedProfessional,
    professionalId: linkedProfessional?.id ?? null,
  };
}
