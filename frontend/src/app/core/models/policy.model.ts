import { PackageCode } from './package.model';
import { PersonalData } from './personal-data.model';

/**
 * A concluded insurance policy, as persisted to localStorage / the BFF.
 *
 * `premium` and `insuredSum` are SNAPSHOTTED at conclusion time on purpose: an
 * insurance contract's terms are fixed at inception, so later changes to the
 * package catalogue or pricing formula must never alter an existing policy.
 */
export interface Policy {
  id: string;
  personal: PersonalData;
  packageCode: PackageCode;
  /** Final premium computed and frozen when the policy was concluded (EUR). */
  premium: number;
  /** Insured sum snapshot at conclusion (EUR). */
  insuredSum: number;
  /** ISO timestamp of conclusion. */
  concludedAt: string;
}
