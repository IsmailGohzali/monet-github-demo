# Monet: Project Progress

> **Read this file first before changing anything in the app.**
> Update it at the end of every change: add a line to the Changelog, and update "Current state" and "Next steps" if they changed.

_Last updated: 1 Nov 2026_

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
| App prototype (`app/`) | **Built locally, not committed or pushed** (branch `app-prototype`, local only). Clickable front-end with demo data; no backend. See §5b. |
| Real app (chat, database, WhatsApp) | **Not started.** Plans exist (see §7). |
| Branches on GitHub | Only `main` and `monet-blue` (others deleted 1 Nov 2026). |
| Planning docs in `docs/` | All 7 present. DESIGN, PRD, AFD, IPD, TRD updated to v1.2 on 2 Nov 2026 (dark mode, menu, floating button, logo tiles, phone rules, app prototype); BSD and DBD unchanged (v1.1). |

## 3. Files in the repo
| Path | What it is |
|---|---|
| `index.html` | White landing page (homepage); single self-contained file with logos embedded |
| `progress.md` | This file |
| `CLAUDE.md` | Tells Claude to read this file first |
| `.gitignore` | Ignores the `docs/` folder (local planning docs) |
| `app/` (local only, untracked) | App prototype: `index.html` shell, `app.css`, `i18n.js` (EN/ID text), `data.js` (demo data + storage), `agents.js` (mock Monet/Bookkeeper/Analyst/Reminder), `app.js` (pages) |
| `.claude/launch.json` + `.claude/serve.js` (local only, untracked) | Start a local preview server on port 5173 |

## 4. Working rules (how the owner wants changes done)
1. **Read this file first**, then the files you'll change.
2. **Preview before pushing.** Make changes locally, send the owner a preview (the page + desktop and mobile screenshots), and **push only after they approve**, unless they explicitly say "push".
3. Work on a feature branch and get changes to `main` through a pull request, only when the owner asks. Don't push directly to `main`. The old blue site lives on branch `monet-blue`; don't change it unless asked.
4. **Never push** the planning docs (PRD, TRD, AFD, DBD, BSD, IPD, DESIGN). They live in the `docs/` folder, which `.gitignore` ignores.
5. Don't commit screenshots or other scratch files.
6. Ask first when unsure what something means (e.g. document names, scope).
7. After each change: test in a browser at **1440 px and 390 px** (no horizontal scroll, no console errors) and update this file.

## 5. Landing page (`index.html`): key facts
**Sections:** floating menu (Features · How it works · Demo · FAQ · 🌙/☀️ light-dark · EN | ID; on phones the links open from a ☰ button) + floating "Get started" button (`.getfix`: bottom right on larger screens, bottom centre on phones) → hero + app mockup → scrolling bank/e-wallet logos → features (6 cards of different sizes) → how it works (agent diagram) → live chat demo + stats row → FAQ → dark sign-up section → footer.

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
- **Run it:** start the `monet-local` preview (`.claude/launch.json`) and open `http://localhost:5173/app/`. Sign in with `rina@example.com` (demo data) or any other email (empty account → onboarding). Code is always `123456`.
- **Pages (routes per AFD §1):** sign-in, 4-step onboarding, Overview `#/overview`, Chat `#/chat`, Add/input `#/input` (type it, form, receipt photo, paste bank notification), Transactions `#/transactions`, Bills `#/bills`, Analysis `#/analysis` (monthly report, tips, investing ideas, archive), Settings `#/settings` (automations: WhatsApp, email forwarding + senders, receipts, inbox "coming soon"; rules; reminders; profile; accounts; memory; export; delete account; reset demo).
- **Agents are mocked** with rules in `agents.js` (no AI calls). They follow the AFD flows: Monet asks before saving anything unclear (amount, account, new account, duplicates), shows 🧠 memory updates, mentions 🔴 bills once a day, can't move money, investing always shows the OJK disclaimer. "Behind the scenes" toggle shows agent messages.
- **Data** lives in the browser's `localStorage` (`monet-proto-v2`); language shares the landing page key `monet-lang`. Settings → "Reset demo data" restores it.
- **EN | ID:** every string is in `i18n.js` as `[English, Indonesian]`.
- **Chart colours:** added chart-only tokens `--gold-c #DFA32C` (deeper gold for Transport so it passes the lightness check), `--sky #2E9BE6` (Shopping), `--other #A3A8BD` (Others). Category order Food (coral) → Bills (violet) → Transport (gold-c) → Shopping (sky); income green. Palette checked with a colourblind validator. DESIGN.md not yet updated with these.
- On the first days of a month, Overview and Analysis open on **last month** (this month has almost no data yet); a switch goes back to this month.

## 6. Open items
- [ ] **Stats row** ("5 min saved per day", "0 late fees", "4+ accounts", "24/7") is not measured. Verify or remove.
- [ ] **Sign-up** only opens an email to the owner. Needs a real waitlist form.
- [ ] Hero has both "Start for free" and "See it in action" buttons; menu has "Get started". Consider one label.
- [ ] Native-speaker review of the Indonesian text.
- [ ] Inter font isn't embedded (most visitors see their system font).

## 7. Planning documents (local only, in `docs/`, not in Git)
Written on 1 Nov 2026 for the full Monet app. **They are not in the repository**, so a new session won't have them unless the owner provides them again.

| File | Content |
|---|---|
| PRD.md | Product requirements: features F-1 … F-83 with priorities |
| TRD.md | Tech: Next.js + Vercel, Supabase (Postgres, Auth, Storage), QStash, WhatsApp Cloud API, inbound email, Claude API (`claude-opus-5-5` for Monet + Analyst, `claude-haiku-5-5` for Bookkeeper; Reminder is plain code) |
| AFD.md | User flows (onboarding, chat turn, logging, confirmations, reports, reminders, settings) |
| DBD.md | 19 tables (users, accounts, transactions, bills, bill_periods, messages, agent_messages, pending_confirmations, preferences, reports…), money as whole Rupiah `bigint` |
| BSD.md | Folder structure, API endpoints, orchestrator loop, cron jobs |
| IPD.md | 12 phases, about 14–15 weeks |
| DESIGN.md | Full design rules (short version in §5 above) |

## 8. Next steps (suggested)
1. Owner reviews the `app/` prototype locally; collect changes. Decide whether to commit it (and whether it should be deployed at `/app`) before anything is pushed.
2. Add the new chart colour tokens to `docs/DESIGN.md`.
3. Resolve the open items in §6 (stats row, real sign-up).
4. Start the real app: IPD Phase 0 (Next.js + Supabase setup), reusing the prototype's screens; apply for WhatsApp Business early.

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
