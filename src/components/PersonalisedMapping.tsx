import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { clamp01, computeTextScrubOpacity, lerp } from '../utils/scrollMath';

interface PersonalisedMappingProps {
  onCheckAllServices: () => void;
}

export function PersonalisedMapping({ onCheckAllServices }: PersonalisedMappingProps) {
  const { config } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);
  const transit = useScrollProgress(sectionRef, 'transit', 0.55);
  const [animating, setAnimating] = useState(true);

  // Scrub progress active while section enters center of viewport (0.12 -> 0.56)
  const scrubP = clamp01((transit - 0.1) / 0.44);

  // Flatten heading characters across lines for ever.co.id's SplitType letter-by-letter opacity scrub
  const lines = config.personalisedSection.titleLines;
  const totalChars = Math.max(1, lines.reduce((acc, line) => acc + line.length, 0));
  let runningCharIdx = 0;

  // Image clip-path & gentle parallax zoom
  const imgClip = Math.round(lerp(12, 0, clamp01(scrubP * 1.3)) * 10) / 10;
  const imgScale = lerp(1.12, 1.0, scrubP);

  return (
    <section
      ref={sectionRef}
      className="bg-[#7A6047] py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12 items-center">
          {/* Left Editorial Statement with Split-Character Scroll Scrub */}
          <div className="lg:col-span-6 space-y-6">
            <p
              style={{ opacity: lerp(0.35, 0.85, scrubP) }}
              className="text-xs sm:text-sm font-normal tracking-[0.18em] uppercase text-white"
            >
              {config.personalisedSection.kicker}
            </p>

            <h2
              aria-label={lines.join(' ')}
              className="font-sans text-4xl sm:text-6xl lg:text-[4.6rem] font-light tracking-[0.03em] leading-[1.04] uppercase text-white"
            >
              {lines.map((line, lineIdx) => (
                <span key={`${line}-${lineIdx}`} className="block" aria-hidden="true">
                  {Array.from(line).map((char, idx) => {
                    const globalIdx = runningCharIdx++;
                    const op = computeTextScrubOpacity(scrubP, globalIdx, totalChars, 0.22);
                    return (
                      <span
                        key={`${line}-${idx}`}
                        style={{ opacity: op }}
                        className="inline-block transition-opacity duration-150"
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h2>

            <p
              style={{
                opacity: lerp(0.3, 0.9, clamp01((scrubP - 0.2) / 0.6)),
                transform: `translate3d(0, ${lerp(18, 0, clamp01((scrubP - 0.2) / 0.6))}px, 0)`,
              }}
              className="max-w-md text-sm sm:text-base font-light leading-relaxed text-white pt-2 will-change-transform"
            >
              {config.personalisedSection.description}
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={onCheckAllServices}
                className="inline-flex min-h-12 items-center justify-center bg-[#F9F6F1] px-8 py-3.5 text-xs font-medium tracking-[0.16em] uppercase text-[#7A6047] transition-all duration-300 hover:bg-white hover:tracking-[0.2em] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
              >
                {config.personalisedSection.ctaLabel}
              </button>
            </div>
          </div>

          {/* Right Brow & Eye Precision Mapping Visual with Scroll Clip-Path Reveal */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div
              style={{ clipPath: `inset(${imgClip}% 0%)` }}
              className="relative w-full max-w-[540px] aspect-[4/5] overflow-hidden bg-[#5F4A36]"
            >
              <img
                src={config.personalisedSection.image}
                alt={config.personalisedSection.imageAlt}
                referrerPolicy="no-referrer"
                style={{ transform: `scale(${imgScale})` }}
                className="h-full w-full object-cover will-change-transform"
              />

              {/* Delicate Golden-Ratio Architectural Brow & Lash Mapping Lines */}
              <svg
                viewBox="0 0 400 500"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <line
                  x1="34"
                  y1="176"
                  x2="345"
                  y2="176"
                  stroke="#FFFFFF"
                  strokeOpacity="0.65"
                  strokeWidth="1"
                  className={`animate-mapping-line ${!animating ? 'animate-mapping-paused' : ''}`}
                />
                <line
                  x1="108"
                  y1="145"
                  x2="335"
                  y2="145"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="0.9"
                  className={`animate-mapping-line ${!animating ? 'animate-mapping-paused' : ''}`}
                />
                <line
                  x1="148"
                  y1="95"
                  x2="148"
                  y2="465"
                  stroke="#FFFFFF"
                  strokeOpacity="0.65"
                  strokeWidth="1"
                  className={`animate-mapping-line ${!animating ? 'animate-mapping-paused' : ''}`}
                />
                <line
                  x1="248"
                  y1="105"
                  x2="175"
                  y2="465"
                  stroke="#FFFFFF"
                  strokeOpacity="0.6"
                  strokeWidth="1"
                  className={`animate-mapping-line ${!animating ? 'animate-mapping-paused' : ''}`}
                />
                <line
                  x1="345"
                  y1="176"
                  x2="152"
                  y2="465"
                  stroke="#FFFFFF"
                  strokeOpacity="0.6"
                  strokeWidth="1"
                  className={`animate-mapping-line ${!animating ? 'animate-mapping-paused' : ''}`}
                />
                <line
                  x1="262"
                  y1="100"
                  x2="262"
                  y2="345"
                  stroke="#FFFFFF"
                  strokeOpacity="0.4"
                  strokeWidth="0.8"
                />
                <circle cx="148" cy="176" r="2.5" fill="#F9F6F1" fillOpacity="0.85" />
                <circle cx="240" cy="145" r="2.5" fill="#F9F6F1" fillOpacity="0.85" />
                <circle cx="322" cy="176" r="2.5" fill="#F9F6F1" fillOpacity="0.85" />
              </svg>

              {/* Pause / Play Mapping Motion Toggle */}
              <button
                type="button"
                onClick={() => setAnimating((prev) => !prev)}
                aria-label={animating ? 'Pause facial mapping animation' : 'Play facial mapping animation'}
                className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center border border-white/35 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F9F6F1]"
              >
                {animating ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
