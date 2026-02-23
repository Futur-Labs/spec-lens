import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const ReactCompilerConfig = {};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    server: {
      proxy: {
        '/api': {
          target: `${env.VITE_DEV_API_URL}:${env.VITE_DEV_API_PORT}`,
          changeOrigin: true,
          timeout: 30000,
        },
      },
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT, 10) || 3000,
      open: true,
      cors: true,
    },
    define: {
      global: 'window',
    },
    plugins: [
      tanstackStart(),
      nitro(),
      svgr({
        svgrOptions: {
          expandProps: 'start',
          svgo: true,
        },
      }),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
        },
      }),
      tsconfigPaths(),
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
        exclude: undefined,
        include: undefined,
        includePublic: true,
        logStats: true,
        ansiColors: true,
        svg: {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  cleanupNumericValues: false,
                },
                // cleanupIDs: {
                //   minify: false,
                //   remove: false,
                // },
                // convertPathData: false,
              },
            },
            'sortAttrs',
            {
              name: 'addAttributesToSVGElement',
              params: {
                attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
              },
            },
          ],
        },
        png: {
          // https://sharp.pixelplumbing.com/api-output#png
          quality: 95,
        },
        jpeg: {
          // https://sharp.pixelplumbing.com/api-output#jpeg
          quality: 95,
        },
        jpg: {
          // https://sharp.pixelplumbing.com/api-output#jpeg
          quality: 95,
        },
        tiff: {
          // https://sharp.pixelplumbing.com/api-output#tiff
          quality: 95,
        },
        // gif does not support lossless compression
        // https://sharp.pixelplumbing.com/api-output#gif
        gif: {},
        webp: {
          // https://sharp.pixelplumbing.com/api-output#webp
          lossless: false,
        },
        avif: {
          // https://sharp.pixelplumbing.com/api-output#avif
          lossless: true,
        },
        cache: false,
        cacheLocation: undefined,
      }),
    ],
    nitro: {
      serverDir: './',
    },
    assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.otf'],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/')) {
              if (id.includes('/framer-motion/')) return 'vendor-motion';
              if (id.includes('/@jigoooo/shared-ui/')) return 'vendor-shared-ui';
              if (id.includes('/@tanstack/react-query-devtools/')) return 'vendor-query-devtools';
              if (id.includes('/@tanstack/react-router-devtools/')) {
                return 'vendor-router-devtools';
              }
              if (id.includes('/lucide-react/')) return 'vendor-icons';
              if (id.includes('/@tanstack/react-query/')) return 'vendor-query';
              if (id.includes('/@tanstack/react-router/')) return 'vendor-router';
            }
            return undefined;
          },
        },
      },
    },
  };
});
