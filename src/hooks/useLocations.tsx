import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LocationRow {
  id: string;
  state_code: string;
  state_name: string;
  city: string;
  neighborhood: string;
}

export function useLocations() {
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("state_name")
        .order("city")
        .order("neighborhood");
      if (error) throw error;
      return data as LocationRow[];
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  const states = Array.from(
    new Map(locations.map((l) => [l.state_code, { code: l.state_code, name: l.state_name }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const getCities = (stateCode?: string) => {
    const filtered = stateCode ? locations.filter((l) => l.state_code === stateCode) : locations;
    return Array.from(new Set(filtered.map((l) => l.city))).sort();
  };

  const getNeighborhoods = (city?: string, stateCode?: string) => {
    if (!city) return [];
    let filtered = locations.filter((l) => l.city === city);
    if (stateCode) filtered = filtered.filter((l) => l.state_code === stateCode);
    return Array.from(new Set(filtered.map((l) => l.neighborhood))).sort();
  };

  const findStateByCity = (city: string): string | undefined => {
    const loc = locations.find((l) => l.city === city);
    return loc?.state_code;
  };

  const getAllCitiesWithState = () =>
    Array.from(
      new Map(locations.map((l) => [
        `${l.state_code}-${l.city}`,
        { city: l.city, stateKey: l.state_code, stateName: l.state_name },
      ])).values()
    ).sort((a, b) => a.city.localeCompare(b.city));

  return { locations, states, getCities, getNeighborhoods, findStateByCity, getAllCitiesWithState, isLoading };
}
