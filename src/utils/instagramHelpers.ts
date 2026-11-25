import { SITE_IMAGES, type ServicePillar } from '../data/siteConfig';

export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

export interface InstagramPostItem {
  id: string;
  imageUrl: string;
  caption: string;
  permalink: string;
  timestamp: string;
  mediaType: InstagramMediaType;
  pillar?: ServicePillar;
  serviceSlug?: string;
  username?: string;
}

export interface InstagramSectionConfig {
  eyebrow: string;
  heading: string;
  subtitle: string;
  handle: string;
  ctaLabel: string;
  maxPosts: number;
}

export interface InstagramFeedApiResponse {
  connected: boolean;
  source: 'live' | 'curated';
  handle: string | null;
  fetchedAt: string;
  posts: InstagramPostItem[];
  notice?: string;
}

export const DEFAULT_INSTAGRAM_SECTION: InstagramSectionConfig = {
  eyebrow: 'LIVE FROM THE SANCTUARY',
  heading: 'Latest on Instagram',
  subtitle:
    'Daily lash & brow artistry, bespoke nail finishes, and quiet studio rituals captured inside our Paule Beauty sanctuaries.',
  handle: '@everlash_lash_expert',
  ctaLabel: 'Follow on Instagram',
  maxPosts: 6,
};

export const DEFAULT_INSTAGRAM_POSTS: InstagramPostItem[] = [
  {
    id: 'ig-post-1',
    imageUrl: SITE_IMAGES.heroPortrait,
    caption:
      'Featherlight individual lash placement mapped to your natural eye symmetry. Soft curl, seamless retention, zero heaviness. #EVERLASH #BeautyInEveryDetail',
    permalink: 'https://www.instagram.com/everlash_lash_expert/',
    timestamp: '2026-11-18T09:30:00.000Z',
    mediaType: 'IMAGE',
    pillar: 'EVERLASH',
    serviceSlug: 'natural-lash-extension',
    username: 'everlash_lash_expert',
  },
  {
    id: 'ig-post-2',
    imageUrl: SITE_IMAGES.personalisedEye,
    caption:
      'Precision brow architecture paired with our signature Brow Bomber keratin lamination—lifted, airy, and tailored to your facial proportions. #EVERBROW',
    permalink: 'https://www.instagram.com/everlash_lash_expert/',
    timestamp: '2026-11-15T11:15:00.000Z',
    mediaType: 'CAROUSEL_ALBUM',
    pillar: 'EVERBROW',
    serviceSlug: 'brow-bomber-lamination',
    username: 'everlash_lash_expert',
  },
  {
    id: 'ig-post-3',
    imageUrl: SITE_IMAGES.everhouseOrchid,
    caption:
      'Morning light inside Everhouse Senopati. Unhurried appointments, private suites, and herbal tea before every ritual. #EVERHOUSE',
    permalink: 'https://www.instagram.com/everlash_lash_expert/',
    timestamp: '2026-11-12T08:00:00.000Z',
    mediaType: 'VIDEO',
    pillar: 'EVERBODY',
    serviceSlug: 'lymphatic-sculpting-ritual',
    username: 'everlash_lash_expert',
  },
  {
    id: 'ig-post-4',
    imageUrl: SITE_IMAGES.sculpturalSilhouette,
    caption:
      'Sheer Japanese builder gel in warm alabaster—clean Russian cuticle care and an editorial glass finish designed to last three weeks. #EVERNAILS',
    permalink: 'https://www.instagram.com/everlash_lash_expert/',
    timestamp: '2026-11-09T14:20:00.000Z',
    mediaType: 'IMAGE',
    pillar: 'EVERNAILS',
    serviceSlug: 'japanese-gel-manicure',
    username: 'everlash_lash_expert',
  },
  {
    id: 'ig-post-5',
    imageUrl: SITE_IMAGES.botanicalTexture,
    caption:
      'Botanical chamomile-infused wax blended at low temperature for calm, velvety skin—gentle enough for the most delicate contours. #EVERWAX',
    permalink: 'https://www.instagram.com/everlash_lash_expert/',
    timestamp: '2026-11-06T10:45:00.000Z',
    mediaType: 'CAROUSEL_ALBUM',
    pillar: 'EVERWAX',
    serviceSlug: 'botanical-body-waxing',
    username: 'everlash_lash_expert',
  },
  {
    id: 'ig-post-6',
    imageUrl: SITE_IMAGES.footerProfileOrchid,
    caption:
      'Micro-soft nano brow strokes healed to an undetectable velvet shadow. Custom pigment matched to your natural undertone. #EVERSPMU',
    permalink: 'https://www.instagram.com/everlash_lash_expert/',
    timestamp: '2026-11-02T16:00:00.000Z',
    mediaType: 'IMAGE',
    pillar: 'EVER SPMU',
    serviceSlug: 'nano-brow-embroidery',
    username: 'everlash_lash_expert',
  },
];

