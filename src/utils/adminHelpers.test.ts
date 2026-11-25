import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDefaultSiteConfig,
  computeAdminDashboardStats,
  isValidImageSource,
  mergeSiteSettings,
  moveItemInArray,
  slugifyTitle,
  toggleSectionVisibility,
  type ClientInquiryItem,
} from './adminHelpers';

test('moveItemInArray reorders sections cleanly and respects boundaries', () => {
  const start = ['hero', 'arcSlider', 'collage', 'faq'];
  assert.deepEqual(moveItemInArray(start, 2, 'up'), ['hero', 'collage', 'arcSlider', 'faq']);
  assert.deepEqual(moveItemInArray(start, 0, 'down'), ['arcSlider', 'hero', 'collage', 'faq']);
  // Boundary no-ops
  assert.deepEqual(moveItemInArray(start, 0, 'up'), start);
  assert.deepEqual(moveItemInArray(start, 3, 'down'), start);
});

test('toggleSectionVisibility adds and removes section ids idempotently', () => {
  const hidden1 = toggleSectionVisibility([], 'collage');
  assert.deepEqual(hidden1, ['collage']);
  const hidden2 = toggleSectionVisibility(hidden1, 'faq');
  assert.deepEqual(hidden2, ['collage', 'faq']);
  const shown = toggleSectionVisibility(hidden2, 'collage');
  assert.deepEqual(shown, ['faq']);
});

test('slugifyTitle produces Firestore-rule compliant slugs', () => {
  assert.equal(slugifyTitle('Keratiné Filler Lift!'), 'keratin-filler-lift');
  assert.equal(slugifyTitle('  Brow & Face Threading  '), 'brow-face-threading');
  assert.match(slugifyTitle('Luxury Studio 2026'), /^[a-z0-9-]+$/);
});

test('isValidImageSource accepts relative assets, https urls, and bounded data urls while rejecting oversized/invalid values', () => {
  assert.equal(isValidImageSource('/src/assets/images/hero.jpg'), true);
  assert.equal(isValidImageSource('https://example.com/photo.jpg'), true);
  assert.equal(isValidImageSource('data:image/jpeg;base64,/9j/4AAQ'), true);
  assert.equal(isValidImageSource(''), false);
  assert.equal(isValidImageSource('javascript:alert(1)'), false);
  assert.equal(isValidImageSource(`data:image/jpeg;base64,${'a'.repeat(260000)}`), false);
});

test('mergeSiteSettings overlays remote updates while preserving missing section IDs', () => {
  const defaults = buildDefaultSiteConfig();
  const merged = mergeSiteSettings(defaults, {
    brand: { ...defaults.brand, name: 'LUMIERE' },
    structure: {
      sectionOrder: ['hero', 'faq'],
      hiddenSections: ['collage'],
      showPreloader: false,
      showFooterContactForm: true,
      showFooterBanner: false,
    },
  });

  assert.equal(merged.brand.name, 'LUMIERE');
  assert.equal(merged.structure.sectionOrder[0], 'hero');
  assert.equal(merged.structure.sectionOrder[1], 'faq');
  assert.equal(merged.structure.sectionOrder.length, defaults.structure.sectionOrder.length);
  assert.deepEqual(merged.structure.hiddenSections, ['collage']);
  assert.equal(merged.structure.showPreloader, false);
  assert.equal(merged.structure.showFooterBanner, false);
});

test('computeAdminDashboardStats summarizes salon CMS inventory and unread inquiries', () => {
  const config = buildDefaultSiteConfig();
  config.structure.hiddenSections = ['collage'];
  const inquiries: ClientInquiryItem[] = [
    {
      id: 'inq-1',
      type: 'contact',
      name: 'Clara',
      contact: 'clara@example.com',
      message: 'Bridal package',
      status: 'new',
      createdAtMs: 1000,
    },
    {
      id: 'inq-2',
      type: 'booking',
      name: 'Nadia',
      contact: '+62812345678',
      message: 'Senopati',
      status: 'contacted',
      createdAtMs: 2000,
    },
  ];
  const stats = computeAdminDashboardStats(config, inquiries, 9);
  assert.equal(stats.servicesCount, 11);
  assert.equal(stats.locationsCount, 6);
  assert.equal(stats.instagramPostsCount, 6);
  assert.equal(stats.visibleHomeSections, 7);
  assert.equal(stats.totalHomeSections, 8);
  assert.equal(stats.newInquiriesCount, 1);
  assert.equal(stats.totalInquiriesCount, 2);
  assert.equal(stats.mediaCount, 9);
});
