# Project Structure

A map of the codebase: what each part does and how the pieces fit together.

The app lets a user enter travel-insurance data, pick a package (S/M/L), see the
premium calculated **live**, conclude a policy, and review/delete concluded
policies. It works entirely in the browser (via `localStorage`); an optional
NestJS BFF mirrors data server-side and recomputes the price so a tampered-with
browser price can never be persisted.

```
fe_tujina/
├── frontend/          Angular 20 app (the whole product lives here)
├── bff/               Optional NestJS backend (REST API + server-side pricing)
├── render.yaml        Render.com Blueprint (deploys both services)
├── docker-compose.yml Local stack: Nginx frontend + Node BFF
└── *.md               README / NOTES (docs)
```

---

## Frontend (`frontend/`)

Angular 20, standalone components, **Signals** for state, Reactive Forms, SCSS.

### Bootstrap / shell

| File | What it does |
|------|--------------|
| `src/main.ts` | App entry point; bootstraps the root component. |
| `src/app/app.config.ts` | Global providers: router, `HttpClient` (fetch), zone change detection. |
| `src/app/app.ts` / `app.html` / `app.scss` | Root component — the page shell (header/nav + `<router-outlet>`). |
| `src/app/app.routes.ts` | Routes. `/sklenitev` (conclude a policy, the default) and `/police` (list of policies), both **lazy-loaded**. Unknown paths redirect to `/sklenitev`. |
| `src/index.html`, `src/styles.scss` | HTML host page and global styles. |
| `src/environments/` | `environment.ts` (dev) and `environment.prod.ts` — the `useBff` flag and `apiBaseUrl` live here. `useBff: false` by default, so the app runs deterministically against `localStorage`. |

### `src/app/core/` — the domain (framework-light logic + data)

**Models** (`core/models/`) — plain TypeScript interfaces:
- `personal-data.model.ts` — the person + trip fields entered in the form.
- `package.model.ts` — `InsurancePackage` and the `PackageCode` union (`'S' | 'M' | 'L'`).
- `destination.model.ts` — `Destination` and the `DestinationRisk` tiers.
- `policy.model.ts` — a concluded `Policy`. `premium` and `insuredSum` are **snapshotted** at conclusion time (contract terms are frozen at inception).

**Data** (`core/data/`) — static catalogues:
- `packages.ts` — the S/M/L catalogue (`PACKAGES`): name, insured sum, daily base price, coverages. `PACKAGE_LIST` is the ordered list for rendering.
- `destinations.ts` — selectable countries mapped to a risk tier, plus `riskForCountry()` lookup.

**Pricing** (`core/pricing/`):
- `premium.ts` — **the single source of truth for pricing** (a pure, framework-independent function). `calculatePremium()` returns a full breakdown. Formula:
  `Premium = dailyBase(package) × tripDays × ageFactor × destinationFactor`, floored at `MIN_PREMIUM` (5 €). Also exports helpers `tripDays`, `ageOnDate`, `ageFactor`, `destinationFactor`.
- `premium.spec.ts` — unit tests for the formula.

**Services** (`core/services/`):
- `policy.service.ts` — owns concluded policies. Exposes them as a read-only **Signal** (so the list updates reactively). `localStorage` is the authoritative store; when `useBff` is on it also hydrates from and mirrors writes to the BFF, **merging** (local wins on id conflicts) and failing silently if the BFF is unreachable.
- `policy-api.service.ts` — thin HTTP client for the BFF policy API (`list`/`create`/`remove`).
- `policy.service.spec.ts` — unit tests.

### `src/app/features/` — the two screens

**`features/sklenitev/`** — "conclude a policy" (the main flow):
- `sklenitev-page.ts` — **container/smart component**. Owns all state as Signals: the form, the selected package, and the **live premium** (a `computed()` that re-derives whenever package or form values change, returning `null` until inputs are valid). Handles `conclude()` → builds a `Policy`, saves it via `PolicyService`, resets.
- `insurance-form.factory.ts` — builds the Reactive `FormGroup` with all field + cross-field validators. Standalone so it's reusable and unit-testable.
- `insurance-form.ts` — **presentational** form over the FormGroup (the parent owns the group).
- `package-selector.ts` — presentational S/M/L selector; emits the chosen code to the parent.
- `live-premium.ts` — presentational display of the computed premium breakdown; holds no state.
- `*.html` / `*.scss` — templates and styles for each of the above.

