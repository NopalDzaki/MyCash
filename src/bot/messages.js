/**
 * Message Templates — Template pesan response bot yang emoji-rich dan terstruktur
 */

const { formatRupiah, formatDate, formatTime, getMonthName } = require('../utils/formatter');

/**
 * Pesan selamat datang saat /start
 */
function welcomeMessage() {
  return `✨ *WELCOME TO MYCASH PREMIUM* ✨
╭─────────────────────────────
│ Asisten keuangan pribadi terpercaya,
│ praktis, dan handal\\! 💸⚡
├─────────────────────────────
│ *💡 CONTOH CATATAN CEPAT:*
│ • \`2000 parkir di minimarket\`
│ • \`15000 makan siang bakso\`
│ • \`gajian 5 juta\`
│ • \`beli kopi susu 18rb\`
│ • \`dapat bonus 500rb\`
├─────────────────────────────
│ *🚀 PERINTAH UTAMA:*
│ • /menu \\- Lihat semua fitur & perintah
│ • /help \\- Panduan lengkap & format
│ • /laporan \\- Ringkasan keuangan bulan ini
│ • /dompet \\- Cek sisa saldo & kas saat ini
│ • /grafik \\- Visualisasi pengeluaran bulanan
│ • /sisa\\_hari \\- Cek rekomendasi belanja harian
│ • /hapus \\- Hapus transaksi terakhir
╰─────────────────────────────
Kirim transaksi pertamamu sekarang, mari kelola cashflow kita bersama\\! 💪`;
}

/**
 * Pesan bantuan /help
 */
function helpMessage() {
  return `📖 *PANDUAN LENGKAP MYCASH*
╭─────────────────────────────
│ *1. Cara Mencatat Pengeluaran*
│ Cukup ketik nominal dan keterangan barang/jasa\\.
│ 💡 Contoh:
│ • \`15000 makan nasi padang\`
│ • \`beli kopi 18rb\`
│ • \`50rb isi bensin pertamax\`
│ • \`1\\.2jt bayar kost\`
│
│ *2. Cara Mencatat Pemasukan*
│ Sebutkan nominal & kata kunci pemasukan:
│ *gaji, gajian, bonus, terima, dapat, cashback, refund*\\.
│ 💡 Contoh:
│ • \`gajian bulan ini 4 juta\`
│ • \`terima bonus transfer 200rb\`
│ • \`dapat cashback shopee 25rb\`
│
│ *3. Format Nominal Fleksibel*
│ • Ribuan: \`15000\`, \`15\\.000\`, \`15rb\`, \`15k\`
│ • Jutaan: \`2000000\`, \`2\\.000\\.000\`, \`2jt\`, \`2 juta\`
│ • Singkat: \`seribu\` \\(1k\\), \`sejuta\` \\(1jt\\), \`setengah juta\` \\(500k\\)
│
│ *4. Banyak Transaksi Sekaligus*
│ Gunakan kata hubung *dan*, *&*, atau koma *\\,*\\.
│ 💡 Contoh:
│ • \`makan 15000 dan parkir 2000\`
│ • \`bensin 20k, jajan boba 15k\`
├─────────────────────────────
╰ Ketik /menu untuk melihat semua perintah yang tersedia\\.`;
}

/**
 * Direktori Perintah /menu atau /commands
 */
function commandsMenu() {
  return `🛠️ *DIREKTORI PERINTAH MYCASH*
╭─────────────────────────────
│ 📋 *Informasi & Panduan*
│ • /menu \\- Menampilkan menu ini
│ • /help \\- Panduan format input lengkap
│ • /status \\- Status koneksi bot & database
│ • /ping \\- Cek latensi respon bot
│ • /tentang \\- Info bot & developer
│
│ 📈 *Laporan & Ringkasan*
│ • /hari\\_ini \\- Transaksi hari ini
│ • /minggu\\_ini \\- Transaksi 7 hari terakhir
│ • /laporan \\- Laporan bulanan detail
│ • /bulan\\_lalu \\- Laporan bulan lalu
│ • /kategori \\- Daftar kategori transaksi
│ • /analisis \\- Analisis keuangan mendalam
│
│ 👛 *Fitur Wallet & Budgeting*
│ • /dompet \\- Cek sisa saldo & total kas
│ • /grafik \\- Visualisasi pengeluaran (Bar Chart)
│ • /pemasukan \\- Riwayat pemasukan bulan ini
│ • /pengeluaran \\- Riwayat pengeluaran bulan ini
│ • /sisa\\_hari \\- Sisa rekomendasi belanja harian
│ • /tips \\- Tips keuangan harian acak
│ • /quotes \\- Quotes bijak tentang uang
│
│ 🔧 *Manajemen Transaksi*
│ • /hapus \\- Hapus transaksi terakhir
│ • /batal \\- Alias untuk hapus transaksi
│ • /cari \`<teks>\` \\- Cari riwayat transaksi
│ • /ekspor \\- Link Google Sheets spreadsheet
╰─────────────────────────────
💡 *Tips:* Ingin cari kata kunci tertentu?
Ketik saja \`/cari kopi\` atau \`/cari bensin\`\\!`;
}

