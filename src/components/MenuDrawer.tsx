import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { BrandWordmark } from './BrandWordmark';
import type { AppRoute } from './Header';

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: AppRoute, serviceSlug?: string) => void;
  onOpenBooking: (defaultServiceSlug?: string) => void;
}

export function MenuDrawer({
  open,
  onClose,
  onNavigate,
  onOpenBooking,
}: MenuDrawerProps) {
  const { config } = useSiteContent();
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const whatsappDirectUrl = `https://api.whatsapp.com/send?phone=${config.brand.whatsappNumber}&text=${encodeURIComponent(
    `Hello ${config.brand.houseName}, I would like to schedule an appointment.`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation menu"
      className="fixed inset-0 z-40 overflow-y-auto bg-[#070605] text-white animate-menu-curtain"
    >
      <div className="mx-auto flex min-h-full max-w-[1440px] flex-col justify-center px-6 pt-24 pb-12 sm:px-10 md:px-14 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Left Column: Giant MENU + Page Links + Booking + Brand Preview Card */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div>
              <h2 className="font-sans text-6xl sm:text-7xl md:text-[5.5rem] font-light tracking-[0.04em] leading-none text-white">
                MENU
              </h2>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-6 text-[11px] tracking-[0.16em] uppercase text-white/75">
                <a
                  href={config.brand.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors whitespace-nowrap"
                >
                  FACEBOOK
                </a>
                <a
                  href={config.brand.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors whitespace-nowrap"
                >
                  INSTAGRAM
                </a>
              </div>

              {/* Primary Pages */}
              <nav aria-label="Main pages" className="mt-7 flex flex-col gap-2.5 text-xs tracking-[0.16em] uppercase text-white/85">
                {(
                  [
                    { label: '/ OUR STORY', route: 'story' },
                    { label: '/ JOURNAL', route: 'journal' },
                    { label: '/ LOCATION', route: 'locations' },
                    { label: '/ SERVICES', route: 'services' },
                    { label: '/ MANAGER PORTAL', route: 'admin' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => {
                      onNavigate(item.route);
                      onClose();
                    }}
                    className={`w-fit text-left py-1 hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                      item.route === 'admin' ? 'text-white/55 mt-1' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* For Booking */}
              <div className="mt-8 space-y-2.5">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white">
                  FOR BOOKING
                </p>
                <div className="flex flex-col gap-2 text-xs tracking-[0.14em] uppercase text-white/80">
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit py-0.5 hover:text-white hover:translate-x-1 transition-all duration-200"
                  >
                    / SCHEDULE VIA WHATSAPP
                  </a>
                  <a
                    href={config.brand.phoneHref}
                    className="w-fit py-0.5 hover:text-white hover:translate-x-1 transition-all duration-200"
                  >
                    / SCHEDULE VIA CALL
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Warm Preview Card + Ivory CONTACT US Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 pt-2">
              <div className="group relative h-32 w-56 overflow-hidden bg-[#5A4634] shrink-0">
                <img
                  src={config.hero.image}
                  alt={`${config.brand.name} studio detail`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover opacity-55 transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3B2D20]/80 via-transparent to-[#7A6047]/40 flex items-center justify-center">
                  <BrandWordmark size="md" className="h-6 text-[#F9F6F1]" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="inline-flex min-h-11 items-center justify-center bg-[#F9F6F1] px-7 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#7A6047] transition-all duration-300 hover:bg-white hover:tracking-[0.2em] whitespace-nowrap shrink-0 cursor-pointer"
              >
                CONTACT US
              </button>
            </div>
          </div>

          {/* Right Column: Hairline-Divided Service Directory with Staggered Slide-In */}
          <div className="lg:col-span-7">
            <ul className="divide-y divide-white/25 border-t border-b border-white/25">
              {config.services.map((service, idx) => (
                <li
                  key={service.id}
                  style={{ animationDelay: `${140 + idx * 32}ms` }}
                  className="animate-fade-up"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('services', service.slug);
                      onClose();
                    }}
                    className="group relative flex w-full items-center justify-between gap-4 py-3.5 sm:py-4 text-left transition-colors duration-300 hover:bg-white/[0.045] px-1 cursor-pointer"
                  >
                    <div className="flex items-baseline gap-5 sm:gap-7 min-w-0">
                      <span className="text-[11px] font-normal tracking-[0.14em] text-white/60 tabular-nums shrink-0 transition-colors group-hover:text-white">
                        {service.index}
                      </span>
                      <span className="text-sm sm:text-base font-light tracking-[0.1em] uppercase text-white/95 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 group-hover:text-white truncate">
                        {service.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <span className="hidden sm:inline text-[11px] font-medium tracking-[0.26em] uppercase text-white/75 transition-colors group-hover:text-white">
                        {service.pillar}
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 text-white/70 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
