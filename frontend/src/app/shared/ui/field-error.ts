import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Slovenian messages keyed by the validation-error key. */
const MESSAGES: Record<string, string> = {
  required: 'To polje je obvezno.',
  minlength: 'Vnos je prekratek.',
  email: 'Vnesite veljaven e-poštni naslov.',
  phone: 'Vnesite veljavno telefonsko številko (8–15 številk).',
  pastDate: 'Datum ne sme biti v preteklosti.',
  futureBirthDate: 'Datum rojstva ne sme biti v prihodnosti.',
  ageTooHigh: 'Preverite datum rojstva.',
};

/**
 * Renders validation errors for a single control, but only once the user has
 * interacted with it (touched/dirty) — so the form isn't a wall of red on load.
 */
@Component({
  selector: 'app-field-error',
  standalone: true,
  template: `
    @if (show) {
      <div class="field-error" role="alert">
        @for (msg of messages; track msg) {
          <small>{{ msg }}</small>
        }
      </div>
    }
  `,
  styles: [
    `
      .field-error {
        margin-top: 0.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
      }
      small {
        color: #c0392b;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class FieldError {
  @Input() control: AbstractControl | null = null;

  get show(): boolean {
    const c = this.control;
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  get messages(): string[] {
    const errors = this.control?.errors;
    if (!errors) return [];
    return Object.keys(errors).map((key) => MESSAGES[key] ?? 'Neveljavna vrednost.');
  }
}
