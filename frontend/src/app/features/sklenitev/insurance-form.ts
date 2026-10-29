import { Component, Input } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldError } from '../../shared/ui/field-error';
import { DESTINATIONS } from '../../core/data/destinations';

/**
 * Presentational form for personal + trip data. The FormGroup is owned by the
 * parent page (which also owns the package selection and live premium), so this
 * component stays a pure view over the form.
 */
@Component({
  selector: 'app-insurance-form',
  standalone: true,
  imports: [ReactiveFormsModule, FieldError],
  templateUrl: './insurance-form.html',
  styleUrl: './insurance-form.scss',
})
export class InsuranceForm {
  @Input({ required: true }) form!: FormGroup;

  readonly destinations = DESTINATIONS;

  control(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  /** Cross-field date-range error, shown next to the end date once touched. */
  get dateRangeInvalid(): boolean {
    return this.form.hasError('dateRange') && !!this.control('tripEnd')?.touched;
  }
}
