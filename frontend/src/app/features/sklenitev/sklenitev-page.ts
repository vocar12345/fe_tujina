import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { InsuranceForm } from './insurance-form';
import { PackageSelector } from './package-selector';
import { LivePremium } from './live-premium';
import { buildInsuranceForm } from './insurance-form.factory';
import { PACKAGES } from '../../core/data/packages';
import { PackageCode } from '../../core/models/package.model';
import { riskForCountry } from '../../core/data/destinations';
import { calculatePremium, PremiumBreakdown } from '../../core/pricing/premium';

/**
 * Container page for concluding a policy. It owns all state as Signals so the
 * live premium is a pure derivation of (selected package + form values).
 */
@Component({
  selector: 'app-sklenitev-page',
  standalone: true,
  imports: [InsuranceForm, PackageSelector, LivePremium],
  templateUrl: './sklenitev-page.html',
  styleUrl: './sklenitev-page.scss',
})
export class SklenitevPage {
  private readonly fb = inject(FormBuilder);

  readonly form = buildInsuranceForm(this.fb);
  readonly selectedPackage = signal<PackageCode | null>(null);

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

  selectPackage(code: PackageCode): void {
    this.selectedPackage.set(code);
  }
}
