import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: () => ({
    plugins: [react(), tailwindcss()],
  }),

  manifest: {
    name: 'Focus Detection Extension',
    description: 'A browser extension that detects user focus using facial landmarks',
    version: '1.0.0',
    
    // Add camera permission
    permissions: ['camera'],
    
    // Web accessible resources for index.html and assets
    web_accessible_resources: [
      {
        resources: ['index.html', 'assets/*'],
        matches: ['<all_urls>'],
      },
    ],
    
    // Content security policy to allow camera access and external scripts
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; worker-src 'self'; connect-src 'self' https://cdn.jsdelivr.net;"
    },
    
    // For accessing the camera API
    host_permissions: ['<all_urls>']
  },
});