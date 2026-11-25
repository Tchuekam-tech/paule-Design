import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CloudUpload,
  Image as ImageIcon,
  Inbox,
  Instagram,
  LayoutDashboard,
  Layers,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Palette,
  Scissors,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BrandWordmark } from '../components/BrandWordmark';
import { useSiteContent } from '../context/SiteContentContext';
import { computeAdminDashboardStats } from '../utils/adminHelpers';
import {
  BrandContactEditor,
  HomepageSectionsEditor,
  SiteStructureEditor,
} from '../components/admin/SectionsStructurePanel';
import {
  EditorialFaqManager,
  LocationsManager,
  ServicesManager,
} from '../components/admin/CatalogEditorialPanel';
import {
  InquiriesInbox,
  MediaLibraryManager,
  TeamAccessPanel,
} from '../components/admin/MediaInboxTeamPanel';
import { InstagramFeedManager } from '../components/admin/InstagramFeedManager';
import type { ToastInput } from '../components/Toast';

type AdminTabId =
  | 'overview'
  | 'brand'
  | 'structure'
  | 'sections'
  | 'instagram'
  | 'services'
  | 'locations'
  | 'editorial'
  | 'media'
  | 'inbox'
  | 'team';

interface AdminPageProps {
  onExitAdmin: () => void;
  onNotify: (toast: ToastInput) => void;
}

