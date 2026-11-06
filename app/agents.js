/* Mock agent team. Real app: Claude API behind /api/chat (see docs/BSD.md §4).
   Here: rule-based Bookkeeper / Analyst / Reminder so the prototype works offline. */

/* ---------- Bookkeeper: text → transactions ---------- */
const ACCT_WORDS = {
  'BCA':['bca','klikbca','mybca'], 'Mandiri':['mandiri','livin'], 'BRI':['bri','brimo'], 'BNI':['bni'],
  'GoPay':['gopay','gojek pay','go-pay'], 'OVO':['ovo'], 'DANA':['dana'], 'ShopeePay':['shopeepay','spay'], 'Jenius':['jenius'],
  'Cash':['cash','tunai','cash.'], 'BCA credit card':['credit card','kartu kredit','cc bca','bca cc','cc'],
};
const CAT_WORDS = {
  food:['lunch','dinner','breakfast','makan','sarapan','coffee','kopi','food','snack','gofood','grabfood','warung','bakso','nasi','resto','cafe','starbucks','boba','groceries','sayur'],
  transport:['parking','parkir','grab','gojek','ojek','taxi','taksi','fuel','bensin','pertalite','toll','tol','krl','mrt','transjakarta','busway','train','kereta'],
  bills:['electricity','listrik','pln','internet','wifi','indihome','water','pdam','pulsa','phone bill','bpjs','rent','kos','sewa','token','insurance','asuransi'],
  shopping:['shopee','tokopedia','tokped','lazada','clothes','baju','shoes','sepatu','shopping','belanja','uniqlo','zara'],
  entertainment:['netflix','spotify','movie','cinema','bioskop','film','game','concert','konser','youtube'],
  health:['doctor','dokter','apotek','pharmacy','medicine','obat','clinic','klinik','hospital'],
  education:['course','kursus','book','buku','school','sekolah','tuition','udemy'],
  salary:['salary','gaji','payroll'],
  other_income:['freelance','bonus','refund','cashback','dividend','dividen','received','terima','dapat','sold','jual'],
};
const INCOME_RE = /\b(salary|gaji|income|bonus|received|terima|diterima|dapat|refund|cashback|freelance|dividen|dividend|sold|jual|masuk|kredit\s+rp)\b/i;
const TRANSFER_RE = /\b(transfer|tf|kirim|send|top ?up|isi saldo)\b/i;
const AMT_RE = /(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)\s*(k|rb|ribu|jt|juta|m|mio|million)?(?![a-z])/i;

