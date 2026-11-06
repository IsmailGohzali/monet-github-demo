/* EN | ID text. Every key has [English, Indonesian]. */
const T = {
  // nav
  nOverview:['Overview','Ringkasan'], nChat:['Chat','Chat'], nInput:['Add','Catat'], nTxns:['Transactions','Transaksi'],
  nBills:['Bills','Tagihan'], nAnalysis:['Analysis','Analisis'], nSettings:['Settings','Pengaturan'], nHome:['Home','Beranda'],
  logout:['Log out','Keluar'], prototype:['Prototype · demo data','Prototipe · data contoh'],
  notifs:['Notifications','Notifikasi'], noNotifs:['Nothing new.','Belum ada yang baru.'],

  // auth
  loginTitle:['Welcome to Monet','Selamat datang di Monet'],
  loginSub:['Sign in or create an account. No password needed.','Masuk atau buat akun. Tanpa kata sandi.'],
  email:['Email','Email'], sendCode:['Send code','Kirim kode'], google:['Continue with Google','Lanjutkan dengan Google'], or:['or','atau'],
  codeTitle:['Check your email','Cek email kamu'], codeSub:['We sent a 6-digit code to {e}.','Kami mengirim kode 6 digit ke {e}.'],
  demoCode:['Prototype: use code 123456','Prototipe: pakai kode 123456'], code:['Code','Kode'], verify:['Verify','Verifikasi'],
  wrongCode:['That code is wrong or expired. Try 123456.','Kode salah atau kedaluwarsa. Coba 123456.'],
  badEmail:['Enter a valid email.','Masukkan email yang valid.'], back:['Back','Kembali'],
  demoHint:['Use rina@example.com for the demo account with data, or any other email to try onboarding.','Pakai rina@example.com untuk akun demo berisi data, atau email lain untuk mencoba onboarding.'],

  // onboarding
  ob1:['Which language do you prefer?','Bahasa apa yang kamu pilih?'], ob1s:['Monet will reply in this language. You can change it any time.','Monet akan membalas dalam bahasa ini. Bisa diubah kapan saja.'],
  yourName:['What should Monet call you?','Monet harus memanggilmu siapa?'],
  consent:['I have read the privacy notice. Monet only reads what I send or connect, and never sells my data.','Saya sudah membaca pemberitahuan privasi. Monet hanya membaca yang saya kirim atau hubungkan, dan tidak pernah menjual data saya.'],
  ob2:['Where do you keep your money?','Di mana kamu menyimpan uang?'], ob2s:['Tap the ones you use. Names only: never a login or account number.','Pilih yang kamu pakai. Hanya nama: tidak pernah login atau nomor rekening.'],
  ob3:['Chat on WhatsApp?','Chat lewat WhatsApp?'], ob3s:['Send this code to Monet on WhatsApp to link your number.','Kirim kode ini ke Monet di WhatsApp untuk menghubungkan nomormu.'],
  openWa:['Open WhatsApp','Buka WhatsApp'], simulateLink:['Simulate: code received','Simulasi: kode diterima'], linked:['Linked','Terhubung'], skip:['Skip for now','Lewati dulu'],
  ob4:['Say hi to Monet','Sapa Monet'], ob4s:['Your team is ready. Try one of these to start.','Timmu sudah siap. Coba salah satu ini untuk mulai.'],
  next:['Next','Lanjut'], finish:['Open Monet','Buka Monet'], other:['Other','Lainnya'], addOther:['Add another account','Tambah akun lain'],

  // overview
  hi:['Hi {n}','Hai {n}'], ovSub:['Here is your money this month.','Ini kondisi uangmu bulan ini.'], ovSubPrev:['Here is how last month went.','Ini rangkuman bulan lalu.'],
  thisMonthT:['This month','Bulan ini'], lastMonthT:['Last month','Bulan lalu'],
  income:['Income','Pemasukan'], spending:['Spending','Pengeluaran'], saved:['Saved','Ditabung'], rate:['Savings rate','Rasio tabungan'],
  vsLast:['vs last month','vs bulan lalu'], cashflow:['Cash flow','Arus kas'], last6:['Last 6 months','6 bulan terakhir'],
  topCats:['Top categories','Kategori teratas'], upcoming:['Upcoming bills','Tagihan mendatang'], seeAll:['See all','Lihat semua'],
  recent:['Recent transactions','Transaksi terbaru'], askMonet:['Tell Monet anything…','Ceritakan ke Monet…'],
  quickEx:['e.g. lunch 35k gopay, parking 5k cash','mis. makan siang 35rb gopay, parkir 5rb tunai'],
  needsYou:['Needs your answer','Perlu jawabanmu'], answerInChat:['Answer in chat','Jawab di chat'],
  byAccount:['Spending by account','Pengeluaran per akun'], thisMonth:['this month','bulan ini'],

  // chat
  chatTitle:['Chat with Monet','Chat dengan Monet'], behind:['Behind the scenes','Di balik layar'], send:['Send','Kirim'],
  typeMsg:['Message Monet…','Kirim pesan ke Monet…'], attach:['Attach receipt','Lampirkan struk'],
  sug1:['Lunch 35k GoPay, parking 5k cash','Makan siang 35rb GoPay, parkir 5rb tunai'],
  sug2:["Show me this month's report",'Tampilkan laporan bulan ini'],
  sug3:['Internet 350k due every 15th','Internet 350rb jatuh tempo tiap tanggal 15'],
  sug4:['Give me investing tips','Kasih tips investasi'], sug5:['transfer 500 to Andi','transfer 500 ke Andi'],
  welcome:["Hi {n}! I'm Monet, your finance manager. Tell me what you spent or earned, ask for a report, or add a bill. I'll keep it all in order.","Hai {n}! Aku Monet, manajer keuanganmu. Ceritakan pengeluaran atau pemasukanmu, minta laporan, atau tambah tagihan. Semua akan aku rapikan."],

  // input
  inTitle:['Add transactions','Catat transaksi'], inSub:['Type it, fill a form, snap a receipt or paste a bank notification. Monet checks everything before saving.','Ketik, isi formulir, foto struk, atau tempel notifikasi bank. Monet mengecek semuanya sebelum menyimpan.'],
  tText:['Type it','Ketik'], tForm:['Form','Formulir'], tReceipt:['Receipt photo','Foto struk'], tPaste:['Paste notification','Tempel notifikasi'],
  textLabel:['Write it like a message. One or many at once.','Tulis seperti pesan. Satu atau banyak sekaligus.'],
  preview:['Check before saving','Cek sebelum menyimpan'], saveAll:['Save {n} transactions','Simpan {n} transaksi'], read:['Read it','Baca'],
  date:['Date','Tanggal'], type:['Type','Jenis'], account:['Account','Akun'], toAccount:['To account','Ke akun'], category:['Category','Kategori'],
  desc:['Description','Keterangan'], amount:['Amount (Rp)','Jumlah (Rp)'], save:['Save','Simpan'], cancel:['Cancel','Batal'], del:['Delete','Hapus'],
  expense:['Expense','Pengeluaran'], incomeT:['Income','Pemasukan'], transfer:['Transfer','Transfer'],
  dropTitle:['Drop a receipt photo here, or tap to choose','Taruh foto struk di sini, atau ketuk untuk memilih'],
  dropSub:['JPG or PNG. The photo stays private.','JPG atau PNG. Foto tetap privat.'], reading:['Bookkeeper is reading the receipt…','Bookkeeper sedang membaca struk…'],
  receiptFound:['Found on the receipt','Ditemukan di struk'], whichAcct:['Which account paid?','Bayar pakai akun apa?'],
  pasteLabel:['Paste a bank SMS, e-wallet notification or email text','Tempel SMS bank, notifikasi e-wallet, atau teks email'],
  pasteEx:['e.g. BCA: Transaksi Debit Rp 125.000 di TOKOPEDIA pada 01/11','mis. BCA: Transaksi Debit Rp 125.000 di TOKOPEDIA pada 01/11'],
  otherWays:['Let it come in by itself','Biar masuk sendiri'], otherWaysSub:['Set these up once in Settings → Automations.','Atur sekali di Pengaturan → Otomatisasi.'],
  wayWa:['WhatsApp: just message Monet','WhatsApp: cukup chat Monet'], wayEmail:['Forward bank emails to your Monet address','Teruskan email bank ke alamat Monet kamu'],
  setUp:['Set up','Atur'], needAcct:['Pick an account','Pilih akun'], needAmt:['Check the amount','Cek jumlahnya'],
  nothingFound:["I couldn't find an amount. Try something like \"coffee 25k ovo\".",'Aku tidak menemukan jumlah. Coba seperti "kopi 25rb ovo".'],
  savedN:['{n} saved','{n} tersimpan'], dupWarn:['Possible duplicate','Kemungkinan duplikat'],
  justAdded:['Added in this session','Baru ditambahkan'],

  // transactions
  txSub:['Every entry Monet has logged. Tap one to edit.','Semua catatan Monet. Ketuk untuk mengubah.'],
  search:['Search','Cari'], all:['All','Semua'], allAccts:['All accounts','Semua akun'], allCats:['All categories','Semua kategori'],
  noTx:['No transactions match.','Tidak ada transaksi yang cocok.'], editTx:['Edit transaction','Ubah transaksi'], source:['Source','Sumber'],
  deleted:['Transaction deleted','Transaksi dihapus'], undo:['Undo','Batalkan'], savedOk:['Saved','Tersimpan'], today:['Today','Hari ini'], yesterday:['Yesterday','Kemarin'],
  srcChat:['Web chat','Chat web'], srcWa:['WhatsApp','WhatsApp'], srcEmail:['Email','Email'], srcReceipt:['Receipt','Struk'], srcManual:['Manual','Manual'],
  nTx:['{n} transactions','{n} transaksi'], export:['Export CSV','Ekspor CSV'],

  // bills
  biSub:['Monet reminds you 3 days and 1 day before, and on the due day.','Monet mengingatkan 3 hari dan 1 hari sebelumnya, dan pada hari jatuh tempo.'],
  addBill:['Add bill','Tambah tagihan'], markPaid:['Mark as paid','Tandai lunas'], due:['Due','Jatuh tempo'],
  urgent:['Urgent','Mendesak'], soon:['Soon','Segera'], later:['Later','Nanti'], overdue:['Overdue','Terlambat'],
  inDays:['in {n} days','{n} hari lagi'], inDay:['tomorrow','besok'], dueToday:['today','hari ini'], daysLate:['{n} days late','telat {n} hari'],
  monthly:['Monthly','Bulanan'], weekly:['Weekly','Mingguan'], yearly:['Yearly','Tahunan'], once:['One-time','Sekali'],
  everyN:['every {n}','tiap tanggal {n}'], estimate:['Estimated amount','Jumlah perkiraan'], billName:['Bill name','Nama tagihan'],
  dueDay:['Due day of month','Tanggal jatuh tempo'], repeat:['Repeats','Berulang'], remindDays:['Remind me','Ingatkan saya'],
  dBefore:['{n} days before','{n} hari sebelum'], d1Before:['1 day before','1 hari sebelum'], dOn:['On the day','Pada harinya'],
  suggested:['Found in your email','Ditemukan di email kamu'], suggestedSub:['Monet found these bills. Add them?','Monet menemukan tagihan ini. Tambahkan?'],
  addIt:['Add','Tambah'], dismiss:['Dismiss','Abaikan'], paidHistory:['Paid recently','Baru dibayar'], logPayment:['Also log the payment as an expense','Catat juga pembayarannya sebagai pengeluaran'],
  paidOk:['{b} marked as paid. Next due {d}.','{b} ditandai lunas. Jatuh tempo berikutnya {d}.'],
  totalDue:['Due in the next 30 days','Jatuh tempo 30 hari ke depan'], noBills:['No bills yet. Add one, or tell Monet in chat.','Belum ada tagihan. Tambahkan, atau bilang ke Monet di chat.'],
  editBill:['Edit bill','Ubah tagihan'], removeBill:['Remove bill','Hapus tagihan'], estShort:['est.','perk.'],

  // analysis
  anSub:['Your monthly report from the Analyst, with tips based on your real spending.','Laporan bulananmu dari Analyst, dengan tips sesuai pengeluaran nyata.'],
  byCat:['Spending by category','Pengeluaran per kategori'], tips:['Tips from the Analyst','Tips dari Analyst'],
  invest:['Investing ideas','Ide investasi'], investSub:['Based on your saved preferences.','Berdasarkan preferensi yang tersimpan.'],
  disclaimer:['Educational only, not licensed financial advice. Choose OJK-registered products.','Hanya edukasi, bukan nasihat keuangan berlisensi. Pilih produk yang terdaftar di OJK.'],
  goal:['Goal','Tujuan'], horizon:['Time horizon','Jangka waktu'], risk:['Risk profile','Profil risiko'], monthlyAmt:['Monthly amount','Jumlah per bulan'],
  conservative:['Conservative','Konservatif'], moderate:['Moderate','Moderat'], aggressive:['Aggressive','Agresif'],
  setPrefs:['Set preferences','Atur preferensi'], noPrefs:["Tell Monet your goal, time horizon, risk profile and monthly amount to get ideas.",'Beri tahu Monet tujuan, jangka waktu, profil risiko, dan jumlah bulanan untuk mendapat ide.'],
  archive:['Reports archive','Arsip laporan'], open:['Open','Buka'], noData:['No data for this month yet.','Belum ada data bulan ini.'],
  dailyAvg:['Daily average spend','Rata-rata pengeluaran harian'], biggest:['Biggest expense','Pengeluaran terbesar'], txCount:['Transactions','Transaksi'],
  tableView:['Table view','Tampilan tabel'], months:['months','bulan'], years:['years','tahun'],
  saveInvest:['Save preferences','Simpan preferensi'],

  // settings
  stSub:['Automate how money gets in, and control what Monet remembers.','Otomatiskan cara data masuk, dan atur apa yang diingat Monet.'],
  sAuto:['Automations','Otomatisasi'], sChannels:['Input channels','Saluran input'], sRules:['Automation rules','Aturan otomatis'],
  sProfile:['Profile and language','Profil dan bahasa'], sAccounts:['Accounts','Akun'], sMemory:['Memory','Memori'], sData:['Your data','Data kamu'],
  waTitle:['WhatsApp','WhatsApp'], waOn:['Linked to {p}. Message Monet any time.','Terhubung ke {p}. Chat Monet kapan saja.'], waOff:['Not linked. Send the code to Monet on WhatsApp.','Belum terhubung. Kirim kode ke Monet di WhatsApp.'],
  unlink:['Unlink','Putuskan'], link:['Link','Hubungkan'], newCode:['New code','Kode baru'],
  fwTitle:['Email forwarding','Penerusan email'], fwSub:['Forward bank and e-wallet emails here, or set an auto-forward rule in Gmail or Outlook. Bills found in emails are suggested to you.','Teruskan email bank dan e-wallet ke sini, atau buat aturan auto-forward di Gmail atau Outlook. Tagihan dari email akan disarankan ke kamu.'],
  copy:['Copy','Salin'], copied:['Copied','Tersalin'], regen:['Regenerate','Buat ulang'], regenOk:['New address created. The old one stops working.','Alamat baru dibuat. Yang lama tidak berlaku lagi.'],
  senders:['Senders Monet reads','Pengirim yang dibaca Monet'], sendersSub:['The first email from a new sender always asks you first.','Email pertama dari pengirim baru selalu ditanyakan dulu.'],
  inboxTitle:['Read my inbox directly','Baca inbox langsung'], inboxSub:['Gmail or Outlook, read-only. Coming later.','Gmail atau Outlook, hanya baca. Segera hadir.'], soonTag:['Coming soon','Segera'],
  rcTitle:['Receipt photos','Foto struk'], rcSub:['Send a photo in chat or WhatsApp. If the account is not on the receipt, Monet asks.','Kirim foto di chat atau WhatsApp. Kalau akun tidak ada di struk, Monet akan bertanya.'],
  rAutoMatch:['Match payments to bills','Cocokkan pembayaran dengan tagihan'], rAutoMatchS:['When a logged expense looks like a bill (±10%, within 7 days), Monet asks to mark it paid.','Saat pengeluaran mirip tagihan (±10%, dalam 7 hari), Monet bertanya untuk menandai lunas.'],
  rDup:['Duplicate check','Cek duplikat'], rDupS:['Same amount and account within 10 minutes asks before saving.','Jumlah dan akun sama dalam 10 menit akan ditanyakan dulu.'],
  rAsk:['Ask when unclear','Tanya kalau tidak jelas'], rAskS:['Always on. Monet never saves a guess.','Selalu aktif. Monet tidak pernah menyimpan tebakan.'],
  rMonthly:['Monthly report on the 1st','Laporan bulanan tiap tanggal 1'], rMonthlyS:['Sent at 09:00 to your main channel.','Dikirim pukul 09:00 ke saluran utama.'],
  rDaily:['Daily summary','Ringkasan harian'], rDailyS:["Today's spending vs your average, every evening.",'Pengeluaran hari ini vs rata-rata, tiap malam.'],
  rEmailSum:['Email summary','Ringkasan email'], rEmailSumS:['"📧 2 transactions logged from your emails today."','"📧 2 transaksi tercatat dari email kamu hari ini."'],
  rRemind:['Bill reminders','Pengingat tagihan'], rRemindS:['When Monet reminds you before a bill is due.','Kapan Monet mengingatkan sebelum tagihan jatuh tempo.'],
  rTime:['Reminder time','Jam pengingat'], rChannel:['Main channel','Saluran utama'], web:['Web app','Aplikasi web'],
  language:['Language','Bahasa'], name:['Name','Nama'], tz:['Time zone','Zona waktu'],
  addAcct:['Add account','Tambah akun'], rename:['Rename','Ganti nama'], archiveA:['Archive','Arsipkan'], restore:['Restore','Pulihkan'], archived:['Archived','Diarsipkan'],
  memSub:['Facts and preferences Monet has learned. Delete anything.','Fakta dan preferensi yang dipelajari Monet. Hapus apa saja.'], noMem:['Monet has not saved any preferences yet.','Monet belum menyimpan preferensi.'],
  exportData:['Export my data','Ekspor data saya'], exportS:['CSV and JSON of everything Monet stores.','CSV dan JSON dari semua yang disimpan Monet.'],
  delAcct:['Delete account','Hapus akun'], delAcctS:['Data is removed within 30 days (UU PDP).','Data dihapus dalam 30 hari (UU PDP).'], typeDelete:['Type DELETE to confirm','Ketik DELETE untuk konfirmasi'],
  resetDemo:['Reset demo data','Atur ulang data contoh'], resetS:['Prototype only: restore the sample data.','Khusus prototipe: kembalikan data contoh.'], resetOk:['Demo data restored','Data contoh dipulihkan'],
  acctName:['Account name','Nama akun'], acctType:['Type','Jenis'], bank:['Bank','Bank'], ewallet:['E-wallet','E-wallet'], cash:['Cash','Tunai'], credit_card:['Credit card','Kartu kredit'], otherT:['Other','Lainnya'],
  noCreds:['Names only. Monet never asks for a login, PIN or account number.','Hanya nama. Monet tidak pernah meminta login, PIN, atau nomor rekening.'],
  exportOk:['Export downloaded','Ekspor diunduh'],
};
const CATS = {
  food:{en:'Food',id:'Makanan',ic:'🍜',color:'var(--coral)',kind:'expense'},
  bills:{en:'Bills',id:'Tagihan',ic:'🧾',color:'var(--violet)',kind:'expense'},
  transport:{en:'Transport',id:'Transportasi',ic:'🛵',color:'var(--gold-c)',kind:'expense'},
  shopping:{en:'Shopping',id:'Belanja',ic:'🛍️',color:'var(--sky)',kind:'expense'},
  entertainment:{en:'Entertainment',id:'Hiburan',ic:'🎬',color:'var(--other)',kind:'expense'},
  health:{en:'Health',id:'Kesehatan',ic:'💊',color:'var(--other)',kind:'expense'},
  education:{en:'Education',id:'Pendidikan',ic:'📚',color:'var(--other)',kind:'expense'},
  others:{en:'Others',id:'Lainnya',ic:'📦',color:'var(--other)',kind:'expense'},
  salary:{en:'Salary',id:'Gaji',ic:'💼',color:'var(--green)',kind:'income'},
  other_income:{en:'Other income',id:'Pemasukan lain',ic:'💰',color:'var(--green)',kind:'income'},
  transfer:{en:'Transfer',id:'Transfer',ic:'🔁',color:'var(--other)',kind:'transfer'},
};
/* chart order: named categories keep fixed colours; the rest fold into Others */
const CHART_CATS = ['food','bills','transport','shopping'];