/**
 * Konfirmasi transaksi berhasil dicatat
 */
function transactionSuccess(data, savedToSheets) {
  const typeLabel = data.type === 'pemasukan' ? '📥 *PEMASUKAN*' : '📤 *PENGELUARAN*';
  const sheetsStatus = savedToSheets 
    ? '✅ *Tersimpan ke Google Sheets*' 
    : '⚠️ _Gagal sinkron ke Google Sheets_';

  // Escape special characters for MarkdownV2
  const amount = escapeMarkdown(formatRupiah(data.amount));
  const category = escapeMarkdown(`${data.categoryEmoji} ${data.category}`);
  const note = escapeMarkdown(data.note);
  const dateStr = escapeMarkdown(formatDate(new Date()));
  const timeStr = escapeMarkdown(formatTime(new Date()));

  return `✨ *TRANSAKSI BERHASIL DICATAT\\!* ✨
╭─────────────────────────────
│ 📌 *Status:* ${sheetsStatus}
├─────────────────────────────
│ 🧾 *Detail Transaksi:*
│ • Tipe: ${typeLabel}
│ • Kategori: ${category}
│ • Nominal: *${amount}*
│ • Catatan: \`${note}\`
│ • Waktu: ${dateStr} pukul ${timeStr}
╰─────────────────────────────
💡 _Ketik /hapus jika terjadi kesalahan pencatatan\\._`;
}

/**
 * Konfirmasi multi-transaksi berhasil dicatat
 */
function multiTransactionSuccess(results, savedCount, totalCount) {
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let detailList = '';

  for (const r of results) {
    const d = r.data;
    const isInc = d.type === 'pemasukan';
    const icon = isInc ? '📥' : '📤';
    
    if (isInc) {
      totalPemasukan += d.amount;
    } else {
      totalPengeluaran += d.amount;
    }
    
    detailList += `\n│ ${icon} *${escapeMarkdown(formatRupiah(d.amount))}* \\- \`${escapeMarkdown(d.note)}\` \\(${escapeMarkdown(d.categoryEmoji)}\\)`;
  }

  const sheetsStatus = savedCount === totalCount
    ? '✅ *Semua tersimpan ke Google Sheets*'
    : `⚠️ _Hanya ${savedCount} dari ${totalCount} tersimpan_`;

  const dateStr = escapeMarkdown(formatDate(new Date()));
  const timeStr = escapeMarkdown(formatTime(new Date()));

  return `✨ *MULTI-TRANSAKSI DICATAT\\!* ✨
╭─────────────────────────────
│ 📌 *Status:* ${sheetsStatus}
│ 📅 *Waktu:* ${dateStr}, ${timeStr}
├─────────────────────────────
│ 📝 *Rincian:*${detailList}
├─────────────────────────────
│ 📊 *Ringkasan:*
│ • Total Pemasukan: *${escapeMarkdown(formatRupiah(totalPemasukan))}*
│ • Total Pengeluaran: *${escapeMarkdown(formatRupiah(totalPengeluaran))}*
│ • Selisih: *${escapeMarkdown(formatRupiah(totalPemasukan - totalPengeluaran))}*
╰─────────────────────────────`;
}

/**
 * Pesan error parsing gagal
 */
function parseError(errorMsg) {
  return `❌ *MAAF, GAGAL MEMPROSES*
╭─────────────────────────────
│ MyCash tidak dapat mengidentifikasi
│ maksud transaksi kamu\\.
├─────────────────────────────
│ *Error detail:*
│ _${escapeMarkdown(errorMsg)}_
╰─────────────────────────────
💡 *Tips:* Kirim format sederhana seperti:
\`15000 kopi susu\` atau ketik /help untuk panduan\\.`;
}

