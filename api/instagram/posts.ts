import { fetchLiveInstagramPosts } from '../../lib/instagram.ts';

interface VercelRequest {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const limitParam = Array.isArray(req.query?.limit) ? req.query?.limit[0] : req.query?.limit;
  const refreshParam = Array.isArray(req.query?.refresh) ? req.query?.refresh[0] : req.query?.refresh;

  const rawLimit = Number(limitParam);
  const safeLimit = Number.isFinite(rawLimit)
    ? Math.max(1, Math.min(12, Math.floor(rawLimit)))
    : 6;
  const forceRefresh = refreshParam === '1';

  res.setHeader('Cache-Control', 'public, max-age=120');
  const result = await fetchLiveInstagramPosts(safeLimit, forceRefresh);
  res.status(200).json(result);
}
