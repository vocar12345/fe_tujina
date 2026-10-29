import { Pipe, PipeTransform } from '@angular/core';

/** Format a number as Slovenian EUR currency, e.g. 80 -> "80,00 €". */
export function formatEur(value: number): string {
  return new Intl.NumberFormat('sl-SI', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

@Pipe({ name: 'eur', standalone: true })
export class EurPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '—' : formatEur(value);
  }
}
