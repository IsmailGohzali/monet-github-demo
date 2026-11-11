# Monet: Project Progress

> **Read this file first before changing anything in the app.**
> Update it at the end of every change: add a line to the Changelog, and update "Current state" and "Next steps" if they changed.

_Last updated: 6 Nov 2026_

---

## 1. What Monet is
Monet is a chat-based AI finance manager for people in Indonesia. Users just chat with **Monet**; behind the scenes Monet runs a team of agents:
- 🎯 **Monet** (Manager): the user's only contact; forwards requests, checks results, replies.
- 📒 **Bookkeeper**: logs transactions from text, WhatsApp, emails, receipts.
- 📊 **Analyst**: reports and saving/investing tips.
- ⏰ **Reminder**: tracks bills (🔴 ≤3 days, 🟡 4–7 days, 🟢 later).

Agents never talk to the user or to each other directly. Everything goes through Monet.

## 2. Current state
| Item | Status |
|---|---|
| Homepage (`index.html`) | **White SaaS landing page, live on `main`** (Vercel deploys from `main`, https://monet-github-demo.vercel.app). Includes light/dark mode, EN | ID in the menu, floating green "Get started", phone fixes and logo tiles (pushed 2 Nov 2026). |
| Old blue/navy site | Kept on branch **`monet-blue`** (not deployed as homepage). |
| Coral prototype (`saas2/`) | Deleted on request. |
| App prototype (`app/`) | **Backed up on GitHub branch `app-prototype`** (commit `0416e20`, 6 Nov 2026; not merged, not deployed). Switch to that branch to see or run it. Clickable front-end with demo data; no backend. See §5b. |
| Real app (Monet v2) | **Step 1 built (7 Nov 2026)** in the private repo [monet-app](https://github.com/IsmailGohzali/monet-app) (its own `progress.md`): encrypted local vault, passkey/PIN/12-word unlock, add and list transactions, backup, PWA. **Live at https://monet-app.ismailgohzali.workers.dev** (Cloudflare Worker, deploys from `main` of `monet-app`). See §7 and §7b. |
| Branches on GitHub | `main`, `monet-blue` (old blue site), `app-prototype` (prototype backup). |
| Planning docs in `docs/` | **v2 (6 Nov 2026):** PRD, TRD, AFD, DBD, BSD, IPD rewritten for Monet v2; DESIGN extended (§11 v2 screens); MONET-V2.md = decision record. Old v1 docs (Supabase plan) kept in `docs/v1/`. **Backed up in the private repo [monet-docs](https://github.com/IsmailGohzali/monet-docs)** (`docs/` is its own git repo; this repo still ignores it). |

## 3. Files in the repo
| Path | What it is |
|---|---|
| `index.html` | White landing page (homepage); single self-contained file with logos embedded |
| `progress.md` | This file |
| `docs/PRODUCT.md` | Impeccable product record (users, purpose, constraints, brand, principles). Lives in `docs/` (private repo `monet-docs`), not in this public repo |
| `CLAUDE.md` | Tells Claude to read this file first |
| `.gitignore` | Ignores the `docs/` folder (planning docs; their own private repo `monet-docs`) |
| `app/` (only on branch `app-prototype`) | App prototype: `index.html` shell, `app.css`, `i18n.js` (EN/ID text), `data.js` (demo data + storage), `agents.js` (mock Monet/Bookkeeper/Analyst/Reminder), `app.js` (pages) |
| `.claude/launch.json` + `.claude/serve.js` (local only, untracked) | Start a local preview server on port 5173 |

## 4. Working rules (how the owner wants changes done)
1. **Read this file first**, then the files you'll change.
2. **Preview before pushing.** Make changes locally, send the owner a preview (the page + desktop and mobile screenshots), and **push only after they approve**, unless they explicitly say "push".
3. Work on a feature branch and get changes to `main` through a pull request, only when the owner asks. Don't push directly to `main`. The old blue site lives on branch `monet-blue`; don't change it unless asked.
4. **Never push** the planning docs (PRD, TRD, AFD, DBD, BSD, IPD, DESIGN) to this public repo. They live in the `docs/` folder, which `.gitignore` ignores; `docs/` is its own git repo pushed only to the private repo `monet-docs`.
5. Don't commit screenshots or other scratch files.
6. Ask first when unsure what something means (e.g. document names, scope).
7. After each change: test in a browser at **1440 px and 390 px** (no horizontal scroll, no console errors) and update this file.

## 5. Landing page (`index.html`): key facts
**Sections:** floating menu (Features · How it works · Demo · FAQ · 🌙/☀️ light-dark · EN | ID; on phones the links open from a ☰ button) + floating "Get started" button (`.getfix`: bottom right on larger screens, bottom centre on phones) → hero + app mockup → scrolling bank/e-wallet logos → features (6 cards of different sizes) → how it works (agent diagram) → live chat demo → FAQ → dark sign-up section → footer.

**Animation (Motion, the engine behind Framer Motion):** every animation goes through Motion; there are no CSS `@keyframes` or `transition` rules.
- The page uses `motion` 14.12.0 (the framework-free build; Framer Motion itself needs React), bundled with esbuild and inlined as one script (about 77 KB, 28 KB compressed), followed by a small animation layer (`const MO = ...`). If Motion fails to load, `MO` falls back to a no-op and the page shows everything statically (`html.nomo`).
- **Scroll reveals:** `.stg` = staggered children fade up one after another (menu, hero, section headings, feature cards, FAQ, prompts, sign-up, footer); `.rv` = a single block (the "How it works" diagram, the chat). Both fire once when scrolled into view and are hidden only when JS is on (`html.js`). Add `data-y="-10"` on a `.stg` to slide children down instead of up.
- **Hover and press:** springs on buttons, cards, prompts, steps, menu links, language and theme buttons, logos; colour changes are tweened and their inline styles cleared afterwards, so theme and language switches never leave stale colours.
- **Loops:** logo strip (pauses on hover), floating cards beside the mockup (wide screens only), pulsing floating "Get Started" (calm on hover), flowing dashes on the active line in "How it works", typing dots in the chat.
- **State changes** (active step, active diagram node) go through `MO.morph`, which animates from the old computed style to the new one.
- **Reduced motion:** content shows at once, no loops, no movement; hover changes are instant.
- **Updating the library:** in a scratch folder run `npm i motion esbuild`, bundle `import { animate, inView, hover, press, stagger } from "motion"; window.Motion = { animate, inView, hover, press, stagger };` with `esbuild --bundle --minify --format=iife --target=es2020 --legal-comments=none`, then replace the bundle script in `index.html` and re-test.

**Language switch (EN | ID):**
- English text is in the HTML; each translatable element has `data-i="key"`.
- Indonesian text is in the `ID` object in the script, same key.
- **Every text change must be made in both languages.** A test: every `data-i` key must exist in `ID`.
- Choice saved in `localStorage` key `monet-lang`; first visit is English.
- Chat demo scripts are in `S.en` and `S.id`.
- The EN | ID switch and the 🌙/☀️ light-dark button sit in the menu bar (right side). "Get started" is not in the menu; it floats at the bottom of the screen.
- **Light / dark mode:** first visit is light; the choice is saved in `localStorage` key `monet-theme`. Dark mode only swaps colour tokens (`html[data-theme="dark"]` block at the end of the CSS). Use tokens, not hex: `--white` (cards), `--soft` (inner panels), `--solid`/`--on-solid` (dark buttons, chips: light in dark mode), `--deep` (dark cards and the sign-up section: stay dark), `--okbg`/`--oktx` (success tags), `--glass` (menu). In dark mode the bank-logo strip sits directly on the dark page background (owner's choice; per-logo white chips and a light band were tried and dropped). Logos always keep their full colours. **Logo tiles:** every logo sits on an equal-size rounded tile (white with a border in light mode, soft light #EEF0F7 in dark mode), 16 px apart, so the full-colour logos are readable in both themes. Tried and dropped: white chips of different sizes, a light band, white-recoloured logos, gradient stripes, a light outline. (White-recoloured logos were tried and reverted on request.)
- **Menu links land on each heading:** sections after Features have less top padding, so they use `scroll-margin-top` to line their headings up with Features (desktop and phone).
- **The motto stays in English** in both languages: hero "Know your wealth. All in one place." and the motto part of the footer line (no `h1` key in `ID`).
- **Buttons keep one size in both languages:** every `.btn` with `data-i` holds both labels in one grid cell (`.dual`), only one visible. Keep Indonesian button labels no wider than the English ones (e.g. "▶ Lihat demonya", "Daftar gratis →").

**Design rules (short version):**
- Colours (CSS variables): ink `#0E1330` (text, dark buttons), ink2 `#4A5072`, muted `#8A8FA8`, line `#E7E8F0`, background `#F7F7FB`, Monet green `#00C853` (logo, final sign-up button, success), gold `#F2B544`, violet `#6C63FF`, coral `#FF6F61`.
- Font: Inter → system fonts. Headings bold with tight letter spacing; second line of a heading in `<em>` (muted).
- White cards: 22 px radius, 1 px border, soft shadow. Buttons and chips are pills.
- Green buttons: the final sign-up and the floating "Get started" (owner's request; Monet logo green `#00C853`, bigger (60 px tall), with a strong pulse ring every 1.8 s and a small hop every 3.6 s, both off for users who turn off motion). Other main buttons are dark ink.
- Reports card on phones: the donut is centred, the bars run full width.
- Sentence case for headings and buttons. Logo is `MONET`.
- Breakpoints: 1000 px and 760 px. On small screens nothing is hidden except the mockup's sidebar menu: the two floating cards sit above the mockup, the Monet chat panel sits under the dashboard, all 3 figures show, email rows wrap, and the agent diagram uses compact stacked boxes.

**Content rules:**
- **No fake social proof:** no testimonials, user counts or pricing (all removed on request).
- Investing content is always "educational only, choose OJK-registered products".
- Money formats: EN `Rp 12,500,000` / `Rp 12.5M`; ID `Rp 12.500.000` / `Rp 12,5 jt`.
- Bank/e-wallet logos come from `idn-finlogos` (CC BY-NC 4.0, non-commercial), credited in the footer. Replace with official brand assets before any commercial launch.
- Only one menu link per destination (the duplicate "Try demo" button was removed).

## 5b. App prototype (`app/`): key facts
- **Run it:** switch to branch `app-prototype`, start the `monet-local` preview (`.claude/launch.json`) and open `http://localhost:5173/app/`. Sign in with `rina@example.com` (demo data) or any other email (empty account → onboarding). Code is always `123456`.
- **Pages (routes per AFD §1):** sign-in, 4-step onboarding, Overview `#/overview`, Chat `#/chat`, Add/input `#/input` (type it, form, receipt photo, paste bank notification), Transactions `#/transactions`, Bills `#/bills`, Analysis `#/analysis` (monthly report, tips, investing ideas, archive), Settings `#/settings` (automations: WhatsApp, email forwarding + senders, receipts, inbox "coming soon"; rules; reminders; profile; accounts; memory; export; delete account; reset demo).
- **Agents are mocked** with rules in `agents.js` (no AI calls). They follow the AFD flows: Monet asks before saving anything unclear (amount, account, new account, duplicates), shows 🧠 memory updates, mentions 🔴 bills once a day, can't move money, investing always shows the OJK disclaimer. "Behind the scenes" toggle shows agent messages.
- **Data** lives in the browser's `localStorage` (`monet-proto-v2`); language shares the landing page key `monet-lang`. Settings → "Reset demo data" restores it.
- **EN | ID:** every string is in `i18n.js` as `[English, Indonesian]`.
- **Chart colours:** added chart-only tokens `--gold-c #DFA32C` (deeper gold for Transport so it passes the lightness check), `--sky #2E9BE6` (Shopping), `--other #A3A8BD` (Others). Category order Food (coral) → Bills (violet) → Transport (gold-c) → Shopping (sky); income green. Palette checked with a colourblind validator. DESIGN.md not yet updated with these.
- On the first days of a month, Overview and Analysis open on **last month** (this month has almost no data yet); a switch goes back to this month.

## 6. Open items
- [x] **Stats row** removed (not measured; 6 Nov 2026, PR #4, live). Bring back only with real numbers.
- [ ] **Sign-up** only opens an email to the owner. Needs a real waitlist form.
- [ ] Hero has both "Start for free" and "See it in action" buttons; menu has "Get started". Consider one label.
- [ ] Native-speaker review of the Indonesian text.
- [ ] Inter font isn't embedded (most visitors see their system font).

## 7. Planning documents (in `docs/`, private repo `monet-docs`)
Monet v2 plan, rewritten 6 Nov 2026 (v1 Supabase plan from 1 Nov kept in `docs/v1/`). **Not in this repository**; a new session can get them by cloning the private repo `IsmailGohzali/monet-docs` into `docs/`.

| File | Content |
|---|---|
| **MONET-V2.md** | Decision record (3 Nov 2026): local-first and encrypted; user chooses sync (Monet's encrypted Cloudflare server, own Google Drive/OneDrive, device only); passkey + 12-word recovery phrase + Monet-assisted recovery; Telegram bot + email inbox read instantly, only sealed results kept; AI online / rules offline / on-device AI; learns the user's style; budgets, goals, debts, investments; freemium; personal use first. §12 = settled 6 Nov, §13 = build decisions, §14 = still open |
| PRD.md | v2.0: features F-1 … F-112 with priorities and Free/Paid plan per feature; privacy model; risks; open questions |
| TRD.md | v2.0: privacy model (what Monet can/can't read), stack (Next.js PWA + OpenNext, Cloudflare Workers/D1/R2/KV, Dexie, Web Crypto, passkeys, Telegram, Claude: `claude-sonnet-5-5` chat/reports, `claude-haiku-5-5` extraction/inbox, `claude-opus-5-5` advanced reports), keys and encryption, sync, device-side AI orchestration, inbox, reminders, security |
| AFD.md | v2.0: setup (passkey, phrase, storage choice), unlock, input → log, learning, receipts, voice, Telegram/email inbox, reports, reminders, money tools, sync, assisted recovery, settings, edge cases |
| DBD.md | v2.0: device vault collections (incl. budgets, goals, debts, holdings, rules) and server tables (D1 metadata + encrypted records only), R2, KV, Drive format, lifecycle |
| BSD.md | v2.0: monorepo (apps/web, workers/api, workers/recovery, packages/shared + rules), API endpoints, device orchestrator, inbox processing, cron, auth, errors, tests (incl. privacy scan) |
| IPD.md | v2.0: 10 phases (~15 weeks); owner uses it daily from Phase 2 (~week 4); beta prep last |
| DESIGN.md | Full design rules (short version in §5 above); §11 = v2 screens (setup, recovery phrase, storage choice, sync status, recovery, money tools, plan gates) |

## 7b. Owner decisions (grilling session, 6 Nov 2026)
Copied into the docs on 6 Nov 2026 (MONET-V2 §12–14 and PRD, TRD, AFD, DBD, BSD, IPD, DESIGN; `monet-docs` commit `ec8f957`). Step 1 = IPD Phases 0 + 1.
- **Direction:** MONET-V2 approved; focus is building for personal use first (waitlist and marketing later).
- **Repos:** real app in a new **private** repo `monet-app` (GitHub `IsmailGohzali`); planning docs in private `monet-docs`.
- **Step 1 = done when:** installable PWA on the owner's phone, passkey sign-in, 12-word recovery key, add a transaction by hand and see it in a list (encrypted in IndexedDB), encrypted backup export/import, deployed on Cloudflare. No AI, sync or polish.
- **Step 1 is a static Next.js export** on Cloudflare; Workers (AI proxy, sync, inbox) come later as separate pieces. ⚠️ TRD/BSD v2 say OpenNext from the start; update them.
- **Encryption:** Dexie + Monet's own small Web Crypto layer, built test-first; no Dexie encryption add-on.
- **Recovery key:** BIP39 English word list (built-in typo check).
- **No passkey PRF on a device:** unlock with a **device PIN/password** for that device, locked after a few wrong tries.
- **Auto-lock:** after 15 min idle and when the app is closed.
- **Owner's devices:** Android phone + Chrome, Windows laptop + Chrome.
- **Device PIN caveat:** the PIN stops someone holding the device; it is weak against someone who copies the browser's data. The passkey path doesn't have this weakness. The app says so in Settings.
- **Address/deploy:** free Cloudflare address until a domain is needed: **by Phase 6** (email inbox needs a domain), which is before the beta; Cloudflare linked to `monet-app` GitHub, push to `main` deploys (build must pass).
- **EN | ID from step 1**, reusing the prototype's `i18n.js` pattern.
- **MONET-V2 §12:** Monet recovery on by default, user can turn it off (warning; Monet's copy deleted); recovery built only before beta; Google Drive / OneDrive sync **free**, Monet-server sync + AI paid (needs Google/Microsoft app approval); investment prices typed by hand in v1; speech-to-text, on-device model, price and payment provider decided at their build step.
- **Owner has no Cloudflare account yet:** the owner creates it before the first deploy (Claude guides).

## 8. Next steps (suggested)
1. Test step 1 on the owner's phone and laptop at the live address (install, passkey PRF, offline, backup restore).
2. Then IPD Phase 2: port the `app/` prototype screens onto the encrypted store with the offline rules engine → owner starts daily use.
3. Before beta: landing page v2 copy (F-84), real waitlist (F-82).

## 9. Changelog
| Date | Change |
|---|---|
| 1 Nov 2026 | Built white SaaS landing page at `/saas` |
| 1 Nov 2026 | Removed pricing, testimonials and the "2,400+ users" line |
| 1 Nov 2026 | Replaced logo text with official bank/e-wallet logos (embedded) |
| 1 Nov 2026 | Built coral prototype at `/saas2`, later deleted on request |
| 1 Nov 2026 | Added EN/ID switch to the white page; removed duplicate "Try demo" menu button |
| 1 Nov 2026 | Wrote PRD, TRD, AFD, DBD, BSD, IPD, DESIGN (local only, in `.gitignore`) |
| 1 Nov 2026 | Added `progress.md` and `CLAUDE.md` |
| 1 Nov 2026 | White landing page merged to `main` as the homepage (`index.html`); `/saas` removed; footer "Original site" link removed. Old blue site saved on branch `monet-blue` |
| 1 Nov 2026 | `.gitignore` now ignores the whole `docs/` folder; planning docs moved into `docs/` |
| 1 Nov 2026 | Deleted old remote branches (`claude/fervent-davinci-a9u8ya`, `claude/fervent-galileo-1pq0jv`, `claude/places-supabase-table-orazpl`, `vercel/install-and-configure-vercel-w-7chyac`). Only `main` and `monet-blue` remain |
| 1 Nov 2026 | `docs/` updated with the latest versions of all 7 planning docs (PRD, TRD, AFD, DBD, BSD, IPD, DESIGN; v1.1 where versioned) |
| 1 Nov 2026 | Built clickable app prototype in `app/` (sign-in, onboarding, overview, chat, add, transactions, bills, analysis, settings/automations; EN/ID; mock agents; demo data). Local only on branch `app-prototype`, not committed or pushed. Tested at 1440 px and 390 px |
| 2 Nov 2026 | Landing page (local, branch `landing-mobile-fixes`, not pushed): EN/ID moved out of the menu into a floating 🌐 pill; motto kept in English; buttons same size in EN and ID; phone fixes (☰ menu for links, floating cards, chat panel and "Saved" figure shown, email rows wrap, diagram boxes no longer overlap). Tested at 1440 px and 390 px |
| 2 Nov 2026 | Landing page (local, not pushed): fixed the Reports card bar chart disappearing on phones; replaced the 🌐 icon with a light/dark mode button and added a dark theme (colours moved to tokens). Tested both themes at 1440 px and 390 px |
| 2 Nov 2026 | Landing page (local, not pushed): dark-mode bank logos now on one light band instead of white chips; How it works / Demo / FAQ menu links now land on their headings like Features (desktop and phone) |
| 2 Nov 2026 | Landing page (local, not pushed): swapped places: light-dark + EN/ID now in the menu bar; "Get started" floats at bottom right (larger screens) / bottom centre (phones). Tested at 1440 px and 390 px |
| 2 Nov 2026 | Landing page (local, not pushed): dark-mode logo strip now uses the dark page background; Reports donut centred on phones; floating "Get started" is now Monet green with a pulse animation. Tested at 1440 px and 390 px |
| 2 Nov 2026 | Landing page (local, not pushed): dark mode shows bank/e-wallet logos in white so they are readable; light mode unchanged |
| 2 Nov 2026 | Landing page (local, not pushed): reverted the white dark-mode logos to full colour; logos now scroll on a gradient strip (light band in dark mode, slightly darker band in light mode) |
| 2 Nov 2026 | Landing page (local, not pushed): logo strip changed to a full-width centre stripe (like the owner's reference image): lighter middle in dark mode, darker middle in light mode |
| 2 Nov 2026 | Landing page (local, not pushed): logo stripe softened: taller band with an eased fade so it blends into the page in both modes |
| 2 Nov 2026 | Landing page (local, not pushed): removed the logo stripe; built two logo options to compare: A equal-size tiles (default), B light outline in dark mode (`?logos=glow`) |
| 2 Nov 2026 | Landing page (local, not pushed): owner chose logo tiles (option A); outline option removed |
| 2 Nov 2026 | Landing page changes committed and pushed to GitHub branch `landing-mobile-fixes` (not merged to `main`, so the live site is unchanged). `app/` prototype still local only |
| 2 Nov 2026 | Landing page commit `1f9d588` pushed to `main` (fast-forward, no PR: `gh` not installed on this computer) and live on Vercel |
| 2 Nov 2026 | Landing page (pushed to `main`): "How it works" heading, label and intro now centred above the steps and diagram, like the other sections. Tested at 1440 px and 390 px |
| 2 Nov 2026 | `docs/` updated (local only): DESIGN.md (theme tokens + dark mode, menu controls, floating "Get started", same-size buttons, logo tiles, phone rules, app prototype section), PRD.md (F-80b–d, status), AFD.md (Add/input screen, prototype note), IPD.md (done list), TRD.md (theme keys, prototype note) |
| 2 Nov 2026 | Landing page (pushed to `main`): floating "Get started" bigger (60 px tall), higher (32 px desktop, 28 px phone) and more noticeable (stronger pulse + hop). Tested at 1440 px and 390 px |
| 2 Nov 2026 | Landing page (pushed to `main`): on phones, How it works (diagram on top, 3 compact step buttons + active step text below) and Demo (chat on top, 3 compact prompt buttons below) each fit in one screen. Desktop unchanged. Tested at 390 px and desktop |
| 3 Nov 2026 | Reimagined Monet with the owner (4 rounds of questions); decisions saved to `docs/MONET-V2.md` (local only). Next steps updated: docs rewrite, then build v2 for personal use |
| 6 Nov 2026 | `docs/` rewritten for Monet v2 (local only): PRD, TRD, AFD, DBD, BSD, IPD → v2.0; DESIGN §11 v2 screens; MONET-V2 marked approved. v1 docs kept in `docs/v1/`. Cross-checked: no Supabase/QStash leftovers, every referenced feature ID exists |
| 6 Nov 2026 | Grilling session with the owner (4 rounds): decisions saved in §7b; next steps rewritten |
| 6 Nov 2026 | Backups: `app/` prototype committed and pushed to branch `app-prototype` (`0416e20`); `docs/` made its own git repo and pushed to private repo `monet-docs` (`1e25496`). Git name/email set for this repo only |
| 6 Nov 2026 | Landing page: removed the unmeasured stats row under the demo (HTML, CSS, `sa1`–`sa4` in `ID`). Tested at 1440 px and 390 px. Merged to `main` via PR #4 (`6757d6d`), live on Vercel |
| 6 Nov 2026 | Deleted merged branches `landing-mobile-fixes` and `remove-stats-row` (GitHub and local), on request. Kept `monet-blue` and `app-prototype` |
| 7 Nov 2026 | Real app step 1 built test-first in the new private repo `monet-app` (commits `792c3c1`, `1879c7b`): 41 unit tests + 10 Playwright runs pass. IPD Phase 0–1 ticked in `monet-docs` (`0d7fb11`). Local `.claude/launch.json` gained a `monet-app` preview (port 4173) |
| 8 Nov 2026 | Floating "Get started" and bottom sign-up button both say "Get Started" and link to the app at `https://monet-app.ismailgohzali.workers.dev` (bottom button was "Sign up now" mailto). Local branch `app-links`, not pushed yet |
| 7 Nov 2026 | Owner created the Cloudflare account; `monet-app` deploys as a Cloudflare Worker (PRs #1, #2 in `monet-app`). Live at https://monet-app.ismailgohzali.workers.dev; checked pages, headers, service worker, console |
| 10 Nov 2026 | Checked the live app: setup screen loads, no console errors (no changes made). Ran `/impeccable init`: wrote `docs/PRODUCT.md` (platform web; users, purpose, positioning, constraints, brand, evidence, principles) from owner answers. Owner chose: personal use first then Indonesians, covers landing page and app, replace bank logos before commercial launch. Kept out of the public repo (in `docs/`). Not committed to `monet-docs` yet |
| 10 Nov 2026 | Landing page (local, not pushed): green sign-up buttons ("Sign up now", floating "Get started") now use dark ink text instead of white, contrast 2.2:1 → 8.1:1. Green kept. Checked computed colours in the browser. Impeccable detector also flags muted captions (#8A8FA8 on #F7F7FB, 3.0:1), not changed yet |
| 10 Nov 2026 | Landing page (local, not pushed): fixed skipped heading levels (hero mockup greeting h3→h2, Bookkeeper/Analyst/Reminder h4→h3, CSS selectors updated; sizes unchanged, checked in browser). Detector: marquee ignored for `index.html` (documented logo strip, DESIGN.md §5). Left standing: nested-cards (may be the mockup itself), Inter font (not confirmed), gradient text and glow shadows (hero, owner's choice pending) |
| 10 Nov 2026 | Landing page (local, not pushed): font changed from Inter (flagged as overused) to Figtree, loaded from Google Fonts (weights 400–800). Adds a third-party request to fonts.googleapis.com / fonts.gstatic.com. Checked in browser: font loads, no horizontal scroll. `docs/DESIGN.md` §2 still says Inter (update in `monet-docs`) |
| 11 Nov 2026 | Landing page (branch `framer-motion`, not pushed): all animation moved to Motion (scroll-triggered fades, staggered reveals, spring hover and press, tweened state changes); CSS keyframes and transitions removed. Tested at 1440 px and 390 px in light and dark, EN and ID, reduced motion and with JS off: no errors, nothing stuck hidden, no horizontal scroll |
| 10 Nov 2026 | Landing page (local, not pushed): Figtree now self-hosted: one variable font file (Latin, 20 KB, weights 400–800) embedded as base64 in `index.html`, like the logos. Google Fonts link removed, so no third-party font requests. Checked in browser: font loaded, zero external font requests, no horizontal scroll. Page grows about 27 KB |
| 6 Nov 2026 | `docs/` updated with the 6 Nov decisions and pushed to `monet-docs` (`ec8f957`): MONET-V2 §12–14; static export first (Workers from Phase 4, server accounts from Phase 5); BIP39 phrase; device PIN when no PRF; app lock 15 min + on close; recovery opt-out; free drive sync; manual prices in v1; domain by Phase 6. Location line in each doc now points to `monet-docs` |
