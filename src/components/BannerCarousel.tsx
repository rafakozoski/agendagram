import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface BannerCarouselProps {
  position: "top" | "middle" | "bottom";
}

export function BannerCarousel({ position }: BannerCarouselProps) {
  const { data: banners = [] } = useQuery({
    queryKey: ["banners", position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", position)
        .eq("enabled", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  if (banners.length === 0) {
    if (position === "top") {
      return (
        <section className="container mx-auto px-6 py-6">
          <Link to="/planos" className="block">
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-6 flex items-center justify-center gap-3 text-center">
              <Crown className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Banner de destaque</span> — disponível exclusivamente para assinantes do plano <span className="font-semibold text-primary">Pro</span>.{" "}
                <span className="underline text-primary">Saiba mais →</span>
              </p>
            </div>
          </Link>
        </section>
      );
    }
    return null;
  }

  const content = banners.length === 1 ? (
    <BannerImage banner={banners[0]} />
  ) : (
    <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]} className="w-full">
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <BannerImage banner={banner} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );

  return (
    <section className="container mx-auto px-6 py-6">
      {content}
    </section>
  );
}

function BannerImage({ banner }: { banner: any }) {
  const maxH = banner.half_height ? "md:max-h-32" : "md:max-h-64";
  const mobileMaxH = banner.half_height ? "max-h-24" : "max-h-44";
  const mobileSrc = banner.mobile_image_url || banner.image_url;
  const img = (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileSrc} />
      <img
        src={banner.image_url}
        alt="Banner"
        className={`w-full h-auto ${mobileMaxH} ${maxH} object-cover rounded-xl`}
        loading="lazy"
      />
    </picture>
  );

  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    );
  }

  return img;
}
