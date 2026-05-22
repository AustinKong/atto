import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import icon from 'astro-icon';

import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://atto.app',
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100
      }
    }
  },
  integrations: [
    react(),
    icon(),
    expressiveCode({
      styleOverrides: {
        frames: {
          shadowColor: 'transparent',
          tooltipSuccessBackground: 'transparent',
          tooltipSuccessForeground: 'transparent'
        }
      }
    })
  ]
});