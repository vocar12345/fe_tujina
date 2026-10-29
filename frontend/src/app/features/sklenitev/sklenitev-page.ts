import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { InsuranceForm } from './insurance-form';
import { buildInsuranceForm } from './insurance-form.factory';

/**
 * Container page for concluding a policy. Owns the form group here so that the
 * package selection and live premium (added in a later phase) can derive from
 * the same state.
 */
@Component({
  selector: 'app-sklenitev-page',
  standalone: true,
  imports: [InsuranceForm],
  templateUrl: './sklenitev-page.html',
  styleUrl: './sklenitev-page.scss',
})
export class SklenitevPage {
  private readonly fb = inject(FormBuilder);
  readonly form = buildInsuranceForm(this.fb);
}