/**
 * Laporan bulanan
 */
function monthlyReport(month, year, transactions, isPrevious = false) {
  const monthName = escapeMarkdown(getMonthName(month));
  const title = isPrevious ? `LAPORAN BULAN LALU` : `LAPORAN BULANAN`;
  if (transactions.length === 0) {
    return `📊 *${title}*
╭─────────────────────────────
│ Bulan: *${monthName} ${year}*
├─────────────────────────────
│ 📭 _Belum ada transaksi tercatat\\._
╰─────────────────────────────`;
  }

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  const categoryTotals = {};

  for (const t of transactions) {
    if (t.type === 'pemasukan') {
      totalPemasukan += t.amount;
    } else {
      totalPengeluaran += t.amount;
      const cat = t.category || '❓ Lainnya';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    }
  }

  const saldo = totalPemasukan - totalPengeluaran;
  const healthEmoji = saldo >= 0 ? '🟢 Net Surplus' : '🔴 Net Defisit';

  let report = `📊 *${title}: ${monthName.toUpperCase()} ${year}*
╭─────────────────────────────
│ 📥 Total Pemasukan:  *${escapeMarkdown(formatRupiah(totalPemasukan))}*
│ 📤 Total Pengeluaran: *${escapeMarkdown(formatRupiah(totalPengeluaran))}*
│ 💰 Saldo Bersih:      *${escapeMarkdown(formatRupiah(saldo))}* \\(${healthEmoji}\\)
│ 📝 Total Transaksi:   *${transactions.length} kali*
├─────────────────────────────
│ ❖ *Pengeluaran per Kategori:*`;

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    for (const [cat, total] of sortedCategories) {
      report += `\n│ • ${escapeMarkdown(cat)}: *${escapeMarkdown(formatRupiah(total))}*`;
    }
  } else {
    report += `\n│ _Tidak ada pengeluaran bulan ini\\._`;
  }

  report += `\n╰─────────────────────────────\n💡 _Gunakan perintah /analisis untuk melihat rasio dan tips finansial Kak\\._`;

  return report;
}

/**
 * Laporan hari ini
 */
function dailyReport(transactions) {
  const dateStr = escapeMarkdown(formatDate(new Date()));

  if (transactions.length === 0) {
    return `📅 *TRANSAKSI HARI INI*
╭─────────────────────────────
│ Tanggal: *${dateStr}*
├─────────────────────────────
│ 📭 _Belum ada transaksi hari ini\\._
╰─────────────────────────────
💡 Kirim catatan pertamamu sekarang\\!`;
  }

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let itemsList = '';

  for (const t of transactions) {
    const isInc = t.type === 'pemasukan';
    const icon = isInc ? '📥' : '📤';
    
    if (isInc) {
      totalPemasukan += t.amount;
    } else {
      totalPengeluaran += t.amount;
    }

    itemsList += `\n│ ${icon} [${t.time}] *${escapeMarkdown(formatRupiah(t.amount))}* \\- \`${escapeMarkdown(t.note)}\` \\(${escapeMarkdown(t.category)}\\)`;
  }

  return `📅 *TRANSAKSI HARI INI*
╭─────────────────────────────
│ Tanggal: *${dateStr}*
├─────────────────────────────
│ 🧾 *Daftar Transaksi:*${itemsList}
├─────────────────────────────
│ 📊 *Total Hari Ini:*
│ • 📥 Pemasukan:  *${escapeMarkdown(formatRupiah(totalPemasukan))}*
│ • 📤 Pengeluaran: *${escapeMarkdown(formatRupiah(totalPengeluaran))}*
│ • ⚖️ Net Saldo: *${escapeMarkdown(formatRupiah(totalPemasukan - totalPengeluaran))}*
╰─────────────────────────────`;
}

/**
 * Laporan mingguan
 */