function parseAmount(seg){
  const m = seg.match(AMT_RE); if (!m) return null;
  let num = m[1], suf = (m[2] || '').toLowerCase(), val;
  if (suf){
    val = parseFloat(num.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
    val *= {k:1e3, rb:1e3, ribu:1e3, jt:1e6, juta:1e6, m:1e6, mio:1e6, million:1e6}[suf];
  } else if (/^\d{1,3}([.,]\d{3})+$/.test(num)) val = parseInt(num.replace(/[.,]/g, ''), 10);
  else val = parseFloat(num.replace(',', '.'));
  if (!isFinite(val) || val <= 0) return null;
  return {amount:Math.round(val), raw:m[0], ambiguous:!suf && val < 1000};
}
function findAccount(seg){
  const s = ' ' + seg.toLowerCase() + ' ';
  // known user accounts first (incl. ones they added), longest names first
  const names = activeAccounts().map(a => a.name).sort((a, b) => b.length - a.length);
  for (const n of names){
    const words = [n.toLowerCase()].concat(ACCT_WORDS[n] || []);
    for (const w of words) if (new RegExp('[^a-z]' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^a-z]').test(s)) return {name:n, known:true};
  }
  for (const n in ACCT_WORDS) for (const w of ACCT_WORDS[n]) if (new RegExp('[^a-z]' + w + '[^a-z]').test(s)) return {name:n, known:false};
  const via = s.match(/\b(?:with|via|pakai|pake|dari|from|using)\s+([a-z][a-z0-9]+)/i);
  if (via && !CAT_WORDS.food.includes(via[1])) return {name:via[1].charAt(0).toUpperCase() + via[1].slice(1), known:false};
  return null;
}
function findCat(seg, type){
  const s = seg.toLowerCase();
  for (const c in CAT_WORDS) for (const w of CAT_WORDS[c]) if (s.includes(w)){
    if (type === 'income' && CATS[c].kind !== 'income') continue;
    if (type === 'expense' && CATS[c].kind === 'income') continue;
    return c;
  }
  return type === 'income' ? 'other_income' : type === 'transfer' ? 'transfer' : 'others';
}
function cleanDesc(seg, amt, acct){
  let d = seg;
  if (amt) d = d.replace(amt.raw, ' ');
  if (acct) for (const w of [acct.name].concat(ACCT_WORDS[acct.name] || [])) d = d.replace(new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'ig'), ' ');
  d = d.replace(/\b(with|via|pakai|pake|from|dari|into|ke|to|using|pay|paid|bayar|for|buat|untuk|di|at|on|rp\.?)\b/ig, ' ').replace(/[^\p{L}\p{N}\s&'-]/gu, ' ').replace(/\s+/g, ' ').trim();
  return d ? d.charAt(0).toUpperCase() + d.slice(1) : '';
}
function parseText(text, when){
  const segs = text.split(/\n|;|,(?!\d{3}\b)(?!\d\s*(?:jt|juta|m)\b)|\s+(?:and|dan|&|terus|lalu|plus)\s+/i).map(x => x.trim()).filter(Boolean);
  const items = [];
  for (const seg of segs){
    const amt = parseAmount(seg); if (!amt) continue;
    const type = TRANSFER_RE.test(seg) ? 'transfer' : INCOME_RE.test(seg) ? 'income' : 'expense';
    const acct = findAccount(seg);
    const cat = findCat(seg, type);
    const desc = cleanDesc(seg, amt, acct) || catName(cat);
    const it = {id:uid(), date:iso(when || new Date()), type, account:acct ? acct.name : null, acctKnown:!!(acct && acct.known), cat, desc, amount:amt.amount, ambiguous:amt.ambiguous};
    if (type === 'transfer'){ const to = seg.match(/\b(?:to|ke)\s+([A-Za-z][\w ]*)$/i); it.to = to ? to[1].trim() : ''; }
    items.push(it);
  }
  return items;
}
function issuesOf(it){
  const out = [];
  if (it.ambiguous) out.push('amount');
  if (!it.account) out.push('account');
  else if (!it.acctKnown && !activeAccounts().some(a => a.name.toLowerCase() === it.account.toLowerCase())) out.push('newacct');
  if (S.auto.dup && !out.length && findDup(it)) out.push('dup');
  return out;
}
function findDup(it){
  const t1 = new Date(it.date).getTime();
  return liveTx().find(x => x.amount === it.amount && x.account === it.account && Math.abs(new Date(x.date).getTime() - t1) <= 10 * 60e3);
}
function saveTx(it, source){
  const tx = {id:it.id || uid(), date:it.date, type:it.type, account:it.account, cat:it.cat, desc:it.desc, amount:it.amount, source:source || 'chat'};
  if (it.type === 'transfer') tx.to = it.to || '';
  S.txns.push(tx); return tx;
}
function billMatch(tx){
  if (!S.auto.autoMatch || tx.type !== 'expense') return null;
  return billsSorted().find(b => b.amount && Math.abs(tx.amount - b.amount) <= b.amount * .1 && Math.abs(daysUntil(b.due)) <= 7 &&
    (tx.cat === b.cat || tx.desc.toLowerCase().split(' ').some(w => w.length > 2 && b.name.toLowerCase().includes(w))));
}
function markBillPaid(b, logIt, account){
  S.paidLog.unshift({id:uid(), bill:b.name, amount:b.amount, date:dateOnly(new Date()), due:b.due});
  if (logIt) saveTx({type:'expense', account:account || 'BCA', cat:b.cat, desc:b.name, amount:b.amount, date:iso(new Date())}, 'manual');
  if (b.rec === 'once') b.active = false; else b.due = addPeriod(b);
}

/* ---------- Analyst ---------- */
function analystTips(y, m){
  const cur = monthTx(y, m), [py, pm] = prevYM(y, m), prev = monthTx(py, pm);
  const now = new Date(), isCur = y === now.getFullYear() && m === now.getMonth();
  const daysCur = isCur ? now.getDate() : new Date(y, m + 1, 0).getDate(), daysPrev = new Date(py, pm + 1, 0).getDate();
  const tc = totals(cur), tp = totals(prev), tips = [];
  let best = null;
  if (daysCur >= 7) for (const c in tc.cats){
    const a = tc.cats[c] / daysCur, b = (tp.cats[c] || 0) / daysPrev;
    if (b > 0 && tc.cats[c] > 100000){ const ch = (a - b) / b; if (!best || ch > best.ch) best = {c, ch}; }
  }
  const coffee = (l, d) => l.filter(x => /coffee|kopi/i.test(x.desc)).reduce((s, x) => s + x.amount, 0) / d;
  const cc = coffee(cur, daysCur), cp = coffee(prev, daysPrev);
  if (daysCur >= 7 && cp > 0 && cc > cp * 1.05){
    const pct = Math.round((cc - cp) / cp * 100), cut = Math.round(cc * 30 * .3 / 1000) * 1000;
    tips.push(LANG === 'id' ? `☕ Pengeluaran kopi naik ${pct}% dibanding bulan lalu. Kurangi 3 cangkir seminggu untuk hemat sekitar ${rpShort(cut)} per bulan.` : `☕ Coffee spending is up ${pct}% vs last month. Skipping 3 cups a week saves about ${rpShort(cut)} a month.`);
  }
  if (best && best.ch > .08 && !(best.c === 'food' && tips.length)){
    const pct = Math.round(best.ch * 100);
    tips.push(LANG === 'id' ? `📈 ${catName(best.c)} naik ${pct}% per hari dibanding bulan lalu. Coba tetapkan batas mingguan.` : `📈 ${catName(best.c)} is up ${pct}% per day vs last month. Try a weekly limit.`);
  }
  if (tc.inc && tc.rate < .2) tips.push(LANG === 'id' ? '🎯 Rasio tabunganmu di bawah 20%. Pindahkan dana ke tabungan tepat setelah gaji masuk.' : '🎯 Your savings rate is under 20%. Move money to savings right after salary arrives.');
  else if (tc.inc) tips.push(LANG === 'id' ? `✅ Kamu menabung ${Math.round(tc.rate * 100)}% dari pemasukan. Pertahankan, dan sisihkan dana darurat 3–6× pengeluaran bulanan.` : `✅ You saved ${Math.round(tc.rate * 100)}% of income. Keep it up, and build an emergency fund of 3–6× monthly spending.`);
  const early = billsSorted().filter(b => { const d = new Date(b.due).getDate(); return d < 25 && d > 5; }).length;
  if (early >= 2) tips.push(LANG === 'id' ? `🗓️ ${early} tagihan jatuh tempo sebelum gaji tanggal 25. Sisihkan dananya di awal bulan.` : `🗓️ ${early} bills fall due before your salary on the 25th. Set that money aside early in the month.`);
  return tips.slice(0, 3);
}
function investIdeas(){
  const p = S.prefs; if (!p.risk) return null;
  const ideas = {
    conservative:[['Reksa dana pasar uang','Money market fund'],['SBN ritel (ORI / SR)','Retail government bonds (ORI / SR)'],['Deposito','Time deposit']],
    moderate:[['Reksa dana pendapatan tetap','Fixed income fund'],['SBN ritel (ORI / SR)','Retail government bonds (ORI / SR)'],['Reksa dana campuran','Balanced fund']],
    aggressive:[['Reksa dana indeks saham','Equity index fund'],['Reksa dana saham','Equity fund'],['SBN ritel sebagai penyeimbang','Retail bonds as a buffer']],
  }[p.risk];
  const split = {conservative:[60,30,10], moderate:[40,35,25], aggressive:[50,30,20]}[p.risk];
  return ideas.map((x, i) => ({name:LANG === 'id' ? x[0] : x[1], pct:split[i], amt:Math.round((p.monthly || 0) * split[i] / 100)}));
}

/* ---------- Monet (manager) ---------- */
const msg = (role, body, extra) => Object.assign({id:uid(), role, body, time:Date.now()}, extra || {});
function botSay(body, qr){ S.chat.push(msg('bot', body, qr ? {qr} : null)); }
function sys(text){ S.chat.push(msg('sys', text)); }
function mem(text){ S.chat.push(msg('mem', '🧠 ' + (LANG === 'id' ? 'Memori diperbarui: ' : 'Memory update: ') + text)); }

function redBillsNote(){
  const today = dateOnly(new Date()); S.mentioned = S.mentioned || {};
  const red = billsSorted().filter(b => billStatus(b).d <= 3 && S.mentioned[b.id] !== today);
  if (!red.length) return '';
  sys('🎯 Monet → ⏰ Reminder: ' + (LANG === 'id' ? 'cek tagihan jatuh tempo' : 'check bills due soon'));
  sys('⏰ Reminder → 🎯 Monet: ' + red.map(b => b.name + ' (' + dueText(billStatus(b).d) + ')').join(', '));
  red.forEach(b => S.mentioned[b.id] = today);
  return '<p>⏰ ' + red.map(b => '🔴 <b>' + esc(b.name) + '</b> ' + rp(b.amount) + ' · ' + dueText(billStatus(b).d)).join('<br>⏰ ') + '</p>';
}
function txTable(list){ return '<table>' + list.map(x => `<tr><td>${CATS[x.cat].ic} ${esc(x.desc)} · ${esc(x.account || '?')}</td><td>${x.type === 'income' ? '+' : ''}${rp(x.amount)}</td></tr>`).join('') + '</table>'; }

function askNext(){
  const p = S.pending.find(x => x.open); if (!p) return false;
  const it = p.item, iss = p.issues[0];
  const label = `<b>${esc(it.desc)} · ${rp(it.amount)}</b>`;
  if (iss === 'amount') botSay(`<p>🤝 ${LANG === 'id' ? `Maksudmu <b>${rp(it.amount * 1000)}</b> untuk ${esc(it.desc)}?` : `Did you mean <b>${rp(it.amount * 1000)}</b> for ${esc(it.desc)}?`}</p>`,
    [{label:rp(it.amount * 1000), act:'amt|' + p.id + '|' + it.amount * 1000}, {label:rp(it.amount), act:'amt|' + p.id + '|' + it.amount}]);
  else if (iss === 'account') botSay(`<p>🤝 ${LANG === 'id' ? `Dari akun mana ${label}?` : `Which account was ${label} from?`}</p>`,
    activeAccounts().slice(0, 6).map(a => ({label:a.name, act:'acct|' + p.id + '|' + a.name})));
  else if (iss === 'newacct') botSay(`<p>🤝 ${LANG === 'id' ? `Aku tidak melihat <b>${esc(it.account)}</b> di akunmu. Tambahkan?` : `I don't see <b>${esc(it.account)}</b> in your accounts. Add it?`}</p>`,
    [{label:(LANG === 'id' ? 'Tambah ' : 'Add ') + it.account, act:'newacct|' + p.id}].concat(activeAccounts().slice(0, 3).map(a => ({label:(LANG === 'id' ? 'Itu ' : 'It was ') + a.name, act:'acct|' + p.id + '|' + a.name}))));
  else if (iss === 'dup') botSay(`<p>🤝 ${LANG === 'id' ? `Kamu sudah mencatat ${label} di ${esc(it.account)} beberapa menit lalu. Ini transaksi baru?` : `You logged ${label} on ${esc(it.account)} a few minutes ago. Is this a new one?`}</p>`,
    [{label:LANG === 'id' ? 'Baru' : 'New', act:'dup|' + p.id + '|new'}, {label:LANG === 'id' ? 'Sama' : 'Same one', act:'dup|' + p.id + '|same'}]);
  return true;
}
function finishPending(p){
  p.open = false;
  const tx = saveTx(p.item, p.source);
  botSay(`<p>📒 ${LANG === 'id' ? 'Tersimpan' : 'Saved'}:</p>` + txTable([tx]));
  mem('+1 ' + (LANG === 'id' ? 'transaksi' : 'transaction'));
  maybeBillMatch([tx]);
  askNext();
}
function maybeBillMatch(list){
  for (const tx of list){ const b = billMatch(tx); if (b){ botSay(`<p>⏰ ${LANG === 'id' ? `Apakah ini pembayaran <b>${esc(b.name)}</b>?` : `Is this the <b>${esc(b.name)}</b> bill?`}</p>`, [{label:LANG === 'id' ? 'Ya' : 'Yes', act:'bill|' + b.id + '|yes'}, {label:LANG === 'id' ? 'Bukan' : 'No', act:'bill|' + b.id + '|no'}]); return; } }
}

function handleAct(m, act){
  m.done = true;
  const [k, a, b] = act.split('|');
  const p = S.pending.find(x => x.id === a);
  if (k === 'go'){ location.hash = a; return; }
  S.chat.push(msg('me', m.qr.find(q => q.act === act).label));
  if (k === 'amt' && p){ p.item.amount = +b; p.item.ambiguous = false; p.issues.shift(); p.issues.length ? askNext() : finishPending(p); }
  else if (k === 'acct' && p){ p.item.account = b; p.item.acctKnown = true; p.issues = p.issues.filter(x => x !== 'account' && x !== 'newacct'); p.issues.length ? askNext() : finishPending(p); }
  else if (k === 'newacct' && p){
    S.accounts.push({id:uid(), name:p.item.account, type:'other', archived:false}); mem((LANG === 'id' ? 'akun baru ' : 'new account ') + p.item.account);
    p.item.acctKnown = true; p.issues = p.issues.filter(x => x !== 'newacct'); p.issues.length ? askNext() : finishPending(p);
  }
  else if (k === 'dup' && p){ if (b === 'new') finishPending(p); else { p.open = false; botSay(`<p>👍 ${LANG === 'id' ? 'Oke, tidak aku catat dua kali.' : "Got it, I won't log it twice."}</p>`); askNext(); } }
  else if (k === 'bill'){ const bill = S.bills.find(x => x.id === a); if (bill && b === 'yes'){ const due = bill.due; markBillPaid(bill, false); botSay(`<p>⏰ ✅ ${t('paidOk', {b:esc(bill.name), d:fmtDate(bill.due)})}</p>`); mem(bill.name + ' ' + (LANG === 'id' ? 'lunas ' : 'paid ') + fmtDate(due)); } else botSay(`<p>👍 ${LANG === 'id' ? 'Oke, tagihan tetap terbuka.' : 'OK, the bill stays open.'}</p>`); }
  else if (k === 'inv') investStep(b);
  persist();
}

/* investing preference questions (AFD §11) */
const INV_Q = [
  {key:'goal', q:['What is the goal?','Apa tujuannya?'], opts:[['Emergency fund','Dana darurat'],['House down payment','DP rumah'],['Retirement','Pensiun'],['Education','Pendidikan']]},
  {key:'horizon', q:['When do you need the money?','Kapan uangnya dibutuhkan?'], opts:[['Under 1 year','Di bawah 1 tahun'],['1–3 years','1–3 tahun'],['3–5 years','3–5 tahun'],['5+ years','5+ tahun']]},
  {key:'risk', q:['How much ups and downs can you accept?','Seberapa siap kamu dengan naik-turun nilai?'], opts:[['conservative'],['moderate'],['aggressive']]},
  {key:'monthly', q:['How much per month?','Berapa per bulan?'], opts:[[500000],[1000000],[2000000],[3000000]]},
];
function investAsk(i){
  const q = INV_Q[i], L = LANG === 'id' ? 1 : 0;
  const lab = o => q.key === 'risk' ? t(o[0]) : q.key === 'monthly' ? rpShort(o[0]) : o[L];
  botSay(`<p>📊 (${i + 1}/4) ${q.q[L]}</p>`, q.opts.map((o, j) => ({label:lab(o), act:'inv|_|' + i + ':' + j})));
}
function investStep(v){
  const [i, j] = v.split(':').map(Number), q = INV_Q[i], o = q.opts[j];
  S.prefs[q.key] = q.key === 'risk' || q.key === 'monthly' ? o[0] : o[LANG === 'id' ? 1 : 0];
  if (i < 3) return investAsk(i + 1);
  savePrefMemory(); investReply();
}
function savePrefMemory(){
  const p = S.prefs;
  S.memory = S.memory.filter(x => !x.key.startsWith('invest_'));
  S.memory.unshift({id:uid(), key:'invest_profile', en:`Investing: ${p.goal}, ${p.horizon}, ${t('risk').toLowerCase()} ${p.risk}, ${rp(p.monthly)}/month`, id_:`Investasi: ${p.goal}, ${p.horizon}, risiko ${p.risk}, ${rp(p.monthly)}/bulan`, date:dateOnly(new Date())});
  mem(LANG === 'id' ? 'preferensi investasi disimpan' : 'investing preferences saved');
}
function investReply(){
  const now = new Date(), [py, pm] = prevYM(now.getFullYear(), now.getMonth()), avg = monthTotals(py, pm).exp;
  sys('🎯 Monet → 📒 Bookkeeper: ' + (LANG === 'id' ? 'rata-rata pengeluaran bulanan' : 'average monthly spending'));
  sys('📒 Bookkeeper → 🎯 Monet: ' + rp(avg));
  sys('🎯 Monet → 📊 Analyst: ' + (LANG === 'id' ? 'rekomendasi investasi sesuai preferensi' : 'investing ideas for saved preferences'));
  const ideas = investIdeas();
  botSay(`<p>📊 ${LANG === 'id' ? `Untuk ${esc(S.prefs.goal)} (${esc(S.prefs.horizon)}), profil ${t(S.prefs.risk).toLowerCase()}, ${rp(S.prefs.monthly)} per bulan:` : `For ${esc(S.prefs.goal)} (${esc(S.prefs.horizon)}), ${t(S.prefs.risk).toLowerCase()} profile, ${rp(S.prefs.monthly)} a month:`}</p>` +
    '<table>' + ideas.map(x => `<tr><td>${esc(x.name)} · ${x.pct}%</td><td>${rp(x.amt)}</td></tr>`).join('') + '</table>' +
    `<p>💡 ${LANG === 'id' ? `Pastikan dana darurat ${rpShort(avg * 3)}–${rpShort(avg * 6)} (3–6× pengeluaran bulanan) sudah ada dulu.` : `First make sure you have an emergency fund of ${rpShort(avg * 3)}–${rpShort(avg * 6)} (3–6× monthly spending).`}</p>` +
    redBillsNote() + `<p class="disc">${t('disclaimer')}</p>`);
}

function reportReply(scope){
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  let list, title;
  if (scope === 'week'){ const from = new Date(today0().getTime() - 6 * DAY); list = liveTx().filter(x => new Date(x.date) >= from); title = LANG === 'id' ? '7 hari terakhir' : 'Last 7 days'; }
  else if (scope === 'today'){ list = liveTx().filter(x => x.date.slice(0, 10) === dateOnly(now)); title = t('today'); }
  else { list = monthTx(y, m); title = fmtMonth(y, m); }
  const tt = totals(list), [py, pm] = prevYM(y, m), tp = monthTotals(py, pm);
  const pend = S.pending.filter(p => p.open).length;
  sys('🎯 Monet → 📒 Bookkeeper: ' + (LANG === 'id' ? 'kirim transaksi ' : 'send transactions for ') + title.toLowerCase());
  sys('📒 Bookkeeper → 🎯 Monet: ' + t('nTx', {n:list.length}) + (pend ? ', ' + pend + (LANG === 'id' ? ' perlu konfirmasi' : ' need confirmation') : ''));
  sys('🎯 Monet → 📊 Analyst: ' + (LANG === 'id' ? 'buat laporan' : 'build a report'));
  const cats = Object.entries(tt.cats).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const tips = scope === 'month' ? analystTips(y, m) : [];
  sys('📊 Analyst → 🎯 Monet: ' + (LANG === 'id' ? 'angka + ' : 'figures + ') + tips.length + ' tips');
  const chg = tp.exp ? Math.round((tt.exp / now.getDate() * new Date(y, m + 1, 0).getDate() - tp.exp) / tp.exp * 100) : 0;
  let h = `<p><b>📒 ${esc(title)}</b> · ${t('nTx', {n:list.length})}</p><table>` +
    `<tr><td>${t('income')}</td><td>${rp(tt.inc)}</td></tr><tr><td>${t('spending')}</td><td>${rp(tt.exp)}</td></tr>` +
    (scope === 'month' ? `<tr><td>${t('saved')}</td><td>${rp(tt.saved)} (${Math.round(tt.rate * 100)}%)</td></tr>` : '') + '</table>' +
    `<p>📊 ${cats.map(([c, v]) => CATS[c].ic + ' ' + catName(c) + ' ' + Math.round(v / (tt.exp || 1) * 100) + '%').join(' · ')}</p>` +
    (scope === 'month' && tp.exp ? `<p class="small muted">${LANG === 'id' ? `Proyeksi pengeluaran ${chg >= 0 ? 'naik' : 'turun'} ${Math.abs(chg)}% vs bulan lalu.` : `Projected spending ${chg >= 0 ? 'up' : 'down'} ${Math.abs(chg)}% vs last month.`}</p>` : '') +
    tips.map(x => `<p>${x}</p>`).join('') + redBillsNote() +
    `<p>✅ ${tt.saved >= 0 ? (LANG === 'id' ? 'Kondisi aman. Detail lengkap ada di halaman Analisis.' : "You're on track. Full detail is on the Analysis page.") : (LANG === 'id' ? 'Pengeluaran lebih besar dari pemasukan. Cek kategori teratas di Analisis.' : 'Spending is above income. Check the top categories in Analysis.')}</p>`;
  botSay(h, [{label:t('nAnalysis') + ' →', act:'go|#/analysis'}]);
}

const BILL_ALIASES = {pln:['electricity','listrik','pln','token'], internet:['internet','wifi','indihome'], 'credit card':['credit card','kartu kredit','cc'], kos:['rent','kos','sewa'], netflix:['netflix'], bpjs:['bpjs'], telkomsel:['telkomsel','pulsa','phone']};
function findBill(text){
  const s = text.toLowerCase();
  for (const b of billsSorted()){
    const n = b.name.toLowerCase(); if (s.includes(n)) return b;
    for (const k in BILL_ALIASES) if (n.includes(k) && BILL_ALIASES[k].some(w => s.includes(w))) return b;
  }
  return null;
}

async function monetHandle(text, rerender){
  S.chat.push(msg('me', text)); persist(); rerender(true);
  await new Promise(r => setTimeout(r, 900));
  const s = text.toLowerCase().trim(), amt = parseAmount(text);

  // investing flow typed answers are handled via buttons; typed text restarts normal handling
  if (/\b(pay my|bayarin|bayarkan|tolong bayar|pay the bill for me)\b/.test(s)){
    botSay(`<p>🙏 ${LANG === 'id' ? 'Aku tidak bisa memindahkan uang, tapi sudah aku catat dan akan aku ingatkan.' : "I can't move money, but I've noted it and will remind you."}</p>` + redBillsNote());
  }
  else if (/^(paid|sudah bayar|udah bayar|sudah lunas|lunas|i paid|aku sudah bayar)\b/.test(s) && !amt){
    const b = findBill(s);
    sys('🎯 Monet → ⏰ Reminder: ' + (LANG === 'id' ? 'tandai lunas' : 'mark as paid') + ' "' + text + '"');
    if (b){ const due = b.due; markBillPaid(b, false); sys('⏰ Reminder → 🎯 Monet: ' + b.name + ' ✓'); botSay(`<p>⏰ ✅ ${t('paidOk', {b:esc(b.name), d:fmtDate(b.due)})}</p>`); mem(b.name + ' ' + (LANG === 'id' ? 'lunas ' : 'paid ') + fmtDate(due)); }
    else botSay(`<p>🤝 ${LANG === 'id' ? 'Tagihan mana yang sudah dibayar?' : 'Which bill did you pay?'}</p>`, billsSorted().slice(0, 4).map(x => ({label:x.name, act:'bill|' + x.id + '|yes'})));
  }
  else if (amt && /(due|jatuh tempo|every|tiap|setiap|each month|tiap bulan|bulanan|monthly)/.test(s) && /\b(\d{1,2})(st|nd|rd|th)?\b(?!\s*(k|rb|jt|m|ribu|juta)\b)/.test(s.replace(amt.raw.toLowerCase(), ''))){
    const day = +s.replace(amt.raw.toLowerCase(), '').match(/\b(\d{1,2})(st|nd|rd|th)?\b/)[1];
    const name = cleanDesc(text.replace(/(due|jatuh tempo|every|tiap|setiap|tanggal|each|month|bulan|around|sekitar|about|kira-kira|~|\d{1,2}(st|nd|rd|th)?\b)/ig, ' '), amt, null) || 'Bill';
    const b = {id:uid(), name, cat:findCat(s, 'expense') === 'others' ? 'bills' : findCat(s, 'expense'), amount:amt.amount, est:/(around|about|sekitar|kira|~)/.test(s), rec:'monthly', dueDay:Math.min(Math.max(day, 1), 31), remind:S.auto.remind.slice(), active:true};
    b.due = nextDue(b.dueDay, today0()); S.bills.push(b);
    sys('🎯 Monet → ⏰ Reminder: ' + (LANG === 'id' ? 'simpan tagihan berulang' : 'save recurring bill'));
    sys('⏰ Reminder → 🎯 Monet: ' + b.name + ', ' + everyN(b.dueDay));
    botSay(`<p>⏰ ${LANG === 'id' ? 'Ditambahkan' : 'Added'}: <b>${esc(b.name)}</b>, ${b.est ? '~' : ''}${rp(b.amount)}, ${everyN(b.dueDay)}. ${LANG === 'id' ? 'Aku akan mengingatkan 3 hari sebelumnya.' : "I'll remind you 3 days before."}</p><p class="small muted">${t('due')}: ${fmtDate(b.due, {weekday:'short', day:'numeric', month:'short'})}</p>`);
    mem((LANG === 'id' ? 'tagihan baru ' : 'new bill ') + b.name);
  }
  else if (/(invest|investasi|reksa dana|saham)/.test(s)){
    sys('🎯 Monet: ' + (LANG === 'id' ? 'cek preferensi investasi' : 'check investing preferences'));
    if (S.prefs.risk) investReply();
    else { botSay(`<p>📊 ${LANG === 'id' ? 'Boleh! Aku perlu 4 jawaban singkat dulu.' : 'Sure! I need 4 quick answers first.'}</p>`); investAsk(0); }
  }
  else if (!amt && /(report|laporan|summary|ringkasan|how much|berapa|spent|spend|pengeluaran|this week|minggu ini|today|hari ini|bulan ini|this month)/.test(s)){
    reportReply(/(week|minggu)/.test(s) ? 'week' : /(today|hari ini)/.test(s) ? 'today' : 'month');
  }
  else if (!amt && /(bill|tagihan|due|jatuh tempo)/.test(s)){
    sys('🎯 Monet → ⏰ Reminder: ' + (LANG === 'id' ? 'kirim tagihan aktif' : 'send active bills'));
    const list = billsSorted(); sys('⏰ Reminder → 🎯 Monet: ' + list.length + (LANG === 'id' ? ' tagihan' : ' bills'));
    botSay('<p>⏰ ' + (LANG === 'id' ? 'Tagihan aktifmu:' : 'Your active bills:') + '</p><table>' + list.map(b => { const st = billStatus(b); return `<tr><td>${{red:'🔴', yellow:'🟡', green:'🟢'}[st.dot]} ${esc(b.name)} · ${dueText(st.d)}</td><td>${b.est ? '~' : ''}${rp(b.amount)}</td></tr>`; }).join('') + '</table>', [{label:t('nBills') + ' →', act:'go|#/bills'}]);
  }
  else if (amt){
    const items = parseText(text);
    sys('🎯 Monet → 📒 Bookkeeper: ' + (LANG === 'id' ? 'catat transaksi ini' : 'record these transactions'));
    const saved = [];
    for (const it of items){
      const iss = issuesOf(it);
      if (iss.length) S.pending.push({id:uid(), item:it, issues:iss, open:true, source:'chat', created:Date.now()});
      else saved.push(saveTx(it, 'chat'));
    }
    sys('📒 Bookkeeper → 🎯 Monet: ' + saved.length + (LANG === 'id' ? ' tersimpan, ' : ' saved, ') + (items.length - saved.length) + (LANG === 'id' ? ' perlu konfirmasi' : ' need confirmation'));
    if (saved.length){
      const todaySpend = liveTx().filter(x => x.type === 'expense' && x.date.slice(0, 10) === dateOnly(new Date())).reduce((a, x) => a + x.amount, 0);
      const now = new Date(), [py, pm] = prevYM(now.getFullYear(), now.getMonth()), avg = monthTotals(py, pm).exp / new Date(py, pm + 1, 0).getDate();
      botSay(`<p>📒 ${LANG === 'id' ? `${saved.length} transaksi tercatat:` : `Logged ${saved.length} transaction${saved.length > 1 ? 's' : ''}:`}</p>` + txTable(saved) +
        `<p>📊 ${LANG === 'id' ? `Pengeluaran hari ini ${rp(todaySpend)} (rata-rata ${rp(avg)}/hari).` : `Spent today: ${rp(todaySpend)} (average ${rp(avg)}/day).`}</p>` + redBillsNote());
      mem('+' + saved.length + ' ' + (LANG === 'id' ? 'transaksi' : (saved.length > 1 ? 'transactions' : 'transaction')));
      maybeBillMatch(saved);
    }
    if (!askNext() && !saved.length) botSay(`<p>${t('nothingFound')}</p>`);
  }
  else if (/^(hi|hai|halo|hello|hey|pagi|siang|malam|good)/.test(s)){
    botSay(`<p>👋 ${LANG === 'id' ? 'Hai! Mau catat pengeluaran, lihat laporan, atau cek tagihan?' : 'Hi! Want to log spending, see a report, or check bills?'}</p>` + redBillsNote(),
      [{label:t('sug2'), act:'go|#/analysis'}, {label:t('nBills'), act:'go|#/bills'}]);
  }
  else botSay(`<p>🙂 ${LANG === 'id' ? 'Aku paling jago soal uangmu. Mau ringkasan minggu ini?' : "I'm best with your money. Want a summary of this week?"}</p>`, [{label:LANG === 'id' ? 'Ringkasan minggu ini' : "This week's summary", act:'say|' + (LANG === 'id' ? 'ringkasan minggu ini' : 'summary this week')}]);
  persist(); rerender(false);
}
