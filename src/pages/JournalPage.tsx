import { useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { JournalArticle } from '../data/siteConfig';
import { useSiteContent } from '../context/SiteContentContext';

interface JournalPageProps {
  onOpenBooking: () => void;
}

export function JournalPage({ onOpenBooking }: JournalPageProps) {
  const { config } = useSiteContent();
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);

  if (activeArticle) {
    return (
      <article className="min-h-screen bg-[#7A6047] pt-28 sm:pt-36 pb-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-10 space-y-8">
          <button
            type="button"
            onClick={() => setActiveArticle(null)}
            className="inline-flex min-h-10 items-center gap-2 text-xs tracking-[0.16em] uppercase text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Journal</span>
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs tracking-[0.14em] uppercase text-white/70">
              <span>{activeArticle.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeArticle.date}</span>
              <span aria-hidden="true">·</span>
              <span>{activeArticle.readTime}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.12] text-white">
              {activeArticle.title}
            </h1>
          </div>

          <div className="aspect-[16/9] w-full overflow-hidden bg-[#5F4A36]">
            <img
              src={activeArticle.image}
              alt={activeArticle.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-5 text-base font-light leading-[1.8] text-white/90">
            {activeArticle.body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm font-light text-white/80">
              Have a question for our lash and brow specialists?
            </p>
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex min-h-11 items-center justify-center bg-[#F9F6F1] px-7 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#7A6047] hover:bg-white transition-colors cursor-pointer"
            >
              Book Consultation
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <section className="min-h-screen bg-[#7A6047] pt-28 sm:pt-36 pb-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-14">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs tracking-[0.22em] uppercase text-white/70">
            {config.brand.name} EDITORIAL
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.08] text-white">
            The Journal
          </h1>
          <p className="text-sm sm:text-base font-light leading-relaxed text-white/85 max-w-xl">
            Notes on aftercare, ingredient science, and the quiet rituals behind
            long-lasting natural beauty.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
          {config.journal.map((article) => (
            <article
              key={article.id}
              className="group border border-white/15 bg-[#6E563F]/75 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#5F4A36]">
                  <img
                    src={article.image}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-7 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white/65">
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-snug text-white">
                    {article.title}
                  </h2>
                  <p className="text-sm font-light leading-relaxed text-white/80">
                    {article.excerpt}
                  </p>
                </div>
              </div>
              <div className="border-t border-white/15 px-7 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveArticle(article);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex min-h-10 items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-[#F9F6F1] hover:opacity-75 transition-opacity cursor-pointer"
                >
                  <span>Read Article</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
