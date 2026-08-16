import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { handleChat } from './api/chat-core';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'blazeconsole-api-dev',
      configureServer(server) {
        server.middlewares.use('/api/v1/chat', async (req, res) => {
          try {
            // Build a standard Request from the IncomingMessage.
            const headers = new Headers();
            for (const [k, v] of Object.entries(req.headers)) {
              if (Array.isArray(v)) headers.set(k, v.join(','));
              else if (v != null) headers.set(k, v);
            }
            const url = `http://${req.headers.host ?? 'localhost'}${req.url ?? ''}`;
            const method = req.method ?? 'GET';
            const body =
              method !== 'GET' && method !== 'HEAD'
                ? new ReadableStream({
                    start(controller) {
                      req.on('data', (c: Buffer) => controller.enqueue(new Uint8Array(c)));
                      req.on('end', () => controller.close());
                      req.on('error', (e) => controller.error(e));
                    },
                  })
                : undefined;
            const request = new Request(url, { method, headers, body, duplex: 'half' });
            const response = await handleChat(request);

            res.statusCode = response.status;
            response.headers.forEach((v, k) => res.setHeader(k, v));

            if (response.body) {
              const reader = response.body.getReader();
              const pump = async () => {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    res.end();
                    break;
                  }
                  res.write(value);
                }
              };
              await pump();
            } else {
              res.end();
            }
          } catch (err) {
            console.error('[dev api] error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
            }
            res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Dev server error.' } }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
