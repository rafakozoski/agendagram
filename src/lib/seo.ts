// Helper minimalista para atualizar meta tags em SPA sem react-helmet.
// Usado em pages que precisam de SEO (BusinessPage, LPs etc).
//
// Uso típico:
//   useEffect(() => setSeo({ title, description, ogImage, canonical }), [...]);

interface SeoConfig {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  /** JSON-LD structured data (LocalBusiness, etc). Stringificado e injetado em <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown>;
}

const META_NAMES = ["description"];
const META_PROPS = ["og:title", "og:description", "og:image", "og:url", "og:type", "twitter:title", "twitter:description", "twitter:image", "twitter:card"];

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data: Record<string, unknown>) {
  const id = "page-jsonld";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("id", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function clearJsonLd() {
  const el = document.getElementById("page-jsonld");
  if (el) el.remove();
}

export function setSeo(config: SeoConfig) {
  if (config.title) {
    document.title = config.title;
    setMetaProperty("og:title", config.title);
    setMetaProperty("twitter:title", config.title);
  }
  if (config.description) {
    setMetaName("description", config.description);
    setMetaProperty("og:description", config.description);
    setMetaProperty("twitter:description", config.description);
  }
  if (config.ogImage) {
    setMetaProperty("og:image", config.ogImage);
    setMetaProperty("twitter:image", config.ogImage);
    setMetaProperty("twitter:card", "summary_large_image");
  }
  if (config.canonical) {
    setCanonical(config.canonical);
    setMetaProperty("og:url", config.canonical);
  }
  if (config.jsonLd) {
    setJsonLd(config.jsonLd);
  } else {
    clearJsonLd();
  }
}

/** Reseta para os defaults do site (usado em pages que não definem SEO próprio) */
export function resetSeo() {
  document.title = "Agendagram | Seu agendamento online";
  setMetaName("description", "Encontre e agende serviços online em segundos no Agendagram.");
  clearJsonLd();
}

/** Helper para construir o JSON-LD LocalBusiness */
export function buildLocalBusinessJsonLd(business: {
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  category?: string | null;
}) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://agendagram.com.br";
  const url = `${baseUrl}/${business.slug}`;
  const streetAddress = [business.address, business.neighborhood].filter(Boolean).join(" - ");
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url,
  };
  if (business.description) data.description = business.description;
  if (business.phone) data.telephone = business.phone;
  if (business.logo_url) data.logo = business.logo_url;
  if (business.cover_url) data.image = business.cover_url;
  if (business.city || streetAddress) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: streetAddress || undefined,
      addressLocality: business.city || undefined,
      addressRegion: business.state || undefined,
      addressCountry: "BR",
    };
  }
  return data;
}
