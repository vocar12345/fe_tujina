import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { PACKAGES, Policy, calculatePremium } from '../domain/pricing';

/**
 * File-backed policy store. The JSON file is enough for this assignment; the
 * narrow method surface means swapping in a real database later is a one-file
 * change.
 */
@Injectable()
export class PoliciesService {
  // Resolved from env at construction (no constructor param, so Nest DI does not
  // try to inject it). Override via the POLICIES_FILE environment variable.
  private readonly file = process.env.POLICIES_FILE ?? join(process.cwd(), 'data', 'policies.json');
  private policies: Policy[] = this.load();

  findAll(): Policy[] {
    return this.policies;
  }

  /**
   * Create a policy. The premium and insured sum are RECOMPUTED server-side and
   * override whatever the client sent — the client price is never trusted.
   */
  create(input: Policy): Policy {
    if (!input?.packageCode || !PACKAGES[input.packageCode] || !input.personal) {
      throw new BadRequestException('Invalid policy payload');
    }

    let premium: number;
    try {
      premium = calculatePremium(input.packageCode, input.personal);
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }

    const policy: Policy = {
      ...input,
      id: input.id || cryptoRandomId(),
      premium,
      insuredSum: PACKAGES[input.packageCode].insuredSum,
      concludedAt: input.concludedAt || new Date().toISOString(),
    };

    this.policies = [policy, ...this.policies.filter((p) => p.id !== policy.id)];
    this.save();
    return policy;
  }

  remove(id: string): void {
    this.policies = this.policies.filter((p) => p.id !== id);
    this.save();
  }

  private load(): Policy[] {
    try {
      if (!existsSync(this.file)) return [];
      const parsed = JSON.parse(readFileSync(this.file, 'utf-8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private save(): void {
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(this.policies, null, 2), 'utf-8');
  }
}

function cryptoRandomId(): string {
  // Node 18+ provides global crypto.randomUUID()
  return (globalThis.crypto as Crypto).randomUUID();
}
