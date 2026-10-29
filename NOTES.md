# NOTES

## 1. Kaj je bila najtežja stvar? Za kaj si porabil največ časa?

Največ časa sta mi vzeli dve stvari. Prva je bila povezava **Angular Signalov z
Reactive Forms** za izračun premije v živo — da se premija samodejno preračuna ob
vsaki spremembi obrazca ali izbire paketa. Rešil sem to tako, da sem vrednosti
obrazca pretvoril v signal (`toSignal(form.valueChanges)`) in nato z `computed()`
izračunal premijo kot čisto izpeljano vrednost. Ko sem enkrat razumel, da je
`computed()` v bistvu "ta vrednost je funkcija teh vhodov", je postalo
preprosto.

Druga stvar je bil **deploy na Render**. Blueprint (`render.yaml`) mi sprva ni
šel skozi validacijo, ker statične strani na Renderju ne smejo imeti polja
`region` — to je bilo treba odstraniti. Potem je bilo treba še preveriti, da
`/api` klici s frontenda pravilno pridejo do NestJS BFF-ja.

## 2. Kaj si moral na novo pogooglati / se naučiti?

- **Angular Signals** (`signal`, `computed`, `toSignal`) — prej sem bil bolj
  navajen RxJS-a.
- **Standalone komponente** brez `NgModule`.
- Osnove **NestJS** (moduli, kontrolerji, servisi, DI).
- **Playwright** za E2E teste.
- **nginx** SPA fallback (`try_files ... /index.html`) in reverse proxy za `/api`.
- **Render Blueprint** sintaksa in razlika med static site in Docker web service.

## 3. Kaj je zavarovalna vsota in kaj je kritje?

**Zavarovalna vsota** je najvišji znesek, ki ga zavarovalnica izplača za krito
škodo — torej zgornja meja njene obveznosti. Ni to, kar plača stranka. Pri
potovalnem zavarovanju je glavna zavarovalna vsota navadno zdravstvena, ker je
resna bolezen ali nesreča v tujini (z morebitnim prevozom domov) tisto res drago
tveganje.

**Kritje** je konkretno tveganje, ki ga polica pokriva (zdravstvo, prtljaga,
odpoved potovanja, odgovornost …). Paket je sveženj kritij — večji paket pokriva
več stvari in ima višjo zavarovalno vsoto.

## 4. Kako si določil formulo za premijo? Zakaj so vrednosti take?

Formula je:

```
Premija = dnevnaOsnova(paket) × trajanjeDni × faktorStarost × faktorDestinacija
          (minimalna premija 5 €)
```

Izbral sem **multiplikativno** formulo, ker se tveganja sestavljajo — dolgo
potovanje IN starejši zavarovanec IN draga destinacija se morajo množiti, ne samo
seštevati. To posnema, kako v resnici deluje zavarovalniško obremenjevanje cene.

- **Dnevne osnove** (S = 2 €, M = 4 €, L = 7 €) naraščajo z obsegom kritij in
  zavarovalno vsoto (30.000 / 100.000 / 250.000 €).
- **Faktor starosti**: 0–17 → 0.8, 18–64 → 1.0, 65–74 → 1.75, 75+ → 2.5.
  80-letnik pade v razred 75+, zato plača 2,5× več kot 45-letnik za isto
  potovanje — kar je prav, saj z leti močno naraste tveganje zdravstvenega
  dogodka v tujini.
- **Faktor destinacije**: EU → 1.0 (velja EHIC), Evropa izven EU → 1.25,
  Svet → 1.6, ZDA/Kanada → 2.0 (zelo drage zdravstvene storitve).

Primer: 45 let, 10 dni, ZDA, paket M → `4 × 10 × 1.0 × 2.0 = 80 €`.

Formulo sem dal v eno samo čisto funkcijo (`core/pricing/premium.ts`), da jo je
lahko najti in testirati; na strani BFF jo preračunam še strežniško, da se
cene ne da ponarediti v brskalniku.

## 5. Kaj v tvoji rešitvi ni najbolje narejeno? Česa nisi utegnil?

- **Podvojena cenovna logika** med frontendom in BFF-jem. V pravem monorepu bi
  bila to skupna knjižnica (`@zavarotujina/pricing`); zdaj moram paziti, da
  ostaneta usklajeni.
- **BFF shramba je efemerna** (Render free nima diska), zato se podatki na
  backendu ob restartu zbrišejo. Zato je `localStorage` glavni vir resnice,
  BFF pa samo zrcali — frontend ob nedosegljivem BFF-ju deluje naprej.
- Ni **avtentikacije** / več uporabnikov.
- Ni polne **i18n** — slovenščina je trdo kodirana.
- **Docker slik nisem gradil lokalno** (na razvojnem računalniku ni bilo
  nameščenega Dockerja); Dockerfile-i so standardni in se gradijo na Renderju.
- Majhna nedoslednost: validatorji datume parsirajo lokalno, formula za premijo
  pa prek UTC — zanemarljivo za Slovenijo, bi pa poenotil.

## 6. Si uporabljal AI? Za kaj in kako? Kaj si prekopiral in kaj napisal sam?

Da, uporabljal sem AI (Claude) kot pomočnika. Konkretno:

- **Scaffold in boilerplate** (Angular/NestJS ogrodje, Dockerfile-i, nginx
  konfiguracija, render.yaml) — to je večinoma generirano, sam sem preveril in
  popravil (npr. napako z `region` pri static site, pot do `dist/.../browser`).
- **Predlog cenovne formule in testov** — logiko premije in unit/E2E teste sem
  razvil s pomočjo AI, nato pa sam preveril vrednosti in jih razumem (znam
  razložiti vsak faktor in primer 80-letnika).
- **Debugging in deploy** — pri napakah (npr. NestJS DI napaka, Render blueprint,
  izguba podatkov ob sinhronizaciji z BFF) sem s pomočjo AI našel vzrok, končne
  odločitve in popravke pa razumem.

Kar sem **sam** naredil/razumel: arhitekturne odločitve (localStorage kot vir
resnice + BFF kot zrcalo, server-side preračun premije), poslovno logiko
zavarovanja, in pregled kode (našel in popravil sem npr. tipkarsko napako na
gumbu in hrošča, ki je ob sinhronizaciji z BFF-jem lahko izbrisal lokalne
police). Kode nisem slepo kopiral — razumem, kaj vsak del počne, in to znam
zagovarjati.
