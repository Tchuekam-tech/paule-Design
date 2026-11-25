import { useState } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { filterLocations, getUniqueCities } from '../utils/siteHelpers';

interface LocationsPageProps {
  onBookAtLocation: (locationId: string) => void;
}

export function LocationsPage({ onBookAtLocation }: LocationsPageProps) {
  const { config } = useSiteContent();
  const cities = getUniqueCities(config.locations);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  const visibleLocations = filterLocations(config.locations, selectedCity);

  return (
    <section className="min-h-screen bg-[#7A6047] pt-28 sm:pt-36 pb-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-14">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs tracking-[0.22em] uppercase text-white/70">
            {config.brand.houseName} SANCTUARIES
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.08] text-white">
            Find Your Nearest Studio
          </h1>
          <p className="text-sm sm:text-base font-light leading-relaxed text-white/85 max-w-xl">
            Every location offers private treatment suites, cashless checkout,
            and seamless weekly retouch privileges across all branches.
          </p>
        </div>

        {/* City Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter studio locations by city"
          className="mt-10 flex flex-wrap items-center gap-2 border-y border-white/20 py-4"
        >
          {['ALL', ...cities].map((city) => {
            const active = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCity(city)}
                className={`min-h-10 px-4 py-2 text-xs tracking-[0.16em] uppercase whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#F9F6F1] text-[#7A6047] font-medium'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {city === 'ALL' ? 'All Cities' : city}
              </button>
            );
          })}
        </div>

        {/* Studio Branch Cards */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visibleLocations.map((loc) => (
            <article
              key={loc.id}
              className="flex flex-col justify-between border border-white/20 bg-[#6E563F]/80 p-7 space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] tracking-[0.16em] uppercase text-white/65">
                  <span>
                    {loc.city} · {loc.district}
                  </span>
                  <span className="tabular-nums">{loc.privateRooms} Private Rooms</span>
                </div>

                <h2 className="font-serif text-2xl font-normal text-white">
                  {loc.name}
                </h2>

                <div className="space-y-2.5 text-sm font-light text-white/85">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white/60" aria-hidden="true" />
                    <span>{loc.address}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
                    <span className="tabular-nums">{loc.hours}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
                    <span className="tabular-nums">{loc.phone}</span>
                  </p>
                </div>

                <p className="text-xs text-white/65 pt-1">{loc.mapNote}</p>

                <p className="text-[11px] tracking-[0.12em] uppercase text-white/75 border-t border-white/15 pt-4">
                  {loc.servicesAvailable.join(' · ')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onBookAtLocation(loc.id)}
                className="inline-flex min-h-11 w-full items-center justify-center bg-[#F9F6F1] px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#7A6047] hover:bg-white transition-colors cursor-pointer"
              >
                Book at {loc.name}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
