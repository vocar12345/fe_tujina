import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PolicyService } from '../../core/services/policy.service';
import { PACKAGES } from '../../core/data/packages';
import { PackageCode } from '../../core/models/package.model';
import { EurPipe } from '../../shared/pipes/eur';

/** Lists concluded policies (reactive to the PolicyService signal) with delete. */
@Component({
  selector: 'app-police-page',
  standalone: true,
  imports: [EurPipe, DatePipe, RouterLink],
  templateUrl: './police-page.html',
  styleUrl: './police-page.scss',
})
export class PolicePage {
  private readonly policyService = inject(PolicyService);

  readonly policies = this.policyService.policies;

  packageName(code: PackageCode): string {
    return PACKAGES[code].name;
  }

  remove(id: string): void {
    this.policyService.remove(id);
  }
}
