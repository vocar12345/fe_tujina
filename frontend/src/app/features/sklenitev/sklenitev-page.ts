import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InsuranceForm } from './insurance-form';
import { PackageSelector } from './package-selector';
import { LivePremium } from './live-premium';
import { buildInsuranceForm } from './insurance-form.factory';
import { PACKAGES } from '../../core/data/packages';
import { PackageCode } from '../../core/models/package.model';
import { PersonalData } from '../../core/models/personal-data.model';
import { Policy } from '../../core/models/policy.model';
import { riskForCountry } from '../../core/data/destinations';
import { calculatePremium, PremiumBreakdown } from '../../core/pricing/premium';
import { PolicyService } from '../../core/services/policy.service';
import { EurPipe } from '../../shared/pipes/eur';

/**
 * Container page for concluding a policy. It owns all state as Signals so the
 * live premium is a pure derivation of (selected package + form values).
 */
@Component({
  selector: 'app-sklenitev-page',
  standalone: true,
  imports: [InsuranceForm, PackageSelector, LivePremium, EurPipe, RouterLink],
  templateUrl: './sklenitev-page.html',
  styleUrl: './sklenitev-page.scss',
})
export class SklenitevPage {
  private readonly fb = inject(FormBuilder);
  private readonly policyService = inject(PolicyService);

  readonly form = buildInsuranceForm(this.fb);
  readonly selectedPackage = signal<PackageCode | null>(null);

  /** The most recently concluded policy, for the success confirmation. */
  readonly lastConcluded = signal<Policy | null>(null);

  /** Form values as a Signal — the reactive source for the live premium. */
  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue() as Record<string, string>,
  });

  readonly selectedPkg = computed(() => {
    const code = this.selectedPackage();
    return code ? PACKAGES[code] : null;
  });

  /**
   * LIVE PREMIUM: recomputes whenever the package or any form value changes.
   * Returns null (so the UI shows a hint) until every pricing input is present
   * and the pricing-relevant fields are valid.
   */
  readonly premium = computed<PremiumBreakdown | null>(() => {
    const code = this.selectedPackage();
    const v = this.formValue();
    if (!code || !v) return null;

    const risk = riskForCountry(v['destination'] ?? '');
    if (!risk || !v['birthDate'] || !v['tripStart'] || !v['tripEnd']) return null;

    const pricingInvalid = ['birthDate', 'tripStart', 'tripEnd'].some(
      (k) => this.form.get(k)?.invalid,
    );
    if (pricingInvalid || this.form.hasError('dateRange')) return null;

    return calculatePremium({
      packageCode: code,
      birthDate: v['birthDate'],
      destinationRisk: risk,
      tripStart: v['tripStart'],
      tripEnd: v['tripEnd'],
    });
  });

  /** Enabled only with a valid form, a selected package, and a priceable trip. */
  readonly canConclude = computed(
    () => !!this.selectedPackage() && this.premium() !== null && this.form.valid,
  );

  selectPackage(code: PackageCode): void {
    this.selectedPackage.set(code);
    this.lastConcluded.set(null);
  }

  conclude(): void {
    if (!this.canConclude()) {
      this.form.markAllAsTouched();
      return;
    }
    const breakdown = this.premium();
    const pkg = this.selectedPkg();
    if (!breakdown || !pkg) return;

    const policy: Policy = {
      id: crypto.randomUUID(),
      personal: this.form.getRawValue() as PersonalData,
      packageCode: pkg.code,
      premium: breakdown.premium,
      insuredSum: pkg.insuredSum,
      concludedAt: new Date().toISOString(),
    };

    this.policyService.add(policy);
    this.lastConcluded.set(policy);
    this.form.reset();
    this.selectedPackage.set(null);
  }
}