export function extractInstagramHandle(urlOrHandle: string): string {
  const trimmed = urlOrHandle.trim();
  if (!trimmed) return '@everlash_lash_expert';
  if (trimmed.startsWith('@')) {
    const clean = trimmed.slice(1).replace(/[^a-zA-Z0-9._]/g, '');
    return clean ? `@${clean}` : '@everlash_lash_expert';
  }
  if (!trimmed.includes('/') && !/instagram\.com|instagr\.am/i.test(trimmed)) {
    const clean = trimmed.replace(/[^a-zA-Z0-9._]/g, '');
    return clean ? `@${clean}` : '@everlash_lash_expert';
  }
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const segment = parsed.pathname
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean)[0];
    if (segment && !['p', 'reel', 'reels', 'stories', 'explore'].includes(segment.toLowerCase())) {
      const clean = segment.replace(/[^a-zA-Z0-9._]/g, '');
      if (clean) return `@${clean}`;
    }
  } catch {
    const clean = trimmed.replace(/[^a-zA-Z0-9._]/g, '');
    if (clean) return `@${clean}`;
  }
  return '@everlash_lash_expert';
}

export function isValidInstagramPermalink(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 500) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'instagram.com' ||
      host === 'www.instagram.com' ||
      host === 'instagr.am'
    );
  } catch {
    return false;
  }
}

export function formatInstagramDate(isoOrLabel: string, nowMs = Date.now()): string {
  const raw = isoOrLabel.trim();
  if (!raw) return 'Recent';
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 40);
  }
  const parsedMs = Date.parse(raw);
  if (Number.isNaN(parsedMs)) {
    return raw.slice(0, 40);
  }
  const diffMs = nowMs - parsedMs;
  if (diffMs >= 0 && diffMs < 3600_000) {
    const mins = Math.max(1, Math.floor(diffMs / 60_000));
    return `${mins}m ago`;
  }
  if (diffMs >= 0 && diffMs < 86_400_000) {
    const hours = Math.floor(diffMs / 3_600_000);
    return `${hours}h ago`;
  }
  if (diffMs >= 0 && diffMs < 7 * 86_400_000) {
    const days = Math.floor(diffMs / 86_400_000);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(parsedMs));
}

export function normalizeInstagramGraphResponse(
  rawItems: unknown,
  fallbackHandle = '@everlash_lash_expert'
): InstagramPostItem[] {
  if (!Array.isArray(rawItems)) return [];
  const cleanHandle = extractInstagramHandle(fallbackHandle).replace(/^@/, '');
  const normalized: InstagramPostItem[] = [];

  for (const entry of rawItems) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;
    const rawId = typeof item.id === 'string' ? item.id.trim() : '';
    const mediaTypeRaw = typeof item.media_type === 'string' ? item.media_type.toUpperCase() : 'IMAGE';
    const mediaType: InstagramMediaType =
      mediaTypeRaw === 'VIDEO' || mediaTypeRaw === 'CAROUSEL_ALBUM' ? mediaTypeRaw : 'IMAGE';

    const mediaUrl = typeof item.media_url === 'string' ? item.media_url.trim() : '';
    const thumbUrl = typeof item.thumbnail_url === 'string' ? item.thumbnail_url.trim() : '';
    const resolvedImage = mediaType === 'VIDEO' ? thumbUrl || mediaUrl : mediaUrl || thumbUrl;

    if (!rawId || !resolvedImage || !/^https?:\/\//i.test(resolvedImage)) {
      continue;
    }

    const permalinkRaw = typeof item.permalink === 'string' ? item.permalink.trim() : '';
    const permalink = isValidInstagramPermalink(permalinkRaw)
      ? permalinkRaw
      : `https://www.instagram.com/${cleanHandle}/`;

    const caption =
      typeof item.caption === 'string' && item.caption.trim()
        ? item.caption.trim().slice(0, 1200)
        : `Captured at ${fallbackHandle}`;

    const timestamp =
      typeof item.timestamp === 'string' && item.timestamp.trim()
        ? item.timestamp.trim()
        : new Date().toISOString();

    const username =
      typeof item.username === 'string' && item.username.trim()
        ? item.username.trim().slice(0, 60)
        : cleanHandle;

    normalized.push({
      id: `ig-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
      imageUrl: resolvedImage,
      caption,
      permalink,
      timestamp,
      mediaType,
      username,
    });
  }

  return normalized.sort((a, b) => {
    const aMs = Date.parse(a.timestamp) || 0;
    const bMs = Date.parse(b.timestamp) || 0;
    return bMs - aMs;
  });
}

export function mergeInstagramFeed(
  livePosts: InstagramPostItem[],
  curatedPosts: InstagramPostItem[],
  maxPosts = 6
): { posts: InstagramPostItem[]; source: 'live' | 'curated' } {
  const safeLimit = Math.max(1, Math.min(12, Math.floor(maxPosts) || 6));
  if (Array.isArray(livePosts) && livePosts.length > 0) {
    return {
      posts: livePosts.slice(0, safeLimit),
      source: 'live',
    };
  }
  return {
    posts: (Array.isArray(curatedPosts) ? curatedPosts : []).slice(0, safeLimit),
    source: 'curated',
  };
}
