/* Demo data + local storage. Shape follows docs/DBD.md (simplified). */
const STORE = 'monet-proto-v2';
const DAY = 864e5;

function today0(){ const d = new Date(); d.setHours(0,0,0,0); return d; }
function iso(d){ const p = n => String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes()); }
function dateOnly(d){ return iso(d).slice(0,10); }
function uid(){ return Math.random().toString(36).slice(2,10); }
function daysUntil(dstr){ return Math.round((new Date(dstr+'T00:00') - today0()) / DAY); }

/* next date with the given day-of-month, on or after `from` */
function nextDue(day, from){
  const f = new Date(from); f.setHours(0,0,0,0);
  for (let i = 0; i < 3; i++){
    const y = f.getFullYear(), m = f.getMonth() + i;
    const last = new Date(y, m + 1, 0).getDate();
    const d = new Date(y, m, Math.min(day, last));
    if (d >= f) return dateOnly(d);
  }
}
function addPeriod(bill){
  const d = new Date(bill.due+'T00:00');
  if (bill.rec === 'weekly') d.setDate(d.getDate()+7);
  else if (bill.rec === 'yearly') d.setFullYear(d.getFullYear()+1);
  else { const nd = new Date(d.getFullYear(), d.getMonth()+1, 1); const last = new Date(nd.getFullYear(), nd.getMonth()+1, 0).getDate(); nd.setDate(Math.min(bill.dueDay || d.getDate(), last)); return dateOnly(nd); }
  return dateOnly(d);
}

function seed(){
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const t0 = today0(), txns = [];
  const add = (d, type, account, cat, desc, amount, source) => txns.push({id:uid(), date:iso(d), type, account, cat, desc, amount:Math.round(amount), source:source || pick(['chat','whatsapp','whatsapp','email','chat'])});
  const foods = [['Lunch','Makan siang'],['Coffee','Kopi'],['Dinner','Makan malam'],['Breakfast','Sarapan'],['GoFood','GoFood']];
  const start = new Date(t0.getFullYear(), t0.getMonth()-6, 1);
  for (let d = new Date(start); d <= t0; d = new Date(d.getTime() + DAY)){
    const dd = d.getDate(), last = d.getMonth() === t0.getMonth() && d.getFullYear() === t0.getFullYear();
    const at = (h, m) => { const x = new Date(d); x.setHours(h, m || 0); return x; };
    // food: 1–3 a day, coffee grows a bit in recent months
    const n = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++){ const f = pick(foods); const isCoffee = f[0] === 'Coffee'; add(at(8 + i * 5, 10), 'expense', pick(['GoPay','OVO','Cash','GoPay']), 'food', f[0], isCoffee ? 28000 + rnd() * (last ? 22000 : 12000) : 25000 + rnd() * 60000); }
    if (rnd() < .55) add(at(9, 5), 'expense', pick(['GoPay','Cash']), 'transport', pick(['Parking','Grab','Gojek','Fuel']), pick([5000, 18000, 24000, 50000]));
    if (rnd() < .07) add(at(20), 'expense', pick(['BCA','BCA credit card']), 'shopping', pick(['Tokopedia','Shopee','Uniqlo']), 150000 + rnd() * 450000, 'email');
    if (rnd() < .03) add(at(19), 'expense', 'OVO', 'entertainment', pick(['Cinema','Concert ticket']), 60000 + rnd() * 200000);
    if (rnd() < .02) add(at(17), 'expense', 'BCA', 'health', 'Pharmacy', 45000 + rnd() * 120000);
    if (dd === 25) add(at(9), 'income', 'BCA', 'salary', 'Salary', 12500000, 'email');
    if (dd === 12 && rnd() < .6) add(at(14), 'income', 'Mandiri', 'other_income', 'Freelance design', 1500000 + Math.round(rnd() * 4) * 500000, 'chat');
    if (!last || dd < t0.getDate()){
      if (dd === 20) add(at(10), 'expense', 'BCA', 'bills', 'PLN electricity', 420000 + rnd() * 60000, 'email');
      if (dd === 15) add(at(10), 'expense', 'BCA', 'bills', 'Internet IndiHome', 350000, 'email');
      if (dd === 10) add(at(10), 'expense', 'Mandiri', 'bills', 'BPJS Kesehatan', 150000, 'whatsapp');
      if (dd === 2) add(at(10), 'expense', 'BCA', 'bills', 'Kos rent', 2500000, 'chat');
    }
    if (dd === 1) add(at(11), 'transfer', 'BCA', 'transfer', 'Top up GoPay', 1000000, 'chat'), txns[txns.length-1].to = 'GoPay';
  }
  const ccDay = new Date(t0.getTime() + 2 * DAY).getDate(), nfDay = new Date(t0.getTime() + 5 * DAY).getDate();
  const bill = (name, cat, amount, est, dueDay, extra) => Object.assign({id:uid(), name, cat, amount, est, rec:'monthly', dueDay, due:nextDue(dueDay, t0), remind:[3,1,0], active:true}, extra || {});
  return {
    v:1,
    user:{name:'Rina', email:'rina@example.com', tz:'Asia/Jakarta', forward:'u-7f3k2@in.monet.app', wa:'+62 812-****-4821', onboarded:true},
    accounts:[
      {id:uid(), name:'BCA', type:'bank', archived:false},
      {id:uid(), name:'Mandiri', type:'bank', archived:false},
      {id:uid(), name:'GoPay', type:'ewallet', archived:false},
      {id:uid(), name:'OVO', type:'ewallet', archived:false},
      {id:uid(), name:'Cash', type:'cash', archived:false},
      {id:uid(), name:'BCA credit card', type:'credit_card', archived:false},
    ],
    txns,
    bills:[
      bill('BCA credit card', 'bills', 2140000, false, ccDay),
      bill('Netflix', 'entertainment', 186000, false, nfDay),
      bill('BPJS Kesehatan', 'bills', 150000, false, 10),
      bill('Internet IndiHome', 'bills', 350000, false, 15),
      bill('PLN electricity', 'bills', 450000, true, 20),
      bill('Kos rent', 'bills', 2500000, false, 2),
    ],
    suggested:[{id:uid(), name:'Telkomsel Halo', cat:'bills', amount:125000, est:false, dueDay:28, from:'tagihan@telkomsel.com'}],
    paidLog:[],
    memory:[
      {id:uid(), key:'salary_day', en:'Salary arrives on the 25th (BCA)', id_:'Gaji masuk tanggal 25 (BCA)', date:dateOnly(new Date(t0.getTime() - 40 * DAY))},
      {id:uid(), key:'daily_budget', en:'Daily food budget about Rp 150,000', id_:'Anggaran makan harian sekitar Rp 150.000', date:dateOnly(new Date(t0.getTime() - 20 * DAY))},
      {id:uid(), key:'alias_gopay', en:'"gojek pay" means GoPay', id_:'"gojek pay" artinya GoPay', date:dateOnly(new Date(t0.getTime() - 9 * DAY))},
    ],
    prefs:{},
    auto:{waLinked:true, autoMatch:true, dup:true, monthly:true, daily:false, emailSum:true, remind:[3,1,0], time:'08:00', channel:'whatsapp',
      senders:[{addr:'noreply@bca.co.id', on:true},{addr:'receipt@gojek.com', on:true},{addr:'tagihan@telkomsel.com', on:true},{addr:'promo@shopee.co.id', on:false}]},
    chat:[],
    pending:[],
    seenNotifs:[],
  };
}
function emptyUser(email){
  const s = seed();
  return Object.assign(s, {
    user:{name:'', email, tz:'Asia/Jakarta', forward:'u-'+uid().slice(0,5)+'@in.monet.app', wa:'', onboarded:false},
    accounts:[], txns:[], bills:[], suggested:[], memory:[], chat:[], paidLog:[],
    auto:Object.assign(s.auto, {waLinked:false, channel:'web', senders:[]}),
  });
}