function weeklyReport(transactions) {
  if (transactions.length === 0) {
    return `🗓️ *TRANSAKSI MINGGU INI*
╭─────────────────────────────
│ Periode: *7 Hari Terakhir*
├─────────────────────────────
│ 📭 _Belum ada transaksi terdaftar\\._
╰─────────────────────────────`;
  }

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let itemsList = '';

  // Tampilkan maksimal 15 transaksi terakhir agar tidak flooding di chat
  const maxToShow = 15;
  const recentTransactions = transactions.slice(-maxToShow);

  for (const t of recentTransactions) {
    const isInc = t.type === 'pemasukan';
    const icon = isInc ? '📥' : '📤';
    
    if (isInc) {
      totalPemasukan += t.amount;
    } else {
      totalPengeluaran += t.amount;
    }

    // Tampilkan tgl singkat (DD/MM)
    const tglParts = t.date.split('/');
    const tglSingkat = escapeMarkdown(`${tglParts[0]}/${tglParts[1]}`);
    itemsList += `\n│ ${icon} [${tglSingkat}] *${escapeMarkdown(formatRupiah(t.amount))}* \\- \`${escapeMarkdown(t.note)}\``;
  }

  if (transactions.length > maxToShow) {
    itemsList += `\n│ 💬 _\\(...dan ${transactions.length - maxToShow} transaksi lainnya\\)_`;
  }

  // Hitung total penuh
  let fullPemasukan = 0;
  let fullPengeluaran = 0;
  for (const t of transactions) {
    if (t.type === 'pemasukan') fullPemasukan += t.amount;
    else fullPengeluaran += t.amount;
  }

  return `🗓️ *TRANSAKSI MINGGU INI*
╭─────────────────────────────
│ Periode: *7 Hari Terakhir*
├─────────────────────────────
│ 🧾 *Daftar Riwayat:*${itemsList}
├─────────────────────────────
│ 📊 *Total Akumulasi:*
│ • 📥 Pemasukan:  *${escapeMarkdown(formatRupiah(fullPemasukan))}*
│ • 📤 Pengeluaran: *${escapeMarkdown(formatRupiah(fullPengeluaran))}*
│ • ⚖️ Net Saldo: *${escapeMarkdown(formatRupiah(fullPemasukan - fullPengeluaran))}*
╰─────────────────────────────`;
}

/**
 * Analisis keuangan bulanan
 */
function financialAnalysis(month, year, transactions) {
  const monthName = escapeMarkdown(getMonthName(month));
  if (transactions.length === 0) {
    return `📊 *ANALISIS FINANSIAL*
╭─────────────────────────────
│ Bulan: *${monthName} ${year}*
├─────────────────────────────
│ 📭 _Belum ada transaksi untuk dianalisis\\._
╰─────────────────────────────`;
  }

  let income = 0;
  let expense = 0;
  let daysMap = new Set();
  const categoryTotals = {};

  for (const t of transactions) {
    if (t.date) daysMap.add(t.date);
    if (t.type === 'pemasukan') {
      income += t.amount;
    } else {
      expense += t.amount;
      const cat = t.category || '❓ Lainnya';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    }
  }

  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const numDays = daysMap.size || 1;
  const avgDailyExpense = expense / numDays;

  // Temukan kategori pengeluaran terbesar
  let topCategory = 'Tidak ada';
  let topCategoryAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amt;
    }
  }

  let healthStatus = '';
  let healthTip = '';

  if (income === 0) {
    healthStatus = '🔴 *BELUM ADA DATA PEMASUKAN*';
    healthTip = 'Catat pemasukanmu seperti gaji atau bonus agar kami bisa menganalisis rasio tabunganmu Kak\\.';
  } else if (savingsRate < 0) {
    healthStatus = '🚨 *DEFISIT FINANSIAL*';
    healthTip = 'Pengeluaran melebihi pemasukan Kak\\! Kurangi belanja non\\-esensial dan batasi kategori *' + escapeMarkdown(topCategory) + '*\\.';
  } else if (savingsRate < 10) {
    healthStatus = '⚠️ *KURANG AMAN (Tabungan < 10%)*';
    healthTip = 'Tabunganmu masih sangat tipis\\. Coba sisihkan minimal 10% di awal bulan sebelum dibelanjakan\\.';
  } else if (savingsRate < 30) {
    healthStatus = '🟡 *CUKUP SEHAT (Tabungan 10-30%)*';
    healthTip = 'Kondisi keuanganmu cukup stabil\\. Pertahankan dan coba tingkatkan investasi untuk masa depan Kak\\!';
  } else {
    healthStatus = '🟢 *SANGAT SEHAT (Tabungan > 30%)*';
    healthTip = 'Luar biasa Sobat\\! Kamu hemat banget bulan ini\\. Selisih tabungan bisa kamu alokasikan ke reksa dana atau emas\\!';
  }

  return `📊 *ANALISIS KEUANGAN BULANAN*
╭─────────────────────────────
│ Bulan: *${monthName} ${year}*
│ Status: ${healthStatus}
├─────────────────────────────
│ 💡 *Metrik Finansial:*
│ • Total Pemasukan: *${escapeMarkdown(formatRupiah(income))}*
│ • Total Pengeluaran: *${escapeMarkdown(formatRupiah(expense))}*
│ • Rasio Tabungan: *${escapeMarkdown(savingsRate.toFixed(1))}%*
│ • Rerata Pengeluaran/Hari: *${escapeMarkdown(formatRupiah(avgDailyExpense))}*
│ • Kategori Terboros: *${escapeMarkdown(topCategory)}* \\(${escapeMarkdown(formatRupiah(topCategoryAmount))}\\)
├─────────────────────────────
│ 📌 *Tips Khusus Bulan Ini:*
│ _${healthTip}_
╰─────────────────────────────`;
}

