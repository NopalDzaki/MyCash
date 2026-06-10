/**
 * Telegram Bot — Setup dan handler commands/messages
 *
 * Menggunakan Telegraf framework.
 * Semua pesan teks non-command otomatis diproses sebagai transaksi.
 */

const { Telegraf } = require('telegraf');
const { parseMultiTransaction } = require('../parser/transactionParser');
const { getAllCategories } = require('../parser/categoryClassifier');
const { appendTransaction, getTransactions, deleteLastTransaction, isConnected } = require('../sheets/sheetsClient');
const messages = require('./messages');

/**
 * Buat dan konfigurasi bot
 * @param {string} token - Telegram Bot Token
 * @returns {Telegraf}
 */
function createBot(token) {
  const bot = new Telegraf(token);

  // ══════════════════════════════════════════
  // Command Handlers
  // ══════════════════════════════════════════

  // /start — Welcome message
  bot.start((ctx) => {
    ctx.reply(messages.welcomeMessage(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending start message:', err.message);
        ctx.reply('👋 Selamat datang di MyCash! Kirim /help untuk panduan.');
      });
  });

  // /help — Panduan penggunaan
  bot.help((ctx) => {
    ctx.reply(messages.helpMessage(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending help message:', err.message);
        ctx.reply('Kirim pesan dengan nominal dan keterangan. Contoh: "15000 makan di warteg"');
      });
  });

  // /kategori — Daftar kategori
  bot.command('kategori', (ctx) => {
    const categories = getAllCategories();
    ctx.reply(messages.categoryList(categories), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending category list:', err.message);
        const fallback = categories.map((c) => `${c.emoji} ${c.name}`).join('\n');
        ctx.reply(`🏷️ Daftar Kategori:\n\n${fallback}`);
      });
  });

  // /laporan — Ringkasan bulan ini
  bot.command('laporan', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung. Ikuti instruksi di README untuk setup.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();

      // Filter transaksi bulan ini
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      });

      const report = messages.monthlyReport(currentMonth, currentYear, monthTransactions);
      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          // Fallback tanpa markdown
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating report:', error.message);
      ctx.reply('❌ Gagal membuat laporan. Coba lagi nanti.');
    }
  });

  // /hari_ini — Transaksi hari ini
  bot.command('hari_ini', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung. Ikuti instruksi di README untuk setup.');
    }

    try {
      const allTransactions = await getTransactions();

      // Filter transaksi hari ini
      const today = new Date();
      const todayStr = today.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      const todayTransactions = allTransactions.filter((t) => t.date === todayStr);

      const report = messages.dailyReport(todayTransactions);
      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating daily report:', error.message);
      ctx.reply('❌ Gagal membuat laporan hari ini. Coba lagi nanti.');
    }
  });

  // /hapus — Hapus transaksi terakhir
  bot.command('hapus', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const deleted = await deleteLastTransaction();

      if (deleted) {
        ctx.reply(messages.deleteSuccess(deleted), { parse_mode: 'MarkdownV2' })
          .catch(() => {
            ctx.reply(`🗑️ Transaksi terakhir dihapus: ${deleted.note}`);
          });
      } else {
        ctx.reply('📭 Tidak ada transaksi untuk dihapus.');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error.message);
      ctx.reply('❌ Gagal menghapus. Coba lagi nanti.');
    }
  });

  // /status — Cek status koneksi
  bot.command('status', (ctx) => {
    const sheetStatus = isConnected() ? '✅ Terhubung' : '❌ Tidak terhubung';
    ctx.reply(
      `📡 *Status MyCash*\n\n🤖 Bot: ✅ Aktif\n📊 Google Sheets: ${sheetStatus}`,
      { parse_mode: 'Markdown' }
    );
  });

  // ══════════════════════════════════════════
  // Message Handler — Proses transaksi dari pesan biasa
  // ══════════════════════════════════════════

  bot.on('text', async (ctx) => {
    const message = ctx.message.text;

    // Skip jika pesan dimulai dengan '/' (command yang tidak dikenali)
    if (message.startsWith('/')) {
      return ctx.reply('❓ Perintah tidak dikenali. Kirim /help untuk melihat daftar perintah.');
    }

    // Parse transaksi (single atau multi)
    const result = parseMultiTransaction(message);

    if (!result.success) {
      return ctx.reply(messages.parseError(result.error), { parse_mode: 'MarkdownV2' })
        .catch(() => ctx.reply(`❌ ${result.error}`));
    }

    // Simpan semua transaksi ke Google Sheets
    let savedCount = 0;
    for (const r of result.results) {
      if (isConnected()) {
        const saved = await appendTransaction(r.data);
        if (saved) savedCount++;
      }
    }

    const allSaved = savedCount === result.results.length;

    // Kirim konfirmasi
    try {
      if (result.multiple) {
        // Multi-transaksi
        await ctx.reply(
          messages.multiTransactionSuccess(result.results, savedCount, result.results.length),
          { parse_mode: 'MarkdownV2' }
        );
      } else {
        // Single transaksi
        await ctx.reply(
          messages.transactionSuccess(result.results[0].data, allSaved),
          { parse_mode: 'MarkdownV2' }
        );
      }
    } catch (err) {
      // Fallback tanpa markdown
      console.error('Markdown error:', err.message);
      const { formatRupiah } = require('../utils/formatter');
      const lines = ['✅ Tercatat!', ''];
      for (const r of result.results) {
        const d = r.data;
        const icon = d.type === 'pemasukan' ? '📥' : '📤';
        lines.push(`${icon} ${formatRupiah(d.amount)} - ${d.categoryEmoji} ${d.note}`);
      }
      lines.push('', `📅 ${result.results[0].data.date}, ${result.results[0].data.time}`);
      if (!allSaved && isConnected()) {
        lines.push('', '⚠️ Sebagian data belum tersimpan ke Google Sheets');
      }
      await ctx.reply(lines.join('\n'));
    }
  });

  // ══════════════════════════════════════════
  // Error Handler
  // ══════════════════════════════════════════

  bot.catch((err, ctx) => {
    console.error(`❌ Error for ${ctx.updateType}:`, err.message);
  });

  return bot;
}

module.exports = { createBot };
