import { PackageCode } from '../models/package.model';
import { DestinationRisk } from '../models/destination.model';
import { PACKAGES } from '../data/packages';

/* ===========================================================================
 *  PREMIUM FORMULA  (the single source of truth for pricing)
 * ---------------------------------------------------------------------------
 *  Premija = dnevnaOsnova(paket) × trajanjeDni × faktorStarost × faktorDestinacija
 *
 *    trajanjeDni       = (datumKonca − datumZačetka) in days + 1   (inclusive)
 *    Premija           = max(Premija, MIN_PREMIUM)                 (floor)
 *
 *  It is MULTIPLICATIVE because each factor is an independent risk/cost
 *  dimension and risk compounds: a long trip AND an older traveller AND a
 *  high-cost destination should stack, mirroring actuarial loading.
 *
 *  faktorStarost (age at trip start):  0-17 → 0.8 · 18-64 → 1.0 ·
 *                                      65-74 → 1.75 · 75+ → 2.5
 *  faktorDestinacija: EU → 1.0 · Evropa izven EU → 1.25 ·
 *                     Svet → 1.6 · ZDA/Kanada → 2.0
 * =========================================================================== */

/** Minimum premium (EUR): every policy has a non-zero cost to issue. */
export const MIN_PREMIUM = 5;

export interface PremiumInput {
  packageCode: PackageCode;
  /** ISO birth date; age is computed at trip start. */
  birthDate: string;
  destinationRisk: DestinationRisk;
  tripStart: string;
  tripEnd: string;
}

/** Full breakdown of a premium so the UI can show *why* the price is what it is. */
export interface PremiumBreakdown {
  dailyBase: number;
  days: number;
  age: number;
  ageFactor: number;
  destinationFactor: number;
  /** Price before the minimum-premium floor. */
  gross: number;
  /** Final price the customer pays (floored). */
  premium: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Inclusive trip length in whole days (same start/end date => 1 day). */
export function tripDays(startIso: string, endIso: string): number {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  return Math.round((end - start) / MS_PER_DAY) + 1;
}

/** Age in whole years that the person has reached on the given date. */
export function ageOnDate(birthDateIso: string, onDateIso: string): number {
  const birth = new Date(birthDateIso);
  const on = new Date(onDateIso);
  let age = on.getFullYear() - birth.getFullYear();
  const monthDiff = on.getMonth() - birth.getMonth();
  const dayDiff = on.getDate() - birth.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--; // birthday hasn't happened yet this year
  }
  return age;
}

/** Age-band multiplier. See the formula header for the reasoning. */
export function ageFactor(age: number): number {
  if (age <= 17) return 0.8;
  if (age <= 64) return 1.0;
  if (age <= 74) return 1.75;
  return 2.5;
}

/** Destination-risk multiplier. */
export function destinationFactor(risk: DestinationRisk): number {
  switch (risk) {
    case 'EU':
      return 1.0;
    case 'EUROPE_NON_EU':
      return 1.25;
    case 'WORLD':
      return 1.6;
    case 'US_CANADA':
      return 2.0;
  }
}

/** Round to whole cents to avoid floating-point noise in displayed prices. */
function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Compute the premium and the breakdown behind it. */
export function calculatePremium(input: PremiumInput): PremiumBreakdown {
  const dailyBase = PACKAGES[input.packageCode].dailyBase;
  const days = tripDays(input.tripStart, input.tripEnd);
  const age = ageOnDate(input.birthDate, input.tripStart);
  const aFactor = ageFactor(age);
  const dFactor = destinationFactor(input.destinationRisk);

  const gross = roundCents(dailyBase * days * aFactor * dFactor);
  const premium = Math.max(gross, MIN_PREMIUM);

  return {
    dailyBase,
    days,
    age,
    ageFactor: aFactor,
    destinationFactor: dFactor,
    gross,
    premium,
  };
}
