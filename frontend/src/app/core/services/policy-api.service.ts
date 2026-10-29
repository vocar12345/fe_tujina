import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Policy } from '../models/policy.model';
import { environment } from '../../../environments/environment';

/** Thin HTTP client for the NestJS BFF policy API. */
@Injectable({ providedIn: 'root' })
export class PolicyApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/policies`;

  list(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.base);
  }

  create(policy: Policy): Observable<Policy> {
    return this.http.post<Policy>(this.base, policy);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
