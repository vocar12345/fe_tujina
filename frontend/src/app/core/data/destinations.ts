import { Destination, DestinationRisk } from '../models/destination.model';

/**
 * Selectable destinations mapped to a risk tier. The country list is
 * illustrative; the important part for pricing is the `risk` mapping.
 */
export const DESTINATIONS: Destination[] = [
  // EU / Schengen — reciprocal healthcare (EHIC), lowest out-of-pocket risk.
  { country: 'Avstrija', risk: 'EU' },
  { country: 'Hrvaška', risk: 'EU' },
  { country: 'Italija', risk: 'EU' },
  { country: 'Nemčija', risk: 'EU' },
  { country: 'Francija', risk: 'EU' },
  { country: 'Španija', risk: 'EU' },
  { country: 'Grčija', risk: 'EU' },
  { country: 'Švica', risk: 'EU' },

  // Europe outside the EU — no EHIC safety net, moderate costs.
  { country: 'Velika Britanija', risk: 'EUROPE_NON_EU' },
  { country: 'Srbija', risk: 'EUROPE_NON_EU' },
  { country: 'Črna gora', risk: 'EUROPE_NON_EU' },
  { country: 'Bosna in Hercegovina', risk: 'EUROPE_NON_EU' },
  { country: 'Turčija', risk: 'EUROPE_NON_EU' },
  { country: 'Albanija', risk: 'EUROPE_NON_EU' },

  // Rest of the world — higher treatment + logistics cost, longer repatriation.
  { country: 'Tajska', risk: 'WORLD' },
  { country: 'Egipt', risk: 'WORLD' },
  { country: 'Maroko', risk: 'WORLD' },
  { country: 'Avstralija', risk: 'WORLD' },
  { country: 'Japonska', risk: 'WORLD' },
  { country: 'Brazilija', risk: 'WORLD' },

  // USA / Canada — extreme private-healthcare costs, the classic worst case.
  { country: 'Združene države Amerike', risk: 'US_CANADA' },
  { country: 'Kanada', risk: 'US_CANADA' },
];

/** Look up a destination's risk tier by country name. */
export function riskForCountry(country: string): DestinationRisk | null {
  return DESTINATIONS.find((d) => d.country === country)?.risk ?? null;
}