let S = null;
function load(){
  try { const raw = localStorage.getItem(STORE); if (raw) S = JSON.parse(raw); } catch (e) {}
  if (!S || S.v !== 1) S = seed();
  try { const l = localStorage.getItem('monet-lang'); if (l === 'en' || l === 'id') LANG = l; } catch (e) {}
}
function persist(){ try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
function session(v){ try { if (v === undefined) return localStorage.getItem('monet-proto-session'); if (v) localStorage.setItem('monet-proto-session', v); else localStorage.removeItem('monet-proto-session'); } catch (e) { return v === undefined ? '1' : null; } }

/* ---- queries ---- */
function liveTx(){ return S.txns.filter(x => !x.deleted); }
function monthTx(y, m){ return liveTx().filter(x => { const d = new Date(x.date); return d.getFullYear() === y && d.getMonth() === m; }); }
function totals(list){
  let inc = 0, exp = 0; const cats = {};
  for (const x of list){
    if (x.type === 'income') inc += x.amount;
    else if (x.type === 'expense'){ exp += x.amount; cats[x.cat] = (cats[x.cat] || 0) + x.amount; }
  }
  return {inc, exp, saved:inc - exp, rate: inc ? (inc - exp) / inc : 0, cats, n:list.length};
}
function monthTotals(y, m){ return totals(monthTx(y, m)); }
function prevYM(y, m, k){ const d = new Date(y, m - (k === undefined ? 1 : k), 1); return [d.getFullYear(), d.getMonth()]; }
function activeAccounts(){ return S.accounts.filter(a => !a.archived); }

function billStatus(b){
  const d = daysUntil(b.due);
  if (d < 0) return {key:'overdue', dot:'red', tag:'urgent', d};
  if (d <= 3) return {key:'urgent', dot:'red', tag:'urgent', d};
  if (d <= 7) return {key:'soon', dot:'yellow', tag:'soon', d};
  return {key:'later', dot:'green', tag:'ok', d};
}
function dueText(d){ if (d < 0) return t('daysLate', {n:-d}); if (d === 0) return t('dueToday'); if (d === 1) return t('inDay'); return t('inDays', {n:d}); }
function billsSorted(){ return S.bills.filter(b => b.active).sort((a, b) => a.due.localeCompare(b.due)); }
function notifications(){
  const out = [];
  for (const b of billsSorted()){ const st = billStatus(b); if (st.d <= 3) out.push({id:'b'+b.id+b.due, ic:'⏰', text:b.name+' · '+rp(b.amount)+' · '+dueText(st.d), href:'#/bills'}); }
  if (S.auto.emailSum && S.txns.some(x => x.source === 'email')) out.push({id:'em'+dateOnly(today0()), ic:'📧', text:LANG === 'id' ? '2 transaksi tercatat dari email kamu hari ini.' : '2 transactions logged from your emails today.', href:'#/transactions'});
  for (const s of S.suggested) out.push({id:'sg'+s.id, ic:'💡', text:(LANG === 'id' ? 'Tagihan baru dari email: ' : 'New bill found in email: ') + s.name, href:'#/bills'});
  return out;
}
