import { isConfiguredSecret } from '../lib/instagram.ts';

interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    instagramConfigured: isConfiguredSecret(process.env.INSTAGRAM_ACCESS_TOKEN),
    timestamp: new Date().toISOString(),
  });
}
