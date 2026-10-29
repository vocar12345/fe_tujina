/* ===========================================================================
 *  PRICING DOMAIN — mirrors frontend/src/app/core/{data,pricing,models}.
 *  Kept framework-free and duplicated here on purpose: the BFF must be able to
 *  recompute the premium server-side so a tampered client price can never be
 *  persisted. In a production monorepo this would be a shared package
 *  (e.g. @zavarotujina/pricing) imported by both the Angular app and the BFF.
 *  The formula is the single source of truth and must stay in sync with the FE.
 * =========================================================================== */

export type PackageCode = 'S' | 'M' | 'L';
export type DestinationRisk = 'EU' | 'EUROPE_NON_EU' | 'WORLD' | 'US_CANADA';

export interface PersonalData {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  destination: string;
  tripStart: string;
  tripEnd: string;
}

export interface Policy {
  id: string;
  personal: PersonalData;
  packageCode: PackageCode;
  premium: number;
  insuredSum: number;
  concludedAt: string;
}

export const MIN_PREMIUM = 5;

export const PACKAGES: Record<PackageCode, { insuredSum: number; dailyBase: number }> = {
  S: { insuredSum: 30_000, dailyBase: 2 },
  M: { insuredSum: 100_000, dailyBase: 4 },
  L: { insuredSum: 250_000, dailyBase: 7 },
};

const DESTINATION_RISK: Record<string, DestinationRisk> = {
  Avstrija: 'EU',
  Hrvaška: 'EU',
  Italija: 'EU',
  Nemčija: 'EU',
  Francija: 'EU',
  Španija: 'EU',
  Grčija: 'EU',
  Švica: 'EU',
  'Velika Britanija': 'EUROPE_NON_EU',
  Srbija: 'EUROPE_NON_EU',
  'Črna gora': 'EUROPE_NON_EU',
  'Bosna in Hercegovina': 'EUROPE_NON_EU',
  Turčija: 'EUROPE_NON_EU',
  Albanija: 'EUROPE_NON_EU',
  Tajska: 'WORLD',
  Egipt: 'WORLD',
  Maroko: 'WORLD',
  Avstralija: 'WORLD',
  Japonska: 'WORLD',
  Brazilija: 'WORLD',
  'Združene države Amerike': 'US_CANADA',
  Kanada: 'US_CANADA',
};

export function riskForCountry(country: string): DestinationRisk | null {
  return DESTINATION_RISK[country] ?? null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function tripDays(startIso: string, endIso: string): number {
  return Math.round((Date.parse(endIso) - Date.parse(startIso)) / MS_PER_DAY) + 1;
}

export function ageOnDate(birthDateIso: string, onDateIso: string): number {
  const birth = new Date(birthDateIso);
  const on = new Date(onDateIso);
  let age = on.getFullYear() - birth.getFullYear();
  const m = on.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < birth.getDate())) age--;
  return age;
}

export function ageFactor(age: number): number {
  if (age <= 17) return 0.8;
  if (age <= 64) return 1.0;
  if (age <= 74) return 1.75;
  return 2.5;
}

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

/** Server-authoritative premium for a personal/package combination. */
export function calculatePremium(packageCode: PackageCode, personal: PersonalData): number {
  const risk = riskForCountry(personal.destination);
  if (!risk) {
    throw new Error(`Unknown destination: ${personal.destination}`);
  }
  const dailyBase = PACKAGES[packageCode].dailyBase;
  const days = tripDays(personal.tripStart, personal.tripEnd);
  const age = ageOnDate(personal.birthDate, personal.tripStart);
  const gross =
    Math.round(dailyBase * days * ageFactor(age) * destinationFactor(risk) * 100) / 100;
  return Math.max(gross, MIN_PREMIUM);
}
