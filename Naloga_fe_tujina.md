# Testna naloga: Zavarovanje za tujino

## Kontekst

V IN2 razvijamo portale za zavarovalnice. Ena izmed stvari, ki jih v tej panogi
največ delamo, je **sklenitev police** — od vnosa osebnih podatkov, prek izbire
paketa in izračuna premije, do pregleda sklenjenih polic.

Naloga je **namenoma odprta**. Zanima nas manj "ali je rešitev lepa" in bolj
**kako si se je lotil(a)**, kaj si pri tem razumel(a) in kaj ti je delalo težave.
Rešitev je lahko preprosta — pomembno je, da jo zagovarjaš.

---

## Kaj je treba narediti

Naredi **spletno aplikacijo za sklenitev zavarovanja za tujino**:

1. **Vnos osebnih podatkov** z validacijo
2. **Izbira paketa** (S, M, L) — od paketa je odvisna zavarovalna vsota in premija
3. **Prikaz premije** v živo (ko uporabnik izbere paket in izpolni podatke)
4. **Sklenitev police** → shrani se v `localStorage`
5. **Pregled sklenjenih polic** (seznam)
6. **Playwright testi** za glavni scenarij
7. **Docker container** + deploy na brezplačni javni strežnik

### Osebni podatki

Minimalno, kar potrebuješ:
- Ime, priimek
- Datum rojstva
- Email
- Telefon
- Država potovanja
- Datum začetka in konca potovanja

Validacija — osnovna. Kaj točno boš preveril, prepuščamo tebi — pripravi se, da nam na razgovoru razložiš, zakaj si se odločil tako.

### Paketi

Trije paketi: **S**, **M**, **L**. Vsak ima:
- **Zavarovalno vsoto** (koliko dobiš izplačano v najhujšem primeru)
- **Vključena kritja** (npr. zdravstveno, prtljaga, odpoved…)
- **Ceno (premijo)**

Vrednosti si **izmisli sam(a)** — ampak razmisli, da bodo smiselne. Na razgovoru
te bomo spraševali tudi o osnovnih zavarovalniških izrazih. Npr.:
- "Kaj je zavarovalna vsota?"
- "Kaj je premija?"
- "Kako si prišel(a) do te cene?"

### Izračun premije

Premija naj bo odvisna od vsaj **dveh** stvari — ne samo paketa. Npr. od starosti,
od trajanja potovanja, od destinacije (EU vs. izven EU)… Logiko si izmisli, ampak
**znati jo moraš razložiti**. Zapiši jo nekje v kodi tako, da jo bomo lahko hitro
našli.

### Sklenjene police

Ko uporabnik sklene polico, se shrani v `localStorage`. Nekje v aplikaciji (nov
zavihek, nova stran, meni) naj bo **seznam sklenjenih polic** z osnovnimi podatki
in ceno. Lahko se jih tudi briše — ni nujno.

---

## Tehnične zahteve

- **Angular** (nova verzija, standalone komponente). Signali so dobrodošli, ampak
  **niso obvezni** — če jih ne poznaš, uporabi, kar znaš, in nam na razgovoru povej,
  zakaj si izbral(a) tako.
- Backenda **ni treba delati** — vse se dogaja v brskalniku, podatki v `localStorage`.
  (Če hočeš narediti še mali NestJS BFF ali pokličeš kakšen javni API, super —
  ampak ni zahtevano.)
- **Playwright testi** — vsaj **en** scenarij od začetka do konca:
  izpolni obrazec → izberi paket → sklene polico → polica se pojavi v seznamu.
  Lahko dodaš še kakšen test za validacijo (npr. prazen obrazec ne pusti naprej).
- **Docker** — aplikacija zapakirana v Docker container (nginx, ki streže Angular
  build, je čisto dovolj).
- **Deploy na brezplačni javni strežnik** — pošlji nam povezavo, ki jo odpremo
  v brskalniku. Opcije:
  - **Netlify, Vercel, Render.com, Fly.io** — vse imajo brezplačne tarife
  - Karkoli drugega, kar znaš


---

## Oddaja

- Git repo (GitHub ali GitLab, javno dostopen)
- V `README.md`:
  - Kako zagnati lokalno (ukazi)
  - Kako zgraditi Docker image + zagnati container
  - Kako pognati Playwright teste
  - **Povezava do delujoče aplikacije** (deploy)
- V `NOTES.md` (navaden tekst, 1 stran je dovolj) napiši:
  1. Kaj je bila **najtežja stvar** v nalogi? Kaj si za to porabil največ časa?
  2. Kaj si moral **na novo pogooglati / naučiti**?
  3. Kaj je **zavarovalna vsota** in kaj je **kritje**?
  4. Kako si določil formulo za izračun premije? Zakaj so vrednosti take, kot so?
  5. **Kaj v tvoji rešitvi ni najbolje narejeno**? Česa nisi utegnil narediti?
  6. Si uporabljal AI (ChatGPT, Copilot, Claude)? Za kaj točno? IN kako? Kaj si od njega prekopiral in kaj si napisal sam?

Odgovore v `NOTES.md` piši **sam** — na razgovoru bomo o njih govorili.

---


## Kaj bomo gledali na razgovoru

Pripravi se, da:
- odpreš svoj repo in nam **razlagaš, kaj gledamo**,
- odpremo tvojo deployed aplikacijo in jo preizkusimo,
- te vprašamo stvari **ne samo o kodi**, ampak tudi o **zavarovalništvu**:
  - kaj je zavarovalna vsota, kaj je kritje, kaj je premija,
  - zakaj si premijo izračunal(a) tako, kot si,
  - kaj bi se zgodilo, če bi bil(a) uporabnik star(a) 80 let,
  - kaj bi dodal(a), če bi bila to prava produkcijska aplikacija,
- te vprašamo o **tehniki** (ampak brez pretiravanja):
  - kaj si novega spoznal(a),
  - kaj ti je delalo težave,
  - kako Playwright pravzaprav deluje (če si delal teste),
  - kako Docker pravzaprav deluje.

**Reši kar lahko, ni treba vsega.** Boljše je, da narediš manj in to poznaš, kot da narediš vse z AI-jem in ne razumeš narejenega.
