/**
 * Message Templates — Template pesan response bot yang emoji-rich
 */

const { formatRupiah, formatDate, formatTime, getMonthName } = require('../utils/formatter');

/**
 * Pesan selamat datang saat /start
 */
function welcomeMessage() {
  return `💰 *Selamat datang di MyCash!*

Saya adalah bot pencatat keuangan pribadimu. Cukup kirim pesan dengan bahasa sehari\\-hari dan saya akan otomatis mencatatnya\\!

*Contoh pesan:*
• \`2000 buat parkir\`
• \`15000 makan di warteg\`
• \`gajian 2 juta\`
• \`beli kopi 18rb\`
• \`50rb pulsa\`

*Perintah tersedia:*
/help \\- Panduan lengkap
/laporan \\- Ringkasan bulan ini
/hari\\_ini \\- Transaksi hari ini
/hapus \\- Hapus transaksi terakhir
/kategori \\- Daftar kategori

Langsung kirim pesanmu sekarang\\! 🚀`;
}

/**
 * Pesan bantuan /help
 */
function helpMessage() {
  return `📖 *Panduan Penggunaan MyCash*

*Cara mencatat pengeluaran:*
Kirim pesan dengan menyebutkan nominal dan keterangan\\.
• \`2000 parkir\`
• \`15000 makan di warteg\`
• \`beli kopi 18rb\`
• \`50rb bensin\`
• \`1\\.5jt bayar kos\`

*Cara mencatat pemasukan:*
Gunakan kata kunci pemasukan: gaji, gajian, bonus, terima, dapat, refund, cashback
• \`gajian 2 juta\`
• \`bonus 500rb\`
• \`dapat cashback 25rb\`

*Format angka yang didukung:*
• Angka biasa: \`2000\`, \`15000\`
• Pakai titik: \`15\\.000\`, \`1\\.500\\.000\`
• Pakai ribu/rb: \`18rb\`, \`18 ribu\`
• Pakai juta/jt: \`2jt\`, \`1\\.5 juta\`
• Singkat: \`sejuta\`, \`seribu\`

*Perintah:*
/laporan \\- Ringkasan bulan ini
/hari\\_ini \\- Transaksi hari ini
/hapus \\- Hapus transaksi terakhir
/kategori \\- Daftar kategori`;
}

/**
 * Konfirmasi transaksi berhasil dicatat
 */
function transactionSuccess(data, savedToSheets) {
  const typeLabel = data.type === 'pemasukan' ? '📥 Pemasukan' : '📤 Pengeluaran';
  const sheetsStatus = savedToSheets ? '' : '\n\n⚠️ _Data belum tersimpan ke Google Sheets_';

  // Escape special characters for MarkdownV2
  const amount = escapeMarkdown(formatRupiah(data.amount));
  const category = escapeMarkdown(`${data.categoryEmoji} ${data.category}`);
  const note = escapeMarkdown(data.note);
  const dateStr = escapeMarkdown(formatDate(new Date()));
  const timeStr = escapeMarkdown(formatTime(new Date()));

  return `✅ *Tercatat\\!*

${escapeMarkdown(typeLabel)}
💰 *${amount}*
🏷️ ${category}
📌 ${note}
📅 ${dateStr}, ${timeStr}${sheetsStatus}`;
}

/**
 * Konfirmasi multi-transaksi berhasil dicatat
 */
function multiTransactionSuccess(results, savedCount, totalCount) {
  let totalAmount = 0;
  let msg = `✅ *${escapeMarkdown(String(savedCount))} transaksi tercatat\\!*\n`;

  for (const r of results) {
    const d = r.data;
    const icon = d.type === 'pemasukan' ? '📥' : '📤';
    totalAmount += d.amount;
    msg += `\n${icon} *${escapeMarkdown(formatRupiah(d.amount))}* \\- ${escapeMarkdown(d.categoryEmoji)} ${escapeMarkdown(d.note)}`;
  }

  msg += `\n\n💰 Total: *${escapeMarkdown(formatRupiah(totalAmount))}*`;

  const dateStr = escapeMarkdown(formatDate(new Date()));
  const timeStr = escapeMarkdown(formatTime(new Date()));
  msg += `\n📅 ${dateStr}, ${timeStr}`;

  if (savedCount < totalCount) {
    msg += `\n\n⚠️ _${escapeMarkdown(String(totalCount - savedCount))} transaksi gagal disimpan_`;
  }

  return msg;
}