export function AdminPage({ onExitAdmin, onNotify }: AdminPageProps) {
  const {
    config,
    mediaAssets,
    inquiries,
    admins,
    user,
    authReady,
    isAdmin,
    isOwner,
    isLocalPreviewAdmin,
    cloudSynced,
    saving,
    signIn,
    signOut,
    saveSettings,
    upsertService,
    removeService,
    upsertLocation,
    removeLocation,
    upsertArticle,
    removeArticle,
    upsertFaq,
    removeFaq,
    upsertInstagramPost,
    removeInstagramPost,
    createMediaAsset,
    removeMediaAsset,
    setInquiryStatus,
    removeInquiry,
    grantAdminAccess,
    revokeAdminAccess,
    seedAllDefaultsToCloud,
    resetSiteSettingsToDefaults,
  } = useSiteContent();

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const stats = computeAdminDashboardStats(config, inquiries, mediaAssets.length);

  const runAction = async (fn: () => Promise<void>, title: string, message: string) => {
    try {
      await fn();
      onNotify({ variant: 'success', title, message });
    } catch (err) {
      onNotify({
        variant: 'error',
        title: 'Save Interrupted',
        message: err instanceof Error ? err.message : 'Please check permissions and try again.',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in popup was cancelled or blocked.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  // Loading auth state
  if (!authReady && !isLocalPreviewAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1410] text-[#F9F6F1]">
        <p className="text-xs tracking-[0.24em] uppercase text-white/70">
          Verifying studio session...
        </p>
      </div>
    );
  }

  // Gate 1: Unauthenticated Sign-In Screen
  if (!user && !isLocalPreviewAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1A1410] px-6 py-12 text-[#F9F6F1]">
        <div
          data-testid="admin-auth-gate"
          className="w-full max-w-md space-y-7 border border-white/15 bg-[#251C14] p-8 sm:p-10 shadow-2xl"
        >
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <BrandWordmark size="md" className="text-[#F9F6F1]" />
            </div>
            <p className="text-[11px] tracking-[0.26em] uppercase text-[#D8C7B4]">
              Salon Manager Portal
            </p>
            <h1 className="font-serif text-2xl font-normal text-white">
              Sign in to manage your studio
            </h1>
            <p className="text-xs font-light leading-relaxed text-white/70">
              Update brand identity, homepage layout structure, treatment pricing, photography, locations, FAQs, and client inquiries in real time.
            </p>
          </div>

          {authError && (
            <div className="border border-red-400/40 bg-red-950/40 px-4 py-3 text-xs text-red-200" role="alert">
              {authError}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={signingIn}
              onClick={() => void handleGoogleSignIn()}
              className="flex min-h-12 w-full items-center justify-center gap-3 bg-[#F9F6F1] px-6 py-3 text-xs font-medium tracking-[0.18em] uppercase text-[#251C14] transition-colors hover:bg-white disabled:opacity-50 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{signingIn ? 'Opening Google Sign-In...' : 'Sign In with Google'}</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="flex min-h-11 w-full items-center justify-center gap-2 border border-white/20 px-6 py-2.5 text-xs tracking-[0.16em] uppercase text-white/80 transition-colors hover:border-white hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Return to Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Gate 2: Authenticated non-manager account
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1A1410] px-6 py-12 text-[#F9F6F1]">
        <div className="w-full max-w-lg space-y-6 border border-white/15 bg-[#251C14] p-8 sm:p-10 text-center shadow-2xl">
          <p className="text-[11px] tracking-[0.26em] uppercase text-[#D8C7B4]">
            Access Restricted
          </p>
          <h1 className="font-serif text-2xl text-white">
            Manager authorization required
          </h1>
          <p className="text-xs font-light leading-relaxed text-white/75">
            Signed in as <strong className="text-white">{user?.email}</strong>. Share your Firebase UID below with the studio owner so they can grant you Salon Manager access in Team Access.
          </p>
          <div className="border border-white/15 bg-black/30 px-4 py-3 font-mono text-xs text-[#D8C7B4] select-all">
            {user?.uid}
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => void signOut()}
              className="border border-white/25 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-white hover:bg-white hover:text-[#251C14] transition-colors cursor-pointer"
            >
              Switch Account
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="bg-[#F9F6F1] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#251C14] hover:bg-white transition-colors cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTabId; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'brand', label: 'Brand & Contact', icon: Building2 },
    { id: 'structure', label: 'Site Structure', icon: Layers },
    { id: 'sections', label: 'Page Sections', icon: Palette },
    { id: 'instagram', label: 'Instagram Feed', icon: Instagram },
    { id: 'services', label: 'Services Menu', icon: Scissors },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'editorial', label: 'Journal & FAQs', icon: BookOpen },
    { id: 'media', label: 'Media & Images', icon: ImageIcon },
    { id: 'inbox', label: 'Client Inbox', icon: Inbox, badge: stats.newInquiriesCount },
    { id: 'team', label: 'Team Access', icon: ShieldCheck },
  ];

  const handleUploadHelper = async (dataUrl: string, label: string) => {
    await runAction(
      async () => {
        await createMediaAsset({
          label,
          category: 'Editorial',
          url: dataUrl,
          alt: label,
        });
      },
      'Image Uploaded',
      `"${label}" was saved to your Media Library.`
    );
  };

  return (
    <div
      data-testid="admin-dashboard"
      className="min-h-screen bg-[#F6F2EC] text-[#251C14] flex flex-col lg:flex-row"
    >
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between bg-[#1A1410] px-5 py-4 text-white lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle admin sidebar"
            className="p-1.5 text-white/85"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-serif text-base tracking-[0.12em]">
            {config.brand.name} MANAGER
          </span>
        </div>
        <button
          type="button"
          onClick={onExitAdmin}
          className="text-[11px] uppercase tracking-[0.16em] text-[#D8C7B4]"
        >
          Live Site
        </button>
      </div>

      {/* Left Espresso Sidebar */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } lg:flex lg:w-64 lg:shrink-0 lg:flex-col justify-between bg-[#1A1410] text-[#F9F6F1] border-r border-white/10`}
      >
        <div className="p-6 space-y-8">
          <div className="space-y-1.5">
            <p className="font-serif text-xl tracking-[0.26em] uppercase text-white">
              {config.brand.name}
            </p>
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#D8C7B4]">
              Salon Management Console
            </p>
          </div>

          <nav aria-label="Admin sections" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`admin-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs tracking-[0.1em] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#7A6047] text-white font-medium'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className="bg-[#F9F6F1] px-1.5 py-0.5 text-[10px] font-semibold text-[#251C14]">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-5 space-y-3">
          <div className="text-[11px] text-white/65 truncate">
            {user?.email ?? 'Studio Preview Session'}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onExitAdmin}
              className="flex w-full items-center justify-center gap-2 border border-white/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white/90 hover:bg-white hover:text-[#251C14] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>View Live Website</span>
            </button>
            {user && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex w-full items-center justify-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#251C14]/10 pb-5">
                <div>
                  <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
                    Studio Overview
                  </p>
                  <h1 className="font-serif text-3xl text-[#251C14]">
                    Welcome back, Salon Manager
                  </h1>
                  <p className="mt-1 text-xs text-[#5F4A36]">
                    Edit every headline, layout order, image, treatment, location, and FAQ directly from this workspace.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void runAction(
                      seedAllDefaultsToCloud,
                      'Studio Synced to Cloud',
                      'All current website settings, services, locations, journal posts, and FAQs are persisted in Firestore.'
                    )
                  }
                  className="inline-flex items-center gap-2 bg-[#7A6047] px-5 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white hover:bg-[#5F4A36] disabled:opacity-50 cursor-pointer"
                >
                  <CloudUpload className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {cloudSynced ? 'Sync All to Cloud' : 'Initialize Cloud Database'}
                  </span>
                </button>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: 'Services', value: stats.servicesCount, tab: 'services' as AdminTabId },
                  { label: 'Locations', value: stats.locationsCount, tab: 'locations' as AdminTabId },
                  { label: 'Instagram', value: stats.instagramPostsCount, tab: 'instagram' as AdminTabId },
                  { label: 'Journal', value: stats.journalCount, tab: 'editorial' as AdminTabId },
                  { label: 'Media', value: stats.mediaCount, tab: 'media' as AdminTabId },
                  { label: 'New Inbox', value: stats.newInquiriesCount, tab: 'inbox' as AdminTabId },
                ].map((kpi) => (
                  <button
                    key={kpi.label}
                    type="button"
                    onClick={() => setActiveTab(kpi.tab)}
                    className="border border-[#251C14]/10 bg-white p-4 text-left transition-all hover:border-[#7A6047] cursor-pointer"
                  >
                    <p className="text-[10px] tracking-[0.18em] uppercase text-[#7A6047]">
                      {kpi.label}
                    </p>
                    <p className="mt-2 font-serif text-3xl text-[#251C14]">{kpi.value}</p>
                  </button>
                ))}
              </div>

              {/* Quick Launch Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    title: 'Brand & Contact',
                    desc: 'Swap brand name, phone, WhatsApp booking number, email, and social links.',
                    tab: 'brand' as AdminTabId,
                  },
                  {
                    title: 'Website Structure',
                    desc: `${stats.visibleHomeSections} of ${stats.totalHomeSections} homepage sections currently visible. Reorder or hide any section.`,
                    tab: 'structure' as AdminTabId,
                  },
                  {
                    title: 'Images & Photography',
                    desc: 'Upload studio photos from your device or update Hero, Collage, and Service imagery.',
                    tab: 'media' as AdminTabId,
                  },
                ].map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => setActiveTab(card.tab)}
                    className="border border-[#251C14]/10 bg-white p-6 text-left space-y-2 transition-all hover:border-[#7A6047] cursor-pointer"
                  >
                    <h2 className="font-serif text-xl text-[#251C14]">{card.title}</h2>
                    <p className="text-xs leading-relaxed text-[#5F4A36]/85">{card.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'brand' && (
            <BrandContactEditor
              settings={config}
              saving={saving}
              onSave={(next) =>
                runAction(
                  () => saveSettings(next),
                  'Brand Updated',
                  'Your salon identity and contact details are now live.'
                )
              }
            />
          )}

          {activeTab === 'structure' && (
            <SiteStructureEditor
              settings={config}
              saving={saving}
              onSave={(next) =>
                runAction(
                  () => saveSettings(next),
                  'Structure Saved',
                  'Homepage section order and visibility toggles have been updated.'
                )
              }
              onResetDefaults={() =>
                runAction(
                  resetSiteSettingsToDefaults,
                  'Defaults Restored',
                  'Global site settings and homepage layout were reset to studio defaults.'
                )
              }
            />
          )}

          {activeTab === 'sections' && (
            <HomepageSectionsEditor
              settings={config}
              services={config.services}
              mediaAssets={mediaAssets}
              saving={saving}
              onSave={(next) =>
                runAction(
                  () => saveSettings(next),
                  'Sections Updated',
                  'Homepage and Our Story content changes are now live.'
                )
              }
              onUploadMedia={handleUploadHelper}
            />
          )}

          {activeTab === 'instagram' && (
            <InstagramFeedManager
              settings={config}
              posts={config.instagramPosts}
              services={config.services}
              mediaAssets={mediaAssets}
              saving={saving}
              onSaveSettings={(next) =>
                runAction(
                  () => saveSettings(next),
                  'Instagram Section Updated',
                  'Your Instagram section heading, handle, and display count are now live.'
                )
              }
              onSavePost={(post, ord) =>
                runAction(
                  () => upsertInstagramPost(post, ord),
                  'Instagram Post Saved',
                  'Your studio Instagram showcase has been updated.'
                )
              }
              onDeletePost={(id) =>
                runAction(
                  () => removeInstagramPost(id),
                  'Instagram Post Removed',
                  'The post was removed from your curated Instagram showcase.'
                )
              }
              onUploadMedia={handleUploadHelper}
            />
          )}

          {activeTab === 'services' && (
            <ServicesManager
              services={config.services}
              mediaAssets={mediaAssets}
              saving={saving}
              onSaveService={(srv, ord) =>
                runAction(
                  () => upsertService(srv, ord),
                  'Treatment Saved',
                  `"${srv.name}" has been updated in your salon menu.`
                )
              }
              onDeleteService={(id) =>
                runAction(
                  () => removeService(id),
                  'Treatment Removed',
                  'The treatment was removed from your salon menu.'
                )
              }
              onUploadMedia={handleUploadHelper}
            />
          )}

          {activeTab === 'locations' && (
            <LocationsManager
              locations={config.locations}
              saving={saving}
              onSaveLocation={(loc, ord) =>
                runAction(
                  () => upsertLocation(loc, ord),
                  'Location Saved',
                  `"${loc.name}" has been updated in your sanctuary directory.`
                )
              }
              onDeleteLocation={(id) =>
                runAction(
                  () => removeLocation(id),
                  'Location Removed',
                  'The branch was removed from your locations directory.'
                )
              }
            />
          )}

          {activeTab === 'editorial' && (
            <EditorialFaqManager
              journal={config.journal}
              faqs={config.faqs}
              mediaAssets={mediaAssets}
              saving={saving}
              onSaveArticle={(art) =>
                runAction(
                  () => upsertArticle(art),
                  'Article Published',
                  `"${art.title}" is now live in the Editorial Journal.`
                )
              }
              onDeleteArticle={(id) =>
                runAction(
                  () => removeArticle(id),
                  'Article Deleted',
                  'The journal article was removed.'
                )
              }
              onSaveFaq={(faq) =>
                runAction(
                  () => upsertFaq(faq),
                  'FAQ Saved',
                  'Your FAQ accordion has been updated.'
                )
              }
              onDeleteFaq={(id) =>
                runAction(
                  () => removeFaq(id),
                  'FAQ Deleted',
                  'The FAQ entry was removed.'
                )
              }
              onUploadMedia={handleUploadHelper}
            />
          )}

          {activeTab === 'media' && (
            <MediaLibraryManager
              mediaAssets={mediaAssets}
              saving={saving}
              onAddMedia={(asset) =>
                runAction(
                  async () => {
                    await createMediaAsset(asset);
                  },
                  'Media Added',
                  `"${asset.label}" is ready to use across the website.`
                )
              }
              onDeleteMedia={(id) =>
                runAction(
                  () => removeMediaAsset(id),
                  'Media Deleted',
                  'The asset was removed from your Media Library.'
                )
              }
            />
          )}

          {activeTab === 'inbox' && (
            <InquiriesInbox
              inquiries={inquiries}
              canListInquiries={isOwner || isLocalPreviewAdmin}
              onUpdateStatus={(id, status) =>
                runAction(
                  () => setInquiryStatus(id, status),
                  'Status Updated',
                  `Inquiry marked as ${status}.`
                )
              }
              onDeleteInquiry={(id) =>
                runAction(
                  () => removeInquiry(id),
                  'Inquiry Deleted',
                  'The inquiry was removed from the inbox.'
                )
              }
            />
          )}

          {activeTab === 'team' && (
            <TeamAccessPanel
              admins={admins}
              isOwner={isOwner}
              saving={saving}
              onGrantAdmin={(uid, email, name) =>
                runAction(
                  () => grantAdminAccess(uid, email, name),
                  'Manager Authorized',
                  `${email} now has access to the Salon Management Console.`
                )
              }
              onRevokeAdmin={(uid) =>
                runAction(
                  () => revokeAdminAccess(uid),
                  'Access Revoked',
                  'Manager access has been removed.'
                )
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
