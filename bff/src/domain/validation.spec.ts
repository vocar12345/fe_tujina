import { PersonalData } from './pricing';
import { MAX_AGE, validatePersonalData } from './validation';

function validPerson(overrides: Partial<PersonalData> = {}): PersonalData {
  return {
    firstName: 'Vuk',
    lastName: 'Micic',
    birthDate: '1980-01-01', // age 45 at trip start
    email: 'vuk@example.com',
    phone: '040123456',
    destination: 'Italija',
    tripStart: '2025-06-01',
    tripEnd: '2025-06-10',
    ...overrides,
  };
}

describe('validatePersonalData', () => {
  it('accepts a well-formed person (no errors)', () => {
    expect(validatePersonalData(validPerson())).toEqual([]);
  });

  it('accepts an 80-year-old (age is priced, not rejected)', () => {
    // born 1945-01-01 -> age 80 at a 2025 trip start
    expect(validatePersonalData(validPerson({ birthDate: '1945-01-01' }))).toEqual([]);
  });

  it('rejects an implausibly high age (e.g. 200 years old)', () => {
    const errors = validatePersonalData(validPerson({ birthDate: '1820-01-01' }));
    expect(errors.some((e) => /age/i.test(e))).toBe(true);
  });

  it('accepts exactly the maximum age', () => {
    const start = '2025-06-01';
    const year = Number(start.slice(0, 4)) - MAX_AGE;
    const errors = validatePersonalData(
      validPerson({ birthDate: `${year}-06-01`, tripStart: start }),
    );
    expect(errors).toEqual([]);
  });

  it('rejects a birth date after the trip start (negative age)', () => {
    const errors = validatePersonalData(
      validPerson({ birthDate: '2030-01-01', tripStart: '2025-06-01' }),
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an end date before the start date', () => {
    const errors = validatePersonalData(
      validPerson({ tripStart: '2025-06-10', tripEnd: '2025-06-01' }),
    );
    expect(errors.some((e) => /end/i.test(e))).toBe(true);
  });

  it('rejects an invalid email', () => {
    const errors = validatePersonalData(validPerson({ email: 'not-an-email' }));
    expect(errors.some((e) => /email/i.test(e))).toBe(true);
  });

  it('rejects a phone with too few digits', () => {
    const errors = validatePersonalData(validPerson({ phone: '123' }));
    expect(errors.some((e) => /phone/i.test(e))).toBe(true);
  });

  it('rejects a missing required field', () => {
    const errors = validatePersonalData(validPerson({ firstName: '' }));
    expect(errors.some((e) => /first name/i.test(e))).toBe(true);
  });

  it('rejects an unparseable date string', () => {
    const errors = validatePersonalData(validPerson({ tripStart: 'yesterday' }));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('does NOT reject a trip start in the past (that rule is the UI\'s)', () => {
    // A policy mirrored after conclusion may legitimately have a past start.
    expect(validatePersonalData(validPerson({ tripStart: '2000-01-01', tripEnd: '2000-01-10' }))).toEqual(
      [],
    );
  });
});
