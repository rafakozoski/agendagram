// Build-time: gera public/sitemap-businesses.xml listando todas as empresas
// publicadas. Roda no prebuild. Se a env do Supabase nao estiver setada, gera
// um sitemap vazio (build nao falha).

import fs from "node:fs";
import path from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;
const SITE_URL = "https://agendagram.com.br";
const OUT_PATH = path.resolve("public/sitemap-businesses.xml");

const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const footer = "</urlset>\n";

function writeSitemap(urls) {
  const body = urls
    .map(
      ({ slug, updated_at }) =>
        `  <url><loc>${SITE_URL}/${slug}</loc>${updated_at ? `<lastmod>${new Date(updated_at).toISOString().slice(0, 10)}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.6</priority></url>`,
    )
    .join("\n");
  fs.writeFileSync(OUT_PATH, `${header}\n${body}\n${footer}`);
  console.log(`[sitemap] wrote ${urls.length} business URLs to ${OUT_PATH}`);
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[sitemap] SUPABASE env not set, writing empty business sitemap");
    writeSitemap([]);
    return;
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/businesses?select=slug,updated_at&order=name`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${await res.text()}`);
    }
    const rows = await res.json();
    writeSitemap(rows.filter((r) => r.slug));
  } catch (err) {
    console.warn("[sitemap] failed to fetch businesses:", err.message || err);
    writeSitemap([]);
  }
}

main();
