import {
  ageOnDate,
  ageFactor,
  destinationFactor,
  tripDays,
  calculatePremium,
  MIN_PREMIUM,
  PremiumInput,
} from './premium';

describe('premium pricing', () => {
  describe('tripDays', () => {
    it('counts days inclusively (start and end on the same day = 1 day)', () => {
      expect(tripDays('2025-06-01', '2025-06-01')).toBe(1);
    });

    it('counts a 10-day trip (01 June -> 10 June) as 10 days', () => {
      expect(tripDays('2025-06-01', '2025-06-10')).toBe(10);
    });
  });

  describe('ageOnDate', () => {
    it('computes age at the trip start date', () => {
      expect(ageOnDate('1980-01-01', '2025-06-01')).toBe(45);
    });

    it('does not count a birthday that has not occurred yet this year', () => {
      expect(ageOnDate('1980-12-31', '2025-06-01')).toBe(44);
    });
  });

  describe('ageFactor', () => {
    it('children 0-17 get a 0.8 multiplier', () => {
      expect(ageFactor(10)).toBe(0.8);
    });
    it('adults 18-64 are the 1.0 reference band', () => {
      expect(ageFactor(45)).toBe(1.0);
    });
    it('seniors 65-74 get a 1.75 multiplier', () => {
      expect(ageFactor(70)).toBe(1.75);
    });
    it('age 75+ gets a 2.5 multiplier', () => {
      expect(ageFactor(80)).toBe(2.5);
    });
  });

  describe('destinationFactor', () => {
    it('EU/Schengen is the 1.0 reference', () => {
      expect(destinationFactor('EU')).toBe(1.0);
    });
    it('USA/Canada is the 2.0 worst case', () => {
      expect(destinationFactor('US_CANADA')).toBe(2.0);
    });
  });

  describe('calculatePremium', () => {
    const base: PremiumInput = {
      packageCode: 'M',
      birthDate: '1980-01-01', // age 45 at trip start
      destinationRisk: 'US_CANADA',
      tripStart: '2025-06-01',
      tripEnd: '2025-06-10', // 10 days
    };

    it('45 y/o, 10-day trip to the USA, package M => 80 EUR', () => {
      // 4 (daily) x 10 (days) x 1.0 (age) x 2.0 (destination) = 80
      expect(calculatePremium(base).premium).toBe(80);
    });

    it('an 80 y/o on the same trip pays more (age factor 2.5) => 200 EUR', () => {
      // 4 x 10 x 2.5 x 2.0 = 200
      const premium = calculatePremium({ ...base, birthDate: '1945-01-01' }).premium;
      expect(premium).toBe(200);
    });

    it('applies the minimum premium floor to tiny cheap trips', () => {
      // S daily 2 x 1 day x 1.0 x 1.0 = 2 -> floored to MIN_PREMIUM
      const premium = calculatePremium({
        packageCode: 'S',
        birthDate: '1990-01-01',
        destinationRisk: 'EU',
        tripStart: '2025-06-01',
        tripEnd: '2025-06-01',
      }).premium;
      expect(premium).toBe(MIN_PREMIUM);
    });

    it('exposes a breakdown of every factor for the live display', () => {
      const b = calculatePremium(base);
      expect(b.dailyBase).toBe(4);
      expect(b.days).toBe(10);
      expect(b.ageFactor).toBe(1.0);
      expect(b.destinationFactor).toBe(2.0);
      expect(b.gross).toBe(80);
      expect(b.premium).toBe(80);
    });
  });
});
