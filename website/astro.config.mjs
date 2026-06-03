import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import mermaid from 'astro-mermaid';

import icon from 'astro-icon';

import expressiveCode from 'astro-expressive-code';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://atto.app',

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    // Temporary shim, see src/shims/debug.js
    resolve: {
      alias: {
        debug: new URL('./src/shims/debug.js', import.meta.url).pathname,
      },
    },
  },

  integrations: [
    react(),
    icon(),
    mermaid({
      theme: 'base',
      autoTheme: false,
      mermaidConfig: {
        themeVariables: {
          primaryColor: '#fff4ed',
          primaryTextColor: '#1f2933',
          primaryBorderColor: '#f97316',
          lineColor: '#ea580c',
          secondaryColor: '#ffedd5',
          tertiaryColor: '#ffffff',
          edgeLabelBackground: '#fff7ed',
          clusterBkg: '#fff7ed',
          clusterBorder: '#fdba74',
          sequenceNumberColor: '#ffffff',
        },
      },
    }),
    expressiveCode({
      styleOverrides: {
        frames: {
          shadowColor: 'transparent',
          tooltipSuccessBackground: 'transparent',
          tooltipSuccessForeground: 'transparent',
        },
        codeFontSize: '1.25rem',
      },
      shiki: {
        engine: 'javascript',
      },
    }),
    mdx(),
  ],

  output: 'static',
  adapter: process.argv.includes('dev') ? undefined : cloudflare(),
});
