/**
 * ============================================================================
 * CENTRALIZED SITE CONFIGURATION — SWAP YOUR BUSINESS INFO HERE
 * ============================================================================
 * Every headline, brand name, phone number, WhatsApp number, service menu,
 * studio location, FAQ, journal post, and image path is defined in this file.
 * Edit values below to personalize the entire site in minutes.
 */

export type ServicePillar =
  | 'EVERLASH'
  | 'EVERBROW'
  | 'EVERNAILS'
  | 'EVERWAX'
  | 'EVER SPMU'
  | 'EVERBODY';

export interface ServiceItem {
  id: string;
  index: string;
  slug: string;
  name: string;
  pillar: ServicePillar;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  technicianPrice: string;
  stylistPrice: string;
  highlights: string[];
  aftercare: string[];
  image: string;
}

export interface TreatmentZone {
  number: string;
  pillar: ServicePillar;
  title: string;
  description: string;
  xPercent: number;
  yPercent: number;
  treatments: { label: string; serviceSlug: string }[];
}

export interface StudioLocation {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  hours: string;
  phone: string;
  privateRooms: number;
  servicesAvailable: ServicePillar[];
  mapNote: string;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  body: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  paragraphs: string[];
  hasLocationLink?: boolean;
}

export const SITE_IMAGES = {
  heroPortrait: '/src/assets/images/hero_ever_portrait_1795142241899.jpg',
  botanicalTexture: '/src/assets/images/collage_textures_botanical_1795142242276.jpg',
  stoneTexture: '/src/assets/images/collage_textures_stone_1795142243775.jpg',
  sculpturalSilhouette: '/src/assets/images/silhouette_all_services_1795142242831.jpg',
  personalisedEye: '/src/assets/images/personalised_brow_eye_1795142242836.jpg',
  everhouseOrchid: '/src/assets/images/everhouse_orchid_portrait_1795142243496.jpg',
  footerProfileOrchid: '/src/assets/images/footer_profile_orchid_1795142241356.jpg',
} as const;

