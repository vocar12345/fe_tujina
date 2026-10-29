import { TestBed } from '@angular/core/testing';
import { PolicyService } from './policy.service';
import { Policy } from '../models/policy.model';

function makePolicy(id: string, firstName = 'Vuk'): Policy {
  return {
    id,
    personal: {
      firstName,
      lastName: 'Micic',
      birthDate: '1990-01-01',
      email: 'vuk@example.com',
      phone: '040123456',
      destination: 'Hrvaška',
      tripStart: '2025-06-01',
      tripEnd: '2025-06-10',
    },
    packageCode: 'M',
    premium: 80,
    insuredSum: 100_000,
    concludedAt: '2025-05-01T10:00:00.000Z',
  };
}

describe('PolicyService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  function service(): PolicyService {
    return TestBed.inject(PolicyService);
  }

  it('starts empty when storage is empty', () => {
    expect(service().policies()).toEqual([]);
  });

  it('add() stores a policy and exposes it', () => {
    const s = service();
    s.add(makePolicy('a'));
    expect(s.policies().length).toBe(1);
    expect(s.policies()[0].id).toBe('a');
  });

  it('add() prepends newest first', () => {
    const s = service();
    s.add(makePolicy('a'));
    s.add(makePolicy('b'));
    expect(s.policies().map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('persists across a fresh service instance (reload)', () => {
    service().add(makePolicy('a'));
    TestBed.resetTestingModule(); // simulate a page reload -> new instance
    expect(service().policies().map((p) => p.id)).toEqual(['a']);
  });

  it('remove() deletes by id', () => {
    const s = service();
    s.add(makePolicy('a'));
    s.add(makePolicy('b'));
    s.remove('a');
    expect(s.policies().map((p) => p.id)).toEqual(['b']);
  });

  it('clear() empties the store', () => {
    const s = service();
    s.add(makePolicy('a'));
    s.clear();
    expect(s.policies()).toEqual([]);
  });
});
