export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

export interface NormalizedInstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  permalink: string;
  timestamp: string;
  mediaType: InstagramMediaType;
  username?: string;
}

interface InstagramCacheEntry {
  fetchedAt: string;
  expiresAtMs: number;
  handle: string | null;
  posts: NormalizedInstagramPost[];
}

const INSTAGRAM_CACHE_TTL_MS = 10 * 60 * 1000;
let instagramCache: InstagramCacheEntry | null = null;

export function isConfiguredSecret(val: string | undefined): val is string {
  if (!val) return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('MY_') || trimmed.includes('YOUR_')) return false;
  return trimmed.length >= 16;
}

function normalizeGraphItems(rawItems: unknown): NormalizedInstagramPost[] {
  if (!Array.isArray(rawItems)) return [];
  const results: NormalizedInstagramPost[] = [];

  for (const item of rawItems) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const rawId = typeof row.id === 'string' ? row.id.trim() : '';
    const mediaTypeRaw = typeof row.media_type === 'string' ? row.media_type.toUpperCase() : 'IMAGE';
    const mediaType: InstagramMediaType =
      mediaTypeRaw === 'VIDEO' || mediaTypeRaw === 'CAROUSEL_ALBUM' ? mediaTypeRaw : 'IMAGE';
    const mediaUrl = typeof row.media_url === 'string' ? row.media_url.trim() : '';
    const thumbUrl = typeof row.thumbnail_url === 'string' ? row.thumbnail_url.trim() : '';
    const imageUrl = mediaType === 'VIDEO' ? thumbUrl || mediaUrl : mediaUrl || thumbUrl;

    if (!rawId || !imageUrl || !/^https?:\/\//i.test(imageUrl)) continue;

    const permalinkRaw = typeof row.permalink === 'string' ? row.permalink.trim() : '';
    const permalink = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//i.test(permalinkRaw)
      ? permalinkRaw
      : 'https://www.instagram.com/';

    const caption =
      typeof row.caption === 'string' && row.caption.trim()
        ? row.caption.trim().slice(0, 1200)
        : 'Studio update on Instagram';
    const timestamp =
      typeof row.timestamp === 'string' && row.timestamp.trim()
        ? row.timestamp.trim()
        : new Date().toISOString();
    const username =
      typeof row.username === 'string' && row.username.trim()
        ? row.username.trim().slice(0, 60)
        : undefined;

    results.push({
      id: `ig-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      imageUrl,
      caption,
      permalink,
      timestamp,
      mediaType,
      username,
    });
  }

  return results.sort((a, b) => (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0));
}

export async function fetchLiveInstagramPosts(limitCount: number, forceRefresh: boolean) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!isConfiguredSecret(token)) {
    return {
      connected: false,
      source: 'curated' as const,
      handle: null,
      fetchedAt: new Date().toISOString(),
      posts: [] as NormalizedInstagramPost[],
    };
  }

  const nowMs = Date.now();
  if (!forceRefresh && instagramCache && instagramCache.expiresAtMs > nowMs) {
    return {
      connected: true,
      source: instagramCache.posts.length > 0 ? ('live' as const) : ('curated' as const),
      handle: instagramCache.handle,
      fetchedAt: instagramCache.fetchedAt,
      posts: instagramCache.posts.slice(0, limitCount),
    };
  }

  const rawUserId = process.env.INSTAGRAM_USER_ID?.trim();
  const safeUserId =
    rawUserId && /^[a-zA-Z0-9_.-]+$/.test(rawUserId) && !rawUserId.startsWith('MY_')
      ? rawUserId
      : 'me';

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username';
  const endpoint = new URL(`https://graph.instagram.com/${safeUserId}/media`);
  endpoint.searchParams.set('fields', fields);
  endpoint.searchParams.set('limit', '12');
  endpoint.searchParams.set('access_token', token.trim());

  try {
    const upstream = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      throw new Error(`Instagram API responded with HTTP ${upstream.status}`);
    }

    const payload = (await upstream.json()) as { data?: unknown };
    const normalized = normalizeGraphItems(payload?.data);
    const derivedHandle = normalized[0]?.username ? `@${normalized[0].username}` : null;
    const fetchedAt = new Date().toISOString();

    instagramCache = {
      fetchedAt,
      expiresAtMs: nowMs + INSTAGRAM_CACHE_TTL_MS,
      handle: derivedHandle,
      posts: normalized,
    };

    return {
      connected: true,
      source: normalized.length > 0 ? ('live' as const) : ('curated' as const),
      handle: derivedHandle,
      fetchedAt,
      posts: normalized.slice(0, limitCount),
    };
  } catch (err) {
    console.warn(
      '[instagram-proxy] Falling back to curated studio feed:',
      err instanceof Error ? err.message : 'Unknown upstream error'
    );
    if (instagramCache && instagramCache.posts.length > 0) {
      return {
        connected: true,
        source: 'live' as const,
        handle: instagramCache.handle,
        fetchedAt: instagramCache.fetchedAt,
        posts: instagramCache.posts.slice(0, limitCount),
        notice: 'Serving cached Instagram posts while refreshing.',
      };
    }
    return {
      connected: true,
      source: 'curated' as const,
      handle: null,
      fetchedAt: new Date().toISOString(),
      posts: [] as NormalizedInstagramPost[],
      notice: 'Instagram live feed temporarily unavailable; showing curated studio posts.',
    };
  }
}
