import { InsurancePackage, PackageCode } from '../models/package.model';

/**
 * The S / M / L package catalogue.
 *
 * Insured sums scale with the severity of the scenario each package covers:
 *   S  — a typical hospital episode within the EU (EHIC shares the cost).
 *   M  — serious treatment + medical repatriation within Europe (the default).
 *   L  — long-haul / high-cost-healthcare destinations (e.g. USA ICU + air
 *        ambulance can reach six figures), plus the richest coverage bundle.
 *
 * Daily base prices (2 / 4 / 7) encode escalating expected claim cost, not a
 * flat markup: M roughly doubles S's protection, L adds the expensive
 * cancellation/liability coverages on top of M.
 */
export const PACKAGES: Record<PackageCode, InsurancePackage> = {
  S: {
    code: 'S',
    name: 'Osnovni',
    insuredSum: 30_000,
    dailyBase: 2,
    coverages: ['Zdravstvo v tujini', 'Nujni prevoz / repatriacija'],
  },
  M: {
    code: 'M',
    name: 'Standard',
    insuredSum: 100_000,
    dailyBase: 4,
    coverages: [
      'Zdravstvo v tujini',
      'Nujni prevoz / repatriacija',
      'Prtljaga do 1.000 €',
      'Nezgodno zavarovanje',
      '24/7 asistenca',
    ],
  },
  L: {
    code: 'L',
    name: 'Premium',
    insuredSum: 250_000,
    dailyBase: 7,
    coverages: [
      'Zdravstvo v tujini',
      'Nujni prevoz / repatriacija',
      'Prtljaga do 1.000 €',
      'Nezgodno zavarovanje',
      '24/7 asistenca',
      'Odpoved potovanja',
      'Odgovornost do tretjih do 50.000 €',
      'Zamuda leta',
    ],
  },
};

/** Ordered list (S, M, L) for rendering the selector. */
export const PACKAGE_LIST: InsurancePackage[] = [PACKAGES.S, PACKAGES.M, PACKAGES.L];