/**
 * Hasil pencarian kata kunci
 */
function searchResult(keyword, transactions) {
  const cleanKeyword = escapeMarkdown(keyword);
  if (transactions.length === 0) {
    return `🔍 *HASIL PENCARIAN*
╭─────────────────────────────
│ Kata Kunci: \`${cleanKeyword}\`
├─────────────────────────────
│ 📭 _Tidak ditemukan transaksi pencarian\\._
╰─────────────────────────────`;
  }

  let list = '';
  let total = 0;
  
  for (const t of transactions) {
    const isInc = t.type === 'pemasukan';
    const icon = isInc ? '📥' : '📤';
    total += t.amount;
    list += `\n│ ${icon} [${escapeMarkdown(t.date)}] *${escapeMarkdown(formatRupiah(t.amount))}* \\- \`${escapeMarkdown(t.note)}\``;
  }

  return `🔍 *HASIL PENCARIAN*
╭─────────────────────────────
│ Kata Kunci: \`${cleanKeyword}\`
│ Ditemukan: *${transactions.length} transaksi*
├─────────────────────────────
│ 📝 *Daftar Transaksi:*${list}
├─────────────────────────────
│ 💰 Total Nominal: *${escapeMarkdown(formatRupiah(total))}*
╰─────────────────────────────`;
}

/**
 * Link spreadsheet ekspor
 */
function exportLink(spreadsheetId) {
  if (!spreadsheetId) {
    return `⚠️ *EKSPOR DATABASE*
╭─────────────────────────────
│ Google Sheets belum terhubung\\.
│ Hubungkan spreadsheet dengan mengisi
│ file \`.env\` terlebih dahulu\\.
╰─────────────────────────────`;
  }

  const url = `https://docs\\.google\\.com/spreadsheets/d/${spreadsheetId}/edit`;
  return `📊 *AKSES DATABASE GOOGLE SHEETS*
╭─────────────────────────────
│ Link spreadsheet tempat data transaksi
│ keuanganmu disimpan secara real\\-time:
├─────────────────────────────
│ 🔗 [Buka Google Sheets Kamu](${url})
├─────────────────────────────
│ *Petunjuk:*
│ • Jangan hapus kolom header utama\\.
│ • Kamu bisa buat grafik / rumus tambahan\\.
╰─────────────────────────────`;
}

/**
 * Tips finansial acak
 */