**`features/police/`** — "concluded policies":
- `police-page.ts` — lists policies (reactive to the `PolicyService` signal) and deletes them.
- `police-page.html` / `.scss` — template and styles.

### `src/app/shared/` — reusable, cross-feature pieces

- `validators/custom-validators.ts` — form validators: email, phone (8–15 digits), `notInPast`, `dateRange` (cross-field), `birthDate` (plausible age). Pure predicates wrapped as `ValidatorFn`s.
- `ui/field-error.ts` — small component that renders the right validation message for a control.
- `pipes/eur.ts` — `EurPipe`, formats numbers as EUR currency.
- `*.spec.ts` — unit tests for validators.

### `frontend/e2e/` — Playwright end-to-end tests

- `conclude-policy.spec.ts` — the full happy path (form → package → premium → conclude → list → delete).
- `validation.spec.ts` — error cases (empty form, invalid email, bad dates, missing package).
- `playwright.config.ts` — boots `ng serve` then runs the tests.

### Frontend infra

- `Dockerfile` — builds the Angular app and serves it with Nginx.
- `nginx/default.conf.template` — Nginx config; proxies `/api/*` to the BFF.
- `angular.json`, `tsconfig*.json`, `package.json` — Angular/TS build config.

---

## BFF (`bff/`) — optional NestJS backend

A thin REST API with its own server-side copy of the pricing logic. Optional:
the frontend works fully without it.

| File | What it does |
|------|--------------|
| `src/main.ts` | Entry point; creates the Nest app, enables CORS, listens on `PORT` (default 3000). |
| `src/app.module.ts` | Root module wiring everything together. |
| `src/app.controller.ts` / `app.service.ts` | Health endpoint (`/health`) and app-level bits. |
| `src/policies/policies.controller.ts` | REST routes under `/api/policies`: `GET` (list), `POST` (create), `DELETE /:id`. |
| `src/policies/policies.service.ts` | **File-backed JSON store.** On `create`, it **validates the input and recomputes the premium and insured sum server-side**, overriding whatever the client sent (the client is never trusted). Narrow method surface so a real DB could replace it in one file. |
| `src/policies/policies.module.ts` | Wires the policies controller + service. |
| `src/domain/pricing.ts` | Server-side mirror of the frontend pricing formula (`calculatePremium`, `PACKAGES`, `Policy`). |
| `src/domain/validation.ts` | Server-side input validation (`validatePersonalData`), mirroring the Angular form validators — required fields, email/phone format, parseable dates, end-not-before-start, and age within 0–120. Rejects impossible data (e.g. a 200-year-old) with `400` instead of silently pricing it. Deliberately does **not** enforce "trip start not in the past" (that rule is time-relative and the BFF also receives already-concluded policies). |
| `src/*.spec.ts`, `test/` | Jest unit tests and an e2e spec. |
| `Dockerfile` | Containerizes the BFF (Node). |

---

## How it fits together (the main flow)

1. User opens `/sklenitev`. `SklenitevPage` creates the form (`insurance-form.factory.ts`) and renders `InsuranceForm` + `PackageSelector`.
2. As the user types and picks a package, `SklenitevPage.premium` (a `computed` Signal) calls `calculatePremium()` live and `LivePremium` shows the breakdown.
3. On **Conclude**, `SklenitevPage` builds a `Policy` and calls `PolicyService.add()`, which saves to `localStorage` (and, if `useBff`, POSTs to the BFF — which recomputes the price).
4. `/police` (`PolicePage`) reads the same `PolicyService` Signal, so the new policy appears immediately; delete removes it from both stores.

**Pricing lives in exactly two mirrored places** — `frontend/src/app/core/pricing/premium.ts` and `bff/src/domain/pricing.ts` — so the number the user sees live is the same number the server trusts.
