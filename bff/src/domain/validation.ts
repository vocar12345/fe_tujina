/* ===========================================================================
 *  INPUT VALIDATION — mirrors the Angular reactive-form validators
 *  (frontend/src/app/shared/validators/custom-validators.ts).
 *
 *  Framework-free on purpose, like the pricing domain: the BFF must never trust
 *  client-sent data, even on a direct API call that bypasses the UI. The service
 *  runs this before pricing, so impossible ages/dates are rejected instead of
 *  being silently priced.
 *
 *  Deliberately NOT enforced here: "trip start must not be in the past". That
 *  rule is time-relative, and the BFF also receives already-concluded policies
 *  mirrored from the client — a policy that was valid at conclusion must not
 *  become invalid later. The UI owns that forward-looking check.
 * =========================================================================== */
import { PersonalData, ageOnDate } from './pricing';

/** Upper sanity bound on age, matching the frontend's birthDateValidator. */
export const MAX_AGE = 120;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

function isValidPhone(value: string): boolean {
  if (!/^\+?[\d\s]+$/.test(value)) return false; // only +, spaces, digits
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15; // ITU E.164 upper bound
}

function isValidDate(value: string): boolean {
  return DATE_REGEX.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * Validate the personal/trip data. Returns a list of human-readable errors
 * (empty array = valid) so the caller can surface all problems at once.
 */
export function validatePersonalData(p: PersonalData): string[] {
  const errors: string[] = [];

  const required: [keyof PersonalData, string][] = [
    ['firstName', 'First name is required'],
    ['lastName', 'Last name is required'],
    ['birthDate', 'Birth date is required'],
    ['email', 'Email is required'],
    ['phone', 'Phone is required'],
    ['destination', 'Destination is required'],
    ['tripStart', 'Trip start date is required'],
    ['tripEnd', 'Trip end date is required'],
  ];
  for (const [key, msg] of required) {
    if (!p?.[key] || String(p[key]).trim() === '') errors.push(msg);
  }
  // Presence must hold before the format/range checks below can run.
  if (errors.length) return errors;

  if (!isValidEmail(p.email)) errors.push('Invalid email address');
  if (!isValidPhone(p.phone)) errors.push('Invalid phone number');

  for (const [key, label] of [
    ['birthDate', 'Birth date'],
    ['tripStart', 'Trip start date'],
    ['tripEnd', 'Trip end date'],
  ] as const) {
    if (!isValidDate(p[key])) errors.push(`${label} is not a valid date`);
  }
  // Range/age checks assume the dates parse.
  if (errors.length) return errors;

  if (Date.parse(p.tripEnd) < Date.parse(p.tripStart)) {
    errors.push('Trip end date must not be before the start date');
  }

  const age = ageOnDate(p.birthDate, p.tripStart);
  if (age < 0) {
    errors.push('Birth date must be before the trip start date');
  } else if (age > MAX_AGE) {
    errors.push(`Age must not exceed ${MAX_AGE} years`);
  }

  return errors;
}
