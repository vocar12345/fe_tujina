import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PACKAGE_LIST } from '../../core/data/packages';
import { PackageCode } from '../../core/models/package.model';
import { EurPipe } from '../../shared/pipes/eur';

/** Presentational S/M/L selector. Emits the chosen package code to the parent. */
@Component({
  selector: 'app-package-selector',
  standalone: true,
  imports: [EurPipe],
  templateUrl: './package-selector.html',
  styleUrl: './package-selector.scss',
})
export class PackageSelector {
  @Input() selected: PackageCode | null = null;
  @Output() select = new EventEmitter<PackageCode>();

  readonly packages = PACKAGE_LIST;
}
