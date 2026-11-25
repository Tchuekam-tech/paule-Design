import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import {
  HOME_SECTION_CATALOG,
  SERVICE_PILLARS,
  moveItemInArray,
  toggleSectionVisibility,
  type EditableSiteSettings,
  type MediaAssetItem,
} from '../../utils/adminHelpers';
import type { ServiceItem, ServicePillar } from '../../data/siteConfig';
import { ImageFieldPicker } from './ImageFieldPicker';

interface SharedSettingsProps {
  settings: EditableSiteSettings;
  services: ServiceItem[];
  mediaAssets: MediaAssetItem[];
  saving: boolean;
  onSave: (next: EditableSiteSettings) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onUploadMedia: (dataUrl: string, label: string) => Promise<void>;
}

const INPUT_CLASS =
  'w-full border border-[#251C14]/20 bg-white px-3 py-2 text-xs text-[#251C14] placeholder:text-[#251C14]/40 focus:border-[#7A6047] focus:outline-none';
const LABEL_CLASS =
  'block text-[11px] font-medium tracking-[0.14em] uppercase text-[#5F4A36] mb-1.5';

export function BrandContactEditor({
  settings,
  saving,
  onSave,
}: Pick<SharedSettingsProps, 'settings' | 'saving' | 'onSave'>) {
  const [draft, setDraft] = useState(settings);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const updateBrand = (patch: Partial<EditableSiteSettings['brand']>) => {
    setFormError(null);
    setDraft((prev) => ({ ...prev, brand: { ...prev.brand, ...patch } }));
  };

  const handleSave = async () => {
    setFormError(null);
    if (!draft.brand.name.trim()) {
      setFormError('Brand Name is required.');
      return;
    }
    if (!draft.brand.houseName.trim()) {
      setFormError('House / Sanctuary Name is required.');
      return;
    }
    await onSave(draft);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Identity & Concierge
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Brand Details & Contact Information
          </h2>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white transition-colors hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{saving ? 'Saving...' : 'Save Brand Info'}</span>
        </button>
      </div>

      {formError && (
        <p className="border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700" role="alert">
          {formError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 border border-[#251C14]/10 bg-white p-6 md:grid-cols-2">
        <div>
          <label className={LABEL_CLASS}>Brand Name</label>
          <input
            type="text"
            value={draft.brand.name}
            onChange={(e) => updateBrand({ name: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>House / Sanctuary Name</label>
          <input
            type="text"
            value={draft.brand.houseName}
            onChange={(e) => updateBrand({ houseName: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div className="md:col-span-2">
          <label className={LABEL_CLASS}>Brand Tagline</label>
          <input
            type="text"
            value={draft.brand.tagline}
            onChange={(e) => updateBrand({ tagline: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Concierge Email</label>
          <input
            type="email"
            value={draft.brand.email}
            onChange={(e) => updateBrand({ email: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Display Phone Number</label>
          <input
            type="text"
            value={draft.brand.phoneDisplay}
            onChange={(e) =>
              updateBrand({
                phoneDisplay: e.target.value,
                phoneHref: `tel:${e.target.value.replace(/[^\d+]/g, '')}`,
              })
            }
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>WhatsApp Number (digits with country code)</label>
          <input
            type="text"
            value={draft.brand.whatsappNumber}
            onChange={(e) => updateBrand({ whatsappNumber: e.target.value.replace(/\D/g, '') })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Copyright Notice</label>
          <input
            type="text"
            value={draft.brand.copyright}
            onChange={(e) => updateBrand({ copyright: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Instagram URL</label>
          <input
            type="url"
            value={draft.brand.social.instagram}
            onChange={(e) =>
              updateBrand({
                social: { ...draft.brand.social, instagram: e.target.value },
              })
            }
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Facebook URL</label>
          <input
            type="url"
            value={draft.brand.social.facebook}
            onChange={(e) =>
              updateBrand({
                social: { ...draft.brand.social, facebook: e.target.value },
              })
            }
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}

export function SiteStructureEditor({
  settings,
  saving,
  onSave,
  onResetDefaults,
}: Pick<SharedSettingsProps, 'settings' | 'saving' | 'onSave' | 'onResetDefaults'>) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const sectionMetaMap = new Map(HOME_SECTION_CATALOG.map((item) => [item.id, item]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Architecture & Visibility
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Website Structure & Section Order
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={() => void onResetDefaults()}
            className="inline-flex items-center gap-1.5 border border-[#251C14]/20 bg-white px-4 py-2.5 text-xs font-medium tracking-[0.14em] uppercase text-[#251C14] hover:border-[#7A6047] hover:text-[#7A6047] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSave(draft)}
            className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white transition-colors hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{saving ? 'Saving...' : 'Save Structure'}</span>
          </button>
        </div>
      </div>

      {/* Homepage Section Reordering & Show/Hide */}
      <div className="border border-[#251C14]/10 bg-white p-6 space-y-4">
        <div>
          <h3 className="font-serif text-lg text-[#251C14]">Homepage Section Sequence</h3>
          <p className="text-xs text-[#5F4A36]/80">
            Reorder sections from top to bottom or toggle any section off without deleting its content.
          </p>
        </div>

        <div className="divide-y divide-[#251C14]/10 border border-[#251C14]/10">
          {draft.structure.sectionOrder.map((sectionId, idx) => {
            const meta = sectionMetaMap.get(sectionId);
            const isHidden = draft.structure.hiddenSections.includes(sectionId);
            return (
              <div
                key={sectionId}
                data-testid={`structure-row-${sectionId}`}
                className={`flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 transition-colors ${
                  isHidden ? 'bg-[#F6F2EC]/70 opacity-65' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-xs text-[#7A6047]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#251C14]">
                      {meta?.label ?? sectionId}
                    </p>
                    <p className="text-xs text-[#5F4A36]/75 truncate">
                      {meta?.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    aria-label={`Move ${meta?.label ?? sectionId} up`}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        structure: {
                          ...prev.structure,
                          sectionOrder: moveItemInArray(
                            prev.structure.sectionOrder,
                            idx,
                            'up'
                          ),
                        },
                      }))
                    }
                    className="inline-flex h-8 w-8 items-center justify-center border border-[#251C14]/15 text-[#251C14] hover:border-[#7A6047] hover:text-[#7A6047] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === draft.structure.sectionOrder.length - 1}
                    aria-label={`Move ${meta?.label ?? sectionId} down`}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        structure: {
                          ...prev.structure,
                          sectionOrder: moveItemInArray(
                            prev.structure.sectionOrder,
                            idx,
                            'down'
                          ),
                        },
                      }))
                    }
                    className="inline-flex h-8 w-8 items-center justify-center border border-[#251C14]/15 text-[#251C14] hover:border-[#7A6047] hover:text-[#7A6047] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        structure: {
                          ...prev.structure,
                          hiddenSections: toggleSectionVisibility(
                            prev.structure.hiddenSections,
                            sectionId
                          ),
                        },
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors cursor-pointer ${
                      isHidden
                        ? 'border-[#251C14]/20 bg-white text-[#5F4A36]'
                        : 'border-[#7A6047] bg-[#7A6047] text-white'
                    }`}
                  >
                    {isHidden ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Hidden</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Visible</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Shell Toggles */}
      <div className="border border-[#251C14]/10 bg-white p-6 space-y-4">
        <h3 className="font-serif text-lg text-[#251C14]">Global Experience Controls</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(
            [
              {
                key: 'showPreloader',
                title: 'Editorial Curtain Preloader',
                desc: 'Show the warm-umber splash curtain on initial site load.',
              },
              {
                key: 'showFooterContactForm',
                title: 'Footer Concierge Form',
                desc: 'Display the Send a Note contact form inside the Footer.',
              },
              {
                key: 'showFooterBanner',
                title: 'Closing Orchid CTA Banner',
                desc: 'Display the parallax macro-orchid banner below the Footer.',
              },
            ] as const
          ).map((toggle) => {
            const active = draft.structure[toggle.key];
            return (
              <button
                key={toggle.key}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    structure: {
                      ...prev.structure,
                      [toggle.key]: !prev.structure[toggle.key],
                    },
                  }))
                }
                className={`border p-4 text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[#7A6047] bg-[#F9F6F1]'
                    : 'border-[#251C14]/15 bg-white opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#251C14]">
                    {toggle.title}
                  </p>
                  <span
                    className={`px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase ${
                      active
                        ? 'bg-[#7A6047] text-white'
                        : 'bg-[#251C14]/10 text-[#5F4A36]'
                    }`}
                  >
                    {active ? 'On' : 'Off'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#5F4A36]/80">{toggle.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type SectionSubTab =
  | 'hero'
  | 'arc'
  | 'collage'
  | 'hotspots'
  | 'personalised'
  | 'story';

export function HomepageSectionsEditor({
  settings,
  services,
  mediaAssets,
  saving,
  onSave,
  onUploadMedia,
}: Omit<SharedSettingsProps, 'onResetDefaults'>) {
  const [draft, setDraft] = useState(settings);
  const [subTab, setSubTab] = useState<SectionSubTab>('hero');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSaveSections = async () => {
    setFormError(null);
    if (!draft.hero.headline.trim()) {
      setFormError('Hero Headline cannot be empty.');
      return;
    }
    if (!draft.quote.text.trim()) {
      setFormError('Editorial Brand Quote text cannot be empty.');
      return;
    }
    if (draft.editorialCollage.headingLines.filter((l) => l.trim()).length === 0) {
      setFormError('Collage Heading Lines must include at least one line.');
      return;
    }
    if (!draft.marqueePhrase.trim()) {
      setFormError('Scrolling Marquee Phrase cannot be empty.');
      return;
    }
    if (draft.arcSlides.length === 0) {
      setFormError('Arc Carousel must include at least one slide.');
      return;
    }
    if (!draft.story.headline.trim()) {
      setFormError('Our Story Headline cannot be empty.');
      return;
    }
    if (!draft.footerBanner.label.trim()) {
      setFormError('Closing Footer CTA Banner label cannot be empty.');
      return;
    }
    await onSave(draft);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Copy & Visual Art Direction
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Homepage & Story Sections
          </h2>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSaveSections()}
          className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white transition-colors hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{saving ? 'Saving...' : 'Save Section Changes'}</span>
        </button>
      </div>

      {formError && (
        <p className="border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700" role="alert">
          {formError}
        </p>
      )}

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#251C14]/10 pb-3">
        {(
          [
            { id: 'hero', label: 'Hero & Quote' },
            { id: 'arc', label: 'Arc Carousel' },
            { id: 'collage', label: 'Collage & Marquee' },
            { id: 'hotspots', label: '01–06 Hotspots' },
            { id: 'personalised', label: 'Personalised & Everhouse' },
            { id: 'story', label: 'Our Story & Footer Banner' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`px-3.5 py-2 text-[11px] font-medium tracking-[0.14em] uppercase transition-colors cursor-pointer ${
              subTab === tab.id
                ? 'bg-[#251C14] text-[#F9F6F1]'
                : 'border border-[#251C14]/15 bg-white text-[#5F4A36] hover:border-[#7A6047]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero & Quote */}
      {subTab === 'hero' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
            <h3 className="font-serif text-lg text-[#251C14]">Full-Viewport Hero</h3>
            <div>
              <label className={LABEL_CLASS}>Hero Headline</label>
              <input
                type="text"
                value={draft.hero.headline}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, hero: { ...p.hero, headline: e.target.value } }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Scroll Prompt Label</label>
              <input
                type="text"
                value={draft.hero.scrollLabel}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, hero: { ...p.hero, scrollLabel: e.target.value } }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <ImageFieldPicker
              label="Hero Portrait Image"
              value={draft.hero.image}
              onChange={(url) =>
                setDraft((p) => ({ ...p, hero: { ...p.hero, image: url } }))
              }
              mediaAssets={mediaAssets}
              onUploadToLibrary={onUploadMedia}
            />
            <div>
              <label className={LABEL_CLASS}>Image Alt Description</label>
              <input
                type="text"
                value={draft.hero.imageAlt}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, hero: { ...p.hero, imageAlt: e.target.value } }))
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
            <h3 className="font-serif text-lg text-[#251C14]">Editorial Brand Quote</h3>
            <div>
              <label className={LABEL_CLASS}>Quote Text</label>
              <textarea
                rows={4}
                value={draft.quote.text}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, quote: { ...p.quote, text: e.target.value } }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Editorial Sublabel</label>
              <input
                type="text"
                value={draft.quote.sublabel}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, quote: { ...p.quote, sublabel: e.target.value } }))
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      )}

      {/* Arc Showcase Carousel */}
      {subTab === 'arc' && (
        <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-[#251C14]">
                Curved Arc Carousel Slides ({draft.arcSlides.length}/10)
              </h3>
              <p className="text-xs text-[#5F4A36]/75">
                Each slide links to a service pillar (or studio locations if no pillar is chosen).
              </p>
            </div>
            <button
              type="button"
              disabled={draft.arcSlides.length >= 10}
              onClick={() =>
                setDraft((p) => ({
                  ...p,
                  arcSlides: [
                    ...p.arcSlides,
                    {
                      id: `arc-${Date.now()}`,
                      label: 'NEW PILLAR',
                      subtitle: 'Signature Detail',
                      pillar: 'EVERLASH',
                      image: mediaAssets[0]?.url ?? p.hero.image,
                    },
                  ],
                }))
              }
              className="inline-flex items-center gap-1.5 border border-[#7A6047] bg-[#F9F6F1] px-3.5 py-2 text-[11px] font-medium tracking-[0.14em] uppercase text-[#5F4A36] hover:bg-[#7A6047] hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {draft.arcSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className="space-y-3 border border-[#251C14]/15 bg-[#FBF9F6] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#7A6047]">
                    SLIDE {String(idx + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    disabled={draft.arcSlides.length <= 1}
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        arcSlides: p.arcSlides.filter((_, i) => i !== idx),
                      }))
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-red-700 hover:underline disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLASS}>Label</label>
                    <input
                      type="text"
                      value={slide.label}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          arcSlides: p.arcSlides.map((s, i) =>
                            i === idx ? { ...s, label: e.target.value } : s
                          ),
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Hover Subtitle</label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          arcSlides: p.arcSlides.map((s, i) =>
                            i === idx ? { ...s, subtitle: e.target.value } : s
                          ),
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Destination Link</label>
                  <select
                    value={slide.pillar ?? ''}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        arcSlides: p.arcSlides.map((s, i) =>
                          i === idx
                            ? {
                                ...s,
                                pillar: (e.target.value || undefined) as ServicePillar | undefined,
                              }
                            : s
                        ),
                      }))
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="">Studio Locations Page</option>
                    {SERVICE_PILLARS.map((pillar) => (
                      <option key={pillar} value={pillar}>
                        Services → {pillar}
                      </option>
                    ))}
                  </select>
                </div>

                <ImageFieldPicker
                  label="Slide Image"
                  value={slide.image}
                  onChange={(url) =>
                    setDraft((p) => ({
                      ...p,
                      arcSlides: p.arcSlides.map((s, i) =>
                        i === idx ? { ...s, image: url } : s
                      ),
                    }))
                  }
                  mediaAssets={mediaAssets}
                  onUploadToLibrary={onUploadMedia}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collage & Marquee */}
      {subTab === 'collage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 border border-[#251C14]/10 bg-white p-6 md:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>Collage Heading Lines (one per line)</label>
              <textarea
                rows={4}
                value={draft.editorialCollage.headingLines.join('\n')}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    editorialCollage: {
                      ...p.editorialCollage,
                      headingLines: e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean)
                        .slice(0, 5),
                    },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Scrolling Marquee Phrase</label>
              <input
                type="text"
                value={draft.marqueePhrase}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, marqueePhrase: e.target.value }))
                }
                className={INPUT_CLASS}
              />
              <p className="mt-2 text-xs text-[#5F4A36]/75">
                Displays continuously across the interactive treatment map silhouette.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {draft.editorialCollage.tiles.map((tile, idx) => (
              <div
                key={tile.id}
                className="space-y-3 border border-[#251C14]/10 bg-white p-5"
              >
                <p className="font-mono text-xs text-[#7A6047]">
                  COLLAGE TILE {String(idx + 1).padStart(2, '0')}
                </p>
                <ImageFieldPicker
                  label="Tile Photography"
                  value={tile.image}
                  onChange={(url) =>
                    setDraft((p) => ({
                      ...p,
                      editorialCollage: {
                        ...p.editorialCollage,
                        tiles: p.editorialCollage.tiles.map((t, i) =>
                          i === idx ? { ...t, image: url } : t
                        ),
                      },
                    }))
                  }
                  mediaAssets={mediaAssets}
                  onUploadToLibrary={onUploadMedia}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLASS}>Caption</label>
                    <input
                      type="text"
                      value={tile.caption}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          editorialCollage: {
                            ...p.editorialCollage,
                            tiles: p.editorialCollage.tiles.map((t, i) =>
                              i === idx ? { ...t, caption: e.target.value } : t
                            ),
                          },
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Alt Text</label>
                    <input
                      type="text"
                      value={tile.alt}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          editorialCollage: {
                            ...p.editorialCollage,
                            tiles: p.editorialCollage.tiles.map((t, i) =>
                              i === idx ? { ...t, alt: e.target.value } : t
                            ),
                          },
                        }))
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive 01-06 Hotspots */}
      {subTab === 'hotspots' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 border border-[#251C14]/10 bg-white p-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className={LABEL_CLASS}>Live Pin Placement Preview</p>
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#251C14]/15 bg-[#251C14]">
                <img
                  src={draft.silhouetteImage}
                  alt="Silhouette preview"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover opacity-85"
                />
                {draft.treatmentZones.map((zone) => (
                  <span
                    key={zone.number}
                    style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-[#251C14]/80 text-[10px] font-medium text-white shadow"
                  >
                    {zone.number}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <ImageFieldPicker
                label="Full-Bleed Silhouette Image"
                value={draft.silhouetteImage}
                onChange={(url) => setDraft((p) => ({ ...p, silhouetteImage: url }))}
                mediaAssets={mediaAssets}
                onUploadToLibrary={onUploadMedia}
              />

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {draft.treatmentZones.map((zone, idx) => (
                  <div
                    key={zone.number}
                    className="space-y-3 border border-[#251C14]/15 bg-[#FBF9F6] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium tracking-[0.14em] uppercase text-[#7A6047]">
                        Pin {zone.number} · {zone.pillar}
                      </span>
                      <span className="font-mono text-[11px] text-[#5F4A36]">
                        X:{zone.xPercent}% / Y:{zone.yPercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS}>Zone Title</label>
                        <input
                          type="text"
                          value={zone.title}
                          onChange={(e) =>
                            setDraft((p) => ({
                              ...p,
                              treatmentZones: p.treatmentZones.map((z, i) =>
                                i === idx ? { ...z, title: e.target.value } : z
                              ),
                            }))
                          }
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Pillar</label>
                        <select
                          value={zone.pillar}
                          onChange={(e) =>
                            setDraft((p) => ({
                              ...p,
                              treatmentZones: p.treatmentZones.map((z, i) =>
                                i === idx
                                  ? { ...z, pillar: e.target.value as ServicePillar }
                                  : z
                              ),
                            }))
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS}>Horizontal Position ({zone.xPercent}%)</label>
                        <input
                          type="range"
                          min={10}
                          max={90}
                          value={zone.xPercent}
                          onChange={(e) =>
                            setDraft((p) => ({
                              ...p,
                              treatmentZones: p.treatmentZones.map((z, i) =>
                                i === idx ? { ...z, xPercent: Number(e.target.value) } : z
                              ),
                            }))
                          }
                          className="w-full accent-[#7A6047]"
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Vertical Position ({zone.yPercent}%)</label>
                        <input
                          type="range"
                          min={10}
                          max={90}
                          value={zone.yPercent}
                          onChange={(e) =>
                            setDraft((p) => ({
                              ...p,
                              treatmentZones: p.treatmentZones.map((z, i) =>
                                i === idx ? { ...z, yPercent: Number(e.target.value) } : z
                              ),
                            }))
                          }
                          className="w-full accent-[#7A6047]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Description</label>
                      <textarea
                        rows={2}
                        value={zone.description}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            treatmentZones: p.treatmentZones.map((z, i) =>
                              i === idx ? { ...z, description: e.target.value } : z
                            ),
                          }))
                        }
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Linked Treatments</label>
                      <div className="flex flex-wrap gap-1.5">
                        {services.map((srv) => {
                          const linked = zone.treatments.some(
                            (t) => t.serviceSlug === srv.slug
                          );
                          return (
                            <button
                              key={srv.slug}
                              type="button"
                              onClick={() =>
                                setDraft((p) => ({
                                  ...p,
                                  treatmentZones: p.treatmentZones.map((z, i) => {
                                    if (i !== idx) return z;
                                    const nextTreatments = linked
                                      ? z.treatments.filter((t) => t.serviceSlug !== srv.slug)
                                      : [
                                          ...z.treatments,
                                          { label: srv.name, serviceSlug: srv.slug },
                                        ];
                                    return { ...z, treatments: nextTreatments };
                                  }),
                                }))
                              }
                              className={`border px-2 py-1 text-[10px] transition-colors cursor-pointer ${
                                linked
                                  ? 'border-[#7A6047] bg-[#7A6047] text-white'
                                  : 'border-[#251C14]/15 bg-white text-[#5F4A36]'
                              }`}
                            >
                              {srv.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalised & Everhouse */}
      {subTab === 'personalised' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
            <h3 className="font-serif text-lg text-[#251C14]">Personalised Services</h3>
            <div>
              <label className={LABEL_CLASS}>Kicker</label>
              <input
                type="text"
                value={draft.personalisedSection.kicker}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    personalisedSection: {
                      ...p.personalisedSection,
                      kicker: e.target.value,
                    },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Title Lines (one per line)</label>
              <textarea
                rows={2}
                value={draft.personalisedSection.titleLines.join('\n')}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    personalisedSection: {
                      ...p.personalisedSection,
                      titleLines: e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean),
                    },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Description</label>
              <textarea
                rows={3}
                value={draft.personalisedSection.description}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    personalisedSection: {
                      ...p.personalisedSection,
                      description: e.target.value,
                    },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>CTA Button Label</label>
              <input
                type="text"
                value={draft.personalisedSection.ctaLabel}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    personalisedSection: {
                      ...p.personalisedSection,
                      ctaLabel: e.target.value,
                    },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <ImageFieldPicker
              label="Facial Mapping Eye Image"
              value={draft.personalisedSection.image}
              onChange={(url) =>
                setDraft((p) => ({
                  ...p,
                  personalisedSection: { ...p.personalisedSection, image: url },
                }))
              }
              mediaAssets={mediaAssets}
              onUploadToLibrary={onUploadMedia}
            />
          </div>

          <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
            <h3 className="font-serif text-lg text-[#251C14]">Everhouse Sanctuary Card</h3>
            <div>
              <label className={LABEL_CLASS}>Sub-Brand Eyebrow</label>
              <input
                type="text"
                value={draft.houseSection.subBrand}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    houseSection: { ...p.houseSection, subBrand: e.target.value },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Heading Lines (one per line)</label>
              <textarea
                rows={2}
                value={draft.houseSection.titleLines.join('\n')}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    houseSection: {
                      ...p.houseSection,
                      titleLines: e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean),
                    },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Description</label>
              <textarea
                rows={3}
                value={draft.houseSection.description}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    houseSection: { ...p.houseSection, description: e.target.value },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>CTA Label</label>
              <input
                type="text"
                value={draft.houseSection.ctaLabel}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    houseSection: { ...p.houseSection, ctaLabel: e.target.value },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <ImageFieldPicker
              label="Full-Bleed Background Image"
              value={draft.houseSection.backgroundImage}
              onChange={(url) =>
                setDraft((p) => ({
                  ...p,
                  houseSection: { ...p.houseSection, backgroundImage: url },
                }))
              }
              mediaAssets={mediaAssets}
              onUploadToLibrary={onUploadMedia}
            />
            <ImageFieldPicker
              label="Card Inset Image"
              value={draft.houseSection.insetImage}
              onChange={(url) =>
                setDraft((p) => ({
                  ...p,
                  houseSection: { ...p.houseSection, insetImage: url },
                }))
              }
              mediaAssets={mediaAssets}
              onUploadToLibrary={onUploadMedia}
            />
          </div>
        </div>
      )}

      {/* Story & Footer Banner */}
      {subTab === 'story' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
            <h3 className="font-serif text-lg text-[#251C14]">Our Story Page</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Eyebrow</label>
                <input
                  type="text"
                  value={draft.story.eyebrow}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, story: { ...p.story, eyebrow: e.target.value } }))
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Headline</label>
                <input
                  type="text"
                  value={draft.story.headline}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, story: { ...p.story, headline: e.target.value } }))
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Lead Paragraph</label>
              <textarea
                rows={3}
                value={draft.story.lead}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, story: { ...p.story, lead: e.target.value } }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <ImageFieldPicker
              label="Primary Story Portrait"
              value={draft.story.heroImage}
              onChange={(url) =>
                setDraft((p) => ({ ...p, story: { ...p.story, heroImage: url } }))
              }
              mediaAssets={mediaAssets}
              onUploadToLibrary={onUploadMedia}
            />
            <ImageFieldPicker
              label="Secondary Studio Texture"
              value={draft.story.secondaryImage}
              onChange={(url) =>
                setDraft((p) => ({ ...p, story: { ...p.story, secondaryImage: url } }))
              }
              mediaAssets={mediaAssets}
              onUploadToLibrary={onUploadMedia}
            />

            <div className="space-y-3 pt-2">
              <p className={LABEL_CLASS}>Studio Philosophy Pillars</p>
              {draft.story.pillars.map((pillar, idx) => (
                <div key={pillar.number} className="space-y-2 border border-[#251C14]/10 bg-[#FBF9F6] p-3">
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        story: {
                          ...p.story,
                          pillars: p.story.pillars.map((pl, i) =>
                            i === idx ? { ...pl, title: e.target.value } : pl
                          ),
                        },
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                  <textarea
                    rows={2}
                    value={pillar.body}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        story: {
                          ...p.story,
                          pillars: p.story.pillars.map((pl, i) =>
                            i === idx ? { ...pl, body: e.target.value } : pl
                          ),
                        },
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border border-[#251C14]/10 bg-white p-6 h-fit">
            <h3 className="font-serif text-lg text-[#251C14]">Closing Footer CTA Banner</h3>
            <div>
              <label className={LABEL_CLASS}>Banner CTA Label</label>
              <input
                type="text"
                value={draft.footerBanner.label}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    footerBanner: { ...p.footerBanner, label: e.target.value },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
            <ImageFieldPicker
              label="Banner Macro Portrait"
              value={draft.footerBanner.image}
              onChange={(url) =>
                setDraft((p) => ({
                  ...p,
                  footerBanner: { ...p.footerBanner, image: url },
                }))
              }
              mediaAssets={mediaAssets}
              onUploadToLibrary={onUploadMedia}
            />
            <div>
              <label className={LABEL_CLASS}>Image Alt Text</label>
              <input
                type="text"
                value={draft.footerBanner.imageAlt}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    footerBanner: { ...p.footerBanner, imageAlt: e.target.value },
                  }))
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
