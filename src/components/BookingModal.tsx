import { useEffect, useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import {
  buildWhatsAppBookingUrl,
  validateBookingForm,
  type BookingFormValues,
} from '../utils/siteHelpers';

interface BookingModalProps {
  open: boolean;
  defaultServiceSlug?: string;
  defaultLocationId?: string;
  onClose: () => void;
}

const TIME_SLOTS = [
  '09:30',
  '11:00',
  '13:00',
  '14:30',
  '16:00',
  '17:30',
  '19:00',
];

export function BookingModal({
  open,
  defaultServiceSlug,
  defaultLocationId,
  onClose,
}: BookingModalProps) {
  const { config, submitClientInquiry } = useSiteContent();
  const firstServiceSlug = config.services[0]?.slug ?? '';
  const firstLocationId = config.locations[0]?.id ?? '';

  const [values, setValues] = useState<BookingFormValues>({
    fullName: '',
    contact: '',
    serviceSlug: defaultServiceSlug || firstServiceSlug,
    locationId: defaultLocationId || firstLocationId,
    therapistTier: 'Stylist',
    preferredDate: '',
    preferredTime: '11:00',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormValues, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues((prev) => ({
      ...prev,
      serviceSlug: defaultServiceSlug || prev.serviceSlug || firstServiceSlug,
      locationId: defaultLocationId || prev.locationId || firstLocationId,
    }));
    setErrors({});
    setSubmitted(false);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, defaultServiceSlug, defaultLocationId, firstServiceSlug, firstLocationId, onClose]);

  if (!open) return null;

  const selectedService =
    config.services.find((s) => s.slug === values.serviceSlug) ??
    config.services[0];
  const selectedLocation =
    config.locations.find((l) => l.id === values.locationId) ??
    config.locations[0];

  if (!selectedService || !selectedLocation) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateBookingForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmitted(true);

    void submitClientInquiry({
      type: 'booking',
      name: values.fullName.trim(),
      contact: values.contact.trim(),
      message: values.notes.trim() || `Appointment request for ${selectedService.name}`,
      serviceName: selectedService.name,
      locationName: selectedLocation.name,
      therapistTier: values.therapistTier,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
    }).catch(() => {
      // Non-blocking: guest still receives WhatsApp & confirmation summary
    });
  };

  const whatsappUrl = buildWhatsAppBookingUrl(config.brand.whatsappNumber, {
    brandName: config.brand.houseName,
    fullName: values.fullName,
    serviceName: selectedService.name,
    locationName: selectedLocation.name,
    therapistTier: values.therapistTier,
    preferredDate: values.preferredDate,
    preferredTime: values.preferredTime,
    notes: values.notes,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl border border-white/15 bg-[#251C14] text-white shadow-2xl my-auto">
        <div className="flex items-start justify-between gap-4 border-b border-white/15 px-6 py-5 sm:px-8">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/60">
              {config.brand.houseName} Concierge
            </p>
            <h2
              id="booking-modal-title"
              className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-white"
            >
              Make an Appointment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close appointment dialog"
            className="inline-flex h-10 w-10 items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-8 sm:px-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F9F6F1] text-[#5F4A36]">
                <Check className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-white">
                  Reservation Request Ready
                </h3>
                <p className="mt-1 text-sm text-white/75 leading-relaxed">
                  Thank you, {values.fullName}. Our concierge at{' '}
                  <strong className="font-medium text-white">
                    {selectedLocation.name}
                  </strong>{' '}
                  has recorded your request and will confirm availability shortly.
                </p>
              </div>
            </div>

            <dl className="divide-y divide-white/15 border-t border-b border-white/15 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-white/60">Treatment</dt>
                <dd className="text-right text-white font-medium">
                  {selectedService.name} ({selectedService.pillar})
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-white/60">Specialist Tier</dt>
                <dd className="text-right text-white">
                  {values.therapistTier} ·{' '}
                  {values.therapistTier === 'Stylist'
                    ? selectedService.stylistPrice
                    : selectedService.technicianPrice}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-white/60">Preferred Schedule</dt>
                <dd className="text-right text-white tabular-nums">
                  {values.preferredDate} · {values.preferredTime}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-white/60">Contact</dt>
                <dd className="text-right text-white">{values.contact}</dd>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center bg-[#F9F6F1] px-6 py-3 text-xs font-medium tracking-[0.14em] uppercase text-[#5F4A36] hover:bg-white transition-colors"
              >
                Send via WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center border border-white/25 px-6 py-3 text-xs font-medium tracking-[0.14em] uppercase text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="px-6 py-6 sm:px-8 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-name"
                  className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="booking-name"
                  type="text"
                  value={values.fullName}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="e.g. Nadia Putri"
                  className="w-full border border-white/25 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#F9F6F1] focus:outline-none"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-[#F3C5A2]">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-contact"
                  className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5"
                >
                  WhatsApp or Email
                </label>
                <input
                  id="booking-contact"
                  type="text"
                  value={values.contact}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, contact: e.target.value }))
                  }
                  placeholder="+62 812 ... or email"
                  className="w-full border border-white/25 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#F9F6F1] focus:outline-none"
                />
                {errors.contact && (
                  <p className="mt-1 text-xs text-[#F3C5A2]">{errors.contact}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-service"
                  className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5"
                >
                  Treatment
                </label>
                <select
                  id="booking-service"
                  value={values.serviceSlug}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, serviceSlug: e.target.value }))
                  }
                  className="w-full border border-white/25 bg-[#2F241A] px-3.5 py-2.5 text-sm text-white focus:border-[#F9F6F1] focus:outline-none"
                >
                  {config.services.map((service) => (
                    <option key={service.id} value={service.slug}>
                      {service.index} — {service.name}
                    </option>
                  ))}
                </select>
                {errors.serviceSlug && (
                  <p className="mt-1 text-xs text-[#F3C5A2]">{errors.serviceSlug}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-location"
                  className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5"
                >
                  Studio Branch
                </label>
                <select
                  id="booking-location"
                  value={values.locationId}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, locationId: e.target.value }))
                  }
                  className="w-full border border-white/25 bg-[#2F241A] px-3.5 py-2.5 text-sm text-white focus:border-[#F9F6F1] focus:outline-none"
                >
                  {config.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city})
                    </option>
                  ))}
                </select>
                {errors.locationId && (
                  <p className="mt-1 text-xs text-[#F3C5A2]">{errors.locationId}</p>
                )}
              </div>
            </div>

            {/* Therapist Tier Segmented Control */}
            <div>
              <span className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5">
                Therapist Tier
              </span>
              <div className="grid grid-cols-2 gap-2 border border-white/20 p-1 bg-white/[0.03]">
                {(['Technician', 'Stylist'] as const).map((tier) => {
                  const active = values.therapistTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() =>
                        setValues((prev) => ({ ...prev, therapistTier: tier }))
                      }
                      aria-pressed={active}
                      className={`min-h-10 px-3 py-2 text-xs tracking-[0.12em] uppercase transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#F9F6F1] text-[#5F4A36] font-medium'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {tier} ·{' '}
                      {tier === 'Stylist'
                        ? selectedService.stylistPrice
                        : selectedService.technicianPrice}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="booking-date"
                  className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5"
                >
                  Preferred Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={values.preferredDate}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, preferredDate: e.target.value }))
                  }
                  className="w-full border border-white/25 bg-[#2F241A] px-3.5 py-2.5 text-sm text-white focus:border-[#F9F6F1] focus:outline-none"
                />
                {errors.preferredDate && (
                  <p className="mt-1 text-xs text-[#F3C5A2]">{errors.preferredDate}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-time"
                  className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5"
                >
                  Preferred Time
                </label>
                <select
                  id="booking-time"
                  value={values.preferredTime}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, preferredTime: e.target.value }))
                  }
                  className="w-full border border-white/25 bg-[#2F241A] px-3.5 py-2.5 text-sm text-white tabular-nums focus:border-[#F9F6F1] focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.preferredTime && (
                  <p className="mt-1 text-xs text-[#F3C5A2]">{errors.preferredTime}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="booking-notes"
                className="block text-[11px] tracking-[0.16em] uppercase text-white/75 mb-1.5"
              >
                Preferences or Patch Test Request (Optional)
              </label>
              <textarea
                id="booking-notes"
                rows={2}
                value={values.notes}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Share reference styles, lash sensitivity, or home service requests..."
                className="w-full border border-white/25 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#F9F6F1] focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/15">
              <p className="text-xs text-white/60">
                Cashless payments preferred · Private suite guaranteed
              </p>
              <button
                type="submit"
                className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center bg-[#F9F6F1] px-8 py-3 text-xs font-medium tracking-[0.16em] uppercase text-[#5F4A36] hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
              >
                Confirm Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
