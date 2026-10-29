/** The three insurance packages a customer can choose from. */
export type PackageCode = 'S' | 'M' | 'L';

/**
 * A travel-insurance package.
 *
 * `insuredSum` (zavarovalna vsota) is the maximum the insurer pays out for a
 * covered medical claim — the headline number of the product. `dailyBase`
 * (dnevna osnova) is the per-day price input consumed by the premium formula
 * (see core/pricing/premium.ts).
 */
export interface InsurancePackage {
  code: PackageCode;
  /** Short marketing name, e.g. "Standard". */
  name: string;
  /** Zavarovalna vsota for medical coverage, in EUR. */
  insuredSum: number;
  /** Included coverages (kritja), Slovenian labels for display. */
  coverages: string[];
  /** Base price per day, in EUR — the formula's package input. */
  dailyBase: number;
}
