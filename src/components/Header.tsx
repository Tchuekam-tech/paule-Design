import { useEffect, useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { BrandWordmark } from './BrandWordmark';

export type AppRoute = 'home' | 'services' | 'story' | 'locations' | 'journal' | 'admin';

interface HeaderProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: (route: AppRoute) => void;
  onOpenBooking: () => void;
}

export function Header({
  menuOpen,
  onToggleMenu,
  onNavigate,
  onOpenBooking,
}: HeaderProps) {
  const { config } = useSiteContent();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        menuOpen
          ? 'bg-transparent'
          : scrolled
            ? 'bg-gradient-to-b from-[#251C14]/65 via-[#251C14]/30 to-transparent'
            : 'bg-gradient-to-b from-black/45 via-black/15 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-10 md:px-14">
        {/* Left: Minimal 3-line menu toggle matching ever.co.id */}
        <div className="flex flex-1 items-center justify-start">
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            className="group inline-flex h-11 w-11 items-center justify-center text-white transition-opacity duration-200 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F9F6F1] cursor-pointer"
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 5L19 19M19 5L5 19" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="flex w-6 flex-col gap-[5px]" aria-hidden="true">
                <span className="block h-[1.5px] w-full bg-white transition-transform duration-200 group-hover:translate-x-0.5" />
                <span className="block h-[1.5px] w-full bg-white" />
                <span className="block h-[1.5px] w-4 bg-white transition-all duration-200 group-hover:w-full" />
              </span>
            )}
          </button>
        </div>

        {/* Center: EVER Wordmark */}
        <div className="flex shrink-0 items-center justify-center">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              if (menuOpen) onToggleMenu();
              onNavigate('home');
            }}
            aria-label={`${config.brand.name} Home`}
            className="inline-flex items-center py-2 text-white transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
          >
            <BrandWordmark size="md" />
          </a>
        </div>

        {/* Right: Primary Appointment Action */}
        <div className="flex flex-1 items-center justify-end">
          <button
            type="button"
            onClick={() => {
              if (menuOpen) onToggleMenu();
              onOpenBooking();
            }}
            className="inline-flex min-h-10 items-center text-[11px] sm:text-xs font-normal tracking-[0.14em] uppercase text-white whitespace-nowrap shrink-0 border-b border-transparent hover:border-white/80 pb-0.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1] cursor-pointer"
          >
            <span className="hidden sm:inline">MAKE AN APPOINTMENT</span>
            <span className="sm:hidden">BOOK</span>
          </button>
        </div>
      </div>
    </header>
  );
}