let LANG = 'en';
function t(k, v){ const e = T[k]; let s = e ? e[LANG === 'id' ? 1 : 0] : k; if (v) for (const x in v) s = s.split('{'+x+'}').join(v[x]); return s; }
function everyN(n){
  if (LANG === 'id') return t('everyN', {n});
  const s = (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({1:'st', 2:'nd', 3:'rd'}[n % 10] || 'th');
  return t('everyN', {n:n + s});
}
function catName(k){ const c = CATS[k] || CATS.others; return c[LANG]; }
function rp(n){ return 'Rp ' + Math.round(n).toLocaleString(LANG === 'id' ? 'id-ID' : 'en-US'); }
function rpShort(n){
  const a = Math.abs(n), id = LANG === 'id';
  const f = (x) => (Math.round(x * 10) / 10).toLocaleString(id ? 'id-ID' : 'en-US');
  if (a >= 1e6) return 'Rp ' + f(n / 1e6) + (id ? ' jt' : 'M');
  if (a >= 1e3) return 'Rp ' + f(n / 1e3) + (id ? ' rb' : 'k');
  return rp(n);
}
function locale(){ return LANG === 'id' ? 'id-ID' : 'en-GB'; }
function fmtDate(d, o){ return new Date(d).toLocaleDateString(locale(), o || {day:'numeric', month:'short'}); }
function fmtMonth(y, m){ return new Date(y, m, 1).toLocaleDateString(locale(), {month:'long', year:'numeric'}); }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
