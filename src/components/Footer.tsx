import { useRef, useState, type FormEvent } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import { BrandWordmark } from './BrandWordmark';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { lerp } from '../utils/scrollMath';
import {
  validateContactForm,
  type ContactFormValues,
} from '../utils/siteHelpers';
import type { AppRoute } from './Header';
import type { LegalDocType } from './LegalModal';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
  onOpenBooking: () => void;
  onOpenLegal: (doc: LegalDocType) => void;
  onContactSubmitted?: (values: ContactFormValues) => void;
  showBottomBanner?: boolean;
  showContactForm?: boolean;
}

const INITIAL_CONTACT: ContactFormValues = {
  name: '',
  contact: '',
  message: '',
};

export function Footer({
  onNavigate,
  onOpenBooking,
  onOpenLegal,
  onContactSubmitted,
  showBottomBanner = true,
  showContactForm = true,
}: FooterProps) {
  const { config } = useSiteContent();
  const bannerRef = useRef<HTMLButtonElement>(null);
  const bannerTransit = useScrollProgress(bannerRef, 'transit', 0.5);
  const bannerParallaxY = lerp(-48, 36, bannerTransit);

  const [formValues, setFormValues] = useState<ContactFormValues>(INITIAL_CONTACT);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ContactFormValues, string>>
  >({});

  const handleFieldChange = (field: keyof ContactFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateContactForm(formValues);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const submitted: ContactFormValues = {
      name: formValues.name.trim(),
      contact: formValues.contact.trim(),
      message: formValues.message.trim(),
    };

    setFormErrors({});
    setFormValues(INITIAL_CONTACT);
    onContactSubmitted?.(submitted);
  };

  return (
    <footer className="bg-[#7A6047] text-white">
      {/* Upper Footer Navigation & Monumental Brand Wordmark */}
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-14 sm:px-10 md:px-14 border-t border-white/15">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-12">
          {/* Column 1: Company */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-medium tracking-[0.08em] text-white/75">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs tracking-[0.14em] uppercase text-white/90">
              {(
                [
                  { label: 'HOME', route: 'home' },
                  { label: 'OUR STORY', route: 'story' },
                  { label: 'JOURNAL', route: 'journal' },
                  { label: 'SERVICE', route: 'services' },
                  { label: 'LOCATIONS', route: 'locations' },
                ] as const
              ).map((item) => (
                <li key={item.route}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.route)}
                    className="hover:opacity-70 hover:translate-x-0.5 transition-all duration-200 cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Contact */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-medium tracking-[0.08em] text-white/75">
              Contact
            </h3>
            <ul className="space-y-2.5 text-xs tracking-[0.14em] uppercase text-white/90">
              <li>
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="text-left hover:opacity-70 hover:translate-x-0.5 transition-all duration-200 cursor-pointer"
                >
                  SCHEDULE AN APPOINTMENT
                </button>
              </li>
              <li>
                <a
                  href={config.brand.phoneHref}
                  className="inline-block hover:opacity-70 hover:translate-x-0.5 transition-all duration-200"
                >
                  CHAT WITH CONSULTANT
                </a>
              </li>
              <li className="pt-1 text-[11px] normal-case tracking-normal text-white/70">
                {config.brand.phoneDisplay} · {config.brand.email}
              </li>
            </ul>
          </div>

          {/* Column 3: Follow Us */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-xs font-medium tracking-[0.08em] text-white/75">
              Follow Us
            </h3>
            <div className="flex items-center gap-4">
              <a
                href={config.brand.social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-[#7A6047] hover:scale-105 transition-all duration-200"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V22h3.4Z" />
                </svg>
              </a>
              <a
                href={config.brand.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-[#7A6047] hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 4: Concierge Contact Form */}
          {showContactForm && (
          <div className="col-span-2 sm:col-span-3 lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-medium tracking-[0.08em] text-white/75">
                Send a Note
              </h3>
              <p className="text-xs font-light text-white/70">
                Questions about a treatment, bridal inquiry, or private booking? Leave a message for our concierge.
              </p>
            </div>

            <form
              onSubmit={handleContactSubmit}
              noValidate
              data-testid="footer-contact-form"
              className="space-y-3.5"
            >
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="footer-contact-name" className="sr-only">
                    Your name
                  </label>
                  <input
                    id="footer-contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={formValues.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    aria-invalid={Boolean(formErrors.name)}
                    className="w-full border-b border-white/30 bg-transparent py-2 text-xs text-white placeholder:text-white/50 transition-colors focus:border-[#F9F6F1] focus:outline-none"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-[11px] text-[#F9E3D8]" role="alert">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="footer-contact-info" className="sr-only">
                    Email or WhatsApp number
                  </label>
                  <input
                    id="footer-contact-info"
                    name="contact"
                    type="text"
                    autoComplete="email"
                    placeholder="Email or WhatsApp"
                    value={formValues.contact}
                    onChange={(e) => handleFieldChange('contact', e.target.value)}
                    aria-invalid={Boolean(formErrors.contact)}
                    className="w-full border-b border-white/30 bg-transparent py-2 text-xs text-white placeholder:text-white/50 transition-colors focus:border-[#F9F6F1] focus:outline-none"
                  />
                  {formErrors.contact && (
                    <p className="mt-1 text-[11px] text-[#F9E3D8]" role="alert">
                      {formErrors.contact}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="footer-contact-message" className="sr-only">
                  Your message
                </label>
                <textarea
                  id="footer-contact-message"
                  name="message"
                  rows={2}
                  placeholder="Tell us how we can assist you..."
                  value={formValues.message}
                  onChange={(e) => handleFieldChange('message', e.target.value)}
                  aria-invalid={Boolean(formErrors.message)}
                  className="w-full resize-none border-b border-white/30 bg-transparent py-2 text-xs text-white placeholder:text-white/50 transition-colors focus:border-[#F9F6F1] focus:outline-none"
                />
                {formErrors.message && (
                  <p className="mt-1 text-[11px] text-[#F9E3D8]" role="alert">
                    {formErrors.message}
                  </p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center justify-center bg-[#F9F6F1] px-6 py-2.5 text-[11px] font-medium tracking-[0.18em] uppercase text-[#7A6047] transition-all duration-300 hover:bg-white hover:tracking-[0.22em] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
          )}
        </div>

        {/* Monumental Brand Wordmark & Legal Row */}
        <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            aria-label={`Back to ${config.brand.name} top`}
            className="w-fit text-white transition-opacity hover:opacity-85 cursor-pointer"
          >
            <BrandWordmark size="xl" />
          </button>

          <div className="space-y-2.5 text-left lg:text-right text-xs text-white/80">
            <p>{config.brand.copyright}</p>
            <div className="flex flex-wrap items-center gap-5 lg:justify-end">
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('cookies')}
                className="underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
              >
                Cookies Settings
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="underline underline-offset-4 text-white/65 hover:text-white transition-colors cursor-pointer"
              >
                Manager Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Final Full-Bleed Macro Orchid Portrait CTA Banner with Scroll-Linked Parallax */}
      {showBottomBanner && (
        <button
          ref={bannerRef}
          type="button"
          onClick={() => onNavigate('services')}
          aria-label={config.footerBanner.label}
          className="group relative block h-[460px] sm:h-[620px] w-full overflow-hidden bg-[#251C14] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#F9F6F1]"
        >
          <img
            src={config.footerBanner.image}
            alt={config.footerBanner.imageAlt}
            referrerPolicy="no-referrer"
            style={{
              transform: `translate3d(0, ${bannerParallaxY}px, 0) scale(1.16)`,
            }}
            className="h-full w-full object-cover object-center will-change-transform transition-[filter] duration-700 group-hover:brightness-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/20 transition-opacity duration-500 group-hover:bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <span className="border-b border-white/60 pb-1.5 font-sans text-sm sm:text-base font-normal tracking-[0.14em] text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-white group-hover:tracking-[0.22em]">
              {config.footerBanner.label}
            </span>
          </div>
        </button>
      )}
    </footer>
  );
}
