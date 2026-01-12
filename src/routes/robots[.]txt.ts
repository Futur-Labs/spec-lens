import { createFileRoute } from '@tanstack/react-router';

const BASE_URL = process.env.VITE_PRODUCTION_API_URL || '';

function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
}

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const robotsTxt = generateRobotsTxt();

        return new Response(robotsTxt, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      },
    },
  },
});
