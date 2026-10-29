# Zavarovanje za tujino — Travel Insurance

Spletna aplikacija za sklenitev potovalnega zavarovanja: vnos osebnih podatkov z
validacijo, izbira paketa (S/M/L), **izračun premije v živo**, sklenitev police
(shrani se v `localStorage`, po želji tudi na BFF) in pregled/brisanje sklenjenih
polic.

> UI je v slovenščini; koda in komentarji so v angleščini.

**Živa aplikacija:** https://fe-tujina-frontend.onrender.com

---

## Tech stack

| Del | Tehnologija |
|-----|-------------|
| Frontend | Angular 20 (standalone komponente, **Signals**), Reactive Forms, SCSS |
| Backend (opcijsko) | NestJS BFF (Node), file-backed JSON store |
| Testi | Karma/Jasmine (unit), **Playwright** (E2E + validacija) |
| Container | Docker (Nginx za Angular, Node za NestJS) |
| Deploy | Render.com (static site + Docker web service) |

## Struktura repozitorija

```
frontend/   Angular aplikacija
  src/app/core/        modeli, podatki (paketi/destinacije), pricing, storitve
  src/app/features/    sklenitev (obrazec + izbira paketa + živa premija), police
  src/app/shared/      validatorji, UI komponente, pipes
  e2e/                 Playwright testi
bff/        NestJS BFF (REST API + server-side izračun premije)
render.yaml Render Blueprint (oba servisa)
docker-compose.yml
```

---

## Zagon lokalno

### Frontend (dovolj za celotno aplikacijo — deluje prek `localStorage`)

```bash
cd frontend
npm ci
npm start            # ng serve -> http://localhost:4200
```

### BFF (opcijsko)

```bash
cd bff
npm ci
npm run start:dev    # http://localhost:3000  (health: /health)
```

Za uporabo BFF lokalno v frontendu nastavi v `frontend/src/environments/environment.ts`
`useBff: true` (in po potrebi `apiBaseUrl: 'http://localhost:3000'`). Privzeto je
`useBff: false`, tako da aplikacija (in E2E testi) tečejo determinirano prek
`localStorage`.

---

## Izračun premije

Formula je na enem mestu, v čisti (framework-neodvisni) funkciji
[`frontend/src/app/core/pricing/premium.ts`](frontend/src/app/core/pricing/premium.ts)
(na strani BFF zrcaljena v [`bff/src/domain/pricing.ts`](bff/src/domain/pricing.ts)):

```
Premija = dnevnaOsnova(paket) × trajanjeDni × faktorStarost × faktorDestinacija
          (minimalna premija: 5 €)
```

- **faktorStarost**: 0–17 → 0.8 · 18–64 → 1.0 · 65–74 → 1.75 · 75+ → 2.5
- **faktorDestinacija**: EU → 1.0 · Evropa izven EU → 1.25 · Svet → 1.6 · ZDA/Kanada → 2.0

Primer: 45 let, 10 dni, ZDA, paket M → `4 × 10 × 1.0 × 2.0 = 80,00 €`.

---

## Testi

### Unit (frontend)

```bash
cd frontend
npm test                                  # interaktivno (Karma)
npx ng test --watch=false --browsers=ChromeHeadless   # enkratno, headless
```

### Unit (BFF)

```bash
cd bff
npm test                                  # jest
```

### E2E (Playwright)

```bash
cd frontend
npx playwright install chromium           # prvič
npm run e2e                               # zažene ng serve + teste
```

Pokrito: glavni scenarij (obrazec → paket → premija → sklenitev → seznam),
brisanje police ter validacija (prazen obrazec, neveljaven email, napačni
datumi, manjkajoč paket).

---

## Docker

Lokalni stack (Nginx frontend + NestJS BFF):

```bash
docker compose up --build
# -> http://localhost:8080  (frontend proxya /api na bff:3000)
```

Samo frontend:

```bash
cd frontend
docker build -t fe-tujina-frontend .
docker run -p 8080:80 fe-tujina-frontend   # -> http://localhost:8080
```

---

## Deploy (Render.com)

Repo vsebuje [`render.yaml`](render.yaml) Blueprint za oba servisa.

1. Na Render: **New + → Blueprint**, poveži ta repozitorij in **Apply**.
2. Nastane `fe-tujina-bff` (Docker) in `fe-tujina-frontend` (static site).
3. Če Render BFF-ju dodeli drugačno ime/URL, popravi `destination` v
   `render.yaml` (pravilo `/api/*`).
4. Povezavo do `fe-tujina-frontend` vpiši zgoraj pod **Živa aplikacija**.

Frontend je static site (brez cold-starta); BFF na brezplačnem planu zaspi po
neaktivnosti (~50 s ob prvem klicu) — aplikacija to prenese, ker ob nedosegljivem
BFF pade nazaj na `localStorage`.
