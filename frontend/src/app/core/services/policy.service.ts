import { Injectable, Signal, signal } from '@angular/core';
import { Policy } from '../models/policy.model';

const STORAGE_KEY = 'fe_tujina_policies';

/**
 * Persists concluded policies to localStorage and exposes them as a Signal so
 * the policy list updates reactively. This is the default persistence layer;
 * the optional BFF (later phase) layers on top of the same Policy shape.
 */
@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly _policies = signal<Policy[]>(this.load());

  /** Reactive, read-only view of all concluded policies (newest first). */
  readonly policies: Signal<Policy[]> = this._policies.asReadonly();

  add(policy: Policy): void {
    this.persist([policy, ...this._policies()]);
  }

  remove(id: string): void {
    this.persist(this._policies().filter((p) => p.id !== id));
  }

  clear(): void {
    this.persist([]);
  }

  private persist(list: Policy[]): void {
    this._policies.set(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // localStorage may be unavailable (private mode / quota) — keep in memory.
    }
  }

  private load(): Policy[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
