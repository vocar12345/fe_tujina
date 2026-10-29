import { FormControl, FormGroup } from '@angular/forms';
import {
  isValidEmail,
  isValidPhone,
  notInPastValidator,
  dateRangeValidator,
  birthDateValidator,
  emailValidator,
  phoneValidator,
} from './custom-validators';

/** LOCAL `yyyy-mm-dd` offset from today by `days` (negative = past).
 *  Uses local calendar fields (not toISOString/UTC) to match what a native
 *  date input emits. */
function isoFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('custom validators', () => {
  describe('isValidEmail', () => {
    it('accepts a normal address', () => {
      expect(isValidEmail('vuk.micic@example.com')).toBe(true);
    });
    it('rejects an address with no @', () => {
      expect(isValidEmail('vuk.micic.example.com')).toBe(false);
    });
    it('rejects an address with no domain dot', () => {
      expect(isValidEmail('vuk@example')).toBe(false);
    });
    it('rejects whitespace', () => {
      expect(isValidEmail('vuk @example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('accepts an international number with + and spaces', () => {
      expect(isValidPhone('+386 40 123 456')).toBe(true);
    });
    it('accepts a plain local number', () => {
      expect(isValidPhone('040123456')).toBe(true);
    });
    it('rejects too few digits', () => {
      expect(isValidPhone('12345')).toBe(false);
    });
    it('rejects letters', () => {
      expect(isValidPhone('040-ABC-123')).toBe(false);
    });
  });

  describe('notInPastValidator', () => {
    const validate = notInPastValidator();
    it('accepts today', () => {
      expect(validate(new FormControl(isoFromToday(0)))).toBeNull();
    });
    it('accepts a future date', () => {
      expect(validate(new FormControl(isoFromToday(5)))).toBeNull();
    });
    it('rejects a past date', () => {
      expect(validate(new FormControl(isoFromToday(-1)))).toEqual({ pastDate: true });
    });
    it('is neutral on an empty value (required owns emptiness)', () => {
      expect(validate(new FormControl(''))).toBeNull();
    });
  });

  describe('dateRangeValidator', () => {
    const validate = dateRangeValidator('tripStart', 'tripEnd');
    function group(start: string, end: string) {
      return new FormGroup({
        tripStart: new FormControl(start),
        tripEnd: new FormControl(end),
      });
    }
    it('accepts end after start', () => {
      expect(validate(group('2025-06-01', '2025-06-10'))).toBeNull();
    });
    it('accepts end equal to start', () => {
      expect(validate(group('2025-06-01', '2025-06-01'))).toBeNull();
    });
    it('rejects end before start', () => {
      expect(validate(group('2025-06-10', '2025-06-01'))).toEqual({ dateRange: true });
    });
  });

  describe('birthDateValidator', () => {
    const validate = birthDateValidator(120);
    it('accepts a normal birth date', () => {
      expect(validate(new FormControl('1990-05-20'))).toBeNull();
    });
    it('rejects a future birth date', () => {
      expect(validate(new FormControl(isoFromToday(1)))).toEqual({ futureBirthDate: true });
    });
    it('rejects an implausibly old age', () => {
      expect(validate(new FormControl('1850-01-01'))).toEqual({ ageTooHigh: true });
    });
  });

  describe('emailValidator / phoneValidator as ValidatorFns', () => {
    it('emailValidator flags an invalid address', () => {
      expect(emailValidator()(new FormControl('nope'))).toEqual({ email: true });
    });
    it('phoneValidator flags an invalid number', () => {
      expect(phoneValidator()(new FormControl('12'))).toEqual({ phone: true });
    });
  });
});
