# CHANGELOG

Format: SemVer (MAJOR.MINOR.PATCH). Intrările mai vechi sunt copiate din README (secțiunea „History / Changelog”), neschimbate.

## 2.0.1 — 2026-10-27 (anterior: 2.0.0)

Recenzie (doar texte, fără modificări de logică):
- README (8 limbi): secțiune nouă „Cum funcționează jocul” cu tabelul obiectelor (valorile sunt citite din codul jocului) și nota sinceră că cele 108 puzzle-uri sunt variații pe aceeași mecanică; lista „Obiecte de plasat” completată cu **Lună** și **Scut**, care existau în cod dar lipseau din listă; dimensiunea fișierului corectată (≈ 1,1 MB).
- Descrierea scurtă a aplicației (meta description / fișa din `app.json`) rescrisă mai atractiv.
- Adăugat „Stare: stabil” și „Offline: complet” în README.
- Salvarea progresului (`incrediblecosmos.progress`, cu `try/catch`) și editorul de niveluri existau deja din 1.2.7 / 2.0.0; nu s-a modificat nimic acolo.

---

## Istoric anterior (din README.md)

#### 1.2.7 — 2026-10-23

- Fix: a damaged saved-progress entry (`null`, negative or huge star count in `incrediblecosmos.progress`) crashed the whole screen on start; progress is now validated (0–3 stars per puzzle). `app.json` now lists the `incrediblecosmos.progress` key. New regression test.

#### 1.2.6 — 2026-10-23

- Storage: keys now carry the app prefix (`incrediblecosmos.progress`, `incrediblecosmos.lang`, `incrediblecosmos.tut`); existing data is migrated automatically at startup from the old key(s) (`cosmos108`, `cosmos108:lang`, `cosmos108:tut`), and older `.fff.json` backups still import (fff-kit 1.2.0).
- Dialogs: the native `alert`/`confirm`/`prompt` boxes were replaced with accessible, translated `FFF.dialog` dialogs (keyboard, focus trap, Escape) with the same behavior (fff-kit 1.2.0).

#### 1.2.4 — 2026-10-22

fff-kit 1.1.4: touch targets and minimum text size. Touch targets/text fixed in the app.

#### 1.2.3 — 2026-10-22

fff-kit 1.1.2: PBKDF2 with 600,000 iterations, anti-clickjacking protection.

#### 1.2.2 — 2026-10-22
- The blocking browser confirmation when resetting progress is replaced by a translated modal dialog (8 languages).
- Mobile: all UI text is at least 12 px (it was 6–11 px) and the category filter chips are larger touch targets.

#### 1.2.1 — 2026-10-22
- Puzzle subtitles (star types, categories, short descriptors) are now translated into all 8 languages; they were shown in Romanian everywhere.

#### 1.1.0 — 2026-10-14
- Backup copy and data labelling (fff-kit).

#### 1.0.0 — 2026-10-12
- The version and the date of the last update are shown in the app (gallery footer).

#### 11 October 2026 (round 7)
- Fixed: "Search puzzle" searched only names (e.g. "wormhole" gave 0 results); it now also searches subtitle, goal, category, difficulty and objects, ignoring diacritics, with the number of results announced and a message when there are none. The CSP hash of the JSX script was recalculated.

#### 11 October 2026 (round 6)
- Added: keyboard play (cursor with arrows, hotkeys), `aria-live` announcements, "Continue" and "Clear progress" in the gallery; progress is saved on winning, not only when leaving the puzzle.
- Security: CSP with `script-src` by hash (5 scripts) instead of `'unsafe-inline'`.
- Unchanged: the 108 puzzles remain variations on the same mechanics (the author's content decision).

#### 11 October 2026
- Fixed: the 3D background no longer shows grainy squares; particles (stars, nebulae) now use a soft circular sprite generated locally.
- Fixed: the "How to play" panel appears automatically only on first opening (localStorage key `cosmos108:tut`), closes by itself after 8 seconds or with Escape, and remains available from the "?" button.
- Fixed: structure with landmarks (`<main>`, `<aside>` for support); 0 axe-core violations at 1280 and 360 px.
