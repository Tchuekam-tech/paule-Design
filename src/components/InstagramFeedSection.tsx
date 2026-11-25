import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Layers,
  Play,
  X,
} from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import {
  extractInstagramHandle,
  formatInstagramDate,
  mergeInstagramFeed,
  type InstagramFeedApiResponse,
  type InstagramPostItem,
} from '../utils/instagramHelpers';

interface InstagramFeedSectionProps {
  onBookService: (serviceSlug?: string) => void;
}

export function InstagramFeedSection({ onBookService }: InstagramFeedSectionProps) {
  const { config } = useSiteContent();
  const [livePosts, setLivePosts] = useState<InstagramPostItem[]>([]);
  const [liveHandle, setLiveHandle] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const section = config.instagramSection;
  const maxPosts = Math.max(1, Math.min(12, section.maxPosts || 6));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/instagram/posts?limit=${maxPosts}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: InstagramFeedApiResponse | null) => {
        if (!data || !Array.isArray(data.posts)) return;
        if (data.posts.length > 0) {
          setLivePosts(data.posts);
        }
        if (data.handle) {
          setLiveHandle(data.handle);
        }
      })
      .catch(() => {
        // Silent graceful fallback to curated studio posts managed in Firestore
      });

    return () => controller.abort();
  }, [maxPosts]);

  const { posts } = mergeInstagramFeed(livePosts, config.instagramPosts, maxPosts);
  const displayHandle = liveHandle || extractInstagramHandle(section.handle || config.brand.social.instagram);
  const profileUrl = config.brand.social.instagram || 'https://www.instagram.com/';

  const activePost = activeIndex !== null ? posts[activeIndex] ?? null : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      } else if (event.key === 'ArrowRight' && posts.length > 1) {
        setActiveIndex((prev) => (prev === null ? null : (prev + 1) % posts.length));
      } else if (event.key === 'ArrowLeft' && posts.length > 1) {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + posts.length) % posts.length
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, posts.length]);

  if (posts.length === 0) return null;

  return (
    <section
      data-home-section="instagram"
      aria-labelledby="instagram-feed-heading"
      className="relative bg-[#6F5740] border-t border-white/10 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-14">
        {/* Editorial Section Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/15 pb-10">
          <div className="max-w-xl space-y-3">
            {section.eyebrow && (
              <p className="text-[11px] font-medium tracking-[0.26em] uppercase text-[#E5D7C6]">
                {section.eyebrow}
              </p>
            )}
            <h2
              id="instagram-feed-heading"
              className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] font-normal leading-[1.08] tracking-[-0.01em] text-[#F9F6F1]"
            >
              {section.heading}
            </h2>
            {section.subtitle && (
              <p className="text-sm font-light leading-relaxed text-white/80 max-w-lg">
                {section.subtitle}
              </p>
            )}
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-3 self-start md:self-auto border border-white/25 px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-[#F9F6F1] transition-all duration-300 hover:border-[#F9F6F1] hover:bg-[#F9F6F1] hover:text-[#251C14] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
          >
            <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{displayHandle}</span>
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Uniform Editorial 4:5 Instagram Gallery Grid */}
        <div
          data-testid="instagram-feed-grid"
          className="mt-12 grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3"
        >
          {posts.map((post, idx) => {
            const dateLabel = formatInstagramDate(post.timestamp);
            return (
              <button
                key={post.id}
                type="button"
                data-testid={`instagram-card-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className="group relative aspect-[4/5] w-full overflow-hidden border border-white/10 bg-[#251C14] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F9F6F1]"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption.slice(0, 120)}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Top Subtle Media Format Marker */}
                {post.mediaType !== 'IMAGE' && (
                  <span
                    aria-label={post.mediaType === 'VIDEO' ? 'Reel video' : 'Carousel gallery'}
                    className="pointer-events-none absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center bg-[#251C14]/65 text-white/95 backdrop-blur-xs"
                  >
                    {post.mediaType === 'VIDEO' ? (
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    ) : (
                      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </span>
                )}

                {/* Editorial Hover Reveal Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#1A1410]/90 via-[#1A1410]/35 to-transparent p-4 sm:p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <div className="translate-y-2 space-y-2 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                    <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.2em] uppercase text-[#E5D7C6]">
                      <span>{post.pillar || displayHandle}</span>
                      <span>{dateLabel}</span>
                    </div>
                    <p className="line-clamp-3 text-xs sm:text-[13px] font-light leading-relaxed text-white/95">
                      {post.caption}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Follow Line */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs font-light tracking-[0.06em] text-white/75">
            Tag <span className="text-[#F9F6F1] font-normal">{displayHandle}</span> to be featured in our studio journal.
          </p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-[#F9F6F1] underline-offset-4 hover:underline"
          >
            <span>{section.ctaLabel}</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Editorial Post Lightbox Modal (portaled to body to avoid ancestor transform stacking contexts) */}
      {activePost &&
        activeIndex !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Instagram post details"
            data-testid="instagram-lightbox"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1A1410]/85 p-4 sm:p-8 backdrop-blur-xs"
            onClick={() => setActiveIndex(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden border border-white/15 bg-[#251C14] text-[#F9F6F1] shadow-2xl md:grid-cols-12 max-h-[90vh]"
            >
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label="Close Instagram post"
                className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center bg-[#1A1410]/80 text-white/90 transition-colors hover:bg-white hover:text-[#251C14] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Post Visual */}
              <div className="relative aspect-[4/5] md:aspect-auto md:col-span-7 bg-[#1A1410] max-h-[52vh] md:max-h-[80vh]">
                <img
                  src={activePost.imageUrl}
                  alt={activePost.caption.slice(0, 120)}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center"
                />

                {posts.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous Instagram post"
                      onClick={() =>
                        setActiveIndex((activeIndex - 1 + posts.length) % posts.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center bg-[#1A1410]/75 text-white transition-colors hover:bg-white hover:text-[#251C14] cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next Instagram post"
                      onClick={() => setActiveIndex((activeIndex + 1) % posts.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center bg-[#1A1410]/75 text-white transition-colors hover:bg-white hover:text-[#251C14] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>

              {/* Editorial Caption & Actions */}
              <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 md:col-span-5 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5 pr-8">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Instagram className="h-4 w-4 shrink-0 text-[#D8C7B4]" aria-hidden="true" />
                      <span className="truncate text-xs font-medium tracking-[0.12em] text-[#F9F6F1]">
                        {activePost.username ? `@${activePost.username}` : displayHandle}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] tracking-[0.18em] uppercase text-white/60">
                      {formatInstagramDate(activePost.timestamp)}
                    </span>
                  </div>

                  {activePost.pillar && (
                    <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#D8C7B4]">
                      Featured Ritual · {activePost.pillar}
                    </p>
                  )}

                  <p className="text-sm font-light leading-relaxed text-white/90 whitespace-pre-line">
                    {activePost.caption}
                  </p>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      const slug = activePost.serviceSlug;
                      setActiveIndex(null);
                      onBookService(slug);
                    }}
                    className="flex min-h-11 w-full items-center justify-center bg-[#F9F6F1] px-6 py-3 text-xs font-medium tracking-[0.18em] uppercase text-[#251C14] transition-colors hover:bg-white cursor-pointer"
                  >
                    Book This Look
                  </button>

                  <a
                    href={activePost.permalink || profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 w-full items-center justify-center gap-2 border border-white/25 px-6 py-2.5 text-xs font-medium tracking-[0.16em] uppercase text-white/90 transition-colors hover:border-white hover:text-white"
                  >
                    <span>View on Instagram</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>

                  <p className="text-center font-mono text-[10px] tracking-[0.2em] text-white/50">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(posts.length).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
