import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesText = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8')) as {
  entities: Record<string, unknown>;
  firestore: Record<string, unknown>;
};

test('firestore.rules starts with rules_version 2 and default-deny catch-all', () => {
  assert.match(rulesText, /^rules_version = '2';/);
  assert.match(
    rulesText,
    /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/
  );
});

test('every collection in firebase-blueprint.json has an explicit match block in firestore.rules', () => {
  const collectionNames = Object.keys(blueprint.firestore).map((p) =>
    p.replace(/^\//, '').split('/')[0]
  );
  for (const name of collectionNames) {
    assert.match(
      rulesText,
      new RegExp(`match /${name}/\\{[a-zA-Z0-9_]+\\}`),
      `Missing match block for collection /${name}`
    );
  }
});

test('Dirty Dozen #1–#3: auth, email_verified anti-spoof, and non-escalatable admin gate enforced', () => {
  assert.match(rulesText, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesText, /request\.auth\.token\.email == 'tchuekrostand@gmail\.com'/);
  assert.match(rulesText, /match \/admins\/\{adminId\}[\s\S]*allow create:[\s\S]*isBootstrappedOwner\(\)/);
});

test('Dirty Dozen #4–#7 & #11–#12: inquiries PII isolation, create-only new status, server timestamps, and strict affectedKeys', () => {
  const inquiryBlock = rulesText.match(/match \/inquiries\/\{inquiryId\} \{[\s\S]*?\n    \}/)?.[0] ?? '';
  assert.ok(inquiryBlock.length > 0, 'inquiries match block missing');
  assert.match(inquiryBlock, /allow get: if isValidId\(inquiryId\) && isAdmin\(\);/);
  assert.match(inquiryBlock, /allow list: if isBootstrappedOwner\(\);/);
  assert.match(inquiryBlock, /incoming\(\)\.status == 'new'/);
  assert.match(inquiryBlock, /incoming\(\)\.createdAt == request\.time/);
  assert.match(inquiryBlock, /incoming\(\)\.createdAt == existing\(\)\.createdAt/);
  assert.match(inquiryBlock, /affectedKeys\(\)\.hasOnly\(\['status', 'updatedAt'\]\)/);
});

test('Dirty Dozen #8–#10: ID poisoning guard, bounded string sizes, and bounded array sizes enforced', () => {
  assert.match(rulesText, /function isValidId\(id\)[\s\S]*id\.size\(\) <= 128[\s\S]*\^\[a-zA-Z0-9_\\\\-\]\+\$/);
  assert.match(rulesText, /data\.highlights\.size\(\) <= 10/);
  assert.match(rulesText, /data\.aftercare\.size\(\) <= 10/);
  assert.match(rulesText, /isBoundedString\(data\.message, 2000\)/);
  assert.doesNotMatch(rulesText, /allow (read|write|list): if true;/);
});

test('instagramPosts collection and instagramSection obey bounded list and strict schema rules', () => {
  const igBlock = rulesText.match(/match \/instagramPosts\/\{postId\} \{[\s\S]*?\n    \}/)?.[0] ?? '';
  assert.ok(igBlock.length > 0, 'instagramPosts match block missing');
  assert.match(igBlock, /allow get: if isValidId\(postId\);/);
  assert.match(igBlock, /allow list: if request\.query\.limit <= 100;/);
  assert.match(igBlock, /isValidInstagramPost\(incoming\(\)\)/);
  assert.match(rulesText, /function isValidInstagramSection\(sec\)/);
});
