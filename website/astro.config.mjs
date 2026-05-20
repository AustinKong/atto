import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import icon from 'astro-icon';

export default defineConfig({
  site: 'https://atto.app',
  integrations: [react(), icon()]
});