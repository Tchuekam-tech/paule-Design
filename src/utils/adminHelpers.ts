import {
  SITE_CONFIG,
  SITE_IMAGES,
  type FaqItem,
  type JournalArticle,
  type ServiceItem,
  type ServicePillar,
  type StudioLocation,
  type TreatmentZone,
} from '../data/siteConfig';
import {
  DEFAULT_INSTAGRAM_POSTS,
  DEFAULT_INSTAGRAM_SECTION,
  type InstagramPostItem,
  type InstagramSectionConfig,
} from './instagramHelpers';

export type HomeSectionId =
  | 'hero'
  | 'arcSlider'
  | 'collage'
  | 'hotspots'
  | 'personalised'
  | 'everhouse'
  | 'instagram'
  | 'faq';

export interface HomeSectionMeta {
  id: HomeSectionId;
  label: string;
  description: string;
}

export const HOME_SECTION_CATALOG: HomeSectionMeta[] = [
  {
    id: 'hero',
    label: 'Full-Viewport Hero',
    description: 'Editorial portrait, masked headline reveal, and scroll prompt',
  },
  {
    id: 'arcSlider',
    label: 'Curved Arc Showcase & Quote',
    description: 'Interactive curved pillar carousel and editorial brand quote',
  },
  {
    id: 'collage',
    label: 'Sticky Dual-Column Collage',
    description: 'Parallax moodboard behind the understated beauty statement',
  },
  {
    id: 'hotspots',
    label: 'Interactive 01–06 Treatment Map',
    description: 'Numbered silhouette pins, scrolling marquee, and treatment detail card',
  },
  {
    id: 'personalised',
    label: 'Personalised Services & Mapping',
    description: 'Character-scrubbed heading paired with animated facial proportion lines',
  },
  {
    id: 'everhouse',
    label: 'Everhouse Sanctuary Feature',
    description: 'Sticky orchid portrait with rising taupe architectural card',
  },
  {
    id: 'instagram',
    label: 'Latest on Instagram Feed',
    description: 'Dynamic live Instagram Graph API or curated studio showcase gallery',
  },
  {
    id: 'faq',
    label: 'Frequently Asked Questions',
    description: 'Expandable editorial FAQ accordion and concierge contact CTA',
  },
];

export interface ArcSlideConfig {
  id: string;
  label: string;
  pillar?: ServicePillar;
  subtitle: string;
  image: string;
}

export interface SiteStructureConfig {
  sectionOrder: HomeSectionId[];
  hiddenSections: HomeSectionId[];
  showPreloader: boolean;
  showFooterContactForm: boolean;
  showFooterBanner: boolean;
}

export interface CollageTileConfig {
  id: string;
  image: string;
  alt: string;
  caption: string;
}

export interface StoryPillarConfig {
  number: string;
  title: string;
  body: string;
}

export interface EditableSiteSettings {
  brand: {
    name: string;
    houseName: string;
    tagline: string;
    phoneDisplay: string;
    phoneHref: string;
    whatsappNumber: string;
    email: string;
    copyright: string;
    social: {
      facebook: string;
      instagram: string;
    };
  };
  hero: {
    headline: string;
    scrollLabel: string;
    image: string;
    imageAlt: string;
  };
  quote: {
    text: string;
    sublabel: string;
  };
  editorialCollage: {
    headingLines: string[];
    tiles: CollageTileConfig[];
  };
  marqueePhrase: string;
  silhouetteImage: string;
  treatmentZones: TreatmentZone[];
  personalisedSection: {
    kicker: string;
    titleLines: string[];
    description: string;
    ctaLabel: string;
    image: string;
    imageAlt: string;
  };
  houseSection: {
    subBrand: string;
    titleLines: string[];
    description: string;
    ctaLabel: string;
    backgroundImage: string;
    insetImage: string;
  };
  story: {
    eyebrow: string;
    headline: string;
    lead: string;
    heroImage: string;
    secondaryImage: string;
    pillars: StoryPillarConfig[];
  };
  footerBanner: {
    label: string;
    image: string;
    imageAlt: string;
  };
  instagramSection: InstagramSectionConfig;
  arcSlides: ArcSlideConfig[];
  structure: SiteStructureConfig;
}

export interface EditableSiteConfig extends EditableSiteSettings {
  services: ServiceItem[];
  locations: StudioLocation[];
  journal: JournalArticle[];
  faqs: FaqItem[];
  instagramPosts: InstagramPostItem[];
}

export type MediaCategory = 'Hero' | 'Editorial' | 'Services' | 'Journal' | 'Sanctuary';

