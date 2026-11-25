import { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  isValidImageSource,
  type AdminUserItem,
  type ClientInquiryItem,
  type InquiryStatus,
  type MediaAssetItem,
  type MediaCategory,
} from '../../utils/adminHelpers';
import { OWNER_ADMIN_EMAIL } from '../../firebase';
import { compressImageFileToDataUrl } from './ImageFieldPicker';

const INPUT_CLASS =
  'w-full border border-[#251C14]/20 bg-white px-3 py-2 text-xs text-[#251C14] placeholder:text-[#251C14]/40 focus:border-[#7A6047] focus:outline-none';
const LABEL_CLASS =
  'block text-[11px] font-medium tracking-[0.14em] uppercase text-[#5F4A36] mb-1.5';

const MEDIA_CATEGORIES: MediaCategory[] = [
  'Hero',
  'Editorial',
  'Services',
  'Journal',
  'Sanctuary',
];

// ============================================================================
// Media & Images Library Manager
// ============================================================================
interface MediaLibraryManagerProps {
  mediaAssets: MediaAssetItem[];
  saving: boolean;
  onAddMedia: (asset: {
    label: string;
    category: MediaCategory;
    url: string;
    alt: string;
  }) => Promise<void>;
  onDeleteMedia: (id: string) => Promise<void>;
}

