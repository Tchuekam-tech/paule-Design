import { useEffect, useState } from 'react';
import {
  Instagram,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type { ServiceItem, ServicePillar } from '../../data/siteConfig';
import {
  SERVICE_PILLARS,
  isValidImageSource,
  type EditableSiteSettings,
  type MediaAssetItem,
} from '../../utils/adminHelpers';
import {
  formatInstagramDate,
  isValidInstagramPermalink,
  type InstagramFeedApiResponse,
  type InstagramMediaType,
  type InstagramPostItem,
} from '../../utils/instagramHelpers';
import { ImageFieldPicker } from './ImageFieldPicker';

const INPUT_CLASS =
  'w-full border border-[#251C14]/20 bg-white px-3 py-2 text-xs text-[#251C14] placeholder:text-[#251C14]/40 focus:border-[#7A6047] focus:outline-none';
const LABEL_CLASS =
  'block text-[11px] font-medium tracking-[0.14em] uppercase text-[#5F4A36] mb-1.5';

interface InstagramFeedManagerProps {
  settings: EditableSiteSettings;
  posts: InstagramPostItem[];
  services: ServiceItem[];
  mediaAssets: MediaAssetItem[];
  saving: boolean;
  onSaveSettings: (next: EditableSiteSettings) => Promise<void>;
  onSavePost: (post: InstagramPostItem, order?: number) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onUploadMedia: (dataUrl: string, label: string) => Promise<void>;
}

export function InstagramFeedManager({
  settings,
  posts,
  services,
  mediaAssets,
  saving,
  onSaveSettings,
  onSavePost,
  onDeletePost,
  onUploadMedia,
}: InstagramFeedManagerProps) {
  const [sectionDraft, setSectionDraft] = useState(settings.instagramSection);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<InstagramPostItem | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<{
    checking: boolean;
    connected: boolean;
    source: 'live' | 'curated';
    liveCount: number;
    handle: string | null;
  }>({
    checking: true,
    connected: false,
    source: 'curated',
    liveCount: 0,
    handle: null,
  });

  useEffect(() => {
    setSectionDraft(settings.instagramSection);
  }, [settings.instagramSection]);

  const checkLiveFeed = async (refresh = false) => {
    setLiveStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch(
        `/api/instagram/posts?limit=12${refresh ? '&refresh=1' : ''}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error('Unable to inspect live feed');
      const data = (await res.json()) as InstagramFeedApiResponse;
      setLiveStatus({
        checking: false,
        connected: Boolean(data.connected),
        source: data.source,
        liveCount: Array.isArray(data.posts) ? data.posts.length : 0,
        handle: data.handle,
      });
    } catch {
      setLiveStatus({
        checking: false,
        connected: false,
        source: 'curated',
        liveCount: 0,
        handle: null,
      });
    }
  };

  useEffect(() => {
    void checkLiveFeed(false);
  }, []);

  const handleSaveSectionConfig = async () => {
    setSectionError(null);
    if (!sectionDraft.heading.trim()) {
      setSectionError('Section heading is required.');
      return;
    }
    if (!sectionDraft.handle.trim()) {
      setSectionError('Instagram handle (e.g. @everlash_lash_expert) is required.');
      return;
    }
    if (!sectionDraft.ctaLabel.trim()) {
      setSectionError('CTA link label is required.');
      return;
    }
    await onSaveSettings({
      ...settings,
      instagramSection: {
        ...sectionDraft,
        maxPosts: Math.max(1, Math.min(12, Number(sectionDraft.maxPosts) || 6)),
      },
    });
  };

  const startNewPost = () => {
    setPostError(null);
    setEditing({
      id: `ig-post-${Date.now()}`,
      imageUrl: mediaAssets[0]?.url ?? '',
      caption: '',
      permalink: settings.brand.social.instagram || 'https://www.instagram.com/',
      timestamp: new Date().toISOString(),
      mediaType: 'IMAGE',
      pillar: 'EVERLASH',
      serviceSlug: services[0]?.slug,
      username: sectionDraft.handle.replace(/^@/, ''),
    });
  };

  const handleSavePost = async () => {
    if (!editing) return;
    setPostError(null);
    if (!isValidImageSource(editing.imageUrl)) {
      setPostError('Please select or upload a valid post image.');
      return;
    }
    if (!editing.caption.trim()) {
      setPostError('Please enter a caption for this Instagram post.');
      return;
    }
    const cleanPermalink =
      editing.permalink.trim() ||
      settings.brand.social.instagram ||
      'https://www.instagram.com/';
    if (!isValidInstagramPermalink(cleanPermalink)) {
      setPostError('Post link must be a valid https://www.instagram.com/... URL.');
      return;
    }

    await onSavePost({
      ...editing,
      caption: editing.caption.trim(),
      permalink: cleanPermalink,
      timestamp: editing.timestamp.trim() || new Date().toISOString(),
    });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251C14]/10 pb-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
            Social Showcase ({posts.length} Curated Posts)
          </p>
          <h2 className="font-serif text-2xl text-[#251C14]">
            Instagram Feed & Gallery Manager
          </h2>
        </div>

        <button
          type="button"
          data-testid="add-instagram-post-btn"
          onClick={startNewPost}
          className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white hover:bg-[#5F4A36] transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Add Curated Post</span>
        </button>
      </div>

      {/* Live Graph API Sync Readout */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#7A6047]/30 bg-[#F9F6F1] p-5">
        <div className="flex items-start gap-3.5 max-w-2xl">
          <Instagram className="h-5 w-5 shrink-0 text-[#7A6047] mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs text-[#251C14]">
            <p className="font-medium">
              {liveStatus.checking
                ? 'Checking Instagram Graph API connection...'
                : liveStatus.connected && liveStatus.source === 'live'
                  ? `Live Instagram Graph API Active (${liveStatus.liveCount} posts synced${liveStatus.handle ? ` from ${liveStatus.handle}` : ''})`
                  : 'Curated Studio Feed Active'}
            </p>
            <p className="text-[#5F4A36] leading-relaxed">
              {liveStatus.connected && liveStatus.source === 'live'
                ? 'Your storefront automatically streams your latest Instagram posts via the server proxy, with your curated posts below serving as an instant fallback.'
                : 'Your storefront currently displays the curated Instagram gallery managed below. To stream live Instagram Business/Creator posts automatically, set INSTAGRAM_ACCESS_TOKEN in your deployment environment secrets.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={liveStatus.checking}
          onClick={() => void checkLiveFeed(true)}
          className="inline-flex items-center gap-2 border border-[#251C14]/20 bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#251C14] hover:border-[#7A6047] hover:text-[#7A6047] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${liveStatus.checking ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>Refresh Sync</span>
        </button>
      </div>

      {/* Section Copy & Display Settings */}
      <div className="space-y-4 border border-[#251C14]/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#251C14]/10 pb-3">
          <h3 className="font-serif text-lg text-[#251C14]">Section Header & Layout</h3>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveSectionConfig()}
            className="inline-flex items-center gap-2 bg-[#7A6047] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{saving ? 'Saving...' : 'Save Section Copy'}</span>
          </button>
        </div>

        {sectionError && (
          <p className="text-xs text-red-700" role="alert">
            {sectionError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={LABEL_CLASS}>Eyebrow Label</label>
            <input
              type="text"
              value={sectionDraft.eyebrow}
              onChange={(e) =>
                setSectionDraft((p) => ({ ...p, eyebrow: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Section Heading</label>
            <input
              type="text"
              value={sectionDraft.heading}
              onChange={(e) =>
                setSectionDraft((p) => ({ ...p, heading: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Instagram Handle</label>
            <input
              type="text"
              value={sectionDraft.handle}
              onChange={(e) =>
                setSectionDraft((p) => ({ ...p, handle: e.target.value }))
              }
              placeholder="@everlash_lash_expert"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className={LABEL_CLASS}>Subtitle</label>
            <input
              type="text"
              value={sectionDraft.subtitle}
              onChange={(e) =>
                setSectionDraft((p) => ({ ...p, subtitle: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div className="md:col-span-4">
            <label className={LABEL_CLASS}>Follow CTA Label</label>
            <input
              type="text"
              value={sectionDraft.ctaLabel}
              onChange={(e) =>
                setSectionDraft((p) => ({ ...p, ctaLabel: e.target.value }))
              }
              className={INPUT_CLASS}
            />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLASS}>Posts Shown</label>
            <input
              type="number"
              min={1}
              max={12}
              value={sectionDraft.maxPosts}
              onChange={(e) =>
                setSectionDraft((p) => ({
                  ...p,
                  maxPosts: Math.max(1, Math.min(12, Number(e.target.value) || 6)),
                }))
              }
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>

      {/* Post Editor Drawer */}
      {editing && (
        <div
          data-testid="instagram-post-editor"
          className="space-y-4 border-2 border-[#7A6047] bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-[#251C14]/10 pb-3">
            <h3 className="font-serif text-xl text-[#251C14]">
              {posts.some((p) => p.id === editing.id)
                ? 'Edit Curated Post'
                : 'New Instagram Showcase Post'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close Instagram post editor"
              className="p-1.5 text-[#5F4A36] hover:text-[#251C14] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {postError && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {postError}
            </p>
          )}

          <ImageFieldPicker
            label="Post Photography"
            value={editing.imageUrl}
            onChange={(url) => setEditing({ ...editing, imageUrl: url })}
            mediaAssets={mediaAssets}
            onUploadToLibrary={onUploadMedia}
          />

          <div>
            <label className={LABEL_CLASS}>Post Caption</label>
            <textarea
              rows={3}
              data-testid="instagram-caption-input"
              value={editing.caption}
              onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              placeholder="Write your editorial caption and studio hashtags..."
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Media Format</label>
              <select
                value={editing.mediaType}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    mediaType: e.target.value as InstagramMediaType,
                  })
                }
                className={INPUT_CLASS}
              >
                <option value="IMAGE">Single Photo</option>
                <option value="CAROUSEL_ALBUM">Carousel Album</option>
                <option value="VIDEO">Reel / Video</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Treatment Pillar Tag</label>
              <select
                value={editing.pillar ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    pillar: (e.target.value || undefined) as ServicePillar | undefined,
                  })
                }
                className={INPUT_CLASS}
              >
                <option value="">None</option>
                {SERVICE_PILLARS.map((pl) => (
                  <option key={pl} value={pl}>
                    {pl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>"Book This Look" Service</label>
              <select
                value={editing.serviceSlug ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    serviceSlug: e.target.value || undefined,
                  })
                }
                className={INPUT_CLASS}
              >
                <option value="">General Appointment</option>
                {services.map((srv) => (
                  <option key={srv.slug} value={srv.slug}>
                    {srv.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>Instagram Post Permalink</label>
              <input
                type="url"
                value={editing.permalink}
                onChange={(e) => setEditing({ ...editing, permalink: e.target.value })}
                placeholder="https://www.instagram.com/p/..."
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Published Date (ISO or Label)</label>
              <input
                type="text"
                value={editing.timestamp}
                onChange={(e) => setEditing({ ...editing, timestamp: e.target.value })}
                placeholder="2026-11-20T09:00:00.000Z"
                className={INPUT_CLASS}
              />
            </div>
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
              data-testid="save-instagram-post-btn"
              disabled={saving}
              onClick={() => void handleSavePost()}
              className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{saving ? 'Saving...' : 'Save Post'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Curated Posts Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col overflow-hidden border border-[#251C14]/10 bg-white"
          >
            <div className="aspect-[4/5] w-full overflow-hidden bg-[#EFE9E0]">
              <img
                src={post.imageUrl}
                alt={post.caption.slice(0, 80)}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3 p-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.16em] uppercase text-[#7A6047]">
                  <span>{post.pillar || post.mediaType}</span>
                  <span>{formatInstagramDate(post.timestamp)}</span>
                </div>
                <p className="line-clamp-3 text-xs leading-relaxed text-[#251C14]/85">
                  {post.caption}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-[#251C14]/10 pt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPostError(null);
                    setEditing({ ...post });
                  }}
                  aria-label="Edit Instagram post"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[#5F4A36] hover:text-[#7A6047] cursor-pointer"
                >
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => void onDeletePost(post.id)}
                  aria-label="Delete Instagram post"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[#5F4A36] hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
