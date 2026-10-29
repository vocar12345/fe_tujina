import { Component, Input } from '@angular/core';
import { PremiumBreakdown } from '../../core/pricing/premium';
import { InsurancePackage } from '../../core/models/package.model';
import { EurPipe } from '../../shared/pipes/eur';

/**
 * Pure presentation of the live premium. Receives the computed breakdown from
 * the parent page; it holds no state of its own.
 */
@Component({
  selector: 'app-live-premium',
  standalone: true,
  imports: [EurPipe],
  templateUrl: './live-premium.html',
  styleUrl: './live-premium.scss',
})
export class LivePremium {
  @Input() breakdown: PremiumBreakdown | null = null;
  @Input() pkg: InsurancePackage | null = null;
}
