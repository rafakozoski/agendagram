import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ArrowRight, Sparkles, Scissors, Heart, Car, PawPrint } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { id: "beleza", label: "Beleza", icon: Sparkles },
  { id: "barbearia", label: "Barbearia", icon: Scissors },
  { id: "saude", label: "Saúde", icon: Heart },
  { id: "automotivo", label: "Automotivo", icon: Car },
  { id: "pet", label: "Pet", icon: PawPrint },
];

export default function Index() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("featured", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = businesses.filter((b) => {
    const matchSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || b.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const featured = filtered.filter((b) => b.featured);
  const regular = filtered.filter((b) => !b.featured);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4 leading-tight">
              Encontre e agende em <span className="text-accent">segundos</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8">
              Descubra os melhores profissionais perto de você e agende online.
            </p>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Busque por nome ou cidade..."
                className="pl-12 h-14 text-base rounded-full bg-card border-0 shadow-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 justify-center flex-wrap">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeCategory === id ? "default" : "outline"}
                size="sm"
                className="rounded-full gap-2"
                onClick={() => setActiveCategory(activeCategory === id ? null : id)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-bold">Destaques</h2>
              <Badge variant="secondary" className="ml-2">Patrocinado</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((b) => (
                <BusinessCard key={b.id} business={b} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="py-12 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            {activeCategory
              ? `Resultados em ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`
              : "Todos os estabelecimentos"}
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : regular.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              Nenhum estabelecimento encontrado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function BusinessCard({ business, featured = false }: { business: any; featured?: boolean }) {
  const categoryLabel = CATEGORIES.find((c) => c.id === business.category)?.label ?? business.category;

  return (
    <Link to={`/${business.slug}`}>
      <Card
        className={`group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
          featured ? "border-accent/40 shadow-md" : ""
        }`}
      >
        <div className={`h-2 w-full ${featured ? "gradient-accent" : "gradient-primary"}`} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {business.name}
              </h3>
              {business.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {business.city}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {categoryLabel}
            </Badge>
          </div>
          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {business.description}
            </p>
          )}
          <div className="flex items-center text-primary text-sm font-medium gap-1 group-hover:gap-2 transition-all">
            Agendar agora <ArrowRight className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
