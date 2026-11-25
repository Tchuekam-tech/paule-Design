# Security Specification & Payload-First TDD (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Safety Net**: Any unmatched path is strictly denied for all reads and writes.
2. **Public Storefront Read vs. Manager-Only Write**: Public visitors may read `/siteSettings/main`, `/services/*`, `/locations/*`, `/journal/*`, `/faqs/*`, `/mediaAssets/*`, and `/instagramPosts/*` (with bounded `limit <= 100` on collection listings), but ONLY verified salon managers (`isAdmin()`) may create, update, or delete storefront content.
3. **PII Isolation (`/inquiries`)**: Public visitors may ONLY `create` a new inquiry document with `status == 'new'`, valid bounded strings, and server timestamp (`createdAt == request.time`, `updatedAt == request.time`). Reading, listing, updating, or deleting `/inquiries` is strictly restricted to verified salon managers.
4. **Privilege Escalation Prevention (`/admins`)**: Non-admin users cannot read, create, update, or delete documents in `/admins/{adminId}` and cannot self-assign admin roles. Only the verified owner (`tchuekrostand@gmail.com` with `email_verified == true`) or an existing verified admin can manage `/admins`.
5. **Anti-Update-Gap & Strict Schema Enforcement**: Every write (`create` and `update`) executes a standalone `isValid[Entity]` blueprint validating required keys, strict key allowlists (`hasOnly`), field types, string `.size()` bounds, bounded list sizes, and server timestamp integrity.
6. **Path Variable Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) enforces `isValidId(docId)` (`^[a-zA-Z0-9_-]+$`, `<= 128` chars) to block ID poisoning.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Be Denied)
1. **Unauthenticated Site Defacement**: Anonymous `update` on `/siteSettings/main` attempting to change `hero.headline`.
2. **Unverified Admin Email Spoof**: Signed-in user with `email == 'tchuekrostand@gmail.com'` but `email_verified == false` attempting `write` to `/services/srv-1`.
3. **Self-Assigned Admin Escalation**: Non-admin authenticated user attempting `create` on `/admins/{theirUid}` with `{ role: 'owner', ... }`.
4. **Shadow Ghost Field Injection on Inquiry**: Public visitor creating `/inquiries/inq-1` with an extra unlisted key `isAdminApproved: true`.
5. **Inquiry State Shortcutting on Create**: Public visitor creating `/inquiries/inq-2` with `status: 'archived'` instead of `'new'`.
6. **Client Timestamp Forgery**: Public visitor creating `/inquiries/inq-3` with a backdated client timestamp (`createdAt != request.time`).
7. **PII Blanket Read Scrape**: Non-admin authenticated user attempting `get` or `list` on `/inquiries`.
8. **ID Poisoning Attack**: Admin or public visitor targeting `/services/../../etc/passwd` or a 200-character document ID.
9. **Denial-of-Wallet Oversized String**: Public visitor creating `/inquiries/inq-4` with a 10,000-character `message` exceeding `2000` chars.
10. **Unbounded Array Exhaustion**: Admin writing a `/services/srv-99` with 25 items in `highlights` (exceeds `<= 10`).
11. **Immutable `createdAt` Tampering**: Admin updating `/inquiries/inq-1` while modifying `createdAt` (`incoming().createdAt != existing().createdAt`).
12. **Terminal Archive Re-Mutation Bypass by Non-Admin / Value Poisoning**: Sending a non-string boolean `status: true` on `/inquiries/inq-1` update or mutating unlisted keys outside `affectedKeys().hasOnly(...)`.