export function MediaLibraryManager({
  mediaAssets,
  saving,
  onAddMedia,
  onDeleteMedia,
}: MediaLibraryManagerProps) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<MediaCategory>('Editorial');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [filterCat, setFilterCat] = useState<MediaCategory | 'ALL'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const visible =
    filterCat === 'ALL'
      ? mediaAssets
      : mediaAssets.filter((m) => m.category === filterCat);

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      const cleanName = file.name.replace(/\.[^.]+$/, '');
      await onAddMedia({
        label: label.trim() || cleanName,
        category,
        url: dataUrl,
        alt: alt.trim() || cleanName,
      });
      setLabel('');
      setAlt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAddUrl = async () => {
    setError(null);
    if (!isValidImageSource(url)) {
      setError('Enter a valid image URL (https://..., /src/assets/..., or uploaded photo).');
      return;
    }
    await onAddMedia({
      label: label.trim() || 'Studio Image',
      category,
      url: url.trim(),
      alt: alt.trim() || label.trim() || 'Studio visual',
    });
    setLabel('');
    setUrl('');
    setAlt('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#251C14]/10 pb-4">
        <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
          Visual Asset Studio ({mediaAssets.length} Assets)
        </p>
        <h2 className="font-serif text-2xl text-[#251C14]">
          Media & Photography Library
        </h2>
      </div>

      {/* Upload / Add Image Box */}
      <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
        <h3 className="font-serif text-lg text-[#251C14]">Add New Photography</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={LABEL_CLASS}>Asset Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Senopati Suite Detail"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MediaCategory)}
              className={INPUT_CLASS}
            >
              {MEDIA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Alt Description</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Accessible image caption"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-end">
          <div className="md:col-span-7">
            <label className={LABEL_CLASS}>Image URL (or upload a file directly)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-studio-cdn.com/photo.jpg or /src/assets/images/..."
              className={INPUT_CLASS}
            />
          </div>
          <div className="md:col-span-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || !url.trim()}
              onClick={() => void handleAddUrl()}
              className="inline-flex items-center gap-1.5 bg-[#7A6047] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#5F4A36] disabled:opacity-45 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add URL</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 border border-[#7A6047] bg-[#F9F6F1] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#5F4A36] hover:bg-[#7A6047] hover:text-white cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Upload Photo</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFileUpload(e.target.files?.[0])}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', ...MEDIA_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] cursor-pointer ${
              filterCat === cat
                ? 'bg-[#251C14] text-white'
                : 'border border-[#251C14]/15 bg-white text-[#5F4A36]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Visual Gallery Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((asset) => (
          <div
            key={asset.id}
            className="overflow-hidden border border-[#251C14]/10 bg-white"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFE9E0]">
              <img
                src={asset.url}
                alt={asset.alt || asset.label}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#251C14]">
                    {asset.label}
                  </p>
                  <p className="text-[10px] tracking-[0.16em] uppercase text-[#7A6047]">
                    {asset.category} {asset.builtIn ? '· Studio Default' : '· Custom Cloud'}
                  </p>
                </div>
                {!asset.builtIn && (
                  <button
                    type="button"
                    onClick={() => void onDeleteMedia(asset.id)}
                    aria-label={`Delete ${asset.label}`}
                    className="p-1 text-[#5F4A36] hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(asset.url);
                  setCopiedId(asset.id);
                  window.setTimeout(() => setCopiedId(null), 1600);
                }}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-[#5F4A36] hover:text-[#7A6047] cursor-pointer"
              >
                {copiedId === asset.id ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>URL Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy Asset URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Client Inquiries & Bookings Inbox
// ============================================================================
interface InquiriesInboxProps {
  inquiries: ClientInquiryItem[];
  canListInquiries?: boolean;
  onUpdateStatus: (id: string, status: InquiryStatus) => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
}

export function InquiriesInbox({
  inquiries,
  canListInquiries = true,
  onUpdateStatus,
  onDeleteInquiry,
}: InquiriesInboxProps) {
  const [filter, setFilter] = useState<InquiryStatus | 'all'>('all');
  const visible =
    filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Private Concierge Feed
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Client Inquiries & Booking Requests
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'contacted', 'archived'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] cursor-pointer ${
                filter === status
                  ? 'bg-[#251C14] text-white'
                  : 'border border-[#251C14]/15 bg-white text-[#5F4A36]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {!canListInquiries ? (
        <div className="border border-[#7A6047]/30 bg-[#F9F6F1] p-8 text-center space-y-2">
          <ShieldCheck className="mx-auto h-6 w-6 text-[#7A6047]" aria-hidden="true" />
          <p className="font-serif text-lg text-[#251C14]">Owner-Only Client PII Inbox</p>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-[#5F4A36]">
            To protect client privacy under studio security rules, listing private client inquiries is restricted to the primary studio owner ({OWNER_ADMIN_EMAIL}).
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-[#251C14]/10 bg-white p-10 text-center space-y-2">
          <Mail className="mx-auto h-6 w-6 text-[#7A6047]/60" aria-hidden="true" />
          <p className="font-serif text-lg text-[#251C14]">No client messages yet</p>
          <p className="text-xs text-[#5F4A36]/75">
            Messages from the Footer contact form and Appointment modal appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className="space-y-3 border border-[#251C14]/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#F9F6F1] border border-[#7A6047]/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#7A6047]">
                      {item.type}
                    </span>
                    <span className="text-xs font-medium text-[#251C14]">
                      {item.name}
                    </span>
                    <span className="text-xs text-[#5F4A36]/80">· {item.contact}</span>
                  </div>
                  {(item.serviceName || item.locationName) && (
                    <p className="mt-1 text-xs text-[#7A6047]">
                      {[
                        item.serviceName,
                        item.therapistTier,
                        item.locationName,
                        item.preferredDate && `${item.preferredDate} ${item.preferredTime ?? ''}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Update status for ${item.name}`}
                    value={item.status}
                    onChange={(e) =>
                      void onUpdateStatus(item.id, e.target.value as InquiryStatus)
                    }
                    className="border border-[#251C14]/20 bg-[#FBF9F6] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[#251C14]"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => void onDeleteInquiry(item.id)}
                    aria-label={`Delete inquiry from ${item.name}`}
                    className="p-1.5 text-[#5F4A36] hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {item.message && (
                <p className="text-xs leading-relaxed text-[#251C14]/85">
                  {item.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Team & Manager Access Control
// ============================================================================
interface TeamAccessProps {
  admins: AdminUserItem[];
  isOwner: boolean;
  saving: boolean;
  onGrantAdmin: (uid: string, email: string, displayName: string) => Promise<void>;
  onRevokeAdmin: (uid: string) => Promise<void>;
}

export function TeamAccessPanel({
  admins,
  isOwner,
  saving,
  onGrantAdmin,
  onRevokeAdmin,
}: TeamAccessProps) {
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleGrant = async () => {
    setFormError(null);
    const cleanUid = uid.trim();
    const cleanEmail = email.trim();
    const cleanName = displayName.trim();

    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(cleanUid)) {
      setFormError('Firebase User UID must contain only letters, numbers, hyphens, or underscores.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid Google email address.');
      return;
    }
    if (!cleanName) {
      setFormError('Please enter a Display Name for this manager.');
      return;
    }

    await onGrantAdmin(cleanUid, cleanEmail, cleanName);
    setUid('');
    setEmail('');
    setDisplayName('');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#251C14]/10 pb-4">
        <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
          Role-Based Access Control
        </p>
        <h2 className="font-serif text-2xl text-[#251C14]">
          Authorized Salon Managers
        </h2>
      </div>

      <div className="border border-[#7A6047]/30 bg-[#F9F6F1] p-5 flex items-center gap-3.5">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#7A6047]" aria-hidden="true" />
        <div className="text-xs text-[#251C14]">
          <p className="font-medium">Primary Studio Owner</p>
          <p className="text-[#5F4A36]">{OWNER_ADMIN_EMAIL} (Full cloud access & manager delegation)</p>
        </div>
      </div>

      {isOwner && (
        <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
          <h3 className="font-serif text-lg text-[#251C14]">Authorize Additional Manager</h3>
          <p className="text-xs text-[#5F4A36]/80">
            Have the manager sign in once at the Manager Portal to copy their Firebase User UID, then authorize them below.
          </p>
          {formError && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Firebase User UID</label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Paste manager UID"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Google Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@salon.com"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Studio Director"
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleGrant()}
            className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#5F4A36] disabled:opacity-45 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Grant Manager Access</span>
          </button>
        </div>
      )}

      <div className="space-y-2.5">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between border border-[#251C14]/10 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-[#251C14]">{admin.displayName}</p>
              <p className="text-xs text-[#5F4A36]">
                {admin.email} · UID: <span className="font-mono">{admin.id}</span>
              </p>
            </div>
            {isOwner && (
              <button
                type="button"
                onClick={() => void onRevokeAdmin(admin.id)}
                className="inline-flex items-center gap-1 border border-red-200 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Revoke</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