const FINANCE_TIPS = [
  'Gunakan rumus 50/30/20: 50% untuk kebutuhan pokok, 30% untuk keinginan, dan 20% untuk tabungan/investasi.',
  'Bayar tagihan tepat waktu di awal bulan untuk menghindari denda dan mengetahui sisa dana bersih yang bebas digunakan.',
  'Catat semua pengeluaran sekecil apa pun. Uang receh yang bocor halus sering kali menjadi penyebab defisit di akhir bulan.',
  'Sebelum membeli barang mahal, tunggu 24 jam terlebih dahulu. Jika esok hari kamu masih sangat menginginkannya, baru beli. Ini mengurangi belanja impulsif!',
  'Bedakan kebutuhan dan keinginan. Ponsel baru adalah keinginan jika ponsel lamamu masih berfungsi dengan baik.',
  'Miliki dana darurat minimal 3-6 kali pengeluaran bulanan sebelum kamu mulai melakukan investasi berisiko tinggi.',
  'Investasi terbaik saat muda adalah leher ke atas: beli buku, ikuti pelatihan, dan pelajari keterampilan baru.',
  'Kurangi makan di luar atau memesan makanan online. Memasak sendiri bisa menghemat hingga 50-70% pengeluaran makanan!',
  'Hindari cicilan barang konsumtif yang nilainya menyusut. Jika tidak bisa membeli tunai, berarti kamu belum mampu memilikinya.',
  'Nabunglah di awal bulan, bukan menyisakan uang di akhir bulan. Yang disisakan sering kali nilainya adalah nol!'
];

function financeTips() {
  const randomIndex = Math.floor(Math.random() * FINANCE_TIPS.length);
  const tip = escapeMarkdown(FINANCE_TIPS[randomIndex]);
  return `💡 *TIPS FINANSIAL MYCASH*
╭─────────────────────────────
│ ${tip}
╰─────────────────────────────
_Mari konsisten demi masa depan cerah\\!_ 🚀`;
}

/**
 * Konfirmasi hapus transaksi
 */
function deleteSuccess(data) {
  const icon = data.type === 'pemasukan' ? '📥' : '📤';
  return `🗑️ *TRANSAKSI BERHASIL DIHAPUS\\!*
╭─────────────────────────────
│ Transaksi terakhir telah dibatalkan
│ dan dihapus dari database:
├─────────────────────────────
│ ${icon} *${escapeMarkdown(formatRupiah(data.amount))}*
│ 🏷️ Kategori: ${escapeMarkdown(data.category)}
│ 📌 Catatan: \`${escapeMarkdown(data.note)}\`
╰─────────────────────────────
_Keuanganmu telah disesuaikan kembali\\._`;
}

/**
 * Daftar kategori
 */
function categoryList(categories) {
  let msg = `🏷️ *DAFTAR KATEGORI MYCASH*
╭─────────────────────────────
│ Kategori otomatis yang didukung:
├─────────────────────────────
│ 🔴 *Pengeluaran:*
`;

  for (const cat of categories) {
    if (cat.name !== 'Gaji' && cat.name !== 'Investasi') {
      msg += `│ • ${cat.emoji} ${escapeMarkdown(cat.name)}\n`;
    }
  }

  msg += `├─────────────────────────────\n│ 🟢 *Pemasukan:*\n`;
  for (const cat of categories) {
    if (cat.name === 'Gaji' || cat.name === 'Investasi') {
      msg += `│ • ${cat.emoji} ${escapeMarkdown(cat.name)}\n`;
    }
  }

  msg += `╰─────────────────────────────\n💡 _Kategori akan terdeteksi otomatis dari kata kunci di pesan kamu\\._`;
  return msg;
}

/**
 * Status dompet (Wallet) untuk perintah /dompet
 */
function walletStatus(monthName, year, totalIncome, totalExpense, balance) {
  const mName = escapeMarkdown(monthName);
  const inc = escapeMarkdown(formatRupiah(totalIncome));
  const exp = escapeMarkdown(formatRupiah(totalExpense));
  const bal = escapeMarkdown(formatRupiah(balance));
  
  const statusEmoji = balance >= 0 ? '🟢 Surplus' : '🔴 Defisit';
  const notes = balance >= 0 
    ? 'Mantap Kak\\! Sisa saldo masih positif\\. Jaga terus ritme belanjanya\\.' 
    : 'Aduh Kak\\! Dompet bocor, saldo minus\\. Batasi jajan tidak penting dulu\\.';

  return `👛 *STATUS DOMPET & SALDO*
╭─────────────────────────────
│ Periode: *${mName} ${year}*
├─────────────────────────────
│ 📥 Pemasukan:  *${inc}*
│ 📤 Pengeluaran: *${exp}*
│ 💰 Sisa Kas:    *${bal}* (${statusEmoji})
├─────────────────────────────
│ 📝 *Analisis Singkat:*
│ _${escapeMarkdown(notes)}_
╰─────────────────────────────`;
}

/**
 * Grafik batang teks untuk /grafik
 */
