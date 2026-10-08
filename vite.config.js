import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET;

  return {
    plugins: [react()],
    server: {
      port: 5180,
      host: true,
      // Lets `npm run dev:api` call a remote backend without CORS issues.
      proxy: proxyTarget ? { '/api': { target: proxyTarget, changeOrigin: true, secure: false } } : undefined,
    },
  };
});