export interface MediaAssetItem {
  id: string;
  label: string;
  category: MediaCategory;
  url: string;
  alt: string;
  builtIn?: boolean;
}

export type InquiryStatus = 'new' | 'contacted' | 'archived';

export interface ClientInquiryItem {
  id: string;
  type: 'contact' | 'booking';
  name: string;
  contact: string;
  message: string;
  serviceName?: string;
  locationName?: string;
  therapistTier?: string;
  preferredDate?: string;
  preferredTime?: string;
  status: InquiryStatus;
  createdAtMs: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string;
  role: 'manager' | 'owner';
}

export const SERVICE_PILLARS: ServicePillar[] = [
  'EVERLASH',
  'EVERBROW',
  'EVERNAILS',
  'EVERWAX',
  'EVER SPMU',
  'EVERBODY',
];

export const DEFAULT_SITE_STRUCTURE: SiteStructureConfig = {
  sectionOrder: [
    'hero',
    'arcSlider',
    'collage',
    'hotspots',
    'personalised',
    'everhouse',
    'instagram',
    'faq',
  ],
  hiddenSections: [],
  showPreloader: true,
  showFooterContactForm: true,
  showFooterBanner: true,
};

export const DEFAULT_ARC_SLIDES: ArcSlideConfig[] = [
  {
    id: 'arc-house',
    label: SITE_CONFIG.brand.houseName,
    subtitle: 'Private Sanctuaries',
    image: SITE_IMAGES.stoneTexture,
  },
  {
    id: 'arc-lash',
    label: 'EVERLASH',
    pillar: 'EVERLASH',
    subtitle: 'Weightless Artistry',
    image: SITE_IMAGES.heroPortrait,
  },
  {
    id: 'arc-brow',
    label: 'EVERBROW',
    pillar: 'EVERBROW',
    subtitle: 'Sculpted Balance',
    image: SITE_IMAGES.personalisedEye,
  },
  {
    id: 'arc-nails',
    label: 'EVERNAILS',
    pillar: 'EVERNAILS',
    subtitle: 'Editorial Finish',
    image: SITE_IMAGES.sculpturalSilhouette,
  },
  {
    id: 'arc-wax',
    label: 'EVERWAX',
    pillar: 'EVERWAX',
    subtitle: 'Botanical Smooth',
    image: SITE_IMAGES.botanicalTexture,
  },
  {
    id: 'arc-spmu',
    label: 'EVER SPMU',
    pillar: 'EVER SPMU',
    subtitle: 'Soft Nano Pigment',
    image: SITE_IMAGES.footerProfileOrchid,
  },
  {
    id: 'arc-body',
    label: 'EVERBODY',
    pillar: 'EVERBODY',
    subtitle: 'Lymphatic Calm',
    image: SITE_IMAGES.everhouseOrchid,
  },
];

export const BUILT_IN_MEDIA_ASSETS: MediaAssetItem[] = [
  {
    id: 'builtin-hero',
    label: 'Hero Editorial Portrait',
    category: 'Hero',
    url: SITE_IMAGES.heroPortrait,
    alt: SITE_CONFIG.hero.imageAlt,
    builtIn: true,
  },
  {
    id: 'builtin-botanical',
    label: 'Dewy Botanical Petal',
    category: 'Editorial',
    url: SITE_IMAGES.botanicalTexture,
    alt: 'Dewy botanical petal macro study',
    builtIn: true,
  },
  {
    id: 'builtin-stone',
    label: 'Raw Travertine Stone',
    category: 'Editorial',
    url: SITE_IMAGES.stoneTexture,
    alt: 'Raw travertine stone texture in warm sepia light',
    builtIn: true,
  },
  {
    id: 'builtin-silhouette',
    label: 'Treatment Map Silhouette',
    category: 'Services',
    url: SITE_IMAGES.sculpturalSilhouette,
    alt: 'Sculptural beauty treatment map portrait',
    builtIn: true,
  },
  {
    id: 'builtin-eye',
    label: 'Sculpted Brow & Lash Macro',
    category: 'Services',
    url: SITE_IMAGES.personalisedEye,
    alt: SITE_CONFIG.personalisedSection.imageAlt,
    builtIn: true,
  },
  {
    id: 'builtin-orchid',
    label: 'Everhouse Orchid Portrait',
    category: 'Sanctuary',
    url: SITE_IMAGES.everhouseOrchid,
    alt: 'Serene spa beauty portrait holding a speckled orchid petal',
    builtIn: true,
  },
  {
    id: 'builtin-footer',
    label: 'Macro Side Profile Orchid',
    category: 'Journal',
    url: SITE_IMAGES.footerProfileOrchid,
    alt: SITE_CONFIG.footerBanner.imageAlt,
    builtIn: true,
  },
];

