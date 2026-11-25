import { useSiteContent } from '../context/SiteContentContext';

interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'xl';
  name?: string;
}

/**
 * Renders the sculpted EVER wordmark matching ever.co.id's signature curved top-bar E's.
 * If the salon manager renames the brand in the Admin Panel, this component
 * automatically renders the new brand name in refined wide-tracked display lettering.
 */
export function BrandWordmark({
  className = '',
  size = 'md',
  name,
}: BrandWordmarkProps) {
  const { config } = useSiteContent();
  const resolvedName = name ?? config.brand.name;
  const isDefaultEver = resolvedName.trim().toUpperCase() === 'EVER';

  if (!isDefaultEver) {
    const sizeClasses =
      size === 'xl'
        ? 'text-3xl sm:text-5xl md:text-6xl xl:text-7xl tracking-[0.14em] sm:tracking-[0.16em] font-normal sm:whitespace-nowrap'
        : size === 'sm'
          ? 'text-sm tracking-[0.2em] font-normal whitespace-nowrap'
          : 'text-base sm:text-[1.4rem] tracking-[0.2em] sm:tracking-[0.24em] font-normal whitespace-nowrap';
    return (
      <span
        className={`inline-block max-w-full font-serif uppercase leading-none select-none ${sizeClasses} ${className}`}
      >
        {resolvedName}
      </span>
    );
  }

  const dimensions =
    size === 'xl'
      ? 'h-16 sm:h-24 md:h-32 w-auto'
      : size === 'sm'
        ? 'h-3.5 w-auto'
        : 'h-4 sm:h-[18px] w-auto';

  return (
    <svg
      viewBox="0 0 340 72"
      fill="currentColor"
      aria-label={resolvedName}
      role="img"
      className={`${dimensions} ${className}`}
    >
      {/* Sculpted E with curved lash-inspired top bar */}
      <path d="M6 12C18 12 31 11 45 14C48 15 51 17 52 19C41 18 28 19 16 20V32H44V39H16V56H51V64H7V12H6Z" />
      {/* V */}
      <path d="M88 12H98L117 54L136 12H145L120 65H113L88 12Z" />
      {/* Sculpted E with curved lash-inspired top bar */}
      <path d="M180 12C192 12 205 11 219 14C222 15 225 17 226 19C215 18 202 19 190 20V32H218V39H190V56H225V64H181V12H180Z" />
      {/* R */}
      <path d="M266 12H293C307 12 316 18 316 29C316 37 311 43 302 45L319 64H307L292 46H275V64H266V12ZM275 19V39H292C301 39 306 35 306 29C306 23 301 19 292 19H275Z" />
    </svg>
  );
}
