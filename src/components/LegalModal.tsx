import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

export type LegalDocType = 'privacy' | 'terms' | 'cookies';

interface LegalModalProps {
  doc: LegalDocType | null;
  onClose: () => void;
}

export function LegalModal({ doc, onClose }: LegalModalProps) {
  const { config } = useSiteContent();

  useEffect(() => {
    if (!doc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [doc, onClose]);

  if (!doc) return null;

  const legalCopy: Record<LegalDocType, { title: string; sections: string[] }> = {
    privacy: {
      title: 'Privacy Policy',
      sections: [
        `${config.brand.houseName} collects only the contact details, treatment preferences, and appointment notes you voluntarily provide when scheduling a session.`,
        'Your consultation records and desired styling notes are stored securely solely to personalize future visits across our studio branches and are never sold to third parties.',
        `You may request access to or deletion of your booking profile at any time by contacting ${config.brand.email}.`,
      ],
    },
    terms: {
      title: 'Terms of Service',
      sections: [
        'Appointments may be rescheduled up to 6 hours prior to your reserved time slot without fee. Arrivals more than 15 minutes late may require adjusting the treatment scope.',
        'Allergic sensitivity patch tests are available upon separate request 48 hours prior to lash or pigment treatments.',
        'Prices listed reflect studio standard tiers (Technician and Stylist) and exclude mobile transport fees for Home Services.',
      ],
    },
    cookies: {
      title: 'Cookies Settings',
      sections: [
        'This website uses essential browser storage strictly to remember your navigation view and smooth display preferences.',
        'No invasive third-party ad tracking scripts are active on this studio website.',
      ],
    },
  };

  const content = legalCopy[doc];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg border border-white/15 bg-[#251C14] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/15 px-6 py-5">
          <h2 id="legal-modal-title" className="font-serif text-2xl font-normal text-white">
            {content.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${content.title}`}
            className="inline-flex h-10 w-10 items-center justify-center text-white/75 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-6 text-sm font-light leading-relaxed text-white/85">
          {content.sections.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
        </div>
        <div className="flex justify-end border-t border-white/15 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 bg-[#F9F6F1] px-6 py-2 text-xs font-medium tracking-[0.14em] uppercase text-[#5F4A36] hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
