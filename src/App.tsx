import { useCallback, useEffect, useState } from 'react';
import { Header, type AppRoute } from './components/Header';
import { MenuDrawer } from './components/MenuDrawer';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { LegalModal, type LegalDocType } from './components/LegalModal';
import { Preloader } from './components/Preloader';
import { ToastViewport, useToast } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { StoryPage } from './pages/StoryPage';
import { LocationsPage } from './pages/LocationsPage';
import { JournalPage } from './pages/JournalPage';
import { AdminPage } from './pages/AdminPage';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useSiteContent } from './context/SiteContentContext';
import type { ServicePillar } from './data/siteConfig';
import type { ContactFormValues } from './utils/siteHelpers';

function parseHashRoute(): { route: AppRoute; serviceSlug?: string } {
  if (typeof window === 'undefined') return { route: 'home' };
  const rawHash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  const rawPath = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const hash = window.location.hash ? rawHash : rawPath;
  if (hash === 'admin' || hash.startsWith('admin/')) {
    return { route: 'admin' };
  }
  if (hash.startsWith('services/')) {
    return { route: 'services', serviceSlug: hash.replace('services/', '') };
  }
  if (hash === 'services') {
    return { route: 'services' };
  }
  if (hash === 'about-us' || hash === 'story') {
    return { route: 'story' };
  }
  if (hash === 'location' || hash === 'locations') {
    return { route: 'locations' };
  }
  if (hash === 'journal' || hash === 'post') {
    return { route: 'journal' };
  }
  return { route: 'home' };
}

export default function App() {
  const { config, submitClientInquiry } = useSiteContent();
  const initial = parseHashRoute();

  const [route, setRoute] = useState<AppRoute>(initial.route);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | undefined>(
    initial.serviceSlug
  );
  const [selectedPillar, setSelectedPillar] = useState<ServicePillar | undefined>(
    undefined
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(
    initial.route === 'admin' || !config.structure.showPreloader
  );
  const [bookingState, setBookingState] = useState<{
    open: boolean;
    serviceSlug?: string;
    locationId?: string;
  }>({ open: false });
  const [legalDoc, setLegalDoc] = useState<LegalDocType | null>(null);
  const { toasts, showToast, dismissToast } = useToast();

  // Disable custom smooth-scroll inertia inside Admin Panel or when modals/drawers are open
  useSmoothScroll(route === 'admin' || menuOpen || bookingState.open || !!legalDoc);

  useEffect(() => {
    if (!config.structure.showPreloader) {
      setHeroReady(true);
    }
  }, [config.structure.showPreloader]);

  // Keep browser document title aligned with the brand name managed in Admin
  useEffect(() => {
    const suffix = route === 'admin' ? 'Manager Console' : config.brand.tagline;
    document.title = `${config.brand.name} — ${suffix}`;
  }, [config.brand.name, config.brand.tagline, route]);

  const navigate = useCallback(
    (nextRoute: AppRoute, serviceSlug?: string, pillar?: ServicePillar) => {
      setRoute(nextRoute);
      setSelectedServiceSlug(nextRoute === 'services' ? serviceSlug : undefined);
      setSelectedPillar(nextRoute === 'services' ? pillar : undefined);

      const targetHash =
        nextRoute === 'home'
          ? '#/'
          : nextRoute === 'services' && serviceSlug
            ? `#/services/${serviceSlug}`
            : `#/${nextRoute}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${targetHash}`);
      }
      window.scrollTo({ top: 0, behavior: nextRoute === 'admin' ? 'auto' : 'smooth' });
    },
    []
  );

  const openBooking = useCallback((serviceSlug?: string, locationId?: string) => {
    setBookingState({ open: true, serviceSlug, locationId });
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const parsed = parseHashRoute();
      setRoute(parsed.route);
      setSelectedServiceSlug(parsed.serviceSlug);
      if (parsed.route === 'admin') {
        setHeroReady(true);
        setMenuOpen(false);
      }
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setHeroReady(true);
  }, []);

  const handleFooterContactSubmitted = useCallback(
    (values: ContactFormValues) => {
      // Persist client note to Firestore Inbox in the background so Salon Managers see it
      void submitClientInquiry({
        type: 'contact',
        name: values.name,
        contact: values.contact,
        message: values.message,
      }).catch(() => {
        // Non-blocking: confirmation toast still provides graceful feedback to the guest
      });

      showToast({
        variant: 'success',
        title: `Thank you, ${values.name}`,
        message: `Your note has been received by our ${config.brand.name} concierge. We will reach out shortly via ${values.contact}.`,
        durationMs: 5500,
      });
    },
    [config.brand.name, showToast, submitClientInquiry]
  );

  if (route === 'admin') {
    return (
      <>
        <AdminPage
          onExitAdmin={() => navigate('home')}
          onNotify={showToast}
        />
        <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#7A6047] text-white">
      {config.structure.showPreloader && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
        onNavigate={(r) => navigate(r)}
        onOpenBooking={() => openBooking()}
      />

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(r, slug) => navigate(r, slug)}
        onOpenBooking={(slug) => openBooking(slug)}
      />

      <main key={route} className="animate-fade-up">
        {route === 'home' && (
          <HomePage
            heroReady={heroReady}
            onNavigate={navigate}
            onOpenBooking={(slug) => openBooking(slug)}
          />
        )}

        {route === 'services' && (
          <ServicesPage
            selectedSlug={selectedServiceSlug}
            initialPillar={selectedPillar}
            onSelectSlug={(slug) => {
              setSelectedServiceSlug(slug);
              const targetHash = slug ? `#/services/${slug}` : '#/services';
              if (window.location.hash !== targetHash) {
                window.history.replaceState(
                  null,
                  '',
                  `${window.location.pathname}${window.location.search}${targetHash}`
                );
              }
            }}
            onBookService={(slug) => openBooking(slug)}
          />
        )}

        {route === 'story' && (
          <StoryPage
            onExploreServices={() => navigate('services')}
            onOpenBooking={() => openBooking()}
          />
        )}

        {route === 'locations' && (
          <LocationsPage
            onBookAtLocation={(locId) => openBooking(undefined, locId)}
          />
        )}

        {route === 'journal' && (
          <JournalPage onOpenBooking={() => openBooking()} />
        )}
      </main>

      <Footer
        onNavigate={(r) => navigate(r)}
        onOpenBooking={() => openBooking()}
        onOpenLegal={(doc) => setLegalDoc(doc)}
        onContactSubmitted={handleFooterContactSubmitted}
        showBottomBanner={route === 'home' && config.structure.showFooterBanner}
        showContactForm={config.structure.showFooterContactForm}
      />

      <BookingModal
        open={bookingState.open}
        defaultServiceSlug={bookingState.serviceSlug}
        defaultLocationId={bookingState.locationId}
        onClose={() => setBookingState({ open: false })}
      />

      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
