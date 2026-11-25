import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import type { ServicePillar } from '../data/siteConfig';
import { useSiteContent } from '../context/SiteContentContext';
import { filterServices } from '../utils/siteHelpers';

interface ServicesPageProps {
  selectedSlug?: string;
  initialPillar?: ServicePillar;
  onSelectSlug: (slug?: string) => void;
  onBookService: (serviceSlug: string) => void;
}

const PILLARS: Array<ServicePillar | 'ALL'> = [
  'ALL',
  'EVERLASH',
  'EVERBROW',
  'EVERNAILS',
  'EVERWAX',
  'EVER SPMU',
  'EVERBODY',
];

export function ServicesPage({
  selectedSlug,
  initialPillar,
  onSelectSlug,
  onBookService,
}: ServicesPageProps) {
  const { config } = useSiteContent();
  const [activePillar, setActivePillar] = useState<ServicePillar | 'ALL'>(
    initialPillar ?? 'ALL'
  );
  const [query, setQuery] = useState('');

  useEffect(() => {
    setActivePillar(initialPillar ?? 'ALL');
  }, [initialPillar]);

  const selectedService = selectedSlug
    ? config.services.find((s) => s.slug === selectedSlug)
    : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSlug]);

  const filtered = filterServices(config.services, activePillar, query);

  if (selectedService) {
    return (
      <section className="min-h-screen bg-[#7A6047] pt-28 sm:pt-36 pb-24">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
          <button
            type="button"
            onClick={() => onSelectSlug(undefined)}
            className="inline-flex min-h-10 items-center gap-2 text-xs tracking-[0.16em] uppercase text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to all services</span>
          </button>

          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] w-full overflow-hidden bg-[#5F4A36]">
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3 border-b border-white/20 pb-6">
                <div className="flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-white/70">
                  <span className="tabular-nums">{selectedService.index}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedService.pillar}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedService.duration}</span>
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl font-normal text-white">
                  {selectedService.name}
                </h1>
                <p className="text-base font-light leading-relaxed text-white/90 pt-2">
                  {selectedService.fullDescription}
                </p>
              </div>

              {/* Transparent Two-Tier Rate Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-white/20 bg-[#6E563F] p-5">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-white/65">
                    Certified Technician
                  </p>
                  <p className="mt-2 font-serif text-2xl text-white tabular-nums">
                    {selectedService.technicianPrice}
                  </p>
                </div>
                <div className="border border-white/20 bg-[#6E563F] p-5">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-white/65">
                    Senior Stylist
                  </p>
                  <p className="mt-2 font-serif text-2xl text-white tabular-nums">
                    {selectedService.stylistPrice}
                  </p>
                </div>
              </div>

              {/* Craftsmanship Highlights */}
              <div className="space-y-3">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-white/70">
                  What Is Included
                </h2>
                <ul className="space-y-2.5 text-sm font-light text-white/90">
                  {selectedService.highlights.map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-white/50 tabular-nums">
                        0{idx + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Aftercare Notes */}
              <div className="space-y-3 border-t border-white/15 pt-6">
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-white/70">
                  Aftercare Guidance
                </h2>
                <ul className="space-y-2 text-sm font-light text-white/85">
                  {selectedService.aftercare.map((tip, idx) => (
                    <li key={idx}>— {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onBookService(selectedService.slug)}
                  className="inline-flex min-h-12 items-center justify-center bg-[#F9F6F1] px-9 py-3.5 text-xs font-medium tracking-[0.16em] uppercase text-[#7A6047] hover:bg-white transition-colors cursor-pointer"
                >
                  Book {selectedService.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#7A6047] pt-28 sm:pt-36 pb-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-14">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs tracking-[0.22em] uppercase text-white/70">
            {config.brand.name} TREATMENT MENU
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.08] text-white">
            Personalised Services
          </h1>
          <p className="text-sm sm:text-base font-light leading-relaxed text-white/85 max-w-xl">
            Every treatment is tailored to your natural anatomy, performed in a
            private sanctuary room with hospital-grade sterilization.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-y border-white/20 py-5">
          <div
            role="tablist"
            aria-label="Filter services by specialty"
            className="flex flex-wrap items-center gap-1.5"
          >
            {PILLARS.map((pillar) => {
              const active = activePillar === pillar;
              return (
                <button
                  key={pillar}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActivePillar(pillar)}
                  className={`min-h-10 px-3.5 py-2 text-[11px] tracking-[0.16em] uppercase whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#F9F6F1] text-[#7A6047] font-medium'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {pillar === 'ALL' ? 'All Services' : pillar}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <label htmlFor="service-search" className="sr-only">
              Search treatments
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55"
              aria-hidden="true"
            />
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search treatments..."
              className="w-full border border-white/25 bg-white/[0.06] py-2.5 pl-10 pr-4 text-xs tracking-[0.06em] text-white placeholder:text-white/50 focus:border-[#F9F6F1] focus:outline-none"
            />
          </div>
        </div>

        {/* Service Directory List */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="font-serif text-2xl text-white">
              No treatments match your filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setActivePillar('ALL');
                setQuery('');
              }}
              className="min-h-10 border border-white/40 px-6 py-2 text-xs tracking-[0.14em] uppercase text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <article
                key={service.id}
                className="group flex flex-col justify-between border border-white/15 bg-[#6E563F]/75 transition-colors hover:border-white/35"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#5F4A36]">
                    <img
                      src={service.image}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] tracking-[0.16em] uppercase text-white/65">
                      <span>
                        <span className="tabular-nums">{service.index}</span> ·{' '}
                        {service.pillar}
                      </span>
                      <span>{service.duration}</span>
                    </div>
                    <h2 className="font-serif text-2xl font-normal text-white">
                      {service.name}
                    </h2>
                    <p className="text-sm font-light leading-relaxed text-white/80">
                      {service.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-white/15 px-6 py-4">
                  <div className="text-xs text-white/80 tabular-nums">
                    From <span className="text-white font-medium">{service.technicianPrice}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onSelectSlug(service.slug)}
                      className="inline-flex min-h-10 items-center gap-1 text-xs tracking-[0.14em] uppercase text-white hover:opacity-75 cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onBookService(service.slug)}
                      className="inline-flex min-h-10 items-center bg-[#F9F6F1] px-4 py-2 text-[11px] font-medium tracking-[0.14em] uppercase text-[#7A6047] hover:bg-white transition-colors cursor-pointer"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
