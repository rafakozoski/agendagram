import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface BannerCarouselProps {
  position: "top" | "middle" | "bottom";
  halfHeight?: boolean;
}

export function BannerCarousel({ position, halfHeight = false }: BannerCarouselProps) {
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

  if (banners.length === 0) return null;

  const maxH = halfHeight ? "max-h-32" : "max-h-64";

  const content = banners.length === 1 ? (
    <BannerImage banner={banners[0]} maxH={maxH} />
  ) : (
    <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]} className="w-full">
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <BannerImage banner={banner} maxH={maxH} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );

  return (
    <section className="container mx-auto px-6 py-6">
      {content}
    </section>
  );
}

function BannerImage({ banner, maxH = "max-h-64" }: { banner: any; maxH?: string }) {
  const img = (
    <img
      src={banner.image_url}
      alt="Banner"
      className={`w-full h-auto ${maxH} object-cover rounded-xl`}
      loading="lazy"
    />
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