export function buildDefaultSiteConfig(): EditableSiteConfig {
  return {
    brand: {
      ...SITE_CONFIG.brand,
      social: { ...SITE_CONFIG.brand.social },
    },
    hero: { ...SITE_CONFIG.hero },
    quote: { ...SITE_CONFIG.quote },
    editorialCollage: {
      headingLines: [...SITE_CONFIG.editorialCollage.headingLines],
      tiles: SITE_CONFIG.editorialCollage.tiles.map((t) => ({ ...t })),
    },
    marqueePhrase: SITE_CONFIG.marqueePhrase,
    silhouetteImage: SITE_IMAGES.sculpturalSilhouette,
    treatmentZones: SITE_CONFIG.treatmentZones.map((z) => ({
      ...z,
      treatments: z.treatments.map((t) => ({ ...t })),
    })),
    personalisedSection: {
      ...SITE_CONFIG.personalisedSection,
      titleLines: [...SITE_CONFIG.personalisedSection.titleLines],
    },
    houseSection: {
      ...SITE_CONFIG.houseSection,
      titleLines: [...SITE_CONFIG.houseSection.titleLines],
    },
    story: {
      ...SITE_CONFIG.story,
      heroImage: SITE_IMAGES.everhouseOrchid,
      secondaryImage: SITE_IMAGES.stoneTexture,
      pillars: SITE_CONFIG.story.pillars.map((p) => ({ ...p })),
    },
    footerBanner: { ...SITE_CONFIG.footerBanner },
    instagramSection: { ...DEFAULT_INSTAGRAM_SECTION },
    arcSlides: DEFAULT_ARC_SLIDES.map((s) => ({ ...s })),
    structure: {
      ...DEFAULT_SITE_STRUCTURE,
      sectionOrder: [...DEFAULT_SITE_STRUCTURE.sectionOrder],
      hiddenSections: [...DEFAULT_SITE_STRUCTURE.hiddenSections],
    },
    services: SITE_CONFIG.services.map((s) => ({
      ...s,
      highlights: [...s.highlights],
      aftercare: [...s.aftercare],
    })),
    locations: SITE_CONFIG.locations.map((l) => ({
      ...l,
      servicesAvailable: [...l.servicesAvailable],
    })),
    journal: SITE_CONFIG.journal.map((j) => ({
      ...j,
      body: [...j.body],
    })),
    faqs: SITE_CONFIG.faqs.map((f) => ({
      ...f,
      paragraphs: [...f.paragraphs],
    })),
    instagramPosts: DEFAULT_INSTAGRAM_POSTS.map((p) => ({ ...p })),
  };
}

export function moveItemInArray<T>(
  list: T[],
  index: number,
  direction: 'up' | 'down'
): T[] {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) {
    return [...list];
  }
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

export function toggleSectionVisibility(
  hiddenSections: HomeSectionId[],
  sectionId: HomeSectionId
): HomeSectionId[] {
  if (hiddenSections.includes(sectionId)) {
    return hiddenSections.filter((id) => id !== sectionId);
  }
  return [...hiddenSections, sectionId];
}

export function slugifyTitle(input: string): string {
  const cleaned = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `item-${Date.now()}`;
}

export function isValidImageSource(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 250000) return false;
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/')
  );
}

