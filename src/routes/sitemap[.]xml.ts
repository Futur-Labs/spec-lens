import { createFileRoute } from '@tanstack/react-router';

const BASE_URL = process.env.VITE_PRODUCTION_API_URL || '';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority.toFixed(2)}</priority>` : ''}
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const urls: SitemapUrl[] = [];
        const today = new Date().toISOString().split('T')[0];

        // Static pages
        urls.push({
          loc: BASE_URL,
          lastmod: today,
          changefreq: 'weekly',
          priority: 1.0,
        });

        urls.push({
          loc: `${BASE_URL}/api-docs`,
          lastmod: today,
          changefreq: 'weekly',
          priority: 0.9,
        });

        const sitemap = generateSitemapXml(urls);

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
