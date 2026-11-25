import type { ServiceItem, ServicePillar, StudioLocation } from '../data/siteConfig';

export interface BookingFormValues {
  fullName: string;
  contact: string;
  serviceSlug: string;
  locationId: string;
  therapistTier: 'Technician' | 'Stylist';
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export interface BookingValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof BookingFormValues, string>>;
}

export function filterServices(
  services: ServiceItem[],
  pillar: ServicePillar | 'ALL',
  searchQuery = ''
): ServiceItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return services.filter((service) => {
    const matchesPillar = pillar === 'ALL' || service.pillar === pillar;
    if (!matchesPillar) return false;
    if (!normalizedQuery) return true;
    return (
      service.name.toLowerCase().includes(normalizedQuery) ||
      service.pillar.toLowerCase().includes(normalizedQuery) ||
      service.shortDescription.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function filterLocations(
  locations: StudioLocation[],
  city: string
): StudioLocation[] {
  if (!city || city === 'ALL') return locations;
  return locations.filter((loc) => loc.city.toLowerCase() === city.toLowerCase());
}

export function getUniqueCities(locations: StudioLocation[]): string[] {
  const seen = new Set<string>();
  const cities: string[] = [];
  for (const loc of locations) {
    if (!seen.has(loc.city)) {
      seen.add(loc.city);
      cities.push(loc.city);
    }
  }
  return cities;
}

export function isValidContact(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneDigits = trimmed.replace(/[\s\-()+]/g, '');
  const phoneRegex = /^\d{8,15}$/;
  return emailRegex.test(trimmed) || phoneRegex.test(phoneDigits);
}

export function validateBookingForm(values: BookingFormValues): BookingValidationResult {
  const errors: Partial<Record<keyof BookingFormValues, string>> = {};

  if (!values.fullName.trim() || values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }

  if (!isValidContact(values.contact)) {
    errors.contact = 'Enter a valid WhatsApp/phone number or email address.';
  }

  if (!values.serviceSlug) {
    errors.serviceSlug = 'Please choose a treatment.';
  }

  if (!values.locationId) {
    errors.locationId = 'Please choose a studio location.';
  }

  if (!values.preferredDate) {
    errors.preferredDate = 'Please select a preferred date.';
  }

  if (!values.preferredTime) {
    errors.preferredTime = 'Please select a preferred time slot.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildWhatsAppBookingUrl(
  whatsappNumber: string,
  details: {
    brandName: string;
    fullName: string;
    serviceName: string;
    locationName: string;
    therapistTier: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }
): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const lines = [
    `Hello ${details.brandName}, I would like to book an appointment:`,
    `Name: ${details.fullName}`,
    `Treatment: ${details.serviceName} (${details.therapistTier})`,
    `Location: ${details.locationName}`,
    `Date & Time: ${details.preferredDate} at ${details.preferredTime}`,
  ];
  if (details.notes && details.notes.trim()) {
    lines.push(`Notes: ${details.notes.trim()}`);
  }
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(lines.join('\n'))}`;
}

export function formatServiceIndex(idx: number): string {
  return String(idx + 1).padStart(3, '0');
}

export interface ContactFormValues {
  name: string;
  contact: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormValues, string>>;
}

export function validateContactForm(
  values: ContactFormValues
): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormValues, string>> = {};

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }

  if (!isValidContact(values.contact)) {
    errors.contact = 'Enter a valid email address or phone number.';
  }

  if (!values.message.trim() || values.message.trim().length < 5) {
    errors.message = 'Please include a short note (at least 5 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

