/* Monet app prototype: router, shell and pages. Routes follow docs/AFD.md §1. */
const $ = (s, el) => (el || document).querySelector(s);
const root = $('#root');
const ROUTES = ['overview', 'chat', 'input', 'transactions', 'bills', 'analysis', 'settings'];
const NAV = [['overview','🏠','nOverview'],['chat','💬','nChat'],['input','➕','nInput'],['transactions','📒','nTxns'],['bills','⏰','nBills'],['analysis','📊','nAnalysis'],['settings','⚙️','nSettings']];
const mark = '<svg viewBox="22 30 78 58" aria-hidden="true"><use href="#mk"/></svg>';
const V = {behind:false, inTab:'text', inItems:null, inErr:'', receipt:null, txQ:'', txType:'all', txAcct:'', txCat:'', txMonth:'', anY:null, anM:null, login:{step:'email', email:'rina@example.com', err:''}, ob:1, obSel:[], obName:'', obConsent:false, recentAdded:[]};

/* ---------- utilities ---------- */
function route(){ const h = location.hash.replace(/^#\/?/, '').split('?'); return {name:h[0] || 'overview', q:new URLSearchParams(h[1] || '')}; }
function setLang(l){ LANG = l; try { localStorage.setItem('monet-lang', l); } catch (e) {} document.documentElement.lang = l; render(); }
function langSwitch(){ return `<div class="lang" role="group" aria-label="Language"><button data-a="lang" data-v="en" aria-pressed="${LANG === 'en'}">EN</button><button data-a="lang" data-v="id" aria-pressed="${LANG === 'id'}">ID</button></div>`; }
let toastT;
function toast(text, undo){
  const el = $('#toast'); el.innerHTML = esc(text) + (undo ? ` <button data-a="undo">${t('undo')}</button>` : '');
  el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), undo ? 6000 : 2600);
  el.onclick = e => { if (e.target.dataset.a === 'undo'){ undo(); el.classList.remove('on'); } };
}
function openPanel(html){ $('#panel').innerHTML = html; $('#panel').classList.add('on'); $('#scrim').classList.add('on'); }
function openModal(html){ $('#modal').innerHTML = html; $('#modal').classList.add('on'); $('#scrim').classList.add('on'); const f = $('#modal input,#modal select'); if (f) f.focus(); }
function closeAll(){ ['#panel', '#modal', '#scrim'].forEach(s => $(s).classList.remove('on')); }
$('#scrim').onclick = closeAll;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
function download(name, text, type){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
function srcLabel(s){ return {chat:'💬 ' + t('srcChat'), whatsapp:'🟢 ' + t('srcWa'), email:'📧 ' + t('srcEmail'), receipt:'🧾 ' + t('srcReceipt'), manual:'✍️ ' + t('srcManual')}[s] || s; }
function chgHtml(cur, prev, goodUp){
  if (!prev) return `<div class="chg flat">—</div>`;
  const p = Math.round((cur - prev) / Math.abs(prev) * 100), good = goodUp ? p >= 0 : p <= 0;
  return `<div class="chg ${p === 0 ? 'flat' : good ? 'up' : 'down'}">${p > 0 ? '▲' : p < 0 ? '▼' : '•'} ${Math.abs(p)}% ${t('vsLast')}</div>`;
}
function acctOptions(sel, withEmpty){ return (withEmpty ? `<option value="">${t('needAcct')}…</option>` : '') + activeAccounts().map(a => `<option ${a.name === sel ? 'selected' : ''}>${esc(a.name)}</option>`).join(''); }
function catOptions(sel, type){ return Object.keys(CATS).filter(k => type === 'transfer' ? k === 'transfer' : CATS[k].kind === (type || 'expense')).map(k => `<option value="${k}" ${k === sel ? 'selected' : ''}>${CATS[k].ic} ${catName(k)}</option>`).join(''); }
function typeOptions(sel){ return [['expense','expense'],['income','incomeT'],['transfer','transfer']].map(([v, k]) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${t(k)}</option>`).join(''); }
function txRow(x){
  const c = CATS[x.cat] || CATS.others, sign = x.type === 'income' ? '+' : x.type === 'transfer' ? '' : '−';
  return `<button class="li" data-a="edit-tx" data-id="${x.id}"><span class="ico">${c.ic}</span><span class="mid"><b>${esc(x.desc)}</b><span>${esc(x.account)}${x.type === 'transfer' && x.to ? ' → ' + esc(x.to) : ''} · ${catName(x.cat)} · ${new Date(x.date).toLocaleTimeString(locale(), {hour:'2-digit', minute:'2-digit'})}</span></span><span class="amt ${x.type === 'income' ? 'inc' : ''}">${sign}${rp(x.amount)}</span></button>`;
}
function dayLabel(d){ const k = d.slice(0, 10), t0 = dateOnly(today0()), y = dateOnly(new Date(today0().getTime() - DAY)); return k === t0 ? t('today') : k === y ? t('yesterday') : fmtDate(d, {weekday:'long', day:'numeric', month:'long'}); }

/* ---------- charts (inline SVG, hover tooltips) ---------- */
function cashflowChart(y, m, n){
  const data = [];
  for (let i = n - 1; i >= 0; i--){ const [yy, mm] = prevYM(y, m, i); const tt = monthTotals(yy, mm); data.push({y:yy, m:mm, inc:tt.inc, exp:tt.exp}); }
  const W = innerWidth <= 760 ? 360 : 640, H = 230, pl = 52, pb = 26, pt = 10, max = Math.max(1, ...data.map(d => Math.max(d.inc, d.exp))) * 1.1;
  const step = (W - pl) / n, bw = Math.min(26, step / 3.2), Y = v => pt + (H - pt - pb) * (1 - v / max);
  const ticks = [0, .25, .5, .75, 1].map(f => max / 1.1 * f);
  const bar = (x, v, col) => { const y0 = Y(0), y1 = Y(v), h = Math.max(0, y0 - y1), r = Math.min(4, h); return `<path d="M${x},${y0}V${y1 + r}Q${x},${y1} ${x + r},${y1}H${x + bw - r}Q${x + bw},${y1} ${x + bw},${y1 + r}V${y0}Z" fill="${col}"/>`; };
  let g = ticks.map(v => `<line x1="${pl}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${v ? rpShort(v).replace('Rp ', '') : '0'}</text>`).join('');
  data.forEach((d, i) => {
    const cx = pl + step * i + step / 2;
    g += bar(cx - bw - 1, d.inc, 'var(--green)') + bar(cx + 1, d.exp, 'var(--violet)');
    g += `<text x="${cx}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--ink2)">${new Date(d.y, d.m, 1).toLocaleDateString(locale(), {month:'short'})}</text>`;
    g += `<rect x="${pl + step * i}" y="0" width="${step}" height="${H - pb}" fill="transparent" data-tip="${esc(`<b>${fmtMonth(d.y, d.m)}</b><br>${t('income')}: ${rp(d.inc)}<br>${t('spending')}: ${rp(d.exp)}<br>${t('saved')}: ${rp(d.inc - d.exp)}`)}" data-x="${cx / W}"/>`;
  });
  return `<div class="legend"><span><i style="background:var(--green)"></i>${t('income')}</span><span><i style="background:var(--violet)"></i>${t('spending')}</span></div><div class="chart" data-chart><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('cashflow')}">${g}</svg><div class="tip"></div></div>`;
}
function catGroups(cats){
  const total = Object.values(cats).reduce((a, b) => a + b, 0);
  const rows = CHART_CATS.filter(c => cats[c]).map(c => ({k:c, name:catName(c), v:cats[c], col:CATS[c].color, ic:CATS[c].ic}));
  const rest = Object.entries(cats).filter(([c]) => !CHART_CATS.includes(c)), rv = rest.reduce((a, [, v]) => a + v, 0);
  if (rv) rows.push({k:'others', name:catName('others'), v:rv, col:'var(--other)', ic:'📦', sub:rest.sort((a, b) => b[1] - a[1]).map(([c]) => catName(c)).join(', ')});
  return {rows, total};
}
function donutChart(cats){
  const {rows, total} = catGroups(cats); if (!total) return `<p class="empty">${t('noData')}</p>`;
  const R = 80, r = 52, C = 90; let a0 = -Math.PI / 2, g = '';
  const pt = (a, rad) => [C + rad * Math.cos(a), C + rad * Math.sin(a)];
  for (const row of rows){
    const a1 = a0 + row.v / total * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R), [x2, y2] = pt(a1, r), [x3, y3] = pt(a0, r);
    const d = rows.length === 1 ? `M${C},${C - R}A${R},${R} 0 1 1 ${C - .01},${C - R}L${C - .01},${C - r}A${r},${r} 0 1 0 ${C},${C - r}Z` : `M${x0},${y0}A${R},${R} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${r},${r} 0 ${large} 0 ${x3},${y3}Z`;
    const mid = (a0 + a1) / 2;
    g += `<path d="${d}" fill="${row.col}" stroke="#fff" stroke-width="2" data-tip="${esc(`<b>${row.name}</b><br>${rp(row.v)} · ${Math.round(row.v / total * 100)}%`)}" data-x="${(C + 66 * Math.cos(mid)) / 180}" data-y="${(C + 66 * Math.sin(mid)) / 180}"/>`;
    a0 = a1;
  }
  g += `<text x="90" y="86" text-anchor="middle" font-size="11" fill="var(--muted)">${t('spending')}</text><text x="90" y="104" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">${rpShort(total)}</text>`;
  const table = `<table class="ctable" aria-label="${t('tableView')}">${rows.map(x => `<tr><td><i style="background:${x.col}"></i>${x.ic} ${x.name}${x.sub ? `<div class="small muted" style="margin-left:18px">${esc(x.sub)}</div>` : ''}</td><td class="n">${rp(x.v)}</td><td class="n muted">${Math.round(x.v / total * 100)}%</td></tr>`).join('')}</table>`;
  return `<div class="donut"><div class="chart" data-chart><svg viewBox="0 0 180 180" role="img" aria-label="${t('byCat')}">${g}</svg><div class="tip"></div></div>${table}</div>`;
}
function bindCharts(){
  document.querySelectorAll('[data-chart]').forEach(ch => {
    const tip = $('.tip', ch);
    ch.addEventListener('mouseover', e => { const el = e.target.closest('[data-tip]'); if (!el) return; tip.innerHTML = el.dataset.tip; const r = ch.getBoundingClientRect();
      tip.style.left = (+el.dataset.x * r.width) + 'px'; tip.style.top = (el.dataset.y ? +el.dataset.y * r.height : 20) + 'px'; tip.classList.add('on'); el.style.opacity = el.tagName === 'rect' ? '' : '.85'; });
    ch.addEventListener('mouseout', e => { const el = e.target.closest('[data-tip]'); if (el) el.style.opacity = ''; tip.classList.remove('on'); });
  });
}

/* ---------- auth & onboarding ---------- */
function pageLogin(){
  const L = V.login;
  const body = L.step === 'email' ? `
    <h2 style="font-size:1.6rem;letter-spacing:-.03em">${t('loginTitle')}</h2><p class="ink2 mt8">${t('loginSub')}</p>
    <form data-f="login-email" class="mt"><label class="f" for="em">${t('email')}</label><input class="in" id="em" type="email" value="${esc(L.email)}" autocomplete="email" required>
    ${L.err ? `<div class="err">${L.err}</div>` : ''}<button class="btn dark block mt">${t('sendCode')} <span class="ar">→</span></button></form>
    <div class="divider">${t('or')}</div><button class="btn ghost block" data-a="google">G&nbsp; ${t('google')}</button>
    <p class="note mt">${t('demoHint')}</p>` : `
    <button class="link" data-a="login-back">← ${t('back')}</button>
    <h2 style="font-size:1.6rem;letter-spacing:-.03em;margin-top:10px">${t('codeTitle')}</h2><p class="ink2 mt8">${t('codeSub', {e:esc(L.email)})}</p>
    <form data-f="login-code" class="mt"><label class="f" for="cd">${t('code')}</label><input class="in" id="cd" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code" style="letter-spacing:.3em;font-weight:700">
    ${L.err ? `<div class="err">${L.err}</div>` : ''}<p class="small muted mt8">${t('demoCode')}</p><button class="btn dark block mt">${t('verify')} <span class="ar">→</span></button></form>`;
  return `<div class="auth"><div class="authbox"><div class="authtop"><a class="logo" href="../index.html">${mark}MONET</a>${langSwitch()}</div><div class="card">${body}</div></div></div>`;
}
function loginAs(email){
  if (email === 'rina@example.com'){ if (S.user.email !== email) S = seed(); }
  else if (S.user.email !== email) S = emptyUser(email);
  session(email); persist(); location.hash = S.user.onboarded ? '#/overview' : '#/onboarding'; render();
}
const OB_ACCTS = [['BCA','bank'],['Mandiri','bank'],['BRI','bank'],['BNI','bank'],['GoPay','ewallet'],['OVO','ewallet'],['DANA','ewallet'],['ShopeePay','ewallet'],['Jenius','bank'],['Cash','cash'],['Credit card','credit_card']];
function pageOnboarding(){
  const st = V.ob, steps = `<div class="steps">${[1, 2, 3, 4].map(i => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>`;
  let b = '';
  if (st === 1) b = `<h2 style="font-size:1.4rem">${t('ob1')}</h2><p class="ink2 mt8">${t('ob1s')}</p>
    <div class="chips mt"><button class="chip" data-a="lang" data-v="en" aria-pressed="${LANG === 'en'}">English</button><button class="chip" data-a="lang" data-v="id" aria-pressed="${LANG === 'id'}">Bahasa Indonesia</button></div>
    <label class="f mt" for="obn">${t('yourName')}</label><input class="in" id="obn" value="${esc(V.obName)}" data-in="obName">
    <label class="check mt"><input type="checkbox" data-a="ob-consent" ${V.obConsent ? 'checked' : ''}><span>${t('consent')}</span></label>
    <button class="btn dark block mt" data-a="ob-next" ${V.obConsent && V.obName.trim() ? '' : 'disabled'}>${t('next')} <span class="ar">→</span></button>`;
  if (st === 2) b = `<h2 style="font-size:1.4rem">${t('ob2')}</h2><p class="ink2 mt8">${t('ob2s')}</p>
    <div class="chips mt">${OB_ACCTS.map(([n]) => `<button class="chip" data-a="ob-acct" data-v="${n}" aria-pressed="${V.obSel.includes(n)}">${n === 'Cash' ? t('cash') : n === 'Credit card' ? t('credit_card') : n}</button>`).join('')}</div>
    <form data-f="ob-other" class="row mt"><input class="in" id="obo" placeholder="${t('addOther')}" style="flex:1"><button class="btn ghost sm">+</button></form>
    <button class="btn dark block mt" data-a="ob-next" ${V.obSel.length ? '' : 'disabled'}>${t('next')} <span class="ar">→</span></button>`;
  if (st === 3) b = `<h2 style="font-size:1.4rem">${t('ob3')}</h2><p class="ink2 mt8">${t('ob3s')}</p>
    <div class="mt"><span class="code">LINK 482913</span></div>
    ${S.auto.waLinked ? `<p class="mt"><span class="tag ok">✓ ${t('linked')}</span></p>` : `<div class="row mt"><a class="btn ghost" href="https://wa.me/" target="_blank" rel="noopener">💬 ${t('openWa')}</a><button class="btn ghost" data-a="ob-wa">${t('simulateLink')}</button></div>`}
    <div class="row mt"><button class="btn dark" data-a="ob-next">${t('next')} <span class="ar">→</span></button>${S.auto.waLinked ? '' : `<button class="link" data-a="ob-next">${t('skip')}</button>`}</div>`;
  if (st === 4) b = `<h2 style="font-size:1.4rem">${t('ob4')}</h2><p class="ink2 mt8">${t('ob4s')}</p>
    <div class="list mt">${['sug1', 'sug2', 'sug3'].map(k => `<button class="li" data-a="ob-finish" data-v="${k}"><span class="ico">💬</span><span class="mid"><b>${t(k)}</b></span><span class="ar">→</span></button>`).join('')}</div>
    <button class="btn dark block mt" data-a="ob-finish">${t('finish')} <span class="ar">→</span></button>`;
  return `<div class="auth"><div class="authbox"><div class="authtop"><span class="logo">${mark}MONET</span>${langSwitch()}</div><div class="card">${steps}${b}</div></div></div>`;
}

/* ---------- shell ---------- */
function shell(name, title, body){
  const n = notifications(), unseen = n.filter(x => !S.seenNotifs.includes(x.id)).length, pend = S.pending.filter(p => p.open).length;
  const urgentBills = billsSorted().filter(b => billStatus(b).d <= 3).length;
  const badge = k => k === 'chat' && pend ? `<span class="badge">${pend}</span>` : k === 'bills' && urgentBills ? `<span class="badge">${urgentBills}</span>` : '';
  const side = `<nav class="side" aria-label="Main"><a class="logo" href="#/overview">${mark}<span>MONET</span></a>
    ${NAV.map(([k, ic, lb]) => `<a class="navi" href="#/${k}" ${k === name ? 'aria-current="page"' : ''} title="${t(lb)}"><span class="ic">${ic}</span><span class="lbl">${t(lb)}</span>${badge(k)}</a>`).join('')}
    <div class="grow"></div><div class="who"><span class="av">${esc((S.user.name || '?')[0])}</span><span class="tx"><b>${esc(S.user.name)}</b><small>${esc(S.user.email)}</small></span><button class="out" data-a="logout" title="${t('logout')}">${t('logout')}</button></div></nav>`;
  const bnav = `<nav class="bnav" aria-label="Main">${[['overview','🏠','nHome'],['chat','💬','nChat'],['input','➕','nInput'],['bills','⏰','nBills'],['analysis','📊','nAnalysis']].map(([k, ic, lb]) => `<a href="#/${k}" ${k === name ? 'aria-current="page"' : ''}><span class="ic">${ic}</span>${t(lb)}${badge(k)}</a>`).join('')}</nav>`;
  const top = `<header class="top"><a class="logo mlogo" href="#/overview">${mark}MONET</a><h1>${title}</h1><span class="proto hide-m">${t('prototype')}</span><span class="sp"></span>${langSwitch()}
    <div class="rel"><button class="iconbtn" data-a="notifs" aria-label="${t('notifs')}">🔔${unseen ? '<span class="dot"></span>' : ''}</button>
    <div class="pop" id="pop-n"><h3 style="font-size:.95rem;margin-bottom:8px">${t('notifs')}</h3>${n.length ? `<div class="list">${n.map(x => `<a class="li" href="${x.href}" data-a="close-pop"><span class="ico">${x.ic}</span><span class="mid" style="white-space:normal;font-size:.84rem">${esc(x.text)}</span></a>`).join('')}</div>` : `<p class="empty">${t('noNotifs')}</p>`}</div></div>
    <div class="rel mmenu"><button class="iconbtn" data-a="menu" aria-label="Menu">☰</button><div class="pop" id="pop-m" style="width:230px"><div class="list">${NAV.map(([k, ic, lb]) => `<a class="li" href="#/${k}" data-a="close-pop"><span class="ico">${ic}</span><span class="mid"><b>${t(lb)}</b></span></a>`).join('')}<button class="li" data-a="logout"><span class="ico">↩</span><span class="mid"><b>${t('logout')}</b></span></button></div></div></div></header>`;
  return `<div class="shell">${side}<div class="main">${top}${body}</div></div>${bnav}`;
}

/* ---------- overview ---------- */
function pageOverview(){
  const now = new Date(); if (V.ovPrev === undefined) V.ovPrev = now.getDate() < 5;
  let y = now.getFullYear(), m = now.getMonth(); if (V.ovPrev) [y, m] = prevYM(y, m);
  const [py, pm] = prevYM(y, m);
  const c = monthTotals(y, m), p = monthTotals(py, pm), bills = billsSorted().slice(0, 4), recent = liveTx().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const pend = S.pending.filter(x => x.open);
  const {rows, total} = catGroups(c.cats);
  const accts = {}; monthTx(y, m).filter(x => x.type === 'expense').forEach(x => accts[x.account] = (accts[x.account] || 0) + x.amount);
  const amax = Math.max(1, ...Object.values(accts));
  const stat = (lb, col, v, chg, href) => `<a class="card stat" href="${href}"><div class="lb"><i style="background:${col}"></i>${lb}</div><div class="v">${v}</div>${chg}</a>`;
  return `<main class="page">
    <div class="ph"><div><h2>${t('hi', {n:esc(S.user.name)})} 👋 <em>${fmtMonth(y, m)}</em></h2><p>${V.ovPrev ? t('ovSubPrev') : t('ovSub')}</p></div>
      <div class="row"><div class="tabs"><button aria-selected="${!V.ovPrev}" data-a="ov-period" data-v="0">${t('thisMonthT')}</button><button aria-selected="${V.ovPrev}" data-a="ov-period" data-v="1">${t('lastMonthT')}</button></div><a class="btn dark hide-m" href="#/input">➕ ${t('nInput')}</a></div></div>
    <div class="grid g4">
      ${stat(t('income'), 'var(--green)', rp(c.inc), chgHtml(c.inc, p.inc, true), '#/transactions?type=income')}
      ${stat(t('spending'), 'var(--violet)', rp(c.exp), chgHtml(c.exp, p.exp, false), '#/transactions?type=expense')}
      ${stat(t('saved'), 'var(--gold-c)', rp(c.saved), chgHtml(c.saved, p.saved, true), '#/analysis')}
      ${stat(t('rate'), 'var(--sky)', Math.round(c.rate * 100) + '%', `<div class="chg flat">${Math.round(p.rate * 100)}% ${LANG === 'id' ? 'bulan lalu' : 'last month'}</div>`, '#/analysis')}
    </div>
    ${pend.length ? `<div class="card mt" style="border-color:#F4C7C1"><div class="row" style="justify-content:space-between"><div><b>🤝 ${t('needsYou')} (${pend.length})</b><div class="small ink2">${pend.map(x => esc(x.item.desc) + ' · ' + rp(x.item.amount)).join(' · ')}</div></div><a class="btn dark sm" href="#/chat">${t('answerInChat')} →</a></div></div>` : ''}
    <div class="grid g21 mt">
      <div class="card"><div class="hd"><h3>${t('cashflow')} <span class="muted small">· ${t('last6')}</span></h3><a href="#/analysis">${t('nAnalysis')} →</a></div>${cashflowChart(y, m, 6)}</div>
      <div class="card"><div class="hd"><h3>${t('upcoming')}</h3><a href="#/bills">${t('seeAll')} →</a></div>
        ${bills.length ? `<div class="list">${bills.map(b => { const st = billStatus(b); return `<a class="li" href="#/bills"><span class="sd ${st.dot}" aria-hidden="true"></span><span class="mid"><b>${esc(b.name)}</b><span>${fmtDate(b.due, {weekday:'short', day:'numeric', month:'short'})}</span></span><span style="text-align:right"><span class="amt" style="display:block">${b.est ? '~' : ''}${rpShort(b.amount)}</span><span class="tag ${st.tag}">${dueText(st.d)}</span></span></a>`; }).join('')}</div>` : `<p class="empty">${t('noBills')}</p>`}
      </div>
    </div>
    <div class="grid g21 mt">
      <div class="card"><div class="hd"><h3>${t('recent')}</h3><a href="#/transactions">${t('seeAll')} →</a></div>${recent.length ? `<div class="list">${recent.map(txRow).join('')}</div>` : `<p class="empty">${t('noTx')}</p>`}</div>
      <div class="grid" style="align-content:start">
        <div class="card dark"><h3>💬 ${t('chatTitle')}</h3><p class="muted small mt8">${t('quickEx')}</p><form data-f="quick" class="mt" style="display:flex;gap:8px"><input class="in" id="qk" placeholder="${t('askMonet')}" style="background:#fff;color:var(--ink)"><button class="btn green sm" aria-label="${t('send')}">→</button></form></div>
        <div class="card"><div class="hd"><h3>${t('topCats')}</h3><a href="#/analysis">${t('seeAll')} →</a></div>
          ${rows.length ? rows.map(r => `<div style="margin-bottom:12px"><div class="row" style="justify-content:space-between;font-size:.85rem"><span>${r.ic} ${r.name}</span><b>${rpShort(r.v)}</b></div><div class="bar mt8"><i style="width:${r.v / total * 100}%;background:${r.col}"></i></div></div>`).join('') : `<p class="empty">${t('noData')}</p>`}</div>
        <div class="card"><div class="hd"><h3>${t('byAccount')}</h3><span class="small muted">${t('thisMonth')}</span></div>
          ${Object.entries(accts).sort((a, b) => b[1] - a[1]).map(([a, v]) => `<div style="margin-bottom:10px"><div class="row" style="justify-content:space-between;font-size:.85rem"><span>${esc(a)}</span><b>${rpShort(v)}</b></div><div class="bar mt8"><i style="width:${v / amax * 100}%;background:var(--ink2)"></i></div></div>`).join('') || `<p class="empty">${t('noData')}</p>`}</div>
      </div>
    </div></main>`;
}

/* ---------- chat ---------- */
function chatMsgHtml(m){
  if (m.role === 'sys' && !V.behind) return '';
  if (m.role === 'me') return `<div class="bub me">${esc(m.body)}</div>`;
  if (m.role === 'sys') return `<div class="bub sys">${esc(m.body)}</div>`;
  if (m.role === 'mem') return `<div class="bub mem">${esc(m.body)}</div>`;
  return `<div class="row" style="align-items:flex-end;gap:8px;flex-wrap:nowrap"><span class="av monet" aria-hidden="true">${mark}</span><div class="bub bot">${m.body}${m.qr ? `<div class="qr ${m.done ? 'done' : ''}">${m.qr.map(q => `<button data-a="qr" data-m="${m.id}" data-v="${esc(q.act)}">${esc(q.label)}</button>`).join('')}</div>` : ''}</div></div>`;
}
function pageChat(){
  if (!S.chat.length){ S.chat.push({id:uid(), role:'bot', body:`<p>${t('welcome', {n:esc(S.user.name)})}</p>`, time:Date.now()}); persist(); }
  return `<div class="chatwrap"><div class="chatlog" id="log" aria-live="polite">${S.chat.map(chatMsgHtml).join('')}</div>
    <div class="composer"><div class="suggest">${['sug1', 'sug2', 'sug3', 'sug4', 'sug5'].map(k => `<button data-a="sug" data-v="${k}">${t(k)}</button>`).join('')}</div>
    <form data-f="chat"><textarea id="msg" rows="1" placeholder="${t('typeMsg')}" aria-label="${t('typeMsg')}"></textarea><a class="iconbtn" href="#/input?tab=receipt" title="${t('attach')}" aria-label="${t('attach')}">📎</a><button class="btn dark">${t('send')}</button></form>
    <div class="chatbar mt8"><button class="tg" role="switch" aria-checked="${V.behind}" data-a="behind" aria-label="${t('behind')}"></button>${t('behind')} <span class="muted" style="font-weight:500">· 🎯 📒 📊 ⏰</span></div></div></div>`;
}
let busy = false;
async function sendChat(text){
  if (busy || !text.trim()) return; busy = true;
  await monetHandle(text.trim(), typing => {
    const log = $('#log'); if (!log) return;
    log.innerHTML = S.chat.map(chatMsgHtml).join('') + (typing ? `<div class="row" style="gap:8px"><span class="av monet">${mark}</span><div class="bub bot"><span class="typing"><i></i><i></i><i></i></span></div></div>` : '');
    log.scrollTop = log.scrollHeight;
  });
  busy = false; if (route().name === 'chat') render(); else toast('💬 Monet ' + (LANG === 'id' ? 'membalas' : 'replied'));
}

/* ---------- input ---------- */
const RECEIPT = {merchant:'Indomaret Fatmawati', total:87500, items:[['Aqua 1.5L', 7500], ['Roti tawar', 18500], ['Indomie goreng ×5', 16500], ['Telur 1 kg', 29000], ['Teh botol ×2', 16000]]};
function previewTable(items){
  return `<table class="ptable"><thead><tr><th>${t('desc')}</th><th>${t('type')}</th><th>${t('account')}</th><th>${t('category')}</th><th style="text-align:right">${t('amount')}</th><th></th></tr></thead><tbody>${items.map((it, i) => {
    const iss = issuesOf(it);
    return `<tr><td><input class="in" style="padding:7px 10px;min-width:110px" value="${esc(it.desc)}" data-pi="${i}" data-k="desc"></td>
      <td><select class="in" style="padding:7px 10px" data-pi="${i}" data-k="type">${typeOptions(it.type)}</select></td>
      <td><select class="in" style="padding:7px 10px" data-pi="${i}" data-k="account">${acctOptions(it.account && activeAccounts().some(a => a.name === it.account) ? it.account : '', true)}</select>${it.account && !activeAccounts().some(a => a.name === it.account) ? `<div class="small muted">"${esc(it.account)}"?</div>` : ''}</td>
      <td><select class="in" style="padding:7px 10px" data-pi="${i}" data-k="cat">${catOptions(it.cat, it.type)}</select></td>
      <td class="n"><input class="in" style="padding:7px 10px;width:120px;text-align:right" inputmode="numeric" value="${it.amount}" data-pi="${i}" data-k="amount">
        ${iss.includes('amount') ? `<div><span class="tag urgent">${t('needAmt')}</span></div>` : ''}${iss.includes('dup') ? `<div><span class="tag soon">${t('dupWarn')}</span></div>` : ''}</td>
      <td><button class="link" data-a="pi-del" data-v="${i}" aria-label="${t('del')}">✕</button></td></tr>`; }).join('')}</tbody></table>`;
}
function pageInput(){
  const q = route().q; if (q.get('tab')){ V.inTab = q.get('tab'); history.replaceState(null, '', '#/input'); }
  const tabs = [['text', '⌨️', 'tText'], ['form', '📝', 'tForm'], ['receipt', '🧾', 'tReceipt'], ['paste', '📋', 'tPaste']];
  const now = new Date(), localNow = iso(now);
  let body = '';
  if (V.inTab === 'text' || V.inTab === 'paste'){
    const isP = V.inTab === 'paste';
    body = `<form data-f="parse"><label class="f" for="pt">${isP ? t('pasteLabel') : t('textLabel')}</label><textarea class="in" id="pt" placeholder="${isP ? t('pasteEx') : t('quickEx')}" rows="4"></textarea>
      ${V.inErr ? `<div class="err">${V.inErr}</div>` : ''}<div class="row mt"><button class="btn dark">🔍 ${t('read')}</button><span class="small muted">📒 Bookkeeper</span></div></form>
      ${V.inItems && V.inItems.length ? `<div class="mt"><h3 class="mb">${t('preview')}</h3><div style="overflow-x:auto">${previewTable(V.inItems)}</div><button class="btn dark mt" data-a="pi-save">${t('saveAll', {n:V.inItems.length})}</button></div>` : ''}`;
  }
  if (V.inTab === 'form') body = `<form data-f="manual" class="fg fg2">
    <div><label class="f">${t('type')}</label><select class="in" id="mf-type" data-a="mf-type">${typeOptions('expense')}</select></div>
    <div><label class="f">${t('date')}</label><input class="in" id="mf-date" type="datetime-local" value="${localNow}" max="${localNow}"></div>
    <div><label class="f">${t('amount')}</label><input class="in" id="mf-amt" inputmode="numeric" placeholder="35000" required></div>
    <div><label class="f">${t('account')}</label><select class="in" id="mf-acct" required>${acctOptions('', true)}</select></div>
    <div><label class="f">${t('category')}</label><select class="in" id="mf-cat">${catOptions('food', 'expense')}</select></div>
    <div><label class="f">${t('desc')}</label><input class="in" id="mf-desc" placeholder="Lunch"></div>
    ${V.inErr ? `<div class="err">${V.inErr}</div>` : ''}<div><button class="btn dark">${t('save')}</button></div></form>`;
  if (V.inTab === 'receipt'){
    const R = V.receipt;
    if (!R) body = `<label class="drop" for="rf"><div style="font-size:2rem">🧾</div><b>${t('dropTitle')}</b><div class="small muted mt8">${t('dropSub')}</div></label><input type="file" id="rf" accept="image/*" class="sr" data-a="receipt-file">`;
    else if (R.reading) body = `<div class="drop" style="cursor:default"><span class="typing"><i></i><i></i><i></i></span><p class="mt8">${t('reading')}</p></div>`;
    else body = `<div class="grid g2"><div>${R.url ? `<img src="${R.url}" alt="" style="width:100%;max-height:320px;object-fit:contain;border-radius:16px;background:var(--bg)">` : ''}</div><div>
      <h3>${t('receiptFound')}</h3><table class="ctable mt8"><tr><td><b>${esc(RECEIPT.merchant)}</b></td><td class="n muted">${fmtDate(now, {day:'numeric', month:'short', year:'numeric'})}</td></tr>${RECEIPT.items.map(([n, v]) => `<tr><td class="ink2">${esc(n)}</td><td class="n">${rp(v)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td class="n"><b>${rp(RECEIPT.total)}</b></td></tr></table>
      <form data-f="receipt" class="mt"><label class="f" for="r-acct">🤝 ${t('whichAcct')}</label><select class="in" id="r-acct" required>${acctOptions('', true)}</select>
      <label class="f mt8" for="r-cat">${t('category')}</label><select class="in" id="r-cat">${catOptions('food', 'expense')}</select>${V.inErr ? `<div class="err">${V.inErr}</div>` : ''}
      <div class="row mt"><button class="btn dark">${t('save')}</button><button type="button" class="btn ghost" data-a="receipt-reset">${t('cancel')}</button></div></form></div></div>`;
  }
  return `<main class="page"><div class="ph"><div><h2>${t('inTitle')}. <em>${LANG === 'id' ? 'Dengan cara apa saja.' : 'Any way you like.'}</em></h2><p>${t('inSub')}</p></div></div>
    <div class="grid g21"><div class="card"><div class="tabs mb" role="tablist">${tabs.map(([k, ic, lb]) => `<button role="tab" aria-selected="${V.inTab === k}" data-a="in-tab" data-v="${k}">${ic} ${t(lb)}</button>`).join('')}</div>${body}</div>
    <div class="grid" style="align-content:start">
      <div class="card"><h3>⚡ ${t('otherWays')}</h3><p class="small ink2 mt8">${t('otherWaysSub')}</p><div class="list mt">
        <a class="li" href="#/settings"><span class="ico">🟢</span><span class="mid"><b>${t('wayWa')}</b><span>${S.auto.waLinked ? '✓ ' + t('linked') : t('waOff')}</span></span></a>
        <a class="li" href="#/settings"><span class="ico">📧</span><span class="mid"><b>${t('wayEmail')}</b><span>${esc(S.user.forward)}</span></span></a>
        <a class="li" href="#/chat"><span class="ico">💬</span><span class="mid"><b>${t('chatTitle')}</b><span>${t('sug1')}</span></span></a></div>
        <a class="btn ghost sm mt" href="#/settings">${t('setUp')} →</a></div>
      <div class="card"><h3>${t('justAdded')}</h3>${V.recentAdded.length ? `<div class="list mt8">${V.recentAdded.map(id => S.txns.find(x => x.id === id)).filter(x => x && !x.deleted).map(txRow).join('')}</div>` : `<p class="empty">—</p>`}</div>
    </div></div></main>`;
}
function readPreview(){
  document.querySelectorAll('[data-pi]').forEach(el => { const it = V.inItems[+el.dataset.pi], k = el.dataset.k; if (!it) return;
    if (k === 'amount'){ const v = parseInt(String(el.value).replace(/\D/g, ''), 10) || 0; if (v !== it.amount) it.ambiguous = false; it.amount = v; }
    else if (k === 'account'){ if (el.value){ it.account = el.value; it.acctKnown = true; } }
    else it[k] = el.value; });
}
function parsePaste(text){
  const items = parseText(text.replace(/\n/g, ' '));
  if (!items.length) return items;
  const it = items[0];
  if (/(debit|pembayaran|payment|purchase|pembelian|transaksi)/i.test(text)) it.type = 'expense';
  if (/(kredit|credit\b|masuk|received|diterima|transfer masuk)/i.test(text) && !/kartu kredit|credit card/i.test(text)) it.type = 'income';
  const mer = text.match(/\b(?:di|at|ke|to|merchant:?)\s+([A-Z0-9][A-Z0-9 .&'-]{2,30})/);
  if (mer){ const name = mer[1].trim().replace(/\s+(PADA|ON|TGL)\b.*$/i, ''); it.desc = name.charAt(0) + name.slice(1).toLowerCase(); it.cat = findCat(name, it.type); }
  const dm = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (dm){ const d = new Date(); d.setMonth(+dm[2] - 1, +dm[1]); if (d <= new Date()) it.date = iso(d); }
  return [it];
}

/* ---------- transactions ---------- */
function txFiltered(){
  const q = V.txQ.toLowerCase();
  return liveTx().filter(x => (V.txType === 'all' || x.type === V.txType) && (!V.txAcct || x.account === V.txAcct) && (!V.txCat || x.cat === V.txCat) && (!V.txMonth || x.date.slice(0, 7) === V.txMonth) &&
    (!q || (x.desc + ' ' + x.account + ' ' + catName(x.cat) + ' ' + x.amount).toLowerCase().includes(q))).sort((a, b) => b.date.localeCompare(a.date));
}
function txListHtml(){
  const list = txFiltered().slice(0, 300); if (!list.length) return `<p class="empty">${t('noTx')}</p>`;
  let h = '', day = '';
  for (const x of list){ const d = x.date.slice(0, 10); if (d !== day){ day = d; h += `<div class="dhead">${dayLabel(x.date)}</div>`; } h += txRow(x); }
  return h;
}
function pageTransactions(){
  const q = route().q; if (q.get('type')){ V.txType = q.get('type'); V.txMonth = dateOnly(new Date()).slice(0, 7); history.replaceState(null, '', '#/transactions'); }
  const months = [...new Set(liveTx().map(x => x.date.slice(0, 7)))].sort().reverse();
  const list = txFiltered(), tt = totals(list);
  return `<main class="page"><div class="ph"><div><h2>${t('nTxns')}. <em>${t('nTx', {n:list.length})}</em></h2><p>${t('txSub')}</p></div><div class="row"><button class="btn ghost" data-a="export-csv">⬇ ${t('export')}</button><a class="btn dark" href="#/input">➕ ${t('nInput')}</a></div></div>
    <div class="card"><div class="row mb">
      <input class="in" type="search" placeholder="🔍 ${t('search')}" value="${esc(V.txQ)}" data-in="txQ" style="flex:1 1 220px;width:auto">
      <div class="tabs">${[['all', 'all'], ['expense', 'expense'], ['income', 'incomeT'], ['transfer', 'transfer']].map(([v, k]) => `<button aria-selected="${V.txType === v}" data-a="tx-type" data-v="${v}">${t(k)}</button>`).join('')}</div>
      <select class="in" style="width:auto" data-in="txAcct"><option value="">${t('allAccts')}</option>${S.accounts.map(a => `<option ${V.txAcct === a.name ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
      <select class="in" style="width:auto" data-in="txCat"><option value="">${t('allCats')}</option>${Object.keys(CATS).map(k => `<option value="${k}" ${V.txCat === k ? 'selected' : ''}>${CATS[k].ic} ${catName(k)}</option>`).join('')}</select>
      <select class="in" style="width:auto" data-in="txMonth"><option value="">${t('all')}</option>${months.map(mo => `<option value="${mo}" ${V.txMonth === mo ? 'selected' : ''}>${fmtMonth(+mo.slice(0, 4), +mo.slice(5) - 1)}</option>`).join('')}</select></div>
      <div class="row small ink2" style="gap:18px"><span>${t('income')}: <b class="amt inc">${rp(tt.inc)}</b></span><span>${t('spending')}: <b>${rp(tt.exp)}</b></span></div>
      <div class="list mt8" id="txlist">${txListHtml()}</div></div></main>`;
}
function editTxPanel(x){
  openPanel(`<div class="phd"><h3>${t('editTx')}</h3><button class="iconbtn" data-a="close" aria-label="${t('cancel')}">✕</button></div>
  <form data-f="edit-tx" data-id="${x.id}" class="fg">
    <div><label class="f">${t('desc')}</label><input class="in" id="et-desc" value="${esc(x.desc)}"></div>
    <div class="fg fg2"><div><label class="f">${t('amount')}</label><input class="in" id="et-amt" inputmode="numeric" value="${x.amount}"></div>
    <div><label class="f">${t('type')}</label><select class="in" id="et-type" data-a="et-type">${typeOptions(x.type)}</select></div></div>
    <div class="fg fg2"><div><label class="f">${t('account')}</label><select class="in" id="et-acct">${acctOptions(x.account)}${activeAccounts().some(a => a.name === x.account) ? '' : `<option selected>${esc(x.account)}</option>`}</select></div>
    <div><label class="f">${t('category')}</label><select class="in" id="et-cat">${catOptions(x.cat, x.type)}</select></div></div>
    <div><label class="f">${t('date')}</label><input class="in" id="et-date" type="datetime-local" value="${x.date}"></div>
    <p class="small muted">${t('source')}: ${srcLabel(x.source)}</p>
    <div class="row"><button class="btn dark">${t('save')}</button><button type="button" class="btn danger" data-a="del-tx" data-id="${x.id}">${t('del')}</button></div></form>`);
}

/* ---------- bills ---------- */
function pageBills(){
  const list = billsSorted(), groups = {red:[], yellow:[], green:[]};
  list.forEach(b => groups[billStatus(b).dot].push(b));
  const sum = l => l.reduce((a, b) => a + (b.amount || 0), 0), in30 = list.filter(b => billStatus(b).d <= 30);
  const sumCard = (dot, lb, l, sub) => `<div class="card"><div class="row" style="gap:8px"><span class="sd ${dot}"></span><b>${lb}</b></div><div class="v" style="font-size:1.5rem;font-weight:750;letter-spacing:-.03em;margin-top:6px">${l.length}</div><div class="small ink2">${rp(sum(l))} · ${sub}</div></div>`;
  const recLabel = b => b.rec === 'monthly' ? everyN(b.dueDay) : t(b.rec);
  return `<main class="page"><div class="ph"><div><h2>${t('nBills')}. <em>${LANG === 'id' ? 'Tidak ada yang terlewat.' : 'Nothing slips by.'}</em></h2><p>${t('biSub')}</p></div><button class="btn dark" data-a="bill-new">➕ ${t('addBill')}</button></div>
    <div class="grid g4">${sumCard('red', t('urgent'), groups.red, '≤3 ' + (LANG === 'id' ? 'hari' : 'days'))}${sumCard('yellow', t('soon'), groups.yellow, '4–7 ' + (LANG === 'id' ? 'hari' : 'days'))}${sumCard('green', t('later'), groups.green, '8+ ' + (LANG === 'id' ? 'hari' : 'days'))}
      <div class="card dark"><b>${t('totalDue')}</b><div style="font-size:1.5rem;font-weight:750;letter-spacing:-.03em;margin-top:6px">${rpShort(sum(in30))}</div><div class="small muted">${in30.length} ${LANG === 'id' ? 'tagihan' : 'bills'}</div></div></div>
    ${S.suggested.length ? `<div class="card mt" style="border-style:dashed"><div class="hd"><div><h3>💡 ${t('suggested')}</h3><p class="small ink2">${t('suggestedSub')}</p></div></div><div class="list">${S.suggested.map(s => `<div class="li"><span class="ico">📧</span><span class="mid"><b>${esc(s.name)} · ${rp(s.amount)}</b><span>${everyN(s.dueDay)} · ${esc(s.from)}</span></span><button class="btn dark sm" data-a="sg-add" data-id="${s.id}">${t('addIt')}</button><button class="btn ghost sm" data-a="sg-dis" data-id="${s.id}">${t('dismiss')}</button></div>`).join('')}</div></div>` : ''}
    <div class="grid g21 mt"><div class="card"><div class="hd"><h3>${t('upcoming')}</h3><span class="small muted">${list.length}</span></div>
      ${list.length ? `<div class="list">${list.map(b => { const st = billStatus(b), c = CATS[b.cat] || CATS.bills; return `<div class="li"><span class="sd ${st.dot}" aria-hidden="true"></span><button class="mid" style="text-align:left" data-a="bill-edit" data-id="${b.id}"><b>${c.ic} ${esc(b.name)}</b><span>${recLabel(b)} · ${fmtDate(b.due, {weekday:'short', day:'numeric', month:'short'})}</span></button>
        <span style="text-align:right"><span class="amt" style="display:block">${b.est ? '~' : ''}${rp(b.amount)}</span><span class="tag ${st.tag}">${st.key === 'overdue' ? t('overdue') + ' · ' : ''}${dueText(st.d)}</span></span><button class="btn ghost sm" data-a="bill-paid" data-id="${b.id}">✓<span class="hide-m">&nbsp;${t('markPaid')}</span></button></div>`; }).join('')}</div>` : `<p class="empty">${t('noBills')}</p>`}</div>
      <div class="grid" style="align-content:start"><div class="card"><h3>⏰ ${t('rRemind')}</h3><p class="small ink2 mt8">${t('rRemindS')}</p><div class="chips mt">${S.auto.remind.map(d => `<span class="tag">${d === 0 ? t('dOn') : d === 1 ? t('d1Before') : t('dBefore', {n:d})}</span>`).join('')}<span class="tag">🕗 ${S.auto.time}</span><span class="tag">${S.auto.channel === 'whatsapp' ? '🟢 WhatsApp' : '💻 ' + t('web')}</span></div><a class="btn ghost sm mt" href="#/settings">${t('nSettings')} →</a></div>
      <div class="card"><h3>${t('paidHistory')}</h3>${S.paidLog.length ? `<div class="list mt8">${S.paidLog.slice(0, 6).map(p => `<div class="li"><span class="ico">✅</span><span class="mid"><b>${esc(p.bill)}</b><span>${fmtDate(p.date)}</span></span><span class="amt">${rp(p.amount)}</span></div>`).join('')}</div>` : `<p class="empty">—</p>`}</div></div></div></main>`;
}
function billModal(b){
  const isNew = !b; b = b || {name:'', amount:'', est:false, cat:'bills', rec:'monthly', dueDay:new Date().getDate(), due:dateOnly(new Date()), remind:S.auto.remind.slice()};
  openModal(`<div class="phd"><h3>${isNew ? t('addBill') : t('editBill')}</h3><button class="iconbtn" data-a="close" aria-label="${t('cancel')}">✕</button></div>
  <form data-f="bill" data-id="${isNew ? '' : b.id}" class="fg">
    <div><label class="f">${t('billName')}</label><input class="in" id="b-name" value="${esc(b.name)}" placeholder="PLN electricity" required></div>
    <div class="fg fg2"><div><label class="f">${t('amount')}</label><input class="in" id="b-amt" inputmode="numeric" value="${b.amount}" required></div>
    <div><label class="f">${t('category')}</label><select class="in" id="b-cat">${catOptions(b.cat, 'expense')}</select></div></div>
    <label class="check"><input type="checkbox" id="b-est" ${b.est ? 'checked' : ''}><span>${t('estimate')}</span></label>
    <div class="fg fg2"><div><label class="f">${t('repeat')}</label><select class="in" id="b-rec">${['monthly', 'weekly', 'yearly', 'once'].map(r => `<option value="${r}" ${b.rec === r ? 'selected' : ''}>${t(r)}</option>`).join('')}</select></div>
    <div><label class="f">${t('due')}</label><input class="in" id="b-due" type="date" value="${b.due}" required></div></div>
    <div><label class="f">${t('remindDays')}</label><div class="chips">${[7, 3, 1, 0].map(d => `<button type="button" class="chip" data-a="b-rem" data-v="${d}" aria-pressed="${b.remind.includes(d)}">${d === 0 ? t('dOn') : d === 1 ? t('d1Before') : t('dBefore', {n:d})}</button>`).join('')}</div></div>
    <div class="row"><button class="btn dark">${t('save')}</button>${isNew ? '' : `<button type="button" class="btn danger" data-a="bill-del" data-id="${b.id}">${t('removeBill')}</button>`}</div></form>`);
}
function paidModal(b){
  openModal(`<div class="phd"><h3>✓ ${esc(b.name)}</h3><button class="iconbtn" data-a="close" aria-label="${t('cancel')}">✕</button></div>
  <p class="ink2">${b.est ? '~' : ''}${rp(b.amount)} · ${t('due')} ${fmtDate(b.due, {weekday:'short', day:'numeric', month:'short'})}</p>
  <form data-f="paid" data-id="${b.id}" class="fg mt"><label class="check"><input type="checkbox" id="p-log" checked><span>${t('logPayment')}</span></label>
  <div><label class="f">${t('account')}</label><select class="in" id="p-acct">${acctOptions('BCA')}</select></div>
  <div><button class="btn dark">${t('markPaid')}</button></div></form>`);
}

/* ---------- analysis ---------- */
function pageAnalysis(){
  const now = new Date(); if (V.anY === null){ V.anY = now.getFullYear(); V.anM = now.getMonth(); if (now.getDate() < 5) [V.anY, V.anM] = prevYM(V.anY, V.anM); }
  const y = V.anY, m = V.anM, [py, pm] = prevYM(y, m), c = monthTotals(y, m), p = monthTotals(py, pm), list = monthTx(y, m);
  const isCur = y === now.getFullYear() && m === now.getMonth(), days = isCur ? now.getDate() : new Date(y, m + 1, 0).getDate();
  const big = list.filter(x => x.type === 'expense').sort((a, b) => b.amount - a.amount)[0];
  const tips = analystTips(y, m), ideas = investIdeas();
  const first = liveTx().map(x => x.date).sort()[0], archive = [];
  for (let i = 1; i <= 6; i++){ const [ay, am] = prevYM(now.getFullYear(), now.getMonth(), i); if (first && new Date(ay, am + 1, 0) >= new Date(first)) archive.push([ay, am]); }
  const stat = (lb, col, v, chg) => `<div class="card"><div class="stat"><div class="lb"><i style="background:${col}"></i>${lb}</div><div class="v">${v}</div>${chg}</div></div>`;
  const P = S.prefs;
  const invest = ideas ? `<div class="list">${ideas.map(x => `<div class="li"><span class="mid"><b>${esc(x.name)}</b><div class="bar mt8"><i style="width:${x.pct}%;background:var(--green)"></i></div></span><span style="text-align:right"><span class="amt" style="display:block">${rpShort(x.amt)}</span><span class="small muted">${x.pct}%</span></span></div>`).join('')}</div>
    <p class="small ink2 mt8">${t('goal')}: <b>${esc(P.goal)}</b> · ${t('horizon')}: <b>${esc(P.horizon)}</b> · ${t('risk')}: <b>${t(P.risk)}</b> · ${t('monthlyAmt')}: <b>${rp(P.monthly)}</b></p><button class="link mt8" data-a="inv-edit">✎ ${t('setPrefs')}</button>`
    : `<p class="ink2 small">${t('noPrefs')}</p><button class="btn dark sm mt" data-a="inv-edit">${t('setPrefs')}</button>`;
  return `<main class="page"><div class="ph"><div><h2>${t('nAnalysis')}. <em>${LANG === 'id' ? 'Kondisi keuanganmu yang sebenarnya.' : 'Your real financial picture.'}</em></h2><p>${t('anSub')}</p></div>
    <div class="row"><button class="iconbtn" data-a="an-prev" aria-label="‹">‹</button><b style="min-width:150px;text-align:center">${fmtMonth(y, m)}</b><button class="iconbtn" data-a="an-next" aria-label="›" ${isCur ? 'disabled style="opacity:.4"' : ''}>›</button></div></div>
    <div class="grid g4">${stat(t('income'), 'var(--green)', rp(c.inc), chgHtml(c.inc, p.inc, true))}${stat(t('spending'), 'var(--violet)', rp(c.exp), chgHtml(c.exp, p.exp, false))}${stat(t('saved'), 'var(--gold-c)', rp(c.saved), chgHtml(c.saved, p.saved, true))}${stat(t('rate'), 'var(--sky)', Math.round(c.rate * 100) + '%', `<div class="chg flat">${Math.round(p.rate * 100)}% ${LANG === 'id' ? 'bulan lalu' : 'last month'}</div>`)}</div>
    <div class="grid g2 mt"><div class="card"><div class="hd"><h3>${t('byCat')}</h3><span class="small muted">${fmtMonth(y, m)}</span></div>${donutChart(c.cats)}</div>
      <div class="card"><div class="hd"><h3>${t('cashflow')}</h3><span class="small muted">${t('last6')}</span></div>${cashflowChart(y, m, 6)}</div></div>
    <div class="grid g2 mt"><div class="card"><div class="hd"><h3>📊 ${t('tips')}</h3></div>${tips.length ? `<div class="list">${tips.map(x => `<div class="li" style="align-items:flex-start"><span class="mid" style="font-size:.9rem">${x}</span></div>`).join('')}</div>` : `<p class="empty">${t('noData')}</p>`}
        <div class="grid g3 mt"><div><div class="small muted">${t('dailyAvg')}</div><b>${rpShort(c.exp / days)}</b></div><div><div class="small muted">${t('biggest')}</div><b>${big ? rpShort(big.amount) : '—'}</b>${big ? `<div class="small muted">${esc(big.desc)}</div>` : ''}</div><div><div class="small muted">${t('txCount')}</div><b>${list.length}</b></div></div></div>
      <div class="card"><div class="hd"><div><h3>🌱 ${t('invest')}</h3><p class="small ink2">${t('investSub')}</p></div></div>${invest}<p class="disc mt">${t('disclaimer')}</p></div></div>
    <div class="card mt"><div class="hd"><h3>🗂️ ${t('archive')}</h3></div>${archive.length ? `<div class="list">${archive.map(([ay, am]) => { const tt = monthTotals(ay, am); return `<button class="li" data-a="an-open" data-v="${ay}-${am}"><span class="ico">📄</span><span class="mid"><b>${fmtMonth(ay, am)}</b><span>${t('income')} ${rpShort(tt.inc)} · ${t('spending')} ${rpShort(tt.exp)} · ${t('saved')} ${Math.round(tt.rate * 100)}%</span></span><span class="link">${t('open')} →</span></button>`; }).join('')}</div>` : `<p class="empty">—</p>`}</div></main>`;
}
function investModal(){
  const P = S.prefs, L = LANG === 'id' ? 1 : 0;
  openModal(`<div class="phd"><h3>🌱 ${t('setPrefs')}</h3><button class="iconbtn" data-a="close" aria-label="${t('cancel')}">✕</button></div>
  <form data-f="invest" class="fg">
    <div><label class="f">${t('goal')}</label><select class="in" id="iv-goal">${INV_Q[0].opts.map(o => `<option ${P.goal === o[L] ? 'selected' : ''}>${o[L]}</option>`).join('')}</select></div>
    <div><label class="f">${t('horizon')}</label><select class="in" id="iv-hz">${INV_Q[1].opts.map(o => `<option ${P.horizon === o[L] ? 'selected' : ''}>${o[L]}</option>`).join('')}</select></div>
    <div><label class="f">${t('risk')}</label><select class="in" id="iv-risk">${['conservative', 'moderate', 'aggressive'].map(r => `<option value="${r}" ${P.risk === r ? 'selected' : ''}>${t(r)}</option>`).join('')}</select></div>
    <div><label class="f">${t('monthlyAmt')}</label><input class="in" id="iv-amt" inputmode="numeric" value="${P.monthly || 1000000}"></div>
    <p class="disc">${t('disclaimer')}</p><div><button class="btn dark">${t('saveInvest')}</button></div></form>`);
}

/* ---------- settings ---------- */
function toggle(key, on, disabled){ return `<button class="tg" role="switch" aria-checked="${on}" data-a="tg" data-v="${key}" ${disabled ? 'disabled' : ''}></button>`; }
function setRow(title, sub, ctrl){ return `<div class="set"><div class="tx"><b>${title}</b><span>${sub}</span></div>${ctrl}</div>`; }
function pageSettings(){
  const A = S.auto;
  return `<main class="page"><div class="ph"><div><h2>${t('nSettings')}. <em>${LANG === 'id' ? 'Atur sekali, lalu biarkan.' : 'Set it once, then forget it.'}</em></h2><p>${t('stSub')}</p></div></div>
  <div class="grid" style="grid-template-columns:200px 1fr;align-items:start" id="stgrid">
    <nav class="snav">${[['s-auto', '⚡ ' + t('sAuto')], ['s-rules', '🤖 ' + t('sRules')], ['s-prof', '👤 ' + t('sProfile')], ['s-acct', '🏦 ' + t('sAccounts')], ['s-mem', '🧠 ' + t('sMemory')], ['s-data', '🔒 ' + t('sData')]].map(([id, l]) => `<a href="#/settings" data-a="jump" data-v="${id}">${l}</a>`).join('')}</nav>
    <div class="grid">
      <section class="card" id="s-auto"><div class="hd"><div><h3>⚡ ${t('sAuto')} · ${t('sChannels')}</h3></div></div>
        <div class="set"><span class="ico" style="font-size:1.4rem">🟢</span><div class="tx"><b>${t('waTitle')}</b><span>${A.waLinked ? t('waOn', {p:esc(S.user.wa || '+62 812-****-4821')}) : t('waOff')}</span>${A.waLinked ? '' : `<div class="mt8"><span class="code">LINK 482913</span></div>`}</div>${A.waLinked ? `<button class="btn ghost sm" data-a="wa-unlink">${t('unlink')}</button>` : `<button class="btn dark sm" data-a="wa-link">${t('simulateLink')}</button>`}</div>
        <div class="set" style="align-items:flex-start"><span class="ico" style="font-size:1.4rem">📧</span><div class="tx"><b>${t('fwTitle')}</b><span>${t('fwSub')}</span>
          <div class="copy mt8"><input class="in" readonly value="${esc(S.user.forward)}" aria-label="${t('fwTitle')}"><button class="btn ghost sm" data-a="copy-fw">${t('copy')}</button><button class="btn ghost sm" data-a="regen-fw">${t('regen')}</button></div>
          <div class="mt"><b class="small">${t('senders')}</b><div class="small muted">${t('sendersSub')}</div>${A.senders.map((s, i) => `<div class="set" style="padding:10px 0"><div class="tx"><span style="font-family:ui-monospace,Consolas,monospace;color:var(--ink)">${esc(s.addr)}</span></div>${toggle('sender:' + i, s.on)}</div>`).join('') || '<p class="small muted mt8">—</p>'}</div></div></div>
        <div class="set"><span class="ico" style="font-size:1.4rem">🧾</span><div class="tx"><b>${t('rcTitle')}</b><span>${t('rcSub')}</span></div><a class="btn ghost sm" href="#/input?tab=receipt">${t('tReceipt')} →</a></div>
        <div class="set"><span class="ico" style="font-size:1.4rem">📥</span><div class="tx"><b>${t('inboxTitle')}</b><span>${t('inboxSub')}</span></div><span class="tag">${t('soonTag')}</span></div></section>
      <section class="card" id="s-rules"><div class="hd"><h3>🤖 ${t('sRules')}</h3></div>
        ${setRow('🤝 ' + t('rAsk'), t('rAskS'), toggle('ask', true, true))}
        ${setRow('🔁 ' + t('rDup'), t('rDupS'), toggle('dup', A.dup))}
        ${setRow('⏰ ' + t('rAutoMatch'), t('rAutoMatchS'), toggle('autoMatch', A.autoMatch))}
        ${setRow('📊 ' + t('rMonthly'), t('rMonthlyS'), toggle('monthly', A.monthly))}
        ${setRow('🌙 ' + t('rDaily'), t('rDailyS'), toggle('daily', A.daily))}
        ${setRow('📧 ' + t('rEmailSum'), t('rEmailSumS'), toggle('emailSum', A.emailSum))}
        <div class="set" style="flex-wrap:wrap"><div class="tx" style="flex-basis:220px"><b>⏰ ${t('rRemind')}</b><span>${t('rRemindS')}</span></div><div class="chips">${[7, 3, 1, 0].map(d => `<button class="chip" data-a="rem" data-v="${d}" aria-pressed="${A.remind.includes(d)}">${d === 0 ? t('dOn') : d === 1 ? t('d1Before') : t('dBefore', {n:d})}</button>`).join('')}</div></div>
        <div class="set"><div class="tx"><b>🕗 ${t('rTime')}</b></div><select class="in" style="width:auto" data-in="time">${['07:00', '08:00', '09:00', '12:00', '19:00'].map(x => `<option ${A.time === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
        <div class="set"><div class="tx"><b>📣 ${t('rChannel')}</b></div><select class="in" style="width:auto" data-in="channel"><option value="whatsapp" ${A.channel === 'whatsapp' ? 'selected' : ''} ${A.waLinked ? '' : 'disabled'}>WhatsApp</option><option value="web" ${A.channel === 'web' ? 'selected' : ''}>${t('web')}</option></select></div></section>
      <section class="card" id="s-prof"><div class="hd"><h3>👤 ${t('sProfile')}</h3></div><div class="fg fg2">
        <div><label class="f">${t('name')}</label><input class="in" value="${esc(S.user.name)}" data-in="uname"></div>
        <div><label class="f">${t('email')}</label><input class="in" value="${esc(S.user.email)}" readonly></div>
        <div><label class="f">${t('language')}</label><div class="chips"><button class="chip" data-a="lang" data-v="en" aria-pressed="${LANG === 'en'}">English</button><button class="chip" data-a="lang" data-v="id" aria-pressed="${LANG === 'id'}">Bahasa Indonesia</button></div></div>
        <div><label class="f">${t('tz')}</label><select class="in" data-in="tz">${[['Asia/Jakarta', 'WIB · Jakarta'], ['Asia/Makassar', 'WITA · Makassar'], ['Asia/Jayapura', 'WIT · Jayapura']].map(([v, l]) => `<option value="${v}" ${S.user.tz === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div></section>
      <section class="card" id="s-acct"><div class="hd"><div><h3>🏦 ${t('sAccounts')}</h3><p class="small ink2">${t('noCreds')}</p></div></div>
        <div class="list">${S.accounts.map(a => `<div class="li"><span class="ico">${{bank:'🏦', ewallet:'📱', cash:'💵', credit_card:'💳', other:'👛'}[a.type]}</span><span class="mid"><b>${esc(a.name)}</b><span>${t(a.type === 'other' ? 'otherT' : a.type)}${a.archived ? ' · ' + t('archived') : ''}</span></span><button class="btn ghost sm" data-a="acct-rename" data-id="${a.id}">${t('rename')}</button><button class="btn ghost sm" data-a="acct-arch" data-id="${a.id}">${a.archived ? t('restore') : t('archiveA')}</button></div>`).join('')}</div>
        <form data-f="acct-add" class="row mt"><input class="in" id="na-name" placeholder="${t('acctName')}" style="flex:1 1 160px;width:auto" required><select class="in" id="na-type" style="width:auto">${['bank', 'ewallet', 'cash', 'credit_card', 'other'].map(x => `<option value="${x}">${t(x === 'other' ? 'otherT' : x)}</option>`).join('')}</select><button class="btn dark sm">➕ ${t('addAcct')}</button></form></section>
      <section class="card" id="s-mem"><div class="hd"><div><h3>🧠 ${t('sMemory')}</h3><p class="small ink2">${t('memSub')}</p></div></div>
        ${S.memory.length ? `<div class="list">${S.memory.map(x => `<div class="li"><span class="ico">🧠</span><span class="mid"><b style="white-space:normal">${esc(LANG === 'id' ? x.id_ : x.en)}</b><span>${fmtDate(x.date, {day:'numeric', month:'short', year:'numeric'})}</span></span><button class="btn ghost sm" data-a="mem-del" data-id="${x.id}">${t('del')}</button></div>`).join('')}</div>` : `<p class="empty">${t('noMem')}</p>`}</section>
      <section class="card" id="s-data"><div class="hd"><h3>🔒 ${t('sData')}</h3></div>
        ${setRow(t('exportData'), t('exportS'), `<button class="btn ghost sm" data-a="export-all">⬇ ${t('export').replace('CSV', '')}</button>`)}
        ${setRow(t('resetDemo'), t('resetS'), `<button class="btn ghost sm" data-a="reset">${t('resetDemo')}</button>`)}
        ${setRow(t('delAcct'), t('delAcctS'), `<button class="btn danger sm" data-a="del-acct">${t('delAcct')}</button>`)}</section>
    </div></div></main>`;
}

/* ---------- render ---------- */
function render(){
  document.documentElement.lang = LANG;
  const r = route();
  if (!session()){ document.title = 'Monet · ' + t('loginTitle'); root.innerHTML = pageLogin(); return; }
  if (!S.user.onboarded){ root.innerHTML = pageOnboarding(); return; }
  const name = ROUTES.includes(r.name) ? r.name : 'overview';
  const titles = {overview:t('nOverview'), chat:t('chatTitle'), input:t('nInput'), transactions:t('nTxns'), bills:t('nBills'), analysis:t('nAnalysis'), settings:t('nSettings')};
  const pages = {overview:pageOverview, chat:pageChat, input:pageInput, transactions:pageTransactions, bills:pageBills, analysis:pageAnalysis, settings:pageSettings};
  document.title = 'Monet · ' + titles[name];
  root.innerHTML = shell(name, titles[name], pages[name]());
  bindCharts();
  if (name === 'chat'){ const log = $('#log'); log.scrollTop = log.scrollHeight; }
  if (name === 'settings' && window.innerWidth <= 1000) $('#stgrid').style.gridTemplateColumns = '1fr';
}
window.addEventListener('hashchange', () => { closeAll(); render(); window.scrollTo(0, 0); });
window.addEventListener('resize', () => { const g = $('#stgrid'); if (g) g.style.gridTemplateColumns = window.innerWidth <= 1000 ? '1fr' : '200px 1fr'; });

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!e.target.closest('.rel')) document.querySelectorAll('.pop.on').forEach(p => p.classList.remove('on'));
  if (!el) return;
  const a = el.dataset.a, v = el.dataset.v, id = el.dataset.id;
  const find = (arr) => arr.find(x => x.id === id);
  switch (a){
    case 'lang': setLang(v); break;
    case 'google': V.login.email = 'rina@example.com'; loginAs('rina@example.com'); break;
    case 'login-back': V.login = {step:'email', email:V.login.email, err:''}; render(); break;
    case 'logout': session(null); V.login = {step:'email', email:'rina@example.com', err:''}; location.hash = ''; render(); break;
    case 'notifs': { const p = $('#pop-n'); p.classList.toggle('on'); S.seenNotifs = notifications().map(x => x.id); persist(); const d = $('.iconbtn .dot'); if (d) d.remove(); break; }
    case 'menu': $('#pop-m').classList.toggle('on'); break;
    case 'close-pop': document.querySelectorAll('.pop.on').forEach(p => p.classList.remove('on')); break;
    case 'close': closeAll(); break;
    // onboarding
    case 'ob-consent': V.obConsent = el.checked; render(); break;
    case 'ob-acct': V.obSel = V.obSel.includes(v) ? V.obSel.filter(x => x !== v) : V.obSel.concat(v); render(); break;
    case 'ob-wa': S.auto.waLinked = true; S.auto.channel = 'whatsapp'; S.user.wa = '+62 8**-****-****'; persist(); render(); break;
    case 'ob-next':
      if (V.ob === 1) S.user.name = V.obName.trim();
      if (V.ob === 2) S.accounts = V.obSel.map(n => { const o = OB_ACCTS.find(x => x[0] === n); return {id:uid(), name:n, type:o ? o[1] : 'other', archived:false}; });
      V.ob++; persist(); render(); break;
    case 'ob-finish':
      S.user.onboarded = true; S.chat = []; persist(); location.hash = '#/chat'; render();
      if (v) setTimeout(() => sendChat(t(v)), 300); break;
    // chat
    case 'qr': {
      const m = S.chat.find(x => x.id === el.dataset.m); if (!m || m.done || busy) break;
      if (v.startsWith('say|')){ m.done = true; sendChat(v.slice(4)); break; }
      handleAct(m, v); render(); break;
    }
    case 'sug': sendChat(t(v)); break;
    case 'behind': V.behind = !V.behind; render(); break;
    // input
    case 'in-tab': V.inTab = v; V.inItems = null; V.inErr = ''; render(); break;
    case 'pi-del': readPreview(); V.inItems.splice(+v, 1); render(); break;
    case 'pi-save': {
      readPreview();
      if (V.inItems.some(it => !it.account || !activeAccounts().some(x => x.name === it.account))){ V.inErr = t('needAcct'); toast('🤝 ' + t('needAcct')); render(); break; }
      if (V.inItems.some(it => !(it.amount > 0))){ toast('🤝 ' + t('needAmt')); break; }
      const src = V.inTab === 'paste' ? 'email' : 'manual';
      V.inItems.forEach(it => { const tx = saveTx(it, src); V.recentAdded.unshift(tx.id); });
      toast('📒 ' + t('savedN', {n:V.inItems.length})); V.inItems = null; V.inErr = ''; persist(); render(); break;
    }
    case 'receipt-reset': V.receipt = null; V.inErr = ''; render(); break;
    // transactions
    case 'tx-type': V.txType = v; render(); break;
    case 'ov-period': V.ovPrev = v === '1'; render(); break;
    case 'edit-tx': { const x = find(S.txns); if (x) editTxPanel(x); break; }
    case 'del-tx': { const x = find(S.txns); x.deleted = true; persist(); closeAll(); render(); toast(t('deleted'), () => { delete x.deleted; persist(); render(); }); break; }
    case 'export-csv': {
      const rows = [['date', 'type', 'account', 'to', 'category', 'description', 'amount_idr', 'source']].concat(txFiltered().map(x => [x.date, x.type, x.account, x.to || '', x.cat, x.desc, x.amount, x.source]));
      download('monet-transactions.csv', rows.map(r => r.map(c => /[",\n]/.test(String(c)) ? '"' + String(c).replace(/"/g, '""') + '"' : c).join(',')).join('\n'), 'text/csv'); toast(t('exportOk')); break;
    }
    // bills
    case 'bill-new': billModal(null); break;
    case 'bill-edit': billModal(find(S.bills)); break;
    case 'bill-paid': paidModal(find(S.bills)); break;
    case 'b-rem': el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') !== 'true'); break;
    case 'bill-del': { const b = find(S.bills); b.active = false; persist(); closeAll(); render(); toast(t('deleted').replace(t('nTxns').toLowerCase(), b.name), () => { b.active = true; persist(); render(); }); break; }
    case 'sg-add': { const s = find(S.suggested); S.bills.push({id:uid(), name:s.name, cat:s.cat, amount:s.amount, est:s.est, rec:'monthly', dueDay:s.dueDay, due:nextDue(s.dueDay, today0()), remind:S.auto.remind.slice(), active:true}); S.suggested = S.suggested.filter(x => x !== s); persist(); render(); toast('⏰ ' + s.name + ' ✓'); break; }
    case 'sg-dis': S.suggested = S.suggested.filter(x => x.id !== id); persist(); render(); break;
    // analysis
    case 'an-prev': [V.anY, V.anM] = prevYM(V.anY, V.anM); render(); break;
    case 'an-next': { const d = new Date(V.anY, V.anM + 1, 1); V.anY = d.getFullYear(); V.anM = d.getMonth(); render(); break; }
    case 'an-open': { const [ay, am] = v.split('-').map(Number); V.anY = ay; V.anM = am; render(); window.scrollTo(0, 0); break; }
    case 'inv-edit': investModal(); break;
    // settings
    case 'jump': e.preventDefault(); document.getElementById(v).scrollIntoView({behavior:'smooth', block:'start'}); break;
    case 'tg': {
      if (v.startsWith('sender:')) { const s = S.auto.senders[+v.slice(7)]; s.on = !s.on; }
      else S.auto[v] = !S.auto[v];
      el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'); persist(); toast(t('savedOk')); break;
    }
    case 'rem': { const d = +v; S.auto.remind = S.auto.remind.includes(d) ? S.auto.remind.filter(x => x !== d) : S.auto.remind.concat(d).sort((a, b) => b - a); persist(); render(); break; }
    case 'wa-unlink': S.auto.waLinked = false; S.auto.channel = 'web'; persist(); render(); toast(t('savedOk')); break;
    case 'wa-link': S.auto.waLinked = true; S.user.wa = S.user.wa || '+62 8**-****-****'; persist(); render(); toast('🟢 ' + t('linked')); break;
    case 'copy-fw': try { navigator.clipboard.writeText(S.user.forward); } catch (err) {} toast(t('copied')); break;
    case 'regen-fw': S.user.forward = 'u-' + uid().slice(0, 5) + '@in.monet.app'; persist(); render(); toast(t('regenOk')); break;
    case 'acct-arch': { const ac = find(S.accounts); ac.archived = !ac.archived; persist(); render(); break; }
    case 'acct-rename': { const ac = find(S.accounts); openModal(`<div class="phd"><h3>${t('rename')}</h3><button class="iconbtn" data-a="close">✕</button></div><form data-f="rename" data-id="${ac.id}" class="fg"><input class="in" id="rn" value="${esc(ac.name)}" required><div><button class="btn dark">${t('save')}</button></div></form>`); break; }
    case 'mem-del': S.memory = S.memory.filter(x => x.id !== id); persist(); render(); toast(t('deleted').split(' ')[0] + ' ✓'); break;
    case 'export-all': {
      download('monet-data.json', JSON.stringify({user:S.user, accounts:S.accounts, transactions:liveTx(), bills:S.bills, preferences:S.prefs, memory:S.memory}, null, 2), 'application/json');
      const rows = [['date', 'type', 'account', 'category', 'description', 'amount_idr', 'source']].concat(liveTx().map(x => [x.date, x.type, x.account, x.cat, '"' + x.desc.replace(/"/g, '""') + '"', x.amount, x.source]));
      setTimeout(() => download('monet-transactions.csv', rows.map(r => r.join(',')).join('\n'), 'text/csv'), 300); toast(t('exportOk')); break;
    }
    case 'reset': S = seed(); session('rina@example.com'); persist(); V.recentAdded = []; render(); toast(t('resetOk')); break;
    case 'del-acct': openModal(`<div class="phd"><h3>${t('delAcct')}</h3><button class="iconbtn" data-a="close">✕</button></div><p class="ink2">${t('delAcctS')}</p><form data-f="del-acct" class="fg mt"><label class="f" for="dl">${t('typeDelete')}</label><input class="in" id="dl" autocomplete="off"><div><button class="btn danger">${t('delAcct')}</button></div></form>`); break;
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.a === 'receipt-file' && el.files[0]){
    V.receipt = {reading:true, url:URL.createObjectURL(el.files[0])}; render();
    setTimeout(() => { V.receipt.reading = false; render(); }, 1400);
  }
  if (el.dataset.a === 'mf-type'){ $('#mf-cat').innerHTML = catOptions(el.value === 'income' ? 'salary' : el.value === 'transfer' ? 'transfer' : 'food', el.value); }
  if (el.dataset.a === 'et-type'){ $('#et-cat').innerHTML = catOptions(el.value === 'income' ? 'salary' : el.value === 'transfer' ? 'transfer' : 'others', el.value); }
  if (el.dataset.pi !== undefined && el.dataset.k === 'type'){ readPreview(); const it = V.inItems[+el.dataset.pi]; it.cat = findCat(it.desc, it.type); render(); }
  const k = el.dataset.in; if (!k) return;
  if (k === 'txAcct' || k === 'txCat' || k === 'txMonth'){ V[k] = el.value; render(); }
  if (k === 'time' || k === 'channel'){ S.auto[k] = el.value; persist(); toast(t('savedOk')); }
  if (k === 'tz'){ S.user.tz = el.value; persist(); toast(t('savedOk')); }
  if (k === 'uname'){ S.user.name = el.value.trim() || S.user.name; persist(); toast(t('savedOk')); }
});
document.addEventListener('input', e => {
  const k = e.target.dataset.in;
  if (k === 'txQ'){ V.txQ = e.target.value; $('#txlist').innerHTML = txListHtml(); }
  if (k === 'obName'){ V.obName = e.target.value; const b = $('[data-a="ob-next"]'); if (b) b.disabled = !(V.obConsent && V.obName.trim()); }
  if (e.target.id === 'msg'){ e.target.style.height = 'auto'; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px'; }
});
document.addEventListener('keydown', e => {
  if (e.target.id === 'msg' && e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); e.target.form.requestSubmit(); }
});
document.addEventListener('submit', e => {
  const f = e.target.dataset.f; if (!f) return; e.preventDefault();
  const val = id => ($('#' + id) || {}).value || '';
  const num = s => parseInt(String(s).replace(/\D/g, ''), 10) || 0;
  switch (f){
    case 'login-email': { const em = val('em').trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ V.login.err = t('badEmail'); render(); break; } V.login = {step:'code', email:em, err:''}; render(); $('#cd').focus(); break; }
    case 'login-code': if (val('cd').trim() !== '123456'){ V.login.err = t('wrongCode'); render(); break; } V.ob = 1; V.obSel = []; V.obName = ''; V.obConsent = false; loginAs(V.login.email); break;
    case 'ob-other': { const n = val('obo').trim(); if (n && !OB_ACCTS.some(x => x[0] === n)){ OB_ACCTS.push([n, 'other']); V.obSel.push(n); } render(); break; }
    case 'quick': { const tx = val('qk'); if (!tx.trim()) break; location.hash = '#/chat'; setTimeout(() => sendChat(tx), 50); break; }
    case 'chat': { const m = $('#msg'); const tx = m.value; m.value = ''; sendChat(tx); break; }
    case 'parse': {
      const tx = val('pt'); V.inErr = '';
      const items = V.inTab === 'paste' ? parsePaste(tx) : parseText(tx);
      if (!items.length){ V.inErr = t('nothingFound'); V.inItems = null; render(); $('#pt').value = tx; break; }
      V.inItems = items; render(); $('#pt').value = tx; break;
    }
    case 'manual': {
      const amt = num(val('mf-amt')), acct = val('mf-acct');
      if (!amt){ V.inErr = t('needAmt'); render(); break; } if (!acct){ V.inErr = t('needAcct'); render(); break; }
      const type = val('mf-type'), tx = saveTx({type, account:acct, cat:val('mf-cat'), desc:val('mf-desc').trim() || catName(val('mf-cat')), amount:amt, date:val('mf-date') || iso(new Date())}, 'manual');
      V.recentAdded.unshift(tx.id); V.inErr = ''; persist(); render(); toast('📒 ' + t('savedN', {n:1})); break;
    }
    case 'receipt': {
      const acct = val('r-acct'); if (!acct){ V.inErr = t('needAcct'); render(); break; }
      const tx = saveTx({type:'expense', account:acct, cat:val('r-cat'), desc:RECEIPT.merchant, amount:RECEIPT.total, date:iso(new Date())}, 'receipt');
      V.recentAdded.unshift(tx.id); V.receipt = null; V.inErr = ''; persist(); render(); toast('🧾 ' + t('savedN', {n:1})); break;
    }
    case 'edit-tx': {
      const x = S.txns.find(y => y.id === e.target.dataset.id);
      Object.assign(x, {desc:val('et-desc').trim() || x.desc, amount:num(val('et-amt')) || x.amount, type:val('et-type'), account:val('et-acct'), cat:val('et-cat'), date:val('et-date') || x.date});
      persist(); closeAll(); render(); toast(t('savedOk')); break;
    }
    case 'bill': {
      const id = e.target.dataset.id, due = val('b-due'), rem = [...document.querySelectorAll('[data-a="b-rem"][aria-pressed="true"]')].map(b => +b.dataset.v);
      const data = {name:val('b-name').trim(), amount:num(val('b-amt')), est:$('#b-est').checked, cat:val('b-cat'), rec:val('b-rec'), due, dueDay:+due.slice(8, 10), remind:rem};
      if (!data.name || !data.amount || !due) break;
      if (id) Object.assign(S.bills.find(b => b.id === id), data); else S.bills.push(Object.assign({id:uid(), active:true}, data));
      persist(); closeAll(); render(); toast('⏰ ' + data.name + ' ✓'); break;
    }
    case 'paid': {
      const b = S.bills.find(x => x.id === e.target.dataset.id); markBillPaid(b, $('#p-log').checked, val('p-acct'));
      persist(); closeAll(); render(); toast('✅ ' + t('paidOk', {b:b.name, d:fmtDate(b.due)})); break;
    }
    case 'invest': {
      S.prefs = {goal:val('iv-goal'), horizon:val('iv-hz'), risk:val('iv-risk'), monthly:num(val('iv-amt'))};
      const before = S.chat.length; savePrefMemory(); S.chat.length = before; // memory entry only; no chat pill from this page
      persist(); closeAll(); render(); toast('🧠 ' + t('savedOk')); break;
    }
    case 'acct-add': { const n = val('na-name').trim(); if (!n || S.accounts.some(a => a.name.toLowerCase() === n.toLowerCase())) break; S.accounts.push({id:uid(), name:n, type:val('na-type'), archived:false}); persist(); render(); toast('🏦 ' + n + ' ✓'); break; }
    case 'rename': { const ac = S.accounts.find(x => x.id === e.target.dataset.id), n = val('rn').trim(); if (!n) break; S.txns.forEach(x => { if (x.account === ac.name) x.account = n; }); ac.name = n; persist(); closeAll(); render(); break; }
    case 'del-acct': if (val('dl') === 'DELETE'){ try { localStorage.removeItem(STORE); } catch (err) {} S = seed(); session(null); closeAll(); location.hash = ''; render(); } break;
  }
});

load();
document.documentElement.lang = LANG;
if (session() && S.user.email !== session()) session(S.user.email);
render();
