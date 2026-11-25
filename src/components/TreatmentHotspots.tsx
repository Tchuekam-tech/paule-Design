import { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { lerp } from '../utils/scrollMath';

interface TreatmentHotspotsProps {
  onSelectService: (serviceSlug: string) => void;
}

export function TreatmentHotspots({ onSelectService }: TreatmentHotspotsProps) {
  const { config } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);
  const transit = useScrollProgress(sectionRef, 'transit', 0.5);
  const zones = config.treatmentZones;
  const [activeZoneNumber, setActiveZoneNumber] = useState<string>('01');
  const activeZone =
    zones.find((z) => z.number === activeZoneNumber) ?? zones[0];

  const marqueeItems = Array.from({ length: 10 }, (_, idx) => idx);
  const portraitScale = lerp(1.08, 1.0, transit);
  const marqueeShiftX = lerp(60, -60, transit);

  return (
    <section
      ref={sectionRef}
      aria-label="Signature treatment zones"
      className="relative overflow-hidden bg-[#6E563F] py-12 sm:py-20"
    >
      {/* Main Interactive Portrait & Numbered Hotspots */}
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-10 md:px-14">
        <div className="relative mx-auto aspect-[16/10] sm:aspect-[16/9] max-h-[760px] w-full overflow-hidden bg-[#4C3A29]">
          <img
            src={config.silhouetteImage}
            alt="All services treatment map covering signature beauty pillars"
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${portraitScale})` }}
            className="h-full w-full object-cover object-center will-change-transform"
          />

          {/* Subtle Editorial Horizontal Marquee with Scroll-Linked Drift */}
          <div
            aria-hidden="true"
            style={{ transform: `translate3d(${marqueeShiftX}px, -50%, 0)` }}
            className="pointer-events-none absolute inset-x-0 top-[44%] overflow-hidden opacity-[0.22] mix-blend-screen select-none will-change-transform"
          >
            <div className="animate-ever-marquee">
              {marqueeItems.map((idx) => (
                <span
                  key={idx}
                  className="mx-8 font-sans text-5xl sm:text-7xl lg:text-[6.25rem] font-light tracking-[0.14em] uppercase text-[#F9F6F1] whitespace-nowrap"
                >
                  {config.marqueePhrase}
                </span>
              ))}
            </div>
          </div>

          {/* Measured vignette so hotspots and card remain ultra-legible */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#251C14]/75 via-transparent to-[#251C14]/25" />

          {/* Interactive 01–06 Circular Hotspots with Delicate Ripple Halos */}
          {zones.map((zone) => {
            const isActive = activeZone ? zone.number === activeZone.number : false;
            return (
              <button
                key={zone.number}
                type="button"
                onClick={() => setActiveZoneNumber(zone.number)}
                onMouseEnter={() => setActiveZoneNumber(zone.number)}
                aria-label={`Explore zone ${zone.number}: ${zone.title}`}
                aria-pressed={isActive}
                style={{
                  left: `${zone.xPercent}%`,
                  top: `${zone.yPercent}%`,
                }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border text-xs font-medium tracking-[0.08em] tabular-nums transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F9F6F1] ${
                  isActive
                    ? 'border-[#F9F6F1] bg-[#F9F6F1] text-[#5F4A36] scale-110 shadow-lg'
                    : 'border-white/60 bg-[#2A2018]/65 text-white backdrop-blur-sm hover:border-white hover:bg-[#F9F6F1]/90 hover:text-[#5F4A36]'
                }`}
              >
                {/* Delicate architectural halo ring on active/idle hotspots */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 rounded-full border ${
                    isActive
                      ? 'border-[#F9F6F1]/80 animate-hotspot-ring'
                      : 'border-white/35 opacity-0 group-hover:opacity-100 group-hover:animate-hotspot-ring'
                  }`}
                />
                <span className="relative z-10">{zone.number}</span>
              </button>
            );
          })}

          {/* Desktop Floating Editorial Detail Panel with Smooth Crossfade */}
          {activeZone && (
          <div
            key={activeZone.number}
            className="hidden lg:block absolute bottom-6 left-6 max-w-sm border border-white/20 bg-[#251C14]/88 backdrop-blur-md p-6 text-white animate-fade-up"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-3">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xs tracking-[0.16em] text-white/60 tabular-nums">
                  {activeZone.number}
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  {activeZone.title}
                </h3>
              </div>
              <span className="text-[10px] tracking-[0.22em] uppercase text-white/65">
                {activeZone.pillar}
              </span>
            </div>

            <p className="mt-3.5 text-xs leading-relaxed text-white/85">
              {activeZone.description}
            </p>

            <div className="mt-4 pt-3.5 border-t border-white/15">
              <p className="text-[10px] tracking-[0.18em] uppercase text-white/55 mb-2">
                Treatments
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {activeZone.treatments.map((item) => (
                  <button
                    key={item.serviceSlug}
                    type="button"
                    onClick={() => onSelectService(item.serviceSlug)}
                    className="group/link inline-flex items-center gap-1 text-xs font-medium tracking-[0.04em] text-[#F9F6F1] hover:underline underline-offset-4 cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 opacity-75 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Mobile / Tablet Detail Card + Zone Selector Strip */}
        {activeZone && (
        <div className="mt-6 lg:hidden border border-white/15 bg-[#5F4A36] p-6 text-white">
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/15">
            {zones.map((zone) => {
              const isActive = zone.number === activeZone.number;
              return (
                <button
                  key={zone.number}
                  type="button"
                  onClick={() => setActiveZoneNumber(zone.number)}
                  className={`min-h-10 px-3 py-1.5 text-xs tracking-[0.14em] tabular-nums transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#F9F6F1] text-[#5F4A36] font-medium'
                      : 'bg-white/10 text-white/85 hover:bg-white/20'
                  }`}
                >
                  {zone.number} · {zone.title}
                </button>
              );
            })}
          </div>
          <div key={activeZone.number} className="animate-fade-up">
            <h3 className="mt-4 font-serif text-2xl text-white">{activeZone.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-white/85">
              {activeZone.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {activeZone.treatments.map((item) => (
                <button
                  key={item.serviceSlug}
                  type="button"
                  onClick={() => onSelectService(item.serviceSlug)}
                  className="inline-flex min-h-10 items-center gap-1 text-xs font-medium tracking-[0.08em] uppercase text-[#F9F6F1] underline underline-offset-4 cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