function textBarChart(categoryTotals, totalExpense) {
  if (totalExpense === 0) {
    return `📊 *GRAFIK PENGELUARAN*
╭─────────────────────────────
│ 📭 _Tidak ada data pengeluaran bulan ini\\._
╰─────────────────────────────`;
  }

  let chart = `📊 *GRAFIK PENGELUARAN BULAN INI*
╭─────────────────────────────
│ Persentase belanja per kategori:
├─────────────────────────────`;

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  for (const [cat, amount] of sortedCategories) {
    const pct = (amount / totalExpense) * 100;
    const blocksCount = Math.round(pct / 10);
    const bar = '█'.repeat(blocksCount) + '░'.repeat(Math.max(0, 10 - blocksCount));
    const label = escapeMarkdown(cat);
    const amountStr = escapeMarkdown(formatRupiah(amount));
    const pctStr = escapeMarkdown(pct.toFixed(0));

    chart += `\n│ ${label}\n│ \`[${bar}]\` *${pctStr}%* \\(${amountStr}\\)\n│`;
  }

  // Remove the trailing newline and vertical line separator
  chart = chart.slice(0, -2);
  
  chart += `\n╰─────────────────────────────\n💰 Total Belanja: *${escapeMarkdown(formatRupiah(totalExpense))}*`;
  return chart;
}

/**
 * Riwayat khusus Pemasukan atau Pengeluaran saja
 */
function transactionList(type, monthName, transactions) {
  const mName = escapeMarkdown(monthName);
  const typeTitle = type === 'pemasukan' ? '📥 RIWAYAT PEMASUKAN' : '📤 RIWAYAT PENGELUARAN';
  const emptyMsg = type === 'pemasukan' 
    ? '📭 _Belum ada pemasukan bulan ini\\._' 
    : '📭 _Belum ada pengeluaran bulan ini\\._';

  if (transactions.length === 0) {
    return `📋 *${typeTitle}*
╭─────────────────────────────
│ Bulan: *${mName}*
├─────────────────────────────
│ ${emptyMsg}
╰─────────────────────────────`;
  }

  let total = 0;
  let list = '';

  for (const t of transactions) {
    total += t.amount;
    const tglParts = t.date.split('/');
    const tglSingkat = escapeMarkdown(`${tglParts[0]}/${tglParts[1]}`);
    list += `\n│ • [${tglSingkat}] *${escapeMarkdown(formatRupiah(t.amount))}* \\- \`${escapeMarkdown(t.note)}\``;
  }

  return `📋 *${typeTitle}*
╭─────────────────────────────
│ Bulan: *${mName}*
├─────────────────────────────
│ 🧾 *Daftar Transaksi:*${list}
├─────────────────────────────
│ 💰 Total Akumulasi: *${escapeMarkdown(formatRupiah(total))}*
╰─────────────────────────────`;
}

/**
 * Rekomendasi budgeting belanja harian
 */
function dailyBudgetRecommendation(daysRemaining, remainingAmount, avgDailyExpense) {
  const remainingStr = escapeMarkdown(formatRupiah(remainingAmount));
  const daysStr = escapeMarkdown(daysRemaining.toString());
  
  let limitPerDay = remainingAmount > 0 ? Math.round(remainingAmount / daysRemaining) : 0;
  const limitPerDayStr = escapeMarkdown(formatRupiah(limitPerDay));
  const avgStr = escapeMarkdown(formatRupiah(avgDailyExpense));

  let advice = '';
  if (remainingAmount <= 0) {
    advice = '🚨 *DEFISIT WARNING\\!* Sisa anggaranmu sudah habis Kak\\! Setiap rupiah yang kamu belanjakan saat ini adalah utang / defisit dari tabunganmu\\. Segera STOP jajan\\!';
  } else if (limitPerDay < 20000) {
    advice = '⚠️ *SIAGA SATU Kak\\!* Anggaranmu tipis banget, cuma boleh belanja maksimal *' + limitPerDayStr + '* sehari\\. Jangan khilaf beli kopi mahal ya\\.';
  } else if (limitPerDay < 100000) {
    advice = '🟡 *WASPADA Kak\\!* Batas belanja harian kamu *' + limitPerDayStr + '*\\. Cukup untuk makan sehari-hari, tapi hindari belanja baju / hiburan dulu ya\\.';
  } else {
    advice = '🟢 *AMAN SENTOSA\\!* Dompet kamu tebal banget Kak, boleh belanja sampai *' + limitPerDayStr + '* sehari\\. Tapi tetap ingat menabung ya\\!';
  }

  return `💡 *REKOMENDASI BELANJA HARIAN*
╭─────────────────────────────
│ 📅 Hari Tersisa Bulan Ini: *${daysStr} hari*
│ 💰 Sisa Anggaran Belanja:  *${remainingStr}*
│ 💸 Rekomendasi Belanja/Hari: *${limitPerDayStr}*
├─────────────────────────────
│ 📊 *Metrik Pembanding:*
│ • Rerata Belanja Saat Ini: *${avgStr}/hari*
├─────────────────────────────
│ 📌 *Catatan Keuangan:*
│ _${advice}_
╰─────────────────────────────`;
}

