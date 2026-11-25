import { useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import type {
  FaqItem,
  JournalArticle,
  ServiceItem,
  ServicePillar,
  StudioLocation,
} from '../../data/siteConfig';
import {
  SERVICE_PILLARS,
  slugifyTitle,
  type MediaAssetItem,
} from '../../utils/adminHelpers';
import { ImageFieldPicker } from './ImageFieldPicker';

const INPUT_CLASS =
  'w-full border border-[#251C14]/20 bg-white px-3 py-2 text-xs text-[#251C14] placeholder:text-[#251C14]/40 focus:border-[#7A6047] focus:outline-none';
const LABEL_CLASS =
  'block text-[11px] font-medium tracking-[0.14em] uppercase text-[#5F4A36] mb-1.5';

// ============================================================================
// Services Menu Manager
// ============================================================================
interface ServicesManagerProps {
  services: ServiceItem[];
  mediaAssets: MediaAssetItem[];
  saving: boolean;
  onSaveService: (service: ServiceItem, order?: number) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onUploadMedia: (dataUrl: string, label: string) => Promise<void>;
}

export function ServicesManager({
  services,
  mediaAssets,
  saving,
  onSaveService,
  onDeleteService,
  onUploadMedia,
}: ServicesManagerProps) {
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [filterPillar, setFilterPillar] = useState<ServicePillar | 'ALL'>('ALL');
  const [formError, setFormError] = useState<string | null>(null);

  const visible =
    filterPillar === 'ALL'
      ? services
      : services.filter((s) => s.pillar === filterPillar);

  const startNew = () => {
    setFormError(null);
    const nextIdx = String(services.length + 1).padStart(3, '0');
    setEditing({
      id: `srv-${Date.now()}`,
      index: nextIdx,
      slug: '',
      name: '',
      pillar: 'EVERLASH',
      shortDescription: '',
      fullDescription: '',
      duration: '60 mins',
      technicianPrice: 'IDR 450,000',
      stylistPrice: 'IDR 600,000',
      highlights: ['Custom consultation & proportion mapping'],
      aftercare: ['Avoid moisture for 24 hours post-treatment.'],
      image: mediaAssets[0]?.url ?? '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setFormError(null);
    if (!editing.name.trim()) {
      setFormError('Treatment name is required.');
      return;
    }
    if (!editing.shortDescription.trim()) {
      setFormError('Short summary is required.');
      return;
    }
    if (!editing.fullDescription.trim()) {
      setFormError('Full editorial description is required.');
      return;
    }
    if (!editing.duration.trim() || !editing.technicianPrice.trim() || !editing.stylistPrice.trim()) {
      setFormError('Duration, Technician Price, and Senior Stylist Price are required.');
      return;
    }
    if (!editing.image.trim()) {
      setFormError('Please select or upload a treatment image.');
      return;
    }

    await onSaveService({
      ...editing,
      name: editing.name.trim(),
      slug: slugifyTitle(editing.slug || editing.name),
      shortDescription: editing.shortDescription.trim(),
      fullDescription: editing.fullDescription.trim(),
      highlights: editing.highlights.map((h) => h.trim()).filter(Boolean),
      aftercare: editing.aftercare.map((a) => a.trim()).filter(Boolean),
    });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Treatment Menu ({services.length})
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Manage Salon Services & Pricing
          </h2>
        </div>

        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white hover:bg-[#5F4A36] transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Add Treatment</span>
        </button>
      </div>

      {/* Pillar Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', ...SERVICE_PILLARS] as const).map((pillar) => (
          <button
            key={pillar}
            type="button"
            onClick={() => setFilterPillar(pillar)}
            className={`px-3 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase transition-colors cursor-pointer ${
              filterPillar === pillar
                ? 'bg-[#251C14] text-white'
                : 'border border-[#251C14]/15 bg-white text-[#5F4A36] hover:border-[#7A6047]'
            }`}
          >
            {pillar}
          </button>
        ))}
      </div>

      {/* Editor Drawer / Panel */}
      {editing && (
        <div className="space-y-5 border-2 border-[#7A6047] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#251C14]/10 pb-3">
            <h3 className="font-serif text-xl text-[#251C14]">
              {editing.name ? `Edit: ${editing.name}` : 'New Treatment Service'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close service editor"
              className="p-1.5 text-[#5F4A36] hover:text-[#251C14] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {formError && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Treatment Name</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    name: e.target.value,
                    slug: editing.slug || slugifyTitle(e.target.value),
                  })
                }
                placeholder="e.g. Keratiné Filler Lift"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Pillar Category</label>
              <select
                value={editing.pillar}
                onChange={(e) =>
                  setEditing({ ...editing, pillar: e.target.value as ServicePillar })
                }
                className={INPUT_CLASS}
              >
                {SERVICE_PILLARS.map((pl) => (
                  <option key={pl} value={pl}>
                    {pl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>URL Slug & Editorial Index</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={editing.index}
                  onChange={(e) => setEditing({ ...editing, index: e.target.value })}
                  placeholder="012"
                  className={INPUT_CLASS}
                />
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="treatment-slug"
                  className={`col-span-2 ${INPUT_CLASS}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Duration</label>
              <input
                type="text"
                value={editing.duration}
                onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Technician Price</label>
              <input
                type="text"
                value={editing.technicianPrice}
                onChange={(e) =>
                  setEditing({ ...editing, technicianPrice: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Senior Stylist Price</label>
              <input
                type="text"
                value={editing.stylistPrice}
                onChange={(e) => setEditing({ ...editing, stylistPrice: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>Short Summary</label>
              <textarea
                rows={3}
                value={editing.shortDescription}
                onChange={(e) =>
                  setEditing({ ...editing, shortDescription: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Full Editorial Description</label>
              <textarea
                rows={3}
                value={editing.fullDescription}
                onChange={(e) =>
                  setEditing({ ...editing, fullDescription: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>Key Highlights (one per line)</label>
              <textarea
                rows={3}
                value={editing.highlights.join('\n')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    highlights: e.target.value.split('\n'),
                  })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Aftercare Notes (one per line)</label>
              <textarea
                rows={3}
                value={editing.aftercare.join('\n')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    aftercare: e.target.value.split('\n'),
                  })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <ImageFieldPicker
            label="Treatment Photography"
            value={editing.image}
            onChange={(url) => setEditing({ ...editing, image: url })}
            mediaAssets={mediaAssets}
            onUploadToLibrary={onUploadMedia}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="border border-[#251C14]/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#5F4A36] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{saving ? 'Saving...' : 'Save Treatment'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((srv) => (
          <div
            key={srv.id}
            className="flex gap-4 border border-[#251C14]/10 bg-white p-4 transition-colors hover:border-[#7A6047]/50"
          >
            <img
              src={srv.image}
              alt={srv.name}
              referrerPolicy="no-referrer"
              className="h-24 w-20 shrink-0 object-cover bg-[#EFE9E0]"
            />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-[#7A6047]">
                    {srv.index} · {srv.pillar}
                  </span>
                  <h3 className="font-serif text-base text-[#251C14]">{srv.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...srv })}
                    aria-label={`Edit ${srv.name}`}
                    className="p-1.5 text-[#5F4A36] hover:text-[#7A6047] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteService(srv.id)}
                    aria-label={`Delete ${srv.name}`}
                    className="p-1.5 text-[#5F4A36] hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="line-clamp-2 text-xs text-[#5F4A36]/80">
                {srv.shortDescription}
              </p>
              <p className="text-[11px] font-medium text-[#251C14]">
                {srv.duration} · Tech: {srv.technicianPrice} · Stylist: {srv.stylistPrice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Studio Locations Manager
// ============================================================================
interface LocationsManagerProps {
  locations: StudioLocation[];
  saving: boolean;
  onSaveLocation: (loc: StudioLocation, order?: number) => Promise<void>;
  onDeleteLocation: (id: string) => Promise<void>;
}

export function LocationsManager({
  locations,
  saving,
  onSaveLocation,
  onDeleteLocation,
}: LocationsManagerProps) {
  const [editing, setEditing] = useState<StudioLocation | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const startNew = () => {
    setFormError(null);
    setEditing({
      id: `loc-${Date.now()}`,
      name: '',
      city: 'Jakarta',
      district: '',
      address: '',
      hours: 'Daily, 09:00 – 20:00 WIB',
      phone: '',
      privateRooms: 8,
      servicesAvailable: ['EVERLASH', 'EVERBROW', 'EVERNAILS'],
      mapNote: '',
    });
  };

  const handleSaveLocation = async () => {
    if (!editing) return;
    setFormError(null);
    if (
      !editing.name.trim() ||
      !editing.city.trim() ||
      !editing.district.trim() ||
      !editing.address.trim() ||
      !editing.hours.trim() ||
      !editing.phone.trim()
    ) {
      setFormError('Branch name, city, district, street address, hours, and phone are all required.');
      return;
    }
    await onSaveLocation(editing);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Everhouse Sanctuaries ({locations.length})
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Manage Studio Locations & Hours
          </h2>
        </div>

        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white hover:bg-[#5F4A36] transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Add Studio Branch</span>
        </button>
      </div>

      {editing && (
        <div className="space-y-4 border-2 border-[#7A6047] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#251C14]/10 pb-3">
            <h3 className="font-serif text-xl text-[#251C14]">
              {editing.name || 'New Studio Location'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close location editor"
              className="p-1.5 text-[#5F4A36] hover:text-[#251C14] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {formError && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Branch Name</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>City</label>
              <input
                type="text"
                value={editing.city}
                onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>District</label>
              <input
                type="text"
                value={editing.district}
                onChange={(e) => setEditing({ ...editing, district: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Street Address</label>
            <input
              type="text"
              value={editing.address}
              onChange={(e) => setEditing({ ...editing, address: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Opening Hours</label>
              <input
                type="text"
                value={editing.hours}
                onChange={(e) => setEditing({ ...editing, hours: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Phone</label>
              <input
                type="text"
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Private Rooms</label>
              <input
                type="number"
                min={0}
                max={200}
                value={editing.privateRooms}
                onChange={(e) =>
                  setEditing({ ...editing, privateRooms: Number(e.target.value) || 0 })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Available Pillars</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_PILLARS.map((pillar) => {
                const active = editing.servicesAvailable.includes(pillar);
                return (
                  <button
                    key={pillar}
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        servicesAvailable: active
                          ? editing.servicesAvailable.filter((p) => p !== pillar)
                          : [...editing.servicesAvailable, pillar],
                      })
                    }
                    className={`border px-3 py-1 text-[11px] uppercase tracking-[0.12em] cursor-pointer ${
                      active
                        ? 'border-[#7A6047] bg-[#7A6047] text-white'
                        : 'border-[#251C14]/20 bg-white text-[#5F4A36]'
                    }`}
                  >
                    {pillar}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Sanctuary Note</label>
            <input
              type="text"
              value={editing.mapNote}
              onChange={(e) => setEditing({ ...editing, mapNote: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="border border-[#251C14]/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#5F4A36] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveLocation()}
              className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{saving ? 'Saving...' : 'Save Location'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="space-y-2 border border-[#251C14]/10 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#7A6047]">
                  {loc.city} · {loc.district}
                </p>
                <h3 className="font-serif text-lg text-[#251C14]">{loc.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditing({ ...loc })}
                  aria-label={`Edit ${loc.name}`}
                  className="p-1.5 text-[#5F4A36] hover:text-[#7A6047] cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void onDeleteLocation(loc.id)}
                  aria-label={`Delete ${loc.name}`}
                  className="p-1.5 text-[#5F4A36] hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="text-xs text-[#5F4A36]/85">{loc.address}</p>
            <p className="text-xs text-[#251C14]">
              {loc.hours} · {loc.phone} · {loc.privateRooms} private suites
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Journal & FAQ Editorial Manager
// ============================================================================
interface EditorialManagerProps {
  journal: JournalArticle[];
  faqs: FaqItem[];
  mediaAssets: MediaAssetItem[];
  saving: boolean;
  onSaveArticle: (article: JournalArticle) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  onSaveFaq: (faq: FaqItem) => Promise<void>;
  onDeleteFaq: (id: string) => Promise<void>;
  onUploadMedia: (dataUrl: string, label: string) => Promise<void>;
}

export function EditorialFaqManager({
  journal,
  faqs,
  mediaAssets,
  saving,
  onSaveArticle,
  onDeleteArticle,
  onSaveFaq,
  onDeleteFaq,
  onUploadMedia,
}: EditorialManagerProps) {
  const [tab, setTab] = useState<'journal' | 'faqs'>('journal');
  const [editingArticle, setEditingArticle] = useState<JournalArticle | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [faqError, setFaqError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Editorial & Client Care
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Journal Articles & FAQs
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('journal')}
            className={`px-4 py-2 text-xs uppercase tracking-[0.14em] cursor-pointer ${
              tab === 'journal'
                ? 'bg-[#251C14] text-white'
                : 'border border-[#251C14]/15 bg-white text-[#5F4A36]'
            }`}
          >
            Journal ({journal.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('faqs')}
            className={`px-4 py-2 text-xs uppercase tracking-[0.14em] cursor-pointer ${
              tab === 'faqs'
                ? 'bg-[#251C14] text-white'
                : 'border border-[#251C14]/15 bg-white text-[#5F4A36]'
            }`}
          >
            FAQs ({faqs.length})
          </button>
        </div>
      </div>

      {tab === 'journal' ? (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setEditingArticle({
                  id: `j-${Date.now()}`,
                  slug: '',
                  title: '',
                  category: 'Studio Guide',
                  date: '2026',
                  readTime: '3 min read',
                  excerpt: '',
                  image: mediaAssets[0]?.url ?? '',
                  body: [''],
                })
              }
              className="inline-flex items-center gap-2 bg-[#7A6047] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#5F4A36] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Article</span>
            </button>
          </div>

          {editingArticle && (
            <div className="space-y-4 border-2 border-[#7A6047] bg-white p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS}>Headline</label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        title: e.target.value,
                        slug: editingArticle.slug || slugifyTitle(e.target.value),
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={LABEL_CLASS}>Category</label>
                    <input
                      type="text"
                      value={editingArticle.category}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, category: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Date</label>
                    <input
                      type="text"
                      value={editingArticle.date}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, date: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Read Time</label>
                    <input
                      type="text"
                      value={editingArticle.readTime}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, readTime: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Excerpt</label>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>Body Paragraphs (separate with blank line)</label>
                <textarea
                  rows={6}
                  value={editingArticle.body.join('\n\n')}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      body: e.target.value.split(/\n\s*\n/),
                    })
                  }
                  className={INPUT_CLASS}
                />
              </div>

              <ImageFieldPicker
                label="Cover Image"
                value={editingArticle.image}
                onChange={(url) => setEditingArticle({ ...editingArticle, image: url })}
                mediaAssets={mediaAssets}
                onUploadToLibrary={onUploadMedia}
              />

              {articleError && (
                <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                  {articleError}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setArticleError(null);
                    setEditingArticle(null);
                  }}
                  className="border border-[#251C14]/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#5F4A36] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    setArticleError(null);
                    const cleanBody = editingArticle.body.map((b) => b.trim()).filter(Boolean);
                    if (!editingArticle.title.trim()) {
                      setArticleError('Article headline is required.');
                      return;
                    }
                    if (!editingArticle.excerpt.trim()) {
                      setArticleError('Article excerpt is required.');
                      return;
                    }
                    if (cleanBody.length === 0) {
                      setArticleError('Please provide at least one body paragraph.');
                      return;
                    }
                    if (!editingArticle.image.trim()) {
                      setArticleError('Please choose or upload a cover image.');
                      return;
                    }
                    await onSaveArticle({
                      ...editingArticle,
                      title: editingArticle.title.trim(),
                      excerpt: editingArticle.excerpt.trim(),
                      body: cleanBody,
                      slug: slugifyTitle(editingArticle.slug || editingArticle.title),
                    });
                    setEditingArticle(null);
                  }}
                  className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Save Article</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {journal.map((art) => (
              <div key={art.id} className="flex gap-4 border border-[#251C14]/10 bg-white p-4">
                <img
                  src={art.image}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="h-24 w-24 shrink-0 object-cover bg-[#EFE9E0]"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] tracking-[0.16em] uppercase text-[#7A6047]">
                      {art.category} · {art.date}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingArticle({ ...art })}
                        aria-label={`Edit ${art.title}`}
                        className="p-1 text-[#5F4A36] hover:text-[#7A6047] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteArticle(art.id)}
                        aria-label={`Delete ${art.title}`}
                        className="p-1 text-[#5F4A36] hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-serif text-base text-[#251C14]">{art.title}</h3>
                  <p className="line-clamp-2 text-xs text-[#5F4A36]/80">{art.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setEditingFaq({
                  id: `faq-${Date.now()}`,
                  question: '',
                  paragraphs: [''],
                  hasLocationLink: false,
                })
              }
              className="inline-flex items-center gap-2 bg-[#7A6047] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#5F4A36] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add FAQ</span>
            </button>
          </div>

          {editingFaq && (
            <div className="space-y-4 border-2 border-[#7A6047] bg-white p-6">
              <div>
                <label className={LABEL_CLASS}>Question</label>
                <input
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Answer Paragraphs (one per line)</label>
                <textarea
                  rows={5}
                  value={editingFaq.paragraphs.join('\n')}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      paragraphs: e.target.value.split('\n'),
                    })
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-[#251C14] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingFaq.hasLocationLink)}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, hasLocationLink: e.target.checked })
                  }
                  className="accent-[#7A6047]"
                />
                <span>Include "View all salon locations" button below answer</span>
              </label>
              {faqError && (
                <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                  {faqError}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFaqError(null);
                    setEditingFaq(null);
                  }}
                  className="border border-[#251C14]/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#5F4A36] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={async () => {
                    setFaqError(null);
                    const cleanParagraphs = editingFaq.paragraphs.map((p) => p.trim()).filter(Boolean);
                    if (!editingFaq.question.trim()) {
                      setFaqError('FAQ question is required.');
                      return;
                    }
                    if (cleanParagraphs.length === 0) {
                      setFaqError('Please provide at least one answer paragraph.');
                      return;
                    }
                    await onSaveFaq({
                      ...editingFaq,
                      question: editingFaq.question.trim(),
                      paragraphs: cleanParagraphs,
                    });
                    setEditingFaq(null);
                  }}
                  className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Save FAQ</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="flex items-start justify-between gap-4 border border-[#251C14]/10 bg-white p-4"
              >
                <div className="space-y-1">
                  <h3 className="text-xs font-medium tracking-[0.08em] uppercase text-[#251C14]">
                    {faq.question}
                  </h3>
                  <p className="line-clamp-2 text-xs text-[#5F4A36]/80">
                    {faq.paragraphs[0]}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingFaq({ ...faq })}
                    aria-label={`Edit FAQ ${faq.question}`}
                    className="p-1.5 text-[#5F4A36] hover:text-[#7A6047] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteFaq(faq.id)}
                    aria-label={`Delete FAQ ${faq.question}`}
                    className="p-1.5 text-[#5F4A36] hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
