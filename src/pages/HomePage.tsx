import { useRef } from 'react';
import type { ServicePillar } from '../data/siteConfig';
import { useSiteContent } from '../context/SiteContentContext';
import type { HomeSectionId } from '../utils/adminHelpers';
import { ArcShowcaseSlider } from '../components/ArcShowcaseSlider';
import { TreatmentHotspots } from '../components/TreatmentHotspots';
import { PersonalisedMapping } from '../components/PersonalisedMapping';
import { InstagramFeedSection } from '../components/InstagramFeedSection';
import { FaqSection } from '../components/FaqSection';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { computeCollageScrollState, clamp01, lerp } from '../utils/scrollMath';
import type { AppRoute } from '../components/Header';

interface HomePageProps {
  onNavigate: (route: AppRoute, serviceSlug?: string, pillar?: ServicePillar) => void;
  onOpenBooking: (serviceSlug?: string) => void;
  heroReady: boolean;
}

function HeroSection({ heroReady }: { heroReady: boolean }) {
  const { config } = useSiteContent();
  const heroRef = useRef<HTMLElement>(null);
  const heroTransit = useScrollProgress(heroRef, 'transit', 0.5);

  const scrollToSlider = () => {
    const el = document.getElementById('editorial-quote');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }
  };

  const heroScrollOut = clamp01((heroTransit - 0.5) * 2);
  const heroImageScale = lerp(1.03, 1.15, heroScrollOut);
  const heroImageY = lerp(0, 72, heroScrollOut);
  const heroTextY = lerp(0, -68, heroScrollOut);
  const heroTextOpacity = lerp(1, 0.08, heroScrollOut);
  const heroWords = config.hero.headline.split(/\s+/).filter(Boolean);

  return (
    <section
      ref={heroRef}
      data-home-section="hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#251C14]"
    >
      <img
        src={config.hero.image}
        alt={config.hero.imageAlt}
        referrerPolicy="no-referrer"
        style={{
          transform: `translate3d(0, ${heroImageY}px, 0) scale(${heroImageScale})`,
        }}
        className="absolute inset-0 h-full w-full object-cover object-[50%_26%] will-change-transform"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-[#7A6047]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#7A6047] via-[#7A6047]/75 to-transparent" />

      <div
        style={{
          transform: `translate3d(0, ${heroTextY}px, 0)`,
          opacity: heroTextOpacity,
        }}
        className="relative z-10 mx-auto max-w-[1440px] px-6 text-center -mt-10 sm:-mt-14 will-change-transform"
      >
        <h1 className="font-serif text-[3.1rem] sm:text-[5.25rem] md:text-[6.8rem] lg:text-[7.75rem] font-normal leading-[1.06] tracking-[-0.015em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
          {heroWords.map((word, idx) => (
            <span
              key={`${word}-${idx}`}
              className="inline-block overflow-hidden align-bottom mx-[0.14em] pb-[0.18em] -mb-[0.18em]"
            >
              <span
                style={{
                  animationDelay: heroReady ? `${idx * 95}ms` : '0ms',
                }}
                className={`inline-block ${heroReady ? 'animate-word-rise' : 'opacity-0'}`}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <button
        type="button"
        onClick={scrollToSlider}
        style={{ opacity: lerp(1, 0, clamp01(heroScrollOut * 2.5)) }}
        className="absolute bottom-8 sm:bottom-10 left-1/2 z-10 -translate-x-1/2 min-h-10 px-4 py-2 text-[11px] font-medium tracking-[0.2em] uppercase text-white/95 hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
      >
        <span className="inline-block animate-scroll-cue">
          {config.hero.scrollLabel}
        </span>
      </button>
    </section>
  );
}

function CollageSection() {
  const { config } = useSiteContent();
  const collageRef = useRef<HTMLElement>(null);
  const collageProgress = useScrollProgress(collageRef, 'sticky', 0.5);

  const collage = config.editorialCollage;
  const tiles = collage.tiles;
  const collageState = computeCollageScrollState(collageProgress);

  return (
    <section
      ref={collageRef}
      data-home-section="collage"
      aria-label="The art of understated beauty"
      className="relative bg-[#7A6047] h-[165vh] sm:h-[210vh]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="relative mx-auto h-full w-full max-w-[1440px] px-6 sm:px-10 md:px-14 flex items-center justify-center">
          {/* Left Parallax Column */}
          <div
            style={{
              transform: `translate3d(0, ${collageState.leftColumnY}px, 0)`,
            }}
            className="hidden sm:block pointer-events-none absolute inset-y-0 left-6 md:left-14 w-[44%] will-change-transform"
          >
            {tiles[0] && (
              <div
                style={{
                  clipPath: `inset(0% ${collageState.clipInsetX}%)`,
                  opacity: collageState.imageOpacity,
                }}
                className="absolute left-0 top-[10%] w-44 md:w-56 lg:w-64 aspect-[3/5] overflow-hidden bg-[#5F4A36]"
              >
                <img
                  src={tiles[0].image}
                  alt={tiles[0].alt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover sepia-[0.25] contrast-[0.95]"
                />
              </div>
            )}

            {tiles[1] && (
              <div
                style={{
                  clipPath: `inset(0% ${collageState.clipInsetX}%)`,
                  opacity: collageState.imageOpacity,
                }}
                className="absolute left-[34%] top-[56%] w-48 md:w-60 lg:w-72 aspect-[4/5] overflow-hidden bg-[#5F4A36]"
              >
                <img
                  src={tiles[1].image}
                  alt={tiles[1].alt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover sepia-[0.2] contrast-[0.95]"
                />
              </div>
            )}
          </div>

          {/* Right Parallax Column */}
          <div
            style={{
              transform: `translate3d(0, ${collageState.rightColumnY}px, 0)`,
            }}
            className="hidden sm:block pointer-events-none absolute inset-y-0 right-6 md:right-14 w-[44%] will-change-transform"
          >
            {tiles[2] && (
              <div
                style={{
                  clipPath: `inset(0% ${collageState.clipInsetX}%)`,
                  opacity: collageState.imageOpacity,
                }}
                className="absolute right-[24%] top-[18%] w-48 md:w-64 lg:w-80 aspect-square overflow-hidden bg-[#5F4A36]"
              >
                <img
                  src={tiles[2].image}
                  alt={tiles[2].alt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover sepia-[0.3] brightness-90"
                />
              </div>
            )}

            {tiles[3] && (
              <div
                style={{
                  clipPath: `inset(0% ${collageState.clipInsetX}%)`,
                  opacity: collageState.imageOpacity * 0.92,
                }}
                className="absolute right-0 top-[56%] w-44 lg:w-56 aspect-[3/4] overflow-hidden bg-[#5F4A36]"
              >
                <img
                  src={tiles[3].image}
                  alt={tiles[3].alt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover sepia-[0.3] brightness-90"
                />
              </div>
            )}
          </div>

          {/* Mobile 2x2 subtle moodboard behind headline */}
          <div
            style={{ opacity: collageState.imageOpacity * 0.5 }}
            className="grid grid-cols-2 gap-3 sm:hidden absolute inset-6"
          >
            {tiles.map((tile) => (
              <div
                key={tile.id}
                style={{ clipPath: `inset(0% ${collageState.clipInsetX * 0.5}%)` }}
                className="overflow-hidden bg-[#5F4A36]"
              >
                <img
                  src={tile.image}
                  alt={tile.alt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover sepia-[0.25]"
                />
              </div>
            ))}
          </div>

          {/* Pinned Monumental Light Sans Statement */}
          <h2
            style={{
              opacity: collageState.headingOpacity,
              transform: `scale(${collageState.headingScale})`,
            }}
            className="relative z-10 text-center font-sans text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-light tracking-[0.06em] leading-[1.12] uppercase text-white drop-shadow-[0_4px_24px_rgba(37,28,20,0.45)] will-change-transform"
          >
            {collage.headingLines.map((line, i) => (
              <span key={`${line}-${i}`} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  );
}

function EverhouseSection({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const { config } = useSiteContent();
  const everhouseRef = useRef<HTMLElement>(null);
  const everhouseProgress = useScrollProgress(everhouseRef, 'sticky', 0.5);

  const everhouseBgScale = lerp(1.14, 1.0, everhouseProgress);
  const everhouseCardY = lerp(52, 0, everhouseProgress);
  const everhouseInsetScale = lerp(1.22, 1.05, everhouseProgress);
  const everhouseCardOpacity = lerp(0.78, 1, clamp01(everhouseProgress * 2.5));

  return (
    <section
      ref={everhouseRef}
      data-home-section="everhouse"
      aria-labelledby="everhouse-heading"
      className="relative bg-[#2A2018] h-[145vh] sm:h-[165vh]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-5 pt-20 pb-8 sm:px-10">
        <img
          src={config.houseSection.backgroundImage}
          alt="Serene spa beauty portrait holding a speckled orchid petal"
          referrerPolicy="no-referrer"
          style={{
            transform: `scale(${everhouseBgScale})`,
          }}
          className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/35" />

        <div
          style={{
            transform: `translate3d(0, ${everhouseCardY}px, 0)`,
            opacity: everhouseCardOpacity,
          }}
          className="relative z-10 w-full max-w-[540px] bg-[#96846F] p-4 sm:p-6 text-center shadow-2xl will-change-transform"
        >
          <div className="aspect-[2/1] w-full overflow-hidden bg-[#251C14]">
            <img
              src={config.houseSection.insetImage}
              alt={`${config.houseSection.subBrand} beauty detail`}
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${everhouseInsetScale})`,
              }}
              className="h-full w-full object-cover object-[50%_30%] will-change-transform"
            />
          </div>

          <div className="px-3 pt-5 pb-2 sm:px-7 sm:pt-6 sm:pb-3 space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-white">
              {config.houseSection.subBrand}
            </p>

            <h2
              id="everhouse-heading"
              className="font-sans text-2xl sm:text-[1.95rem] font-light tracking-[0.06em] leading-[1.2] uppercase text-white"
            >
              {config.houseSection.titleLines.map((line, i) => (
                <span key={`${line}-${i}`} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p className="mx-auto max-w-md text-sm font-light leading-relaxed text-white/90">
              {config.houseSection.description}
            </p>

            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => onNavigate('locations')}
                className="inline-flex min-h-11 items-center justify-center bg-[#F9F6F1] px-8 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#7A6047] transition-all duration-300 hover:bg-white hover:tracking-[0.2em] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
              >
                {config.houseSection.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage({ onNavigate, onOpenBooking, heroReady }: HomePageProps) {
  const { config } = useSiteContent();
  const hidden = new Set<HomeSectionId>(config.structure.hiddenSections);

  const renderSection = (sectionId: HomeSectionId) => {
    switch (sectionId) {
      case 'hero':
        return <HeroSection key="hero" heroReady={heroReady} />;
      case 'arcSlider':
        return (
          <ArcShowcaseSlider
            key="arcSlider"
            onSelectPillar={(pillar) => {
              if (pillar) {
                onNavigate('services', undefined, pillar);
              } else {
                onNavigate('locations');
              }
            }}
          />
        );
      case 'collage':
        return <CollageSection key="collage" />;
      case 'hotspots':
        return (
          <TreatmentHotspots
            key="hotspots"
            onSelectService={(slug) => onNavigate('services', slug)}
          />
        );
      case 'personalised':
        return (
          <PersonalisedMapping
            key="personalised"
            onCheckAllServices={() => onNavigate('services')}
          />
        );
      case 'everhouse':
        return (
          <EverhouseSection
            key="everhouse"
            onNavigate={(r) => onNavigate(r)}
          />
        );
      case 'instagram':
        return (
          <InstagramFeedSection
            key="instagram"
            onBookService={(slug) => onOpenBooking(slug)}
          />
        );
      case 'faq':
        return (
          <FaqSection
            key="faq"
            onOpenContact={() => onOpenBooking()}
            onGoToLocations={() => onNavigate('locations')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {config.structure.sectionOrder
        .filter((id) => !hidden.has(id))
        .map((sectionId) => renderSection(sectionId))}
    </div>
  );
}
