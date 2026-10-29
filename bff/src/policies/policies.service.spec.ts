import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { PoliciesService } from './policies.service';
import { Policy } from '../domain/pricing';

function makePolicy(overrides: Partial<Policy> = {}): Policy {
  return {
    id: 'p1',
    personal: {
      firstName: 'Vuk',
      lastName: 'Micic',
      birthDate: '1980-01-01', // age 45 at trip start
      email: 'vuk@example.com',
      phone: '040123456',
      destination: 'Združene države Amerike', // US_CANADA -> factor 2.0
      tripStart: '2025-06-01',
      tripEnd: '2025-06-10', // 10 days
    },
    packageCode: 'M', // dailyBase 4
    premium: 1, // deliberately wrong -> server must override
    insuredSum: 1, // deliberately wrong -> server must override
    concludedAt: '2025-05-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('PoliciesService', () => {
  let dir: string;
  let service: PoliciesService;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'bff-'));
    process.env.POLICIES_FILE = join(dir, 'policies.json');
    service = new PoliciesService();
  });

  afterEach(() => {
    delete process.env.POLICIES_FILE;
    rmSync(dir, { recursive: true, force: true });
  });

  it('starts empty', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('recomputes premium server-side, ignoring the client value', () => {
    // 4 x 10 x 1.0 (age 45) x 2.0 (US) = 80
    const created = service.create(makePolicy());
    expect(created.premium).toBe(80);
    expect(created.insuredSum).toBe(100_000);
  });

  it('persists to disk and reloads in a fresh instance', () => {
    service.create(makePolicy({ id: 'p1' }));
    const reloaded = new PoliciesService(); // reads the same POLICIES_FILE
    expect(reloaded.findAll().map((p) => p.id)).toEqual(['p1']);
    expect(existsSync(join(dir, 'policies.json'))).toBe(true);
  });

  it('removes by id', () => {
    service.create(makePolicy({ id: 'a' }));
    service.create(makePolicy({ id: 'b' }));
    service.remove('a');
    expect(service.findAll().map((p) => p.id)).toEqual(['b']);
  });

  it('rejects an unknown destination', () => {
    const bad = makePolicy({
      personal: { ...makePolicy().personal, destination: 'Atlantida' },
    });
    expect(() => service.create(bad)).toThrow();
  });
});