/**
 * Pesan error parsing gagal
 */
function parseError(errorMsg) {
  return `❌ *Gagal memproses*

${escapeMarkdown(errorMsg)}`;
}

/**
 * Laporan bulanan
 */
function monthlyReport(month, year, transactions) {
  if (transactions.length === 0) {
    return `📊 *Laporan ${escapeMarkdown(getMonthName(month))} ${year}*\n\nBelum ada transaksi bulan ini\\.`;
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

  let report = `📊 *Laporan ${escapeMarkdown(getMonthName(month))} ${year}*\n\n`;
  report += `📥 Pemasukan: *${escapeMarkdown(formatRupiah(totalPemasukan))}*\n`;
  report += `📤 Pengeluaran: *${escapeMarkdown(formatRupiah(totalPengeluaran))}*\n`;
  report += `💰 Saldo: *${escapeMarkdown(formatRupiah(saldo))}*\n`;
  report += `📝 Total transaksi: *${transactions.length}*\n`;

  // Breakdown per kategori
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (sortedCategories.length > 0) {
    report += `\n*Pengeluaran per Kategori:*\n`;
    for (const [cat, total] of sortedCategories) {
      report += `  ${escapeMarkdown(cat)}: ${escapeMarkdown(formatRupiah(total))}\n`;
    }
  }

  return report;
}

/**
 * Laporan hari ini
 */
function dailyReport(transactions) {
  const dateStr = escapeMarkdown(formatDate(new Date()));

  if (transactions.length === 0) {
    return `📅 *Transaksi Hari Ini*\n${dateStr}\n\nBelum ada transaksi hari ini\\.`;
  }

  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  let report = `📅 *Transaksi Hari Ini*\n${dateStr}\n\n`;

  for (const t of transactions) {
    const icon = t.type === 'pemasukan' ? '📥' : '📤';
    const sign = t.type === 'pemasukan' ? '\\+' : '\\-';
    report += `${icon} ${sign}${escapeMarkdown(formatRupiah(t.amount))} \\- ${escapeMarkdown(t.note)}\n`;

    if (t.type === 'pemasukan') {
      totalPemasukan += t.amount;
    } else {
      totalPengeluaran += t.amount;
    }
  }

  report += `\n📥 Pemasukan: *${escapeMarkdown(formatRupiah(totalPemasukan))}*`;
  report += `\n📤 Pengeluaran: *${escapeMarkdown(formatRupiah(totalPengeluaran))}*`;
  report += `\n💰 Net: *${escapeMarkdown(formatRupiah(totalPemasukan - totalPengeluaran))}*`;

  return report;
}

/**
 * Konfirmasi hapus transaksi
 */
function deleteSuccess(data) {
  return `🗑️ *Transaksi terakhir dihapus\\!*

${escapeMarkdown(data.category)} \\- ${escapeMarkdown(formatRupiah(data.amount))}
📌 ${escapeMarkdown(data.note)}`;
}

/**
 * Daftar kategori
 */
function categoryList(categories) {
  let msg = `🏷️ *Daftar Kategori*\n\n`;
  msg += `*Pengeluaran:*\n`;

  for (const cat of categories) {
    if (cat.name !== 'Gaji' && cat.name !== 'Investasi') {
      msg += `${cat.emoji} ${escapeMarkdown(cat.name)}\n`;
    }
  }

  msg += `\n*Pemasukan:*\n`;
  for (const cat of categories) {
    if (cat.name === 'Gaji' || cat.name === 'Investasi') {
      msg += `${cat.emoji} ${escapeMarkdown(cat.name)}\n`;
    }
  }

  msg += `\nKategori otomatis terdeteksi dari pesan kamu\\!`;
  return msg;
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
  transactionSuccess,
  multiTransactionSuccess,
  parseError,
  monthlyReport,
  dailyReport,
  deleteSuccess,
  categoryList,
  escapeMarkdown,
};
