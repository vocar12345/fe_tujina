/**
 * Risk tier of a travel destination. Drives the destination multiplier in the
 * premium formula — higher expected treatment/repatriation cost => higher tier.
 */
export type DestinationRisk = 'EU' | 'EUROPE_NON_EU' | 'WORLD' | 'US_CANADA';

/** A selectable destination country mapped to its risk tier. */
export interface Destination {
  /** Display name (Slovenian), e.g. "Hrvaška". */
  country: string;
  risk: DestinationRisk;
}