export const SITE_CONFIG = {
  brand: {
    name: 'Paule Beauty',
    houseName: 'PAULE BEAUTY',
    tagline: 'Beauty in every detail',
    phoneDisplay: '+62 21 5098 0398',
    phoneHref: 'tel:+622150980398',
    whatsappNumber: '628211218069',
    email: 'concierge@ever.co.id',
    copyright: '© 2025 Paule Beauty. All rights reserved.',
    social: {
      facebook: 'https://www.facebook.com/everlash.id',
      instagram: 'https://www.instagram.com/everlash_lash_expert/',
    },
  },

  hero: {
    headline: 'Beauty in every detail',
    scrollLabel: 'SCROLL TO EXPLORE',
    image: SITE_IMAGES.heroPortrait,
    imageAlt: 'Close-up editorial portrait highlighting natural sculpted brows and delicate lashes',
  },

  quote: {
    text: '“ Your beauty is celebrated through every precise touch. ”',
    sublabel: 'Thoughtful artistry, private sanctuaries, unhurried craft',
  },

  editorialCollage: {
    headingLines: ['THE ART OF', 'UNDERSTATED', 'BEAUTY'],
    tiles: [
      {
        id: 'stone-left',
        image: SITE_IMAGES.stoneTexture,
        alt: 'Raw travertine stone texture in warm sepia light',
        caption: 'Mineral Calm',
      },
      {
        id: 'botanical-bottom',
        image: SITE_IMAGES.botanicalTexture,
        alt: 'Dewy botanical petal macro study',
        caption: 'Dew & Balance',
      },
      {
        id: 'portrait-right',
        image: SITE_IMAGES.everhouseOrchid,
        alt: 'Serene botanical portrait with orchid',
        caption: 'Quiet Precision',
      },
      {
        id: 'eye-corner',
        image: SITE_IMAGES.personalisedEye,
        alt: 'Natural lash and brow craftsmanship study',
        caption: 'Tailored Form',
      },
    ],
  },

  marqueePhrase: 'PAULE BEAUTY · BEAUTY IN EVERY DETAIL',

  treatmentZones: [
    {
      number: '01',
      pillar: 'EVERLASH',
      title: 'Everlash',
      description:
        'Lashes that sit effortlessly, yet make all the difference. Designed to flatter the natural shape of your eyes, each set is applied with precision—whether soft and subtle or full and bold. Light as air, lasting as long as you need.',
      xPercent: 41,
      yPercent: 34,
      treatments: [
        { label: 'Stem Cell Lash Regrowth', serviceSlug: 'stem-cell-lash-regrowth' },
        { label: 'Keratiné Filler Lift', serviceSlug: 'keratine-filler-lift' },
        { label: 'Lash Extension', serviceSlug: 'lash-extension' },
      ],
    },
    {
      number: '02',
      pillar: 'EVERBROW',
      title: 'Everbrow',
      description:
        'Brows, but better. Subtle lifts, soft arches, and defined lines—crafted to frame your face naturally. From threading and waxing to the signature Brow Bomber, each technique is tailored to create balance without looking overdone.',
      xPercent: 56,
      yPercent: 25,
      treatments: [
        { label: 'Brow Bomber', serviceSlug: 'brow-bomber' },
        { label: 'Brow & Face Threading', serviceSlug: 'brow-face-threading' },
        { label: 'Waxing', serviceSlug: 'waxing' },
      ],
    },
    {
      number: '03',
      pillar: 'EVERNAILS',
      title: 'Evernails',
      description:
        'Clean cuticle care, architectural shaping, and understated editorial finishes. Whether you prefer sheer neutral gloss or bespoke minimalist nail art, every session protects natural nail strength.',
      xPercent: 40,
      yPercent: 60,
      treatments: [
        { label: 'Manicure', serviceSlug: 'manicure' },
        { label: 'Nail Art', serviceSlug: 'nail-art' },
        { label: 'Pedicure', serviceSlug: 'pedicure' },
      ],
    },
    {
      number: '04',
      pillar: 'EVERWAX',
      title: 'Everwax',
      description:
        'Gentle low-temperature hard and soft wax formulations selected for sensitive skin. Performed in serene private suites with strict single-use hygiene protocols for smooth, calm results.',
      xPercent: 60,
      yPercent: 41,
      treatments: [
        { label: 'Waxing', serviceSlug: 'waxing' },
        { label: 'Brow & Face Threading', serviceSlug: 'brow-face-threading' },
      ],
    },
    {
      number: '05',
      pillar: 'EVER SPMU',
      title: 'Ever SPMU',
      description:
        'Refined semi-permanent pigment artistry designed to age gracefully. Nano hair-stroke brows and sheer botanical lip blush calibrated to your skin undertone for effortless mornings.',
      xPercent: 50,
      yPercent: 50,
      treatments: [
        { label: 'Semi Permanent Make Up', serviceSlug: 'semi-permanent-makeup' },
      ],
    },
    {
      number: '06',
      pillar: 'EVERBODY',
      title: 'Everbody',
      description:
        'Restorative touch for body and nervous system. Signature lymphatic sculpting, wood therapy contouring, and prenatal calm rituals delivered in warm, quiet private treatment rooms.',
      xPercent: 72,
      yPercent: 76,
      treatments: [
        { label: 'Everbody', serviceSlug: 'ever-body' },
      ],
    },
  ] as TreatmentZone[],

  personalisedSection: {
    kicker: 'ENDLESS POSSIBILITY WITH',
    titleLines: ['PERSONALISED', 'SERVICES'],
    description:
      'At Paule Beauty, no detail is overlooked. Each service is carefully crafted to complement your natural features—because true beauty is personal.',
    ctaLabel: 'CHECK ALL SERVICES',
    image: SITE_IMAGES.personalisedEye,
    imageAlt: 'Precision facial proportion mapping over sculpted eyebrow and lifted lashes',
  },

  houseSection: {
    subBrand: 'PAULE BEAUTY',
    titleLines: ['YOUR MOMENT OF GLOW', 'BEGINS HERE'],
    description:
      'Let’s make this about you. A quiet moment for thoughtful treatments designed to restore balance and highlight your natural charm. Because feeling good starts here.',
    ctaLabel: 'FIND US',
    backgroundImage: SITE_IMAGES.everhouseOrchid,
    insetImage: SITE_IMAGES.everhouseOrchid,
  },

  services: [
    {
      id: 'srv-1',
      index: '001',
      slug: 'lash-extension',
      name: 'Lash Extension',
      pillar: 'EVERLASH',
      shortDescription:
        'Weightless single-strand and artisan volume extensions mapped to your unique eye symmetry.',
      fullDescription:
        'Every lash set begins with an architectural consultation examining your natural lash strength, curl pattern, and eye shape. We isolate each natural lash individually—never sticking lashes together or placing weight on the eyelid—to protect long-term lash health.',
      duration: '90 – 120 mins',
      technicianPrice: 'IDR 480,000',
      stylistPrice: 'IDR 680,000',
      highlights: [
        'Custom eye-shape mapping (Natural Classic, Wispy, MangaLash, Foxy)',
        'Medical-grade low-fume adhesive & ultra-lightweight silk fibers',
        'Weekly infill retouch pricing available across all Everhouse branches',
      ],
      aftercare: [
        'Keep lashes dry and avoid steam for the first 24 hours.',
        'Brush gently each morning with a clean spoolie wand.',
        'Avoid oil-based eye makeup removers along the lash line.',
      ],
      image: SITE_IMAGES.heroPortrait,
    },
    {
      id: 'srv-2',
      index: '002',
      slug: 'keratine-filler-lift',
      name: 'Keratiné Filler Lift',
      pillar: 'EVERLASH',
      shortDescription:
        'Nourishing keratin lift and botanical filler treatment that curls and thickens natural lashes.',
      fullDescription:
        'Our signature Italian-formulated keratin filler lift elevates your natural lashes from the root while infusing hydrolyzed keratin, peptides, and botanical lipids to increase strand diameter by up to 24% across cumulative sessions.',
      duration: '75 mins',
      technicianPrice: 'IDR 450,000',
      stylistPrice: 'IDR 560,000',
      highlights: [
        'Zero extensions required—enhances 100% of your natural lashes',
        'Includes conditioning black tint & peptide serum seal',
        'Effortless curl retention lasting 6 to 8 weeks',
      ],
      aftercare: [
        'Avoid water, swimming, or mascara for 24 hours post-treatment.',
        'Sleep on your back the first night to preserve curl alignment.',
      ],
      image: SITE_IMAGES.personalisedEye,
    },
    {
      id: 'srv-3',
      index: '003',
      slug: 'stem-cell-lash-regrowth',
      name: 'Stem Cell Lash Regrowth',
      pillar: 'EVERLASH',
      shortDescription:
        'Follicle-reviving peptide and botanical stem-cell infusion for sparse or recovering lashes.',
      fullDescription:
        'Designed for clients recovering from over-processed lashes or naturally sparse growth. Gentle micro-infusion stimulates dormant follicles with concentrated plant stem cells and biotin complexes for visibly denser, resilient lashes.',
      duration: '60 mins',
      technicianPrice: 'IDR 620,000',
      stylistPrice: 'IDR 790,000',
      highlights: [
        'Non-invasive follicular nourishment with zero downtime',
        'Ideal series of 3–4 sessions spaced every 3 weeks',
        'Safe to pair with Keratiné Filler Lift between cycles',
      ],
      aftercare: [
        'Avoid rubbing eyes or applying heavy serums for 12 hours.',
        'Maintain hydration with recommended daily lash essence.',
      ],
      image: SITE_IMAGES.botanicalTexture,
    },
    {
      id: 'srv-4',
      index: '004',
      slug: 'brow-bomber',
      name: 'Brow Bomber',
      pillar: 'EVERBROW',
      shortDescription:
        'Feathered brow lamination with nourishing argan and macadamia butter restructuring.',
      fullDescription:
        'Brow Bomber softens unruly brow hairs and sets them into a lifted, sculpted arch tailored to your bone structure. Finished with precision mapping, gentle shaping, and a restorative botanical butter mask.',
      duration: '60 mins',
      technicianPrice: 'IDR 420,000',
      stylistPrice: 'IDR 540,000',
      highlights: [
        'Includes golden-ratio brow mapping & customized tint',
        'Enriched with nourishing botanical oils to keep hairs supple',
        'Fluffy, effortless symmetry lasting 5 to 7 weeks',
      ],
      aftercare: [
        'Avoid wetting brows or applying exfoliants for 24 hours.',
        'Comb upward lightly after cleansing to maintain feathery lift.',
      ],
      image: SITE_IMAGES.personalisedEye,
    },
    {
      id: 'srv-5',
      index: '005',
      slug: 'brow-face-threading',
      name: 'Brow & Face Threading',
      pillar: 'EVERBROW',
      shortDescription:
        'Clean, chemical-free organic cotton threading for crisp brow definition and smooth skin.',
      fullDescription:
        'Performed with pure antibacterial organic cotton thread, our threading technique removes even the finest vellus hair cleanly from the follicle without tugging delicate skin—followed by a cooling botanical compress.',
      duration: '30 – 45 mins',
      technicianPrice: 'IDR 165,000',
      stylistPrice: 'IDR 225,000',
      highlights: [
        'Ideal for sensitive or retinoid-treated skin',
        'Tailored symmetry mapping before removing a single hair',
        'Includes soothing aloe & chamomile finish',
      ],
      aftercare: [
        'Avoid active acids or heavy foundation on threaded zones for 12 hours.',
      ],
      image: SITE_IMAGES.stoneTexture,
    },
    {
      id: 'srv-6',
      index: '006',
      slug: 'manicure',
      name: 'Manicure',
      pillar: 'EVERNAILS',
      shortDescription:
        'Precision Russian-inspired cuticle refinement and high-gloss Japanese soft gel care.',
      fullDescription:
        'Our signature manicure pairs gentle dry cuticle refinement with breathable, soak-off Japanese gel formulas in curated sheer nudes, warm taupes, and classic espresso tones.',
      duration: '60 – 75 mins',
      technicianPrice: 'IDR 280,000',
      stylistPrice: 'IDR 360,000',
      highlights: [
        'Hospital-grade autoclave tool sterilization for every guest',
        'Strengthening builder base option for thin or peeling nails',
        'Warm towel aromatherapy hand massage included',
      ],
      aftercare: [
        'Apply cuticle oil nightly to preserve flexibility and gloss.',
        'Wear gloves when handling household detergents.',
      ],
      image: SITE_IMAGES.sculpturalSilhouette,
    },
    {
      id: 'srv-7',
      index: '007',
      slug: 'nail-art',
      name: 'Nail Art',
      pillar: 'EVERNAILS',
      shortDescription:
        'Understated editorial nail design—cat-eye velvet, glazed chrome, micro-French, and tonal art.',
      fullDescription:
        'From barely-there micro-French tips to luminous velvet cat-eye gradients and fine hand-painted botanicals, our nail stylists design bespoke accents that complement your personal wardrobe.',
      duration: '90 – 120 mins',
      technicianPrice: 'IDR 390,000',
      stylistPrice: 'IDR 520,000',
      highlights: [
        'Bring inspiration photos for bespoke color and texture matching',
        'Japanese & Korean non-yellowing top coats for 3–4 week wear',
        'Gentle soak-off removal that protects natural nail plates',
      ],
      aftercare: [
        'Avoid using nails as tools to prevent micro-lifting at tips.',
      ],
      image: SITE_IMAGES.sculpturalSilhouette,
    },
    {
      id: 'srv-8',
      index: '008',
      slug: 'pedicure',
      name: 'Pedicure',
      pillar: 'EVERNAILS',
      shortDescription:
        'Restorative spa pedicure with gentle exfoliation, callus smoothing, and sheer gel polish.',
      fullDescription:
        'Unwind in a private reclining suite while we restore tired feet with mineral salt soak, meticulous cuticle grooming, botanical sugar exfoliation, deep hydration wrap, and luminous polish.',
      duration: '75 mins',
      technicianPrice: 'IDR 340,000',
      stylistPrice: 'IDR 430,000',
      highlights: [
        'Single-use liners and fully autoclaved stainless instruments',
        'Botanical hydration mask and tension-relieving foot massage',
        'Available in breathable lacquer or long-wear gel finish',
      ],
      aftercare: [
        'Hydrate heels daily with unscented barrier balm.',
      ],
      image: SITE_IMAGES.stoneTexture,
    },
    {
      id: 'srv-9',
      index: '009',
      slug: 'waxing',
      name: 'Waxing',
      pillar: 'EVERWAX',
      shortDescription:
        'Low-temperature soothing resin wax for brow, face, underarms, and full body in private suites.',
      fullDescription:
        'Formulated with chamomile and azulene for minimal redness, our no-double-dip waxing rituals leave skin velvety smooth. Every treatment takes place in an enclosed private room with disposable linens.',
      duration: '20 – 60 mins',
      technicianPrice: 'IDR 150,000 – 480,000',
      stylistPrice: 'IDR 195,000 – 560,000',
      highlights: [
        'Strict zero-double-dip spatula standard',
        'Pre-wax botanical barrier oil to protect skin integrity',
        'Cooling post-wax calming serum to minimize redness',
      ],
      aftercare: [
        'Avoid hot baths, saunas, and intense workouts for 24 hours.',
        'Begin gentle exfoliation 48 hours after treatment.',
      ],
      image: SITE_IMAGES.botanicalTexture,
    },
    {
      id: 'srv-10',
      index: '010',
      slug: 'semi-permanent-makeup',
      name: 'Semi Permanent Make Up',
      pillar: 'EVER SPMU',
      shortDescription:
        'Natural nano-stroke brows and sheer velvet lip blush tailored to your undertone.',
      fullDescription:
        'Our senior SPMU artists use ultra-fine single needles and EU-certified organic pigments that fade softly without shifting harsh tones. Includes comprehensive symmetry design and numbing comfort.',
      duration: '150 – 180 mins',
      technicianPrice: 'Stylist Exclusive',
      stylistPrice: 'IDR 3,800,000',
      highlights: [
        'Available for Nano Hairstroke Brows, Soft Powder Brows, and Lip Blush',
        'Complimentary 6-week perfection touch-up review',
        'Custom pigment blending matched to hair & skin undertone',
      ],
      aftercare: [
        'Keep treated area clean and lightly moisturized with provided balm.',
        'Avoid direct sun, swimming, and peeling flakes during healing.',
      ],
      image: SITE_IMAGES.footerProfileOrchid,
    },
    {
      id: 'srv-11',
      index: '011',
      slug: 'ever-body',
      name: 'Everbody',
      pillar: 'EVERBODY',
      shortDescription:
        'Signature Lymphatic Massage, Wood Sculpt contouring, and Prenatal Calm rituals.',
      fullDescription:
        'Holistic body treatments crafted to reduce fluid retention, release deep muscular tension, and restore inner stillness. Choose from Signature Lymphatic Drainage, Colombian Wood Sculpt, or Prenatal Calm for Mama.',
      duration: '75 – 90 mins',
      technicianPrice: 'IDR 580,000',
      stylistPrice: 'IDR 720,000',
      highlights: [
        'Private sound-insulated warm suite with freshly laundered linens',
        'Organic warm botanical oils blended for lymphatic circulation',
        'Specialized prenatal cushioning for expectant mothers',
      ],
      aftercare: [
        'Drink plenty of warm water over the next 24 hours to support lymphatic flow.',
      ],
      image: SITE_IMAGES.everhouseOrchid,
    },
  ] as ServiceItem[],

  story: {
    eyebrow: 'OUR STORY',
    headline: 'Crafted in quiet detail, never rushed.',
    lead:
      'Founded on the belief that understated beauty endures far longer than fleeting trends, Paule Beauty brings together master lash artisans, brow architects, nail specialists, and body therapists under one serene roof.',
    pillars: [
      {
        number: '01',
        title: 'No Shortcuts in Technique',
        body: 'Every therapist undergoes hundreds of hours of rigorous internal certification. In lash artistry, that means clean single-lash isolation, zero eyelid contact, and calibrated weights that preserve natural lash health for years.',
      },
      {
        number: '02',
        title: 'Private Sanctuary Standard',
        body: 'All Everhouse locations feature enclosed private treatment rooms, hospital-grade instrument sterilization, disposable treatment sheets, and freshly laundered linens for every single guest.',
      },
      {
        number: '03',
        title: 'Two Specialist Tiers',
        body: 'Choose between certified Technicians for timeless classics or Senior Stylists for complex bespoke artistry such as Artisan’s Choice (MangaLash, Wispy Kylie, Glam Kim, Foxy) and corrective symmetry work.',
      },
    ],
  },

  locations: [
    {
      id: 'loc-senopati',
      name: 'Everhouse Senopati',
      city: 'Jakarta',
      district: 'South Jakarta',
      address: 'Jl. Senopati No. 48, Kebayoran Baru, Jakarta Selatan 12190',
      hours: 'Daily, 09:00 – 20:00 WIB',
      phone: '+62 21 5098 0398',
      privateRooms: 12,
      servicesAvailable: ['EVERLASH', 'EVERBROW', 'EVERNAILS', 'EVERWAX', 'EVER SPMU', 'EVERBODY'],
      mapNote: 'Flagship Sanctuary · Complimentary valet parking',
    },
    {
      id: 'loc-plaza-indonesia',
      name: 'Everhouse Plaza Indonesia',
      city: 'Jakarta',
      district: 'Central Jakarta',
      address: 'Plaza Indonesia Level 4, Jl. M.H. Thamrin Kav. 28–30, Jakarta Pusat',
      hours: 'Daily, 10:00 – 21:00 WIB',
      phone: '+62 21 2992 4108',
      privateRooms: 8,
      servicesAvailable: ['EVERLASH', 'EVERBROW', 'EVERNAILS', 'EVERWAX'],
      mapNote: 'Direct elevator access from North Lobby',
    },
    {
      id: 'loc-pik',
      name: 'Everhouse Pantai Indah Kapuk',
      city: 'Jakarta',
      district: 'North Jakarta',
      address: 'Golf Island Boulevard Blok D No. 12, PIK, Jakarta Utara',
      hours: 'Daily, 09:00 – 20:00 WIB',
      phone: '+62 21 5082 7720',
      privateRooms: 10,
      servicesAvailable: ['EVERLASH', 'EVERBROW', 'EVERNAILS', 'EVERWAX', 'EVER SPMU', 'EVERBODY'],
      mapNote: 'Full sanctuary including Prenatal & Lymphatic suites',
    },
    {
      id: 'loc-menteng',
      name: 'Everhouse Menteng',
      city: 'Jakarta',
      district: 'Central Jakarta',
      address: 'Jl. Teuku Cik Ditiro No. 32, Menteng, Jakarta Pusat',
      hours: 'Tue – Sun, 09:00 – 19:00 WIB',
      phone: '+62 21 3190 5541',
      privateRooms: 7,
      servicesAvailable: ['EVERLASH', 'EVERBROW', 'EVER SPMU', 'EVERBODY'],
      mapNote: 'Heritage villa residence with courtyard tea lounge',
    },
    {
      id: 'loc-surabaya',
      name: 'Everhouse Pakuwon Surabaya',
      city: 'Surabaya',
      district: 'West Surabaya',
      address: 'Pakuwon Mall Level 2, Jl. Mayjen Yono Suwoyo, Surabaya',
      hours: 'Daily, 10:00 – 21:00 WIB',
      phone: '+62 31 9914 8210',
      privateRooms: 9,
      servicesAvailable: ['EVERLASH', 'EVERBROW', 'EVERNAILS', 'EVERWAX'],
      mapNote: 'East Java flagship atelier',
    },
    {
      id: 'loc-bali',
      name: 'Everhouse Canggu',
      city: 'Bali',
      district: 'Badung',
      address: 'Jl. Pantai Berawa No. 108, Canggu, Kuta Utara, Bali',
      hours: 'Daily, 09:00 – 20:00 WITA',
      phone: '+62 361 907 4412',
      privateRooms: 8,
      servicesAvailable: ['EVERLASH', 'EVERBROW', 'EVERNAILS', 'EVERWAX', 'EVERBODY'],
      mapNote: 'Tropical travertine sanctuary · Home service available',
    },
  ] as StudioLocation[],

  journal: [
    {
      id: 'j-1',
      slug: 'how-proper-lash-isolation-protects-natural-lashes',
      title: 'Why Proper Lash Isolation Matters for Long-Term Lash Health',
      category: 'Everlash Care',
      date: 'March 2025',
      readTime: '4 min read',
      excerpt:
        'True lash artistry is invisible at the root. Discover why clean one-to-one isolation and featherlight fibers allow you to wear extensions comfortably year after year.',
      image: SITE_IMAGES.heroPortrait,
      body: [
        'Many first-time guests hesitate to try lash extensions because they have heard stories of heavy, uncomfortable sets or weakened natural lashes. In nearly every case, discomfort comes not from extensions themselves, but from rushed application.',
        'At Paule Beauty, every single natural lash is isolated before an extension is placed 1mm away from the eyelid skin. No two natural lashes are ever bonded together, allowing each lash to complete its natural growth cycle freely.',
        'Paired with calibrated fiber diameters matched to your lash strength, a well-crafted set feels completely weightless—and leaves your natural lashes strong and healthy.',
      ],
    },
    {
      id: 'j-2',
      slug: 'technician-vs-stylist-choosing-your-therapist',
      title: 'Technician vs. Stylist: Choosing the Right Specialist for Your Eye Shape',
      category: 'Studio Guide',
      date: 'February 2025',
      readTime: '3 min read',
      excerpt:
        'Understanding the difference between our certified Technicians and Senior Stylists so you can book with complete confidence.',
      image: SITE_IMAGES.personalisedEye,
      body: [
        'Both Paule Beauty Technicians and Senior Stylists complete our intensive academy curriculum and follow identical hygiene and isolation standards.',
        'If you love clean classic or soft natural sets and have balanced natural lash density, our Technicians deliver consistently beautiful results at an accessible tier.',
        'If you are requesting complex Artisan’s Choice designs—such as MangaLash, Wispy Kylie, Glam Kim, or Foxy—or if you have sparse, delicate, or asymmetrical eyes requiring corrective mapping, we recommend booking with a Senior Stylist.',
      ],
    },
    {
      id: 'j-3',
      slug: 'preparing-for-your-quiet-moment-at-everhouse',
      title: 'Preparing for Your Quiet Moment: Three Simple Habits Before Your Visit',
      category: 'Rituals',
      date: 'January 2025',
      readTime: '3 min read',
      excerpt:
        'From arriving makeup-free to skipping pre-appointment espresso, small preparations make your treatment calmer and longer-lasting.',
      image: SITE_IMAGES.everhouseOrchid,
      body: [
        'Arrive with a clean, makeup-free eye area whenever possible. Residual mascara or waterproof liner slows down cleansing and reduces adhesive retention.',
        'Refrain from caffeine for 24 hours before lash treatments if your eyelids tend to flutter. Calm, relaxed eyes allow your therapist to work with effortless precision.',
        'Finally, silence notifications and allow yourself to rest. Minimizing phone checks and conversation keeps eyes gently closed away from drying adhesive vapors—turning your appointment into true restorative rest.',
      ],
    },
    {
      id: 'j-4',
      slug: 'the-botanical-science-of-keratine-filler-lift',
      title: 'The Botanical Science Behind Our Keratiné Filler Lift',
      category: 'Ingredients',
      date: 'December 2024',
      readTime: '5 min read',
      excerpt:
        'How Italian hydrolyzed keratin, peptides, and plant lipids lift and visibly thicken your natural lashes without harsh perms.',
      image: SITE_IMAGES.botanicalTexture,
      body: [
        'Traditional lash perms relied on harsh alkaline solutions that left natural hairs brittle. Modern keratin filler lifts take the opposite philosophy: restructuring the curl gently while feeding the hair shaft from within.',
        'Across a series of treatments, hydrolyzed keratin and conditioning oils support visibly fuller, glossier lashes that hold a soft upward sweep for up to eight weeks.',
      ],
    },
  ] as JournalArticle[],

  faqs: [
    {
      id: 'faq-1',
      question: 'WHAT TYPE OF PAYMENT IS ACCEPTED?',
      paragraphs: [
        'We accept all kinds of payments, but we do prefer cashless for smoother and faster transactions.',
      ],
    },
    {
      id: 'faq-2',
      question: 'WHERE IS PAULE BEAUTY LOCATED? WHAT ARE THE OPENING HOURS?',
      paragraphs: [
        'Please refer to our Locations directory to see each salon’s exact address and operational hours.',
      ],
      hasLocationLink: true,
    },
    {
      id: 'faq-3',
      question: 'WHY DO SOME PEOPLE SAY HAVING TREATMENTS AT PAULE BEAUTY IS MORE EXPENSIVE?',
      paragraphs: [
        'a. We do not take shortcuts in our service: We trained all of our lash therapists extensively to ensure proper lash application. Some of our standards include: no lash sticks to one another, no lash stuck on your eyelid, and no stacking heavier single lashes to create a denser volume look. These ensure you stay comfortable and protect your natural lashes for years to come.',
        'b. We do not take shortcuts in our products: We use the finest, safety-tested products formulated for delicate eye and skin areas.',
        'c. We take pride in giving you a comfortable treatment. We offer private treatment rooms in all our branches, sanitize our tools thoroughly, and use disposable sheets and freshly laundered towels. We love to hear from our clients—do send us feedback via email, Instagram DM, or our call center.',
      ],
    },
    {
      id: 'faq-4',
      question: 'IT IS MY FIRST TIME AT PAULE BEAUTY, WHAT INFORMATION SHOULD I KNOW?',
      paragraphs: [
        'a. There are two types of therapists with slightly different price points: Technicians and Stylists. Both are properly trained, but more complex designs such as Artisan’s Choice are only available by Stylists. If you would like Artisan’s Choice (MangaLash, Wispy Kylie, Glam Kim, Foxy) or have thin/sparse lashes or non-symmetrical eyes, we highly advise booking an appointment with a Stylist.',
        'b. We offer a Patch Test for testing any allergic reaction. If you would like this, make a separate appointment first and if no reactions occur after 48 hours, you can return for your full treatment.',
        'c. We offer weekly retouch prices for your eyelash extension infill that can be done in any of the Everhouse salons.',
        'd. We love feedback. Tell us how you like your set or share constructive feedback, and allow us to note photos of your desirable results so we remember your preferences.',
        'e. We offer Home Services with an additional transport and mobile service fee.',
      ],
    },
    {
      id: 'faq-5',
      question: 'HOW CAN I SHORTEN MY TREATMENT TIME?',
      paragraphs: [
        'i.) Come with a clean face, makeup free.',
        'ii.) Have an idea of what you like or don’t like. Bring or show us reference photos.',
        'iii.) Minimize interruptions (checking phone, fidgeting, talking during treatment, and visit the restroom before your treatment).',
      ],
    },
    {
      id: 'faq-6',
      question: 'WHAT DETERMINES HOW LONG THE TREATMENT TIME?',
      paragraphs: [
        'i.) The quality and quantity of your natural lash. If you have long, strong natural lashes it is much easier to place extensions than when you have thin, brittle, or sparse lashes.',
        'ii.) Fluttering eyes — Not all clients can close their eyes firmly; some have fluttery eyes, which can be challenging for precise placement. Refrain from taking caffeine 24 hours before the treatment.',
        'iii.) Interruptions — Avoid phone calls, videos, or selfies during the treatment. Interruptions increase treatment time, affect results, and expose eyes to fumes from drying lash adhesive.',
        'iv.) The type of treatment you choose — Depending on the lash style, complexity differs. For example, Glam Volume requires more delicate fans and naturally takes a longer session.',
      ],
    },
  ] as FaqItem[],

  footerBanner: {
    label: 'Explore Every Detail of Paule Beauty',
    image: SITE_IMAGES.footerProfileOrchid,
    imageAlt: 'Macro side profile beauty portrait framed by speckled orchid petals',
  },
};
