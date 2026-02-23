/// <reference types="vite/client" />
import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext } from '@tanstack/react-router';

import cssUrl from '../styles/index.css?url';
import { RootCatchBoundary, RootComponent, RootNotFound } from '@/pages/root';

export type RouterContext = {
  queryClient: QueryClient;
};

const SITE_URL = import.meta.env.VITE_PRODUCTION_API_URL || '';

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {},
  head: () => ({
    links: [
      {
        rel: 'icon',
        href: '/logo.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'icon',
        href: '/logo_48x48.png',
        type: 'image/png',
        sizes: '48x48',
      },
      {
        rel: 'icon',
        href: '/logo_96x96.png',
        type: 'image/png',
        sizes: '96x96',
      },
      {
        rel: 'icon',
        href: '/logo_144x144.png',
        type: 'image/png',
        sizes: '144x144',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo_180x180.png',
        sizes: '180x180',
      },
      { rel: 'canonical', href: SITE_URL },
      {
        rel: 'preload',
        href: '/fonts/PretendardVariable.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: cssUrl,
      },
    ],
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },

      // PWA & Mobile
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'SpecLens' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'format-detection', content: 'telephone=no' },

      // Microsoft / Windows
      { name: 'msapplication-TileColor', content: '#0a0a0a' },
      { name: 'msapplication-TileImage', content: '/logo_144x144.png' },

      // Verification (Placeholders)
      // { name: 'naver-site-verification', content: 'YOUR_NAVER_VERIFICATION_CODE' },
      // { name: 'google-site-verification', content: 'YOUR_GOOGLE_VERIFICATION_CODE' },
      { title: 'SpecLens - OpenAPI Spec Viewer' },
      {
        name: 'description',
        content:
          'OpenAPI/Swagger 스펙 JSON 파일을 업로드하여 API 문서를 쉽게 시각화하고 탐색할 수 있는 뷰어입니다.',
      },
      {
        name: 'keywords',
        content: 'OpenAPI, Swagger, API문서, 스펙뷰어, JSON, REST API, API시각화',
      },
      // Basic SEO
      { name: 'application-name', content: 'SpecLens' },
      { name: 'referrer', content: 'origin-when-cross-origin' },
      { name: 'author', content: 'SpecLens' },
      { name: 'creator', content: 'SpecLens Team' },
      { name: 'publisher', content: 'SpecLens' },
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      { name: 'theme-color', content: '#0a0a0a' },
      { name: 'color-scheme', content: 'dark light' },

      // Open Graph / Facebook / Naver Blog
      { property: 'og:title', content: 'SpecLens - OpenAPI Spec Viewer' },
      {
        property: 'og:description',
        content:
          'OpenAPI/Swagger 스펙 JSON 파일을 업로드하여 API 문서를 쉽게 시각화하고 탐색할 수 있는 뷰어입니다.',
      },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'ko_KR' },
      { property: 'og:site_name', content: 'SpecLens' },
      // Main Image
      {
        property: 'og:image',
        content: `${SITE_URL}/speclens_main.png`,
      },
      {
        property: 'og:image:secure_url',
        content: `${SITE_URL}/speclens_main.png`,
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'SpecLens - OpenAPI Spec Viewer' },
      { property: 'og:image:type', content: 'image/png' },

      // Twitter / X
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'SpecLens - OpenAPI Spec Viewer' },
      {
        name: 'twitter:description',
        content:
          'OpenAPI/Swagger 스펙 JSON 파일을 업로드하여 API 문서를 쉽게 시각화하고 탐색할 수 있는 뷰어입니다.',
      },
      { name: 'twitter:site', content: '@SpecLens' },
      { name: 'twitter:creator', content: '@SpecLens' },
      {
        name: 'twitter:image',
        content: `${SITE_URL}/speclens_main.png`,
      },
      { name: 'twitter:image:alt', content: 'SpecLens Main Banner' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          // name: COMPANY_INFOS.NAME,
          // url: COMPANY_INFOS.URL,
          // logo: COMPANY_INFOS.LOGO_URL,
          // description: COMPANY_INFOS.DESCRIPTION,
          // address: {
          //   '@type': 'PostalAddress',
          //   addressLocality: COMPANY_INFOS.ADDRESS_ENGLISH.LOCALITY,
          //   addressRegion: COMPANY_INFOS.ADDRESS_ENGLISH.REGION,
          //   addressCountry: COMPANY_INFOS.ADDRESS_ENGLISH.COUNTRY,
          // },
          // contactPoint: {
          //   '@type': 'ContactPoint',
          //   contactType: 'customer support',
          //   email: COMPANY_INFOS.EMAIL,
          // },
        }),
      },
    ],
  }),
  component: RootComponent,
  errorComponent: RootCatchBoundary,
  notFoundComponent: RootNotFound,
});
