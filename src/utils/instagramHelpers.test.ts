import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_INSTAGRAM_POSTS,
  extractInstagramHandle,
  formatInstagramDate,
  isValidInstagramPermalink,
  mergeInstagramFeed,
  normalizeInstagramGraphResponse,
} from './instagramHelpers';

test('extractInstagramHandle parses handles from full URLs, @mentions, and bare usernames', () => {
  assert.equal(
    extractInstagramHandle('https://www.instagram.com/everlash_lash_expert/?hl=en'),
    '@everlash_lash_expert'
  );
  assert.equal(extractInstagramHandle('@ever.studio'), '@ever.studio');
  assert.equal(extractInstagramHandle('everhouse_id'), '@everhouse_id');
  assert.equal(extractInstagramHandle(''), '@everlash_lash_expert');
});

test('isValidInstagramPermalink allows Instagram https links and blocks unsafe protocols', () => {
  assert.equal(isValidInstagramPermalink('https://www.instagram.com/p/C9abc123/'), true);
  assert.equal(isValidInstagramPermalink('https://instagram.com/everlash_lash_expert/'), true);
  assert.equal(isValidInstagramPermalink('https://instagr.am/p/abc/'), true);
  assert.equal(isValidInstagramPermalink('javascript:alert(1)'), false);
  assert.equal(isValidInstagramPermalink('https://evil.example.com/p/123'), false);
  assert.equal(isValidInstagramPermalink(''), false);
});

test('formatInstagramDate formats relative recent dates and UTC calendar dates cleanly', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  assert.equal(formatInstagramDate('2026-11-20T11:30:00.000Z', now), '30m ago');
  assert.equal(formatInstagramDate('2026-11-20T06:00:00.000Z', now), '6h ago');
  assert.equal(formatInstagramDate('2026-11-18T12:00:00.000Z', now), '2 days ago');
  assert.equal(formatInstagramDate('2026-10-05T08:00:00.000Z', now), 'Oct 5, 2026');
  assert.equal(formatInstagramDate('November 2026', now), 'November 2026');
});

test('normalizeInstagramGraphResponse maps IMAGE, VIDEO thumbnails, CAROUSEL_ALBUM, skips invalid records, and sorts newest first', () => {
  const raw = [
    {
      id: '101',
      caption: 'Older carousel post',
      media_type: 'CAROUSEL_ALBUM',
      media_url: 'https://cdn.example.com/carousel.jpg',
      permalink: 'https://www.instagram.com/p/older/',
      timestamp: '2026-11-10T10:00:00.000Z',
    },
    {
      id: '102',
      caption: 'Newest reel video',
      media_type: 'VIDEO',
      media_url: 'https://cdn.example.com/video.mp4',
      thumbnail_url: 'https://cdn.example.com/video-thumb.jpg',
      permalink: 'https://www.instagram.com/reel/newest/',
      timestamp: '2026-11-19T10:00:00.000Z',
    },
    {
      id: 'bad-no-url',
      caption: 'Missing media url should be dropped',
      media_type: 'IMAGE',
    },
  ];

  const posts = normalizeInstagramGraphResponse(raw, '@everlash_lash_expert');
  assert.equal(posts.length, 2);
  assert.equal(posts[0].id, 'ig-102');
  assert.equal(posts[0].mediaType, 'VIDEO');
  assert.equal(posts[0].imageUrl, 'https://cdn.example.com/video-thumb.jpg');
  assert.equal(posts[1].id, 'ig-101');
  assert.equal(posts[1].mediaType, 'CAROUSEL_ALBUM');
});

test('mergeInstagramFeed prefers live posts when present and falls back to curated posts with bounded limit', () => {
  const curatedResult = mergeInstagramFeed([], DEFAULT_INSTAGRAM_POSTS, 4);
  assert.equal(curatedResult.source, 'curated');
  assert.equal(curatedResult.posts.length, 4);

  const livePost = {
    id: 'ig-live-1',
    imageUrl: 'https://cdn.example.com/live.jpg',
    caption: 'Live studio update',
    permalink: 'https://www.instagram.com/p/live1/',
    timestamp: '2026-11-20T09:00:00.000Z',
    mediaType: 'IMAGE' as const,
  };
  const liveResult = mergeInstagramFeed([livePost], DEFAULT_INSTAGRAM_POSTS, 6);
  assert.equal(liveResult.source, 'live');
  assert.equal(liveResult.posts.length, 1);
  assert.equal(liveResult.posts[0].id, 'ig-live-1');
});
