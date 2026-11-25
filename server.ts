import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchLiveInstagramPosts, isConfiguredSecret } from './lib/instagram.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      instagramConfigured: isConfiguredSecret(process.env.INSTAGRAM_ACCESS_TOKEN),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/instagram/posts', async (req, res) => {
    const rawLimit = Number(req.query.limit);
    const safeLimit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(12, Math.floor(rawLimit)))
      : 6;
    const forceRefresh = req.query.refresh === '1';

    res.setHeader('Cache-Control', 'public, max-age=120');
    const result = await fetchLiveInstagramPosts(safeLimit, forceRefresh);
    res.json(result);
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexHtmlPath = path.join(distDir, 'index.html');
    app.use(express.static(distDir, { maxAge: '1d' }));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(503).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paule Beauty server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
