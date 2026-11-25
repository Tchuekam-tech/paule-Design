import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

interface FaqSectionProps {
  onOpenContact: () => void;
  onGoToLocations: () => void;
}

export function FaqSection({ onOpenContact, onGoToLocations }: FaqSectionProps) {
  const { config } = useSiteContent();
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-[#7A6047] py-24 sm:py-32 border-t border-white/10"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-14">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Left Column: Serif Heading + Contact CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <h2
              id="faq-heading"
              className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal leading-[1.08] text-white"
            >
              Frequently Asked
              <br />
              Questions
            </h2>

            <p className="max-w-sm text-sm sm:text-base font-light leading-relaxed text-white/85">
              Didn&apos;t find the answer to your question? Send it to us by chat.
              We will be happy to answer you!
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenContact}
                className="inline-flex min-h-12 w-full sm:w-auto sm:min-w-[260px] items-center justify-center bg-[#96846F] hover:bg-[#F9F6F1] hover:text-[#7A6047] px-8 py-3.5 text-sm font-normal tracking-[0.06em] text-white transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Right Column: Hairline Accordion */}
          <div className="lg:col-span-7">
            <ul className="divide-y divide-white/20 border-t border-b border-white/20">
              {config.faqs.map((faq) => {
                const isOpen = openId === faq.id;
                const panelId = `${faq.id}-panel`;
                return (
                  <li key={faq.id}>
                    <button
                      type="button"
                      onClick={() => handleToggle(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left transition-opacity duration-200 hover:opacity-85 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F9F6F1]"
                    >
                      <span className="text-xs sm:text-sm font-normal tracking-[0.12em] uppercase leading-relaxed text-white">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-white/80 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <div
                      id={panelId}
                      aria-hidden={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pb-6 pr-6 space-y-3 text-sm font-light leading-relaxed text-white/85">
                          {faq.paragraphs.map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                          {faq.hasLocationLink && (
                            <button
                              type="button"
                              tabIndex={isOpen ? 0 : -1}
                              onClick={onGoToLocations}
                              className="inline-flex items-center text-xs font-medium tracking-[0.14em] uppercase text-[#F9F6F1] underline underline-offset-4 hover:opacity-80 pt-1 cursor-pointer"
                            >
                              View all salon locations &amp; opening hours
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