export function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export function mergeSiteSettings(
  defaults: EditableSiteConfig,
  remote: Partial<EditableSiteSettings> | null | undefined
): EditableSiteSettings {
  if (!remote) {
    return {
      brand: defaults.brand,
      hero: defaults.hero,
      quote: defaults.quote,
      editorialCollage: defaults.editorialCollage,
      marqueePhrase: defaults.marqueePhrase,
      silhouetteImage: defaults.silhouetteImage,
      treatmentZones: defaults.treatmentZones,
      personalisedSection: defaults.personalisedSection,
      houseSection: defaults.houseSection,
      story: defaults.story,
      footerBanner: defaults.footerBanner,
      instagramSection: defaults.instagramSection,
      arcSlides: defaults.arcSlides,
      structure: defaults.structure,
    };
  }

  const validSectionIds = new Set<HomeSectionId>(DEFAULT_SITE_STRUCTURE.sectionOrder);
  const remoteOrder = Array.isArray(remote.structure?.sectionOrder)
    ? remote.structure.sectionOrder.filter((id): id is HomeSectionId =>
        validSectionIds.has(id as HomeSectionId)
      )
    : [];
  // Append any missing section IDs so no section is ever orphaned
  const mergedOrder: HomeSectionId[] = [
    ...remoteOrder,
    ...DEFAULT_SITE_STRUCTURE.sectionOrder.filter((id) => !remoteOrder.includes(id)),
  ];

  const mergedHidden: HomeSectionId[] = Array.isArray(remote.structure?.hiddenSections)
    ? remote.structure.hiddenSections.filter((id): id is HomeSectionId =>
        validSectionIds.has(id as HomeSectionId)
      )
    : [];

  return {
    brand: {
      ...defaults.brand,
      ...(remote.brand ?? {}),
      social: {
        ...defaults.brand.social,
        ...(remote.brand?.social ?? {}),
      },
    },
    hero: { ...defaults.hero, ...(remote.hero ?? {}) },
    quote: { ...defaults.quote, ...(remote.quote ?? {}) },
    editorialCollage: {
      headingLines:
        remote.editorialCollage?.headingLines?.length
          ? remote.editorialCollage.headingLines
          : defaults.editorialCollage.headingLines,
      tiles:
        remote.editorialCollage?.tiles?.length
          ? remote.editorialCollage.tiles
          : defaults.editorialCollage.tiles,
    },
    marqueePhrase: remote.marqueePhrase || defaults.marqueePhrase,
    silhouetteImage: remote.silhouetteImage || defaults.silhouetteImage,
    treatmentZones:
      Array.isArray(remote.treatmentZones) && remote.treatmentZones.length > 0
        ? remote.treatmentZones
        : defaults.treatmentZones,
    personalisedSection: {
      ...defaults.personalisedSection,
      ...(remote.personalisedSection ?? {}),
      titleLines:
        remote.personalisedSection?.titleLines?.length
          ? remote.personalisedSection.titleLines
          : defaults.personalisedSection.titleLines,
    },
    houseSection: {
      ...defaults.houseSection,
      ...(remote.houseSection ?? {}),
      titleLines:
        remote.houseSection?.titleLines?.length
          ? remote.houseSection.titleLines
          : defaults.houseSection.titleLines,
    },
    story: {
      ...defaults.story,
      ...(remote.story ?? {}),
      pillars:
        remote.story?.pillars?.length
          ? remote.story.pillars
          : defaults.story.pillars,
    },
    footerBanner: { ...defaults.footerBanner, ...(remote.footerBanner ?? {}) },
    instagramSection: {
      ...defaults.instagramSection,
      ...(remote.instagramSection ?? {}),
      maxPosts: Math.max(
        1,
        Math.min(12, Number(remote.instagramSection?.maxPosts ?? defaults.instagramSection.maxPosts) || 6)
      ),
    },
    arcSlides:
      Array.isArray(remote.arcSlides) && remote.arcSlides.length > 0
        ? remote.arcSlides
        : defaults.arcSlides,
    structure: {
      sectionOrder: mergedOrder,
      hiddenSections: mergedHidden,
      showPreloader:
        typeof remote.structure?.showPreloader === 'boolean'
          ? remote.structure.showPreloader
          : defaults.structure.showPreloader,
      showFooterContactForm:
        typeof remote.structure?.showFooterContactForm === 'boolean'
          ? remote.structure.showFooterContactForm
          : defaults.structure.showFooterContactForm,
      showFooterBanner:
        typeof remote.structure?.showFooterBanner === 'boolean'
          ? remote.structure.showFooterBanner
          : defaults.structure.showFooterBanner,
    },
  };
}

export interface AdminDashboardStats {
  servicesCount: number;
  locationsCount: number;
  journalCount: number;
  faqsCount: number;
  instagramPostsCount: number;
  mediaCount: number;
  visibleHomeSections: number;
  totalHomeSections: number;
  newInquiriesCount: number;
  totalInquiriesCount: number;
}

export function computeAdminDashboardStats(
  config: EditableSiteConfig,
  inquiries: ClientInquiryItem[],
  mediaCount: number
): AdminDashboardStats {
  const totalHomeSections = config.structure.sectionOrder.length;
  const visibleHomeSections = config.structure.sectionOrder.filter(
    (id) => !config.structure.hiddenSections.includes(id)
  ).length;

  return {
    servicesCount: config.services.length,
    locationsCount: config.locations.length,
    journalCount: config.journal.length,
    faqsCount: config.faqs.length,
    instagramPostsCount: config.instagramPosts.length,
    mediaCount,
    visibleHomeSections,
    totalHomeSections,
    newInquiriesCount: inquiries.filter((inq) => inq.status === 'new').length,
    totalInquiriesCount: inquiries.length,
  };
}
