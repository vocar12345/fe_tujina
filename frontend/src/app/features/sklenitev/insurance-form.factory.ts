import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  birthDateValidator,
  dateRangeValidator,
  emailValidator,
  notInPastValidator,
  phoneValidator,
} from '../../shared/validators/custom-validators';

/**
 * Builds the insurance form group with all field + cross-field validators.
 * Kept as a standalone factory so it can be reused and unit-tested without the
 * component.
 */
export function buildInsuranceForm(fb: FormBuilder): FormGroup {
  return fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: ['', [Validators.required, birthDateValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      phone: ['', [Validators.required, phoneValidator()]],
      destination: ['', [Validators.required]],
      tripStart: ['', [Validators.required, notInPastValidator()]],
      tripEnd: ['', [Validators.required]],
    },
    { validators: dateRangeValidator('tripStart', 'tripEnd') },
  );
}
