import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_CONFIG } from '../data/siteConfig';
import {
  buildWhatsAppBookingUrl,
  filterLocations,
  filterServices,
  formatServiceIndex,
  getUniqueCities,
  isValidContact,
  validateBookingForm,
  validateContactForm,
} from './siteHelpers';

test('filterServices returns all services for ALL pillar', () => {
  const result = filterServices(SITE_CONFIG.services, 'ALL');
  assert.equal(result.length, 11);
});

test('filterServices filters accurately by pillar and search query', () => {
  const browServices = filterServices(SITE_CONFIG.services, 'EVERBROW');
  assert.equal(browServices.length, 2);
  assert.ok(browServices.every((s) => s.pillar === 'EVERBROW'));

  const keratinSearch = filterServices(SITE_CONFIG.services, 'ALL', 'keratin');
  assert.equal(keratinSearch.length, 1);
  assert.equal(keratinSearch[0].slug, 'keratine-filler-lift');
});

test('filterLocations and getUniqueCities group studio branches cleanly', () => {
  const cities = getUniqueCities(SITE_CONFIG.locations);
  assert.deepEqual(cities, ['Jakarta', 'Surabaya', 'Bali']);

  const baliBranches = filterLocations(SITE_CONFIG.locations, 'Bali');
  assert.equal(baliBranches.length, 1);
  assert.equal(baliBranches[0].id, 'loc-bali');

  const allBranches = filterLocations(SITE_CONFIG.locations, 'ALL');
  assert.equal(allBranches.length, SITE_CONFIG.locations.length);
});

test('isValidContact accepts valid emails and phone numbers and rejects garbage', () => {
  assert.equal(isValidContact('guest@example.com'), true);
  assert.equal(isValidContact('+62 812-3456-7890'), true);
  assert.equal(isValidContact('0812345678'), true);
  assert.equal(isValidContact(''), false);
  assert.equal(isValidContact('abc'), false);
  assert.equal(isValidContact('12345'), false);
});

test('validateBookingForm catches missing fields and accepts complete valid submissions', () => {
  const invalid = validateBookingForm({
    fullName: '',
    contact: 'invalid',
    serviceSlug: '',
    locationId: '',
    therapistTier: 'Stylist',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.contact);
  assert.ok(invalid.errors.serviceSlug);
  assert.ok(invalid.errors.locationId);
  assert.ok(invalid.errors.preferredDate);
  assert.ok(invalid.errors.preferredTime);

  const valid = validateBookingForm({
    fullName: 'Nadia Putri',
    contact: '+62 812 9000 1234',
    serviceSlug: 'lash-extension',
    locationId: 'loc-senopati',
    therapistTier: 'Stylist',
    preferredDate: '2026-12-01',
    preferredTime: '11:00',
    notes: 'Wispy natural set please',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('buildWhatsAppBookingUrl encodes booking parameters safely', () => {
  const url = buildWhatsAppBookingUrl('+62 821-121-8069', {
    brandName: 'EVER',
    fullName: 'Alya',
    serviceName: 'Brow Bomber',
    locationName: 'Everhouse Senopati',
    therapistTier: 'Stylist',
    preferredDate: '2026-12-05',
    preferredTime: '14:00',
  });
  assert.ok(url.startsWith('https://api.whatsapp.com/send?phone=628211218069&text='));
  assert.ok(url.includes(encodeURIComponent('Brow Bomber')));
  assert.ok(url.includes(encodeURIComponent('Everhouse Senopati')));
});

test('formatServiceIndex formats 0-based indices as 3-digit editorial numbers', () => {
  assert.equal(formatServiceIndex(0), '001');
  assert.equal(formatServiceIndex(10), '011');
});

test('validateContactForm flags incomplete inputs and accepts valid concierge inquiries', () => {
  const invalid = validateContactForm({
    name: 'A',
    contact: 'bad',
    message: 'Hi',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.contact);
  assert.ok(invalid.errors.message);

  const valid = validateContactForm({
    name: 'Clara Santoso',
    contact: 'clara@example.com',
    message: 'I would love to ask about bridal lash packages.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});
