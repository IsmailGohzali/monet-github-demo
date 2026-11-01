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
| Homepage (`index.html`) | **White SaaS landing page, live on `main`** (Vercel deploys from `main`). |
| Old blue/navy site | Kept on branch **`monet-blue`** (not deployed as homepage). |
| Coral prototype (`saas2/`) | Deleted on request. |
| Real app (chat, database, WhatsApp) | **Not started.** Plans exist (see §7). |

## 3. Files in the repo
| Path | What it is |
|---|---|
| `index.html` | White landing page (homepage); single self-contained file with logos embedded |
| `progress.md` | This file |
| `CLAUDE.md` | Tells Claude to read this file first |
| `.gitignore` | Keeps the local planning docs out of Git |

## 4. Working rules (how the owner wants changes done)
1. **Read this file first**, then the files you'll change.
2. **Preview before pushing.** Make changes locally, send the owner a preview (the page + desktop and mobile screenshots), and **push only after they approve**, unless they explicitly say "push".
3. Work on a feature branch and get changes to `main` through a pull request, only when the owner asks. Don't push directly to `main`. The old blue site lives on branch `monet-blue`; don't change it unless asked.
4. **Never push** the planning docs (PRD, TRD, AFD, DBD, BSD, IPD, DESIGN). They're in `.gitignore`.
5. Don't commit screenshots or other scratch files.
6. Ask first when unsure what something means (e.g. document names, scope).
7. After each change: test in a browser at **1440 px and 390 px** (no horizontal scroll, no console errors) and update this file.

## 5. Landing page (`index.html`): key facts
**Sections:** floating menu (Features · How it works · Demo · FAQ · EN|ID switch · Get started) → hero + app mockup → scrolling bank/e-wallet logos → features (6 cards of different sizes) → how it works (agent diagram) → live chat demo + stats row → FAQ → dark sign-up section → footer.

**Language switch (EN | ID):**
- English text is in the HTML; each translatable element has `data-i="key"`.
- Indonesian text is in the `ID` object in the script, same key.
- **Every text change must be made in both languages.** A test: every `data-i` key must exist in `ID`.
- Choice saved in `localStorage` key `monet-lang`; first visit is English.
- Chat demo scripts are in `S.en` and `S.id`.

**Design rules (short version):**
- Colours (CSS variables): ink `#0E1330` (text, dark buttons), ink2 `#4A5072`, muted `#8A8FA8`, line `#E7E8F0`, background `#F7F7FB`, Monet green `#00C853` (logo, final sign-up button, success), gold `#F2B544`, violet `#6C63FF`, coral `#FF6F61`.
- Font: Inter → system fonts. Headings bold with tight letter spacing; second line of a heading in `<em>` (muted).
- White cards: 22 px radius, 1 px border, soft shadow. Buttons and chips are pills.
- One green button per view (the final sign-up). Other main buttons are dark ink.
- Sentence case for headings and buttons. Logo is `MONET`.
- Breakpoints: 1000 px and 760 px.

**Content rules:**
- **No fake social proof:** no testimonials, user counts or pricing (all removed on request).
- Investing content is always "educational only, choose OJK-registered products".
- Money formats: EN `Rp 12,500,000` / `Rp 12.5M`; ID `Rp 12.500.000` / `Rp 12,5 jt`.
- Bank/e-wallet logos come from `idn-finlogos` (CC BY-NC 4.0, non-commercial), credited in the footer. Replace with official brand assets before any commercial launch.
- Only one menu link per destination (the duplicate "Try demo" button was removed).

## 6. Open items
- [ ] **Stats row** ("5 min saved per day", "0 late fees", "4+ accounts", "24/7") is not measured. Verify or remove.
- [ ] **Sign-up** only opens an email to the owner. Needs a real waitlist form.
- [ ] Hero has both "Start for free" and "See it in action" buttons; menu has "Get started". Consider one label.
- [ ] Native-speaker review of the Indonesian text.
- [ ] Inter font isn't embedded (most visitors see their system font).

## 7. Planning documents (local only, not in Git)
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
1. Resolve the open items in §6 (stats row, real sign-up).
2. Start the app: IPD Phase 0 (Next.js + Supabase setup) and apply for WhatsApp Business early.

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
