/**
 * Personal + trip data entered by the user in the insurance form.
 * All dates are ISO `yyyy-mm-dd` strings (what native date inputs produce).
 */
export interface PersonalData {
  firstName: string;
  lastName: string;
  /** Date of birth, ISO. Drives the age factor in the premium formula. */
  birthDate: string;
  email: string;
  phone: string;
  /** Destination country name; resolved to a DestinationRisk for pricing. */
  destination: string;
  /** Trip start date, ISO. */
  tripStart: string;
  /** Trip end date, ISO. */
  tripEnd: string;
}
