import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Pragmatic email check — intentionally NOT full RFC 5322. The RFC grammar is
 * huge and rejects/accepts surprising edge cases; this "something@something.tld
 * with no spaces" rule is the defensible middle ground for a web form.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * Phone check: allow a leading "+" and spaces for readability, but require the
 * number to contain 8–15 actual digits (ITU E.164 allows up to 15).
 */
export function isValidPhone(value: string): boolean {
  if (!/^\+?[\d\s]+$/.test(value)) return false; // only +, spaces, digits
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/** Midnight-normalised "today" so date-only comparisons are stable. */
function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Parse a `yyyy-mm-dd` string as LOCAL midnight (never UTC), so comparisons
 *  are timezone-independent and match what a native date input produces. */
function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** A trip cannot start in the past. Neutral when empty (required owns that). */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return parseDateOnly(value) < today() ? { pastDate: true } : null;
  };
}

/** Group-level: the end date must not be before the start date. */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    if (!start || !end) return null;
    return parseDateOnly(end) < parseDateOnly(start) ? { dateRange: true } : null;
  };
}

/** Birth date must be in the past and imply a plausible age (<= maxAge). */
export function birthDateValidator(maxAge = 120): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const birth = parseDateOnly(value);
    const now = today();
    if (birth > now) return { futureBirthDate: true };
    const oldest = new Date(now);
    oldest.setFullYear(oldest.getFullYear() - maxAge);
    return birth < oldest ? { ageTooHigh: true } : null;
  };
}

/** ValidatorFn wrappers around the pure predicates, neutral when empty. */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return isValidEmail(value) ? null : { email: true };
  };
}

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    return isValidPhone(value) ? null : { phone: true };
  };
}