/**
 * Informasi bot dan developer
 */
function aboutBot() {
  return `🤖 *TENTANG MYCASH*
╭─────────────────────────────
│ 💎 *MyCash Premium Edition*
│ Asisten finansial cerdas berbasis NLP
│ yang tersinkronisasi langsung dengan
│ Google Sheets spreadsheet secara real-time.
├─────────────────────────────
│ 🚀 *Spesifikasi Sistem:*
│ • Versi: \`v1.2.0-Premium\`
│ • Engine: \`Telegraf Core v4\`
│ • Parser: \`MyCash AmountParser NLP\`
│ • Database: \`Google Sheets API v4\`
│ • Hosting: \`Serverless Node.js Environment\`
├─────────────────────────────
│ 😎 *Tim Pengembang:*
│ • Developer: *Nopal Ganteng*
│ • Motto: _"Catat hari ini, kaya esok hari!"_
╰─────────────────────────────
Dukung project ini dengan memberikan bintang di repositori GitHub kamu\\! Terima kasih Kak\\! ❤️`;
}

/**
 * Quotes bijak finansial
 */
const MOTIVATION_QUOTES = [
  'Jangan pernah bergantung pada satu sumber pendapatan. Lakukan investasi untuk menciptakan sumber kedua. — Warren Buffett',
  'Uang tidak membeli kebahagiaan, tetapi tidak memiliki uang pasti membeli kesengsaraan. — Daniel Kahneman',
  'Bukan berapa banyak uang yang kamu hasilkan, tetapi berapa banyak uang yang kamu simpan. — Robert Kiyosaki',
  'Jangan membeli barang yang tidak kamu butuhkan, dengan uang yang tidak kamu miliki, untuk mengesankan orang yang tidak kamu sukai. — Dave Ramsey',
  'Lebih baik tidur dengan perut lapar daripada bangun dengan utang. — Peribahasa',
  'Orang kaya fokus pada peluang. Orang miskin fokus pada hambatan. — T. Harv Eker',
  'Beli hanya sesuatu yang Anda akan sangat senang menahannya jika pasar tutup selama 10 tahun. — Warren Buffett',
  'Tabungan hari ini adalah kebebasan hari esok. — MyCash Wisdom',
  'Ingat Kak, kopi susu 18rb kalau dibeli tiap hari selama setahun bisa buat beli emas batangan! ☕💸',
  'Dompet tipis bikin kritis, mari rajin catat biar tetap manis. — Nopal Ganteng'
];

function randomQuote() {
  const idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
  const q = escapeMarkdown(MOTIVATION_QUOTES[idx]);
  return `💬 *KATA BIJAK FINANSIAL*
╭─────────────────────────────
│ _"${q}"_
╰─────────────────────────────
Mari renungkan dan hemat belanja hari ini Sobat\\! 💰`;
}

/**
 * Escape karakter khusus untuk Telegram MarkdownV2
 */
function escapeMarkdown(text) {
  if (!text) return '';
  return text.toString().replace(/([_\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

module.exports = {
  welcomeMessage,
  helpMessage,
  commandsMenu,
  transactionSuccess,
  multiTransactionSuccess,
  parseError,
  monthlyReport,
  dailyReport,
  weeklyReport,
  financialAnalysis,
  searchResult,
  exportLink,
  financeTips,
  deleteSuccess,
  categoryList,
  walletStatus,
  textBarChart,
  transactionList,
  dailyBudgetRecommendation,
  aboutBot,
  randomQuote,
  escapeMarkdown,
};
