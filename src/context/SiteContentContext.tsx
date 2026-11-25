import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  OWNER_ADMIN_EMAIL,
  signInManagerWithGoogle,
  signOutManager,
} from '../firebase';
import {
  BUILT_IN_MEDIA_ASSETS,
  buildDefaultSiteConfig,
  clampString,
  mergeSiteSettings,
  slugifyTitle,
  type AdminUserItem,
  type ClientInquiryItem,
  type EditableSiteConfig,
  type EditableSiteSettings,
  type InquiryStatus,
  type MediaAssetItem,
  type MediaCategory,
} from '../utils/adminHelpers';
import type {
  FaqItem,
  JournalArticle,
  ServiceItem,
  StudioLocation,
} from '../data/siteConfig';
import type { InstagramPostItem } from '../utils/instagramHelpers';

interface SiteContentContextValue {
  config: EditableSiteConfig;
  mediaAssets: MediaAssetItem[];
  inquiries: ClientInquiryItem[];
  admins: AdminUserItem[];
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isLocalPreviewAdmin: boolean;
  cloudSynced: boolean;
  saving: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveSettings: (next: EditableSiteSettings) => Promise<void>;
  upsertService: (service: ServiceItem, order?: number) => Promise<void>;
  removeService: (serviceId: string) => Promise<void>;
  upsertLocation: (location: StudioLocation, order?: number) => Promise<void>;
  removeLocation: (locationId: string) => Promise<void>;
  upsertArticle: (article: JournalArticle, order?: number) => Promise<void>;
  removeArticle: (articleId: string) => Promise<void>;
  upsertFaq: (faq: FaqItem, order?: number) => Promise<void>;
  removeFaq: (faqId: string) => Promise<void>;
  upsertInstagramPost: (post: InstagramPostItem, order?: number) => Promise<void>;
  removeInstagramPost: (postId: string) => Promise<void>;
  createMediaAsset: (asset: {
    label: string;
    category: MediaCategory;
    url: string;
    alt: string;
  }) => Promise<MediaAssetItem>;
  removeMediaAsset: (assetId: string) => Promise<void>;
  submitClientInquiry: (payload: {
    type: 'contact' | 'booking';
    name: string;
    contact: string;
    message: string;
    serviceName?: string;
    locationName?: string;
    therapistTier?: string;
    preferredDate?: string;
    preferredTime?: string;
  }) => Promise<void>;
  setInquiryStatus: (inquiryId: string, status: InquiryStatus) => Promise<void>;
  removeInquiry: (inquiryId: string) => Promise<void>;
  grantAdminAccess: (uid: string, email: string, displayName: string) => Promise<void>;
  revokeAdminAccess: (uid: string) => Promise<void>;
  seedAllDefaultsToCloud: () => Promise<void>;
  resetSiteSettingsToDefaults: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function isLocalhostTestPreview(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (!isLocal) return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('adminTest') === '1';
}

function toMillis(ts: unknown): number {
  if (ts && typeof ts === 'object' && 'toMillis' in ts) {
    return (ts as Timestamp).toMillis();
  }
  return Date.now();
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const defaults = useMemo(() => buildDefaultSiteConfig(), []);
  const [localPreviewAdmin] = useState<boolean>(() => isLocalhostTestPreview());

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isListedAdmin, setIsListedAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  const [remoteSettings, setRemoteSettings] = useState<Partial<EditableSiteSettings> | null>(null);
  const [remoteServices, setRemoteServices] = useState<ServiceItem[] | null>(null);
  const [remoteLocations, setRemoteLocations] = useState<StudioLocation[] | null>(null);
  const [remoteJournal, setRemoteJournal] = useState<JournalArticle[] | null>(null);
  const [remoteFaqs, setRemoteFaqs] = useState<FaqItem[] | null>(null);
  const [remoteInstagramPosts, setRemoteInstagramPosts] = useState<InstagramPostItem[] | null>(null);
  const [remoteMedia, setRemoteMedia] = useState<MediaAssetItem[]>([]);
  const [inquiries, setInquiries] = useState<ClientInquiryItem[]>([]);
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [cloudSynced, setCloudSynced] = useState(false);

  // 1. Firebase Auth listener + admin status check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsListedAdmin(false);
        setAuthReady(true);
        return;
      }

