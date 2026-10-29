import { Injectable, Signal, inject, signal } from '@angular/core';
import { Policy } from '../models/policy.model';
import { PolicyApiService } from './policy-api.service';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'fe_tujina_policies';

/**
 * Persists concluded policies and exposes them as a Signal so the policy list
 * updates reactively.
 *
 * localStorage is the authoritative, always-available client store (this is the
 * assignment's "works entirely in the browser" requirement). When the optional
 * BFF is enabled (environment.useBff), the service additionally hydrates from
 * and mirrors writes to the BFF — but every BFF call fails silently so the app
 * keeps working offline / during a free-tier cold start.
 */
@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly api = inject(PolicyApiService);
  private readonly _policies = signal<Policy[]>(this.load());

  /** Reactive, read-only view of all concluded policies (newest first). */
  readonly policies: Signal<Policy[]> = this._policies.asReadonly();

  constructor() {
    if (environment.useBff) {
      this.hydrateFromBff();
    }
  }

  add(policy: Policy): void {
    this.persist([policy, ...this._policies()]);
    if (environment.useBff) {
      this.api.create(policy).subscribe({ error: () => {} });
    }
  }

  remove(id: string): void {
    this.persist(this._policies().filter((p) => p.id !== id));
    if (environment.useBff) {
      this.api.remove(id).subscribe({ error: () => {} });
    }
  }

  clear(): void {
    this.persist([]);
  }

  /** Replace the local store with the BFF's copy, if the BFF answers. */
  private hydrateFromBff(): void {
    this.api.list().subscribe({
      next: (list) => {
        if (Array.isArray(list)) {
          this._policies.set(list);
          this.saveToStorage(list);
        }
      },
      error: () => {
        /* BFF unreachable — keep the localStorage copy. */
      },
    });
  }

  private persist(list: Policy[]): void {
    this._policies.set(list);
    this.saveToStorage(list);
  }

  private saveToStorage(list: Policy[]): void {
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
