import { useSiteContent } from '../context/SiteContentContext';

interface StoryPageProps {
  onExploreServices: () => void;
  onOpenBooking: () => void;
}

export function StoryPage({ onExploreServices, onOpenBooking }: StoryPageProps) {
  const { config } = useSiteContent();

  return (
    <section className="min-h-screen bg-[#7A6047] pt-28 sm:pt-36 pb-24">
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 md:px-14 space-y-20">
        {/* Hero Split */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs tracking-[0.22em] uppercase text-white/70">
              {config.story.eyebrow}
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.08] text-white">
              {config.story.headline}
            </h1>
            <p className="text-base font-light leading-relaxed text-white/85">
              {config.story.lead}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreServices}
                className="inline-flex min-h-12 items-center justify-center bg-[#F9F6F1] px-8 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#7A6047] hover:bg-white transition-colors cursor-pointer"
              >
                Explore Services
              </button>
              <button
                type="button"
                onClick={onOpenBooking}
                className="inline-flex min-h-12 items-center justify-center border border-white/40 px-8 py-3 text-xs font-medium tracking-[0.16em] uppercase text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Book Consultation
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#5F4A36]">
              <img
                src={config.story.heroImage}
                alt={`${config.brand.houseName} quiet beauty philosophy`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Three Editorial Craftsmanship Pillars */}
        <div className="border-t border-white/20 pt-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {config.story.pillars.map((pillar) => (
              <div key={pillar.number} className="space-y-4">
                <p className="text-xs tracking-[0.2em] text-white/60 tabular-nums">
                  {pillar.number}.
                </p>
                <h2 className="font-serif text-2xl font-normal text-white">
                  {pillar.title}
                </h2>
                <p className="text-sm font-light leading-relaxed text-white/85">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Interlude & Private Room Promise */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center border-t border-white/20 pt-16">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] max-h-[520px] w-full overflow-hidden bg-[#5F4A36]">
              <img
                src={config.story.secondaryImage}
                alt={`Natural travertine materials in ${config.brand.houseName} studios`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs tracking-[0.22em] uppercase text-white/70">
              HYGIENE &amp; COMFORT
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
              Designed for unhurried stillness
            </h2>
            <p className="text-sm sm:text-base font-light leading-relaxed text-white/85">
              Every {config.brand.houseName} sanctuary is built around quiet acoustics, warm
              natural travertine textures, and enclosed private rooms. Instruments
              undergo thorough sterilization between every guest, paired with
              single-use treatment sheets and freshly laundered linens.
            </p>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-white/15 pt-6">
              <div>
                <dt className="text-[11px] tracking-[0.16em] uppercase text-white/60">
                  Private Suites
                </dt>
                <dd className="mt-1 font-serif text-2xl text-white tabular-nums">
                  100%
                </dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.16em] uppercase text-white/60">
                  Treatment Pillars
                </dt>
                <dd className="mt-1 font-serif text-2xl text-white tabular-nums">
                  06
                </dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.16em] uppercase text-white/60">
                  Patch Test Window
                </dt>
                <dd className="mt-1 font-serif text-2xl text-white tabular-nums">
                  48 hrs
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