      if (nextUser.email === OWNER_ADMIN_EMAIL && nextUser.emailVerified) {
        setIsListedAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', nextUser.uid));
        setIsListedAdmin(adminSnap.exists());
      } catch {
        setIsListedAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  const isOwner = Boolean(
    user && user.email === OWNER_ADMIN_EMAIL && user.emailVerified
  );
  const isAdmin = localPreviewAdmin || isOwner || (Boolean(user?.emailVerified) && isListedAdmin);

  // 2. Public Storefront live Firestore listeners
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'siteSettings', 'main'),
      (snap) => {
        if (snap.exists()) {
          setRemoteSettings(snap.data() as Partial<EditableSiteSettings>);
          setCloudSynced(true);
        }
      },
      (err) => {
        console.warn('siteSettings listener warning:', err.message);
      }
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'services'), orderBy('order', 'asc'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          setRemoteServices(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<ServiceItem, 'id'>),
            }))
          );
          setCloudSynced(true);
        } else {
          setRemoteServices((prev) => (prev !== null ? [] : null));
        }
      },
      (err) => {
        console.warn('services listener warning:', err.message);
      }
    );

    const unsubLocations = onSnapshot(
      query(collection(db, 'locations'), orderBy('order', 'asc'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          setRemoteLocations(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<StudioLocation, 'id'>),
            }))
          );
          setCloudSynced(true);
        } else {
          setRemoteLocations((prev) => (prev !== null ? [] : null));
        }
      },
      (err) => {
        console.warn('locations listener warning:', err.message);
      }
    );

    const unsubJournal = onSnapshot(
      query(collection(db, 'journal'), orderBy('order', 'asc'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          setRemoteJournal(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<JournalArticle, 'id'>),
            }))
          );
          setCloudSynced(true);
        } else {
          setRemoteJournal((prev) => (prev !== null ? [] : null));
        }
      },
      (err) => {
        console.warn('journal listener warning:', err.message);
      }
    );

    const unsubFaqs = onSnapshot(
      query(collection(db, 'faqs'), orderBy('order', 'asc'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          setRemoteFaqs(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<FaqItem, 'id'>),
            }))
          );
          setCloudSynced(true);
        } else {
          setRemoteFaqs((prev) => (prev !== null ? [] : null));
        }
      },
      (err) => {
        console.warn('faqs listener warning:', err.message);
      }
    );

    const unsubInstagramPosts = onSnapshot(
      query(collection(db, 'instagramPosts'), orderBy('order', 'asc'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          setRemoteInstagramPosts(
            snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<InstagramPostItem, 'id'>),
            }))
          );
          setCloudSynced(true);
        } else {
          setRemoteInstagramPosts((prev) => (prev !== null ? [] : null));
        }
      },
      (err) => {
        console.warn('instagramPosts listener warning:', err.message);
      }
    );

    const unsubMedia = onSnapshot(
      query(collection(db, 'mediaAssets'), limit(100)),
      (snap) => {
        setRemoteMedia(
          snap.docs.map((d) => {
            const data = d.data() as {
              label: string;
              category: MediaCategory;
              url: string;
              alt: string;
            };
            return {
              id: d.id,
              label: data.label,
              category: data.category,
              url: data.url,
              alt: data.alt,
              builtIn: false,
            };
          })
        );
      },
      (err) => {
        console.warn('mediaAssets listener warning:', err.message);
      }
    );

    return () => {
      unsubSettings();
      unsubServices();
      unsubLocations();
      unsubJournal();
      unsubFaqs();
      unsubInstagramPosts();
      unsubMedia();
    };
  }, []);

  // 3. Private PII Inquiries & Team Admins listeners (strictly gated on authReady && isOwner)
  useEffect(() => {
    if (!authReady || !isOwner) {
      setInquiries([]);
      setAdmins([]);
      return;
    }

    const unsubInquiries = onSnapshot(
      query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
      (snap) => {
        setInquiries(
          snap.docs.map((d) => {
            const data = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              type: (data.type as 'contact' | 'booking') ?? 'contact',
              name: String(data.name ?? ''),
              contact: String(data.contact ?? ''),
              message: String(data.message ?? ''),
              serviceName: data.serviceName ? String(data.serviceName) : undefined,
              locationName: data.locationName ? String(data.locationName) : undefined,
              therapistTier: data.therapistTier ? String(data.therapistTier) : undefined,
              preferredDate: data.preferredDate ? String(data.preferredDate) : undefined,
              preferredTime: data.preferredTime ? String(data.preferredTime) : undefined,
              status: (data.status as InquiryStatus) ?? 'new',
              createdAtMs: toMillis(data.createdAt),
            };
          })
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'inquiries');
      }
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        setAdmins(
          snap.docs.map((d) => {
            const data = d.data() as {
              email: string;
              displayName: string;
              role: 'manager' | 'owner';
            };
            return {
              id: d.id,
              email: data.email,
              displayName: data.displayName,
              role: data.role,
            };
          })
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'admins');
      }
    );

    return () => {
      unsubInquiries();
      unsubAdmins();
    };
  }, [authReady, isOwner]);

  const config: EditableSiteConfig = useMemo(() => {
    const mergedSettings = mergeSiteSettings(defaults, remoteSettings);
    return {
      ...mergedSettings,
      services: remoteServices ?? defaults.services,
      locations: remoteLocations ?? defaults.locations,
      journal: remoteJournal ?? defaults.journal,
      faqs: remoteFaqs ?? defaults.faqs,
      instagramPosts: remoteInstagramPosts ?? defaults.instagramPosts,
    };
  }, [
    defaults,
    remoteSettings,
    remoteServices,
    remoteLocations,
    remoteJournal,
    remoteFaqs,
    remoteInstagramPosts,
  ]);

  const mediaAssets: MediaAssetItem[] = useMemo(
    () => [...remoteMedia, ...BUILT_IN_MEDIA_ASSETS],
    [remoteMedia]
  );

  const signIn = useCallback(async () => {
    await signInManagerWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await signOutManager();
  }, []);

  const saveSettings = useCallback(
    async (next: EditableSiteSettings) => {
      if (localPreviewAdmin && !user) {
        setRemoteSettings(next);
        return;
      }
      setSaving(true);
      try {
        const payload = {
          brand: {
            name: clampString(next.brand.name, 80) || defaults.brand.name,
            houseName: clampString(next.brand.houseName, 80) || defaults.brand.houseName,
            tagline: clampString(next.brand.tagline, 160),
            phoneDisplay: clampString(next.brand.phoneDisplay, 60),
            phoneHref: clampString(next.brand.phoneHref, 80),
            whatsappNumber: clampString(next.brand.whatsappNumber, 40),
            email: clampString(next.brand.email, 160),
            copyright: clampString(next.brand.copyright, 200),
            social: {
              facebook: clampString(next.brand.social.facebook, 240),
              instagram: clampString(next.brand.social.instagram, 240),
            },
          },
          hero: {
            headline: clampString(next.hero.headline, 160) || defaults.hero.headline,
            scrollLabel: clampString(next.hero.scrollLabel, 80),
            image: next.hero.image.trim().slice(0, 250000),
            imageAlt: clampString(next.hero.imageAlt, 240),
          },
          quote: {
            text: clampString(next.quote.text, 400) || defaults.quote.text,
            sublabel: clampString(next.quote.sublabel, 200),
          },
          editorialCollage: {
            headingLines: next.editorialCollage.headingLines.slice(0, 5),
            tiles: next.editorialCollage.tiles.slice(0, 6),
          },
          marqueePhrase: clampString(next.marqueePhrase, 120) || defaults.marqueePhrase,
          silhouetteImage: next.silhouetteImage.trim().slice(0, 250000),
          treatmentZones: next.treatmentZones.slice(0, 10),
          personalisedSection: {
            ...next.personalisedSection,
            kicker: clampString(next.personalisedSection.kicker, 120),
            description: clampString(next.personalisedSection.description, 800),
            image: next.personalisedSection.image.trim().slice(0, 250000),
          },
          houseSection: {
            ...next.houseSection,
            subBrand: clampString(next.houseSection.subBrand, 80),
            description: clampString(next.houseSection.description, 800),
            backgroundImage: next.houseSection.backgroundImage.trim().slice(0, 250000),
            insetImage: next.houseSection.insetImage.trim().slice(0, 250000),
          },
          story: {
            ...next.story,
            headline: clampString(next.story.headline, 240) || defaults.story.headline,
            lead: clampString(next.story.lead, 1200),
          },
          footerBanner: {
            label: clampString(next.footerBanner.label, 160) || defaults.footerBanner.label,
            image: next.footerBanner.image.trim().slice(0, 250000),
            imageAlt: clampString(next.footerBanner.imageAlt, 240),
          },
          instagramSection: {
            eyebrow: clampString(next.instagramSection.eyebrow, 100),
            heading: clampString(next.instagramSection.heading, 140) || defaults.instagramSection.heading,
            subtitle: clampString(next.instagramSection.subtitle, 400),
            handle: clampString(next.instagramSection.handle, 80) || defaults.instagramSection.handle,
            ctaLabel: clampString(next.instagramSection.ctaLabel, 80) || defaults.instagramSection.ctaLabel,
            maxPosts: Math.max(1, Math.min(12, Math.floor(Number(next.instagramSection.maxPosts) || 6))),
          },
          arcSlides: next.arcSlides.slice(0, 10),
          structure: {
            sectionOrder: next.structure.sectionOrder.slice(0, 10),
            hiddenSections: next.structure.hiddenSections.slice(0, 10),
            showPreloader: Boolean(next.structure.showPreloader),
            showFooterContactForm: Boolean(next.structure.showFooterContactForm),
            showFooterBanner: Boolean(next.structure.showFooterBanner),
          },
          updatedAt: serverTimestamp(),
          updatedBy: clampString(user?.email || user?.uid || 'manager', 200),
        };
        await setDoc(doc(db, 'siteSettings', 'main'), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'siteSettings/main');
      } finally {
        setSaving(false);
      }
    },
    [defaults, localPreviewAdmin, user]
  );

  const upsertService = useCallback(
    async (service: ServiceItem, order?: number) => {
      const safeId = service.id.replace(/[^a-zA-Z0-9_-]/g, '') || `srv-${Date.now()}`;
      const computedOrder =
        order ??
        Math.max(
          0,
          config.services.findIndex((s) => s.id === safeId)
        );
      const safeService: ServiceItem = {
        ...service,
        id: safeId,
        index: clampString(service.index || '001', 10),
        slug: slugifyTitle(service.slug || service.name).slice(0, 120),
        name: clampString(service.name, 120),
        shortDescription: clampString(service.shortDescription, 500),
        fullDescription: clampString(service.fullDescription, 2500),
        duration: clampString(service.duration, 60),
        technicianPrice: clampString(service.technicianPrice, 80),
        stylistPrice: clampString(service.stylistPrice, 80),
        highlights: service.highlights.filter((h) => h.trim()).slice(0, 10),
        aftercare: service.aftercare.filter((a) => a.trim()).slice(0, 10),
        image: service.image.trim().slice(0, 250000),
      };

      if (localPreviewAdmin && !user) {
        setRemoteServices((prev) => {
          const list = prev ?? defaults.services;
          const idx = list.findIndex((s) => s.id === safeId);
          if (idx >= 0) {
            const copy = [...list];
            copy[idx] = safeService;
            return copy;
          }
          return [...list, safeService];
        });
        return;
      }

      setSaving(true);
      try {
        await setDoc(doc(db, 'services', safeId), {
          index: safeService.index,
          slug: safeService.slug,
          name: safeService.name,
          pillar: safeService.pillar,
          shortDescription: safeService.shortDescription,
          fullDescription: safeService.fullDescription,
          duration: safeService.duration,
          technicianPrice: safeService.technicianPrice,
          stylistPrice: safeService.stylistPrice,
          highlights: safeService.highlights,
          aftercare: safeService.aftercare,
          image: safeService.image,
          order: computedOrder >= 0 ? computedOrder : config.services.length,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `services/${safeId}`);
      } finally {
        setSaving(false);
      }
    },
    [config.services, defaults.services, localPreviewAdmin, user]
  );

  const removeService = useCallback(
    async (serviceId: string) => {
      if (localPreviewAdmin && !user) {
        setRemoteServices((prev) => (prev ?? defaults.services).filter((s) => s.id !== serviceId));
        return;
      }
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'services', serviceId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `services/${serviceId}`);
      } finally {
        setSaving(false);
      }
    },
    [defaults.services, localPreviewAdmin, user]
  );

  const upsertLocation = useCallback(
    async (location: StudioLocation, order?: number) => {
      const safeId = location.id.replace(/[^a-zA-Z0-9_-]/g, '') || `loc-${Date.now()}`;
      const existingIdx = config.locations.findIndex((l) => l.id === safeId);
      const safeLocation: StudioLocation = {
        ...location,
        id: safeId,
        name: clampString(location.name, 140),
        city: clampString(location.city, 80),
        district: clampString(location.district, 100),
        address: clampString(location.address, 400),
        hours: clampString(location.hours, 120),
        phone: clampString(location.phone, 60),
        privateRooms: Math.max(0, Math.min(200, Number(location.privateRooms) || 0)),
        servicesAvailable: location.servicesAvailable.slice(0, 6),
        mapNote: clampString(location.mapNote, 240),
      };

      if (localPreviewAdmin && !user) {
        setRemoteLocations((prev) => {
          const list = prev ?? defaults.locations;
          const idx = list.findIndex((l) => l.id === safeId);
          if (idx >= 0) {
            const copy = [...list];
            copy[idx] = safeLocation;
            return copy;
          }
          return [...list, safeLocation];
        });
        return;
      }

      setSaving(true);
      try {
        await setDoc(doc(db, 'locations', safeId), {
          name: safeLocation.name,
          city: safeLocation.city,
          district: safeLocation.district,
          address: safeLocation.address,
          hours: safeLocation.hours,
          phone: safeLocation.phone,
          privateRooms: safeLocation.privateRooms,
          servicesAvailable: safeLocation.servicesAvailable,
          mapNote: safeLocation.mapNote,
          order: order ?? (existingIdx >= 0 ? existingIdx : config.locations.length),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `locations/${safeId}`);
      } finally {
        setSaving(false);
      }
    },
    [config.locations, defaults.locations, localPreviewAdmin, user]
  );

  const removeLocation = useCallback(
    async (locationId: string) => {
      if (localPreviewAdmin && !user) {
        setRemoteLocations((prev) => (prev ?? defaults.locations).filter((l) => l.id !== locationId));
        return;
      }
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'locations', locationId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `locations/${locationId}`);
      } finally {
        setSaving(false);
      }
    },
    [defaults.locations, localPreviewAdmin, user]
  );

  const upsertArticle = useCallback(
    async (article: JournalArticle, order?: number) => {
      const safeId = article.id.replace(/[^a-zA-Z0-9_-]/g, '') || `j-${Date.now()}`;
      const existingIdx = config.journal.findIndex((j) => j.id === safeId);
      const safeBody = article.body.filter((p) => p.trim()).slice(0, 20);
      const safeArticle: JournalArticle = {
        ...article,
        id: safeId,
        slug: slugifyTitle(article.slug || article.title).slice(0, 160),
        title: clampString(article.title, 200),
        category: clampString(article.category, 60) || 'Editorial',
        date: clampString(article.date, 50) || '2025',
        readTime: clampString(article.readTime, 40) || '3 min read',
        excerpt: clampString(article.excerpt, 600),
        image: article.image.trim().slice(0, 250000),
        body: safeBody.length > 0 ? safeBody : [clampString(article.excerpt, 600) || 'Editorial update.'],
      };

      if (localPreviewAdmin && !user) {
        setRemoteJournal((prev) => {
          const list = prev ?? defaults.journal;
          const idx = list.findIndex((j) => j.id === safeId);
          if (idx >= 0) {
            const copy = [...list];
            copy[idx] = safeArticle;
            return copy;
          }
          return [...list, safeArticle];
        });
        return;
      }

      setSaving(true);
      try {
        await setDoc(doc(db, 'journal', safeId), {
          slug: safeArticle.slug,
          title: safeArticle.title,
          category: safeArticle.category,
          date: safeArticle.date,
          readTime: safeArticle.readTime,
          excerpt: safeArticle.excerpt,
          image: safeArticle.image,
          body: safeArticle.body,
          order: order ?? (existingIdx >= 0 ? existingIdx : config.journal.length),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `journal/${safeId}`);
      } finally {
        setSaving(false);
      }
    },
    [config.journal, defaults.journal, localPreviewAdmin, user]
  );

  const removeArticle = useCallback(
    async (articleId: string) => {
      if (localPreviewAdmin && !user) {
        setRemoteJournal((prev) => (prev ?? defaults.journal).filter((j) => j.id !== articleId));
        return;
      }
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'journal', articleId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `journal/${articleId}`);
      } finally {
        setSaving(false);
      }
    },
    [defaults.journal, localPreviewAdmin, user]
  );

  const upsertFaq = useCallback(
    async (faq: FaqItem, order?: number) => {
      const safeId = faq.id.replace(/[^a-zA-Z0-9_-]/g, '') || `faq-${Date.now()}`;
      const existingIdx = config.faqs.findIndex((f) => f.id === safeId);
      const safeParagraphs = faq.paragraphs.filter((p) => p.trim()).slice(0, 10);
      const safeFaq: FaqItem = {
        id: safeId,
        question: clampString(faq.question, 300),
        paragraphs: safeParagraphs.length > 0 ? safeParagraphs : ['Please contact our concierge for details.'],
        hasLocationLink: Boolean(faq.hasLocationLink),
      };

      if (localPreviewAdmin && !user) {
        setRemoteFaqs((prev) => {
          const list = prev ?? defaults.faqs;
          const idx = list.findIndex((f) => f.id === safeId);
          if (idx >= 0) {
            const copy = [...list];
            copy[idx] = safeFaq;
            return copy;
          }
          return [...list, safeFaq];
        });
        return;
      }

      setSaving(true);
      try {
        await setDoc(doc(db, 'faqs', safeId), {
          question: safeFaq.question,
          paragraphs: safeFaq.paragraphs,
          hasLocationLink: Boolean(safeFaq.hasLocationLink),
          order: order ?? (existingIdx >= 0 ? existingIdx : config.faqs.length),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `faqs/${safeId}`);
      } finally {
        setSaving(false);
      }
    },
    [config.faqs, defaults.faqs, localPreviewAdmin, user]
  );

  const removeFaq = useCallback(
    async (faqId: string) => {
      if (localPreviewAdmin && !user) {
        setRemoteFaqs((prev) => (prev ?? defaults.faqs).filter((f) => f.id !== faqId));
        return;
      }
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'faqs', faqId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `faqs/${faqId}`);
      } finally {
        setSaving(false);
      }
    },
    [defaults.faqs, localPreviewAdmin, user]
  );

  const upsertInstagramPost = useCallback(
    async (post: InstagramPostItem, order?: number) => {
      const safeId = post.id.replace(/[^a-zA-Z0-9_-]/g, '') || `ig-${Date.now()}`;
      const existingIdx = config.instagramPosts.findIndex((p) => p.id === safeId);
      const safePost: InstagramPostItem = {
        id: safeId,
        imageUrl: post.imageUrl.trim().slice(0, 250000),
        caption: clampString(post.caption, 1200) || 'Studio highlight',
        permalink: clampString(post.permalink, 500) || config.brand.social.instagram || 'https://www.instagram.com/',
        timestamp: clampString(post.timestamp, 60) || new Date().toISOString(),
        mediaType: post.mediaType === 'VIDEO' || post.mediaType === 'CAROUSEL_ALBUM' ? post.mediaType : 'IMAGE',
        pillar: post.pillar,
        serviceSlug: post.serviceSlug ? slugifyTitle(post.serviceSlug).slice(0, 120) : undefined,
        username: post.username ? clampString(post.username, 60) : undefined,
      };

      if (localPreviewAdmin && !user) {
        setRemoteInstagramPosts((prev) => {
          const list = prev ?? defaults.instagramPosts;
          const idx = list.findIndex((p) => p.id === safeId);
          if (idx >= 0) {
            const copy = [...list];
            copy[idx] = safePost;
            return copy;
          }
          return [safePost, ...list];
        });
        return;
      }

      setSaving(true);
      try {
        const docPayload: Record<string, unknown> = {
          imageUrl: safePost.imageUrl,
          caption: safePost.caption,
          permalink: safePost.permalink,
          timestamp: safePost.timestamp,
          mediaType: safePost.mediaType,
          order: order ?? (existingIdx >= 0 ? existingIdx : 0),
          updatedAt: serverTimestamp(),
        };
        if (safePost.pillar) docPayload.pillar = safePost.pillar;
        if (safePost.serviceSlug) docPayload.serviceSlug = safePost.serviceSlug;
        if (safePost.username) docPayload.username = safePost.username;

        await setDoc(doc(db, 'instagramPosts', safeId), docPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `instagramPosts/${safeId}`);
      } finally {
        setSaving(false);
      }
    },
    [config.brand.social.instagram, config.instagramPosts, defaults.instagramPosts, localPreviewAdmin, user]
  );

  const removeInstagramPost = useCallback(
    async (postId: string) => {
      if (localPreviewAdmin && !user) {
        setRemoteInstagramPosts((prev) =>
          (prev ?? defaults.instagramPosts).filter((p) => p.id !== postId)
        );
        return;
      }
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'instagramPosts', postId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `instagramPosts/${postId}`);
      } finally {
        setSaving(false);
      }
    },
    [defaults.instagramPosts, localPreviewAdmin, user]
  );

  const createMediaAsset = useCallback(
    async (asset: { label: string; category: MediaCategory; url: string; alt: string }) => {
      const safeId = `media-${Date.now()}`;
      const newAsset: MediaAssetItem = {
        id: safeId,
        label: clampString(asset.label, 120) || 'Studio Photo',
        category: asset.category,
        url: asset.url.trim().slice(0, 250000),
        alt: clampString(asset.alt, 240),
        builtIn: false,
      };

      if (localPreviewAdmin && !user) {
        setRemoteMedia((prev) => [newAsset, ...prev]);
        return newAsset;
      }

      setSaving(true);
      try {
        await setDoc(doc(db, 'mediaAssets', safeId), {
          label: newAsset.label,
          category: newAsset.category,
          url: newAsset.url,
          alt: newAsset.alt,
          createdAt: serverTimestamp(),
        });
        return newAsset;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `mediaAssets/${safeId}`);
      } finally {
        setSaving(false);
      }
    },
    [localPreviewAdmin, user]
  );

  const removeMediaAsset = useCallback(
    async (assetId: string) => {
      if (localPreviewAdmin && !user) {
        setRemoteMedia((prev) => prev.filter((m) => m.id !== assetId));
        return;
      }
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'mediaAssets', assetId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `mediaAssets/${assetId}`);
      } finally {
        setSaving(false);
      }
    },
    [localPreviewAdmin, user]
  );

  const submitClientInquiry = useCallback(
    async (payload: {
      type: 'contact' | 'booking';
      name: string;
      contact: string;
      message: string;
      serviceName?: string;
      locationName?: string;
      therapistTier?: string;
      preferredDate?: string;
      preferredTime?: string;
    }) => {
      const safeId = `inq-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const docBody: Record<string, unknown> = {
        type: payload.type,
        name: clampString(payload.name, 120),
        contact: clampString(payload.contact, 160),
        message: clampString(payload.message, 2000),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (payload.serviceName) docBody.serviceName = clampString(payload.serviceName, 140);
      if (payload.locationName) docBody.locationName = clampString(payload.locationName, 140);
      if (payload.therapistTier) docBody.therapistTier = clampString(payload.therapistTier, 40);
      if (payload.preferredDate) docBody.preferredDate = clampString(payload.preferredDate, 40);
      if (payload.preferredTime) docBody.preferredTime = clampString(payload.preferredTime, 40);

      try {
        await setDoc(doc(db, 'inquiries', safeId), docBody);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `inquiries/${safeId}`);
      }
    },
    []
  );

  const setInquiryStatus = useCallback(
    async (inquiryId: string, status: InquiryStatus) => {
      if (localPreviewAdmin && !user) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === inquiryId ? { ...item, status } : item))
        );
        return;
      }
      setSaving(true);
      try {
        await updateDoc(doc(db, 'inquiries', inquiryId), {
          status,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `inquiries/${inquiryId}`);
      } finally {
        setSaving(false);
      }
    },
    [localPreviewAdmin, user]
  );

  const removeInquiry = useCallback(
    async (inquiryId: string) => {
      if (localPreviewAdmin && !user) {
        setInquiries((prev) => prev.filter((item) => item.id !== inquiryId));
        return;
      }
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'inquiries', inquiryId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `inquiries/${inquiryId}`);
      } finally {
        setSaving(false);
      }
    },
    [localPreviewAdmin, user]
  );

  const grantAdminAccess = useCallback(
    async (uid: string, email: string, displayName: string) => {
      const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
      if (!safeUid) throw new Error('Please provide a valid Firebase User UID.');
      setSaving(true);
      try {
        await setDoc(doc(db, 'admins', safeUid), {
          email: clampString(email, 180),
          displayName: clampString(displayName, 120) || 'Salon Manager',
          role: 'manager',
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `admins/${safeUid}`);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const revokeAdminAccess = useCallback(async (uid: string) => {
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'admins', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${uid}`);
    } finally {
      setSaving(false);
    }
  }, []);

  const seedAllDefaultsToCloud = useCallback(async () => {
    if (localPreviewAdmin && !user) {
      setCloudSynced(true);
      return;
    }
    setSaving(true);
    try {
      const batch = writeBatch(db);
      const updatedBy = clampString(user?.email || user?.uid || 'manager', 200);

      batch.set(doc(db, 'siteSettings', 'main'), {
        brand: config.brand,
        hero: config.hero,
        quote: config.quote,
        editorialCollage: config.editorialCollage,
        marqueePhrase: config.marqueePhrase,
        silhouetteImage: config.silhouetteImage,
        treatmentZones: config.treatmentZones,
        personalisedSection: config.personalisedSection,
        houseSection: config.houseSection,
        story: config.story,
        footerBanner: config.footerBanner,
        instagramSection: config.instagramSection,
        arcSlides: config.arcSlides,
        structure: config.structure,
        updatedAt: serverTimestamp(),
        updatedBy,
      });

      config.services.forEach((s, idx) => {
        batch.set(doc(db, 'services', s.id), {
          index: s.index,
          slug: s.slug,
          name: s.name,
          pillar: s.pillar,
          shortDescription: s.shortDescription,
          fullDescription: s.fullDescription,
          duration: s.duration,
          technicianPrice: s.technicianPrice,
          stylistPrice: s.stylistPrice,
          highlights: s.highlights,
          aftercare: s.aftercare,
          image: s.image,
          order: idx,
          updatedAt: serverTimestamp(),
        });
      });

      config.locations.forEach((l, idx) => {
        batch.set(doc(db, 'locations', l.id), {
          name: l.name,
          city: l.city,
          district: l.district,
          address: l.address,
          hours: l.hours,
          phone: l.phone,
          privateRooms: l.privateRooms,
          servicesAvailable: l.servicesAvailable,
          mapNote: l.mapNote,
          order: idx,
          updatedAt: serverTimestamp(),
        });
      });

      config.journal.forEach((j, idx) => {
        batch.set(doc(db, 'journal', j.id), {
          slug: j.slug,
          title: j.title,
          category: j.category,
          date: j.date,
          readTime: j.readTime,
          excerpt: j.excerpt,
          image: j.image,
          body: j.body,
          order: idx,
          updatedAt: serverTimestamp(),
        });
      });

      config.faqs.forEach((f, idx) => {
        batch.set(doc(db, 'faqs', f.id), {
          question: f.question,
          paragraphs: f.paragraphs,
          hasLocationLink: Boolean(f.hasLocationLink),
          order: idx,
          updatedAt: serverTimestamp(),
        });
      });

      config.instagramPosts.forEach((p, idx) => {
        const postDoc: Record<string, unknown> = {
          imageUrl: p.imageUrl,
          caption: p.caption,
          permalink: p.permalink,
          timestamp: p.timestamp,
          mediaType: p.mediaType,
          order: idx,
          updatedAt: serverTimestamp(),
        };
        if (p.pillar) postDoc.pillar = p.pillar;
        if (p.serviceSlug) postDoc.serviceSlug = p.serviceSlug;
        if (p.username) postDoc.username = p.username;
        batch.set(doc(db, 'instagramPosts', p.id), postDoc);
      });

      await batch.commit();
      setCloudSynced(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch-seed');
    } finally {
      setSaving(false);
    }
  }, [config, localPreviewAdmin, user]);

  const resetSiteSettingsToDefaults = useCallback(async () => {
    const fresh = buildDefaultSiteConfig();
    await saveSettings({
      brand: fresh.brand,
      hero: fresh.hero,
      quote: fresh.quote,
      editorialCollage: fresh.editorialCollage,
      marqueePhrase: fresh.marqueePhrase,
      silhouetteImage: fresh.silhouetteImage,
      treatmentZones: fresh.treatmentZones,
      personalisedSection: fresh.personalisedSection,
      houseSection: fresh.houseSection,
      story: fresh.story,
      footerBanner: fresh.footerBanner,
      instagramSection: fresh.instagramSection,
      arcSlides: fresh.arcSlides,
      structure: fresh.structure,
    });
  }, [saveSettings]);

  const value: SiteContentContextValue = {
    config,
    mediaAssets,
    inquiries,
    admins,
    user,
    authReady,
    isAdmin,
    isOwner,
    isLocalPreviewAdmin: localPreviewAdmin && !user,
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
    submitClientInquiry,
    setInquiryStatus,
    removeInquiry,
    grantAdminAccess,
    revokeAdminAccess,
    seedAllDefaultsToCloud,
    resetSiteSettingsToDefaults,
  };

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error('useSiteContent must be used inside SiteContentProvider');
  }
  return ctx;
}
