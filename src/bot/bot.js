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
const { getTzMonthAndYear } = require('../utils/formatter');

/**
 * Buat dan konfigurasi bot
 * @param {string} token - Telegram Bot Token
 * @returns {Telegraf}
 */
function createBot(token) {
  const bot = new Telegraf(token);

  // Daftarkan menu perintah ke Telegram agar muncul di dropdown "/"
  bot.telegram.setMyCommands([
    { command: 'menu', description: '🛠️ Menu utama & daftar perintah' },
    { command: 'help', description: '📖 Panduan format input lengkap' },
    { command: 'hari_ini', description: '📅 Transaksi hari ini' },
    { command: 'minggu_ini', description: '🗓️ Transaksi 7 hari terakhir' },
    { command: 'laporan', description: '📊 Laporan keuangan bulan ini' },
    { command: 'bulan_lalu', description: '🗓️ Laporan keuangan bulan lalu' },
    { command: 'analisis', description: '📈 Analisis keuangan mendalam' },
    { command: 'kategori', description: '🏷️ Daftar kategori transaksi' },
    { command: 'dompet', description: '💰 Cek sisa saldo & total kas' },
    { command: 'grafik', description: '📊 Visualisasi pengeluaran (Bar Chart)' },
    { command: 'pemasukan', description: '📥 Riwayat pemasukan bulan ini' },
    { command: 'pengeluaran', description: '📤 Riwayat pengeluaran bulan ini' },
    { command: 'sisa_hari', description: '💡 Rekomendasi belanja harian' },
    { command: 'tips', description: '💡 Tips keuangan acak' },
    { command: 'quotes', description: '💬 Quotes bijak tentang uang' },
    { command: 'tentang', description: '🤖 Tentang MyCash & Developer' },
    { command: 'hapus', description: '🗑️ Hapus transaksi terakhir' },
    { command: 'batal', description: '↩️ Batalkan transaksi terakhir' },
    { command: 'cari', description: '🔍 Cari riwayat transaksi' },
    { command: 'ekspor', description: '📂 Link spreadsheet database' },
    { command: 'status', description: '📡 Cek koneksi bot & database' },
    { command: 'ping', description: '🏓 Cek latensi respon server' },
  ]).catch((err) => {
    console.error('Gagal mendaftarkan menu perintah ke Telegram:', err.message);
  });

  // ══════════════════════════════════════════
  // Command Handlers
  // ══════════════════════════════════════════

  // /start — Welcome message
  bot.start((ctx) => {
    ctx.reply(messages.welcomeMessage(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending start message:', err.message);
        ctx.reply('👋 Selamat datang di MyCash! Kirim /menu untuk melihat semua perintah.');
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

  // /bantuan — Alias untuk /help
  bot.command('bantuan', (ctx) => {
    ctx.reply(messages.helpMessage(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending bantuan message:', err.message);
      });
  });

  // /menu /commands — Daftar semua perintah
  bot.command(['menu', 'commands'], (ctx) => {
    ctx.reply(messages.commandsMenu(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending commands menu:', err.message);
        ctx.reply('Gagal memuat menu perintah. Silakan gunakan /help.');
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
      const { month: currentMonth, year: currentYear } = getTzMonthAndYear(now);

      const monthTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === currentMonth && tYear === currentYear;
      });

      const report = messages.monthlyReport(currentMonth, currentYear, monthTransactions);
      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
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
        timeZone: process.env.APP_TZ || 'Asia/Jakarta',
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

  // /minggu_ini — Transaksi minggu ini (7 hari terakhir)
  bot.command('minggu_ini', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung. Ikuti instruksi di README untuk setup.');
    }

    try {
      const allTransactions = await getTransactions();

      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      const weeklyTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        return tDate >= sevenDaysAgo && tDate <= now;
      });

      const report = messages.weeklyReport(weeklyTransactions);
      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating weekly report:', error.message);
      ctx.reply('❌ Gagal membuat laporan mingguan. Coba lagi nanti.');
    }
  });

  // /cari <teks> — Cari riwayat transaksi
  bot.command('cari', async (ctx) => {
    const messageText = ctx.message.text || '';
    const query = messageText.substring(5).trim(); // Menghapus prefix "/cari"

    if (!query) {
      return ctx.reply(
        '🔍 *Pencarian Transaksi*\n───────────────────\nFormat salah Kak\\. Gunakan: \`/cari <keterangan>\`\nContoh: \`/cari kopi\` atau \`/cari bensin\`',
        { parse_mode: 'MarkdownV2' }
      );
    }

    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const allTransactions = await getTransactions();
      const queryLower = query.toLowerCase();

      const foundTransactions = allTransactions.filter((t) => {
        const noteMatch = (t.note || '').toLowerCase().includes(queryLower);
        const catMatch = (t.category || '').toLowerCase().includes(queryLower);
        const origMatch = (t.originalMessage || '').toLowerCase().includes(queryLower);
        return noteMatch || catMatch || origMatch;
      });

      const report = messages.searchResult(query, foundTransactions);
      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error searching transactions:', error.message);
      ctx.reply('❌ Gagal mencari riwayat transaksi. Coba lagi nanti.');
    }
  });

  // /analisis /stats — Analisis keuangan mendalam
  bot.command(['analisis', 'stats'], async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();

      const { month: currentMonth, year: currentYear } = getTzMonthAndYear(now);

      const monthTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === currentMonth && tYear === currentYear;
      });

      const report = messages.financialAnalysis(currentMonth, currentYear, monthTransactions);
      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating analysis report:', error.message);
      ctx.reply('❌ Gagal membuat analisis finansial. Coba lagi nanti.');
    }
  });

  // /ekspor — Link Google Sheets spreadsheet
  bot.command('ekspor', (ctx) => {
    const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
    ctx.reply(messages.exportLink(sheetId), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending export link:', err.message);
        ctx.reply('❌ Gagal mengambil link ekspor. Coba lagi nanti.');
      });
  });

  // /tips — Tips keuangan harian acak
  bot.command('tips', (ctx) => {
    ctx.reply(messages.financeTips(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending tips:', err.message);
        ctx.reply('💡 Kelola cashflow keuanganmu dengan bijak!');
      });
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
    const sheetStatus = isConnected() ? '✅ *Terhubung*' : '❌ *Tidak terhubung*';
    ctx.reply(
      `📡 *STATUS KONEKSI MYCASH*\n───────────────────\n🤖 Status Bot: ✅ *Aktif*\n📊 Google Sheets: ${sheetStatus}\n🌐 Mode: \`${process.env.WEBHOOK_URL ? 'Webhook' : 'Polling'}\`\n\n_Semua transaksi siap dicatat\\!_`,
      { parse_mode: 'MarkdownV2' }
    ).catch(() => {
      ctx.reply(`📡 Status MyCash:\n\n🤖 Bot: Aktif\n📊 Google Sheets: ${isConnected() ? 'Terhubung' : 'Tidak terhubung'}`);
    });
  });

  // /ping — Cek latensi dan status server
  bot.command('ping', (ctx) => {
    const latency = Date.now() - (ctx.message.date * 1000);
    ctx.reply(
      `🏓 *Pong\\!*\n╭─────────────────────────────\n│ ⚡ Latensi: \`${latency}ms\`\n│ 🔋 Uptime: \`${Math.round(process.uptime())}s\`\n│ 🤖 Status: \`Aktif & Siap\`\n╰─────────────────────────────\n_Semua sistem beroperasi normal\\._`,
      { parse_mode: 'MarkdownV2' }
    ).catch((err) => {
      console.error('Error sending ping:', err.message);
      ctx.reply('🏓 Pong! Bot aktif.');
    });
  });

  // /dompet /saldo /sisa — Sisa saldo dan status kas
  bot.command(['dompet', 'saldo', 'sisa'], async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();
      const { month: currentMonth, year: currentYear } = getTzMonthAndYear(now);

      const monthTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === currentMonth && tYear === currentYear;
      });

      let totalIncome = 0;
      let totalExpense = 0;
      for (const t of monthTransactions) {
        if (t.type === 'pemasukan') totalIncome += t.amount;
        else totalExpense += t.amount;
      }
      const balance = totalIncome - totalExpense;

      const report = messages.walletStatus(
        getMonthName(currentMonth),
        currentYear,
        totalIncome,
        totalExpense,
        balance
      );

      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating wallet report:', error.message);
      ctx.reply('❌ Gagal memeriksa saldo. Coba lagi nanti.');
    }
  });

  // /grafik /chart — Visualisasi pengeluaran bulanan
  bot.command(['grafik', 'chart'], async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();
      const { month: currentMonth, year: currentYear } = getTzMonthAndYear(now);

      const monthTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === currentMonth && tYear === currentYear;
      });

      let totalExpense = 0;
      const categoryTotals = {};
      for (const t of monthTransactions) {
        if (t.type === 'pengeluaran') {
          totalExpense += t.amount;
          const cat = t.category || '❓ Lainnya';
          categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
        }
      }

      const report = messages.textBarChart(categoryTotals, totalExpense);

      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating graphic chart:', error.message);
      ctx.reply('❌ Gagal membuat grafik. Coba lagi nanti.');
    }
  });

  // /pemasukan — Daftar pemasukan bulan ini
  bot.command('pemasukan', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();
      const { month: currentMonth, year: currentYear } = getTzMonthAndYear(now);

      const monthIncomes = allTransactions.filter((t) => {
        if (!t.timestamp || t.type !== 'pemasukan') return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === currentMonth && tYear === currentYear;
      });

      const report = messages.transactionList('pemasukan', getMonthName(currentMonth), monthIncomes);

      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating income list:', error.message);
      ctx.reply('❌ Gagal memuat daftar pemasukan. Coba lagi nanti.');
    }
  });

  // /pengeluaran — Daftar pengeluaran bulan ini
  bot.command('pengeluaran', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();
      const { month: currentMonth, year: currentYear } = getTzMonthAndYear(now);

      const monthExpenses = allTransactions.filter((t) => {
        if (!t.timestamp || t.type !== 'pengeluaran') return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === currentMonth && tYear === currentYear;
      });

      const report = messages.transactionList('pengeluaran', getMonthName(currentMonth), monthExpenses);

      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating expense list:', error.message);
      ctx.reply('❌ Gagal memuat daftar pengeluaran. Coba lagi nanti.');
    }
  });

  // /bulan_lalu — Laporan keuangan bulan lalu
  bot.command('bulan_lalu', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();
      
      let { month: targetMonth, year: targetYear } = getTzMonthAndYear(now);
      
      // Kurangi 1 bulan
      if (targetMonth === 0) {
        targetMonth = 11;
        targetYear -= 1;
      } else {
        targetMonth -= 1;
      }

      const monthTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === targetMonth && tYear === targetYear;
      });

      const report = messages.monthlyReport(targetMonth, targetYear, monthTransactions, true);
      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating previous month report:', error.message);
      ctx.reply('❌ Gagal membuat laporan bulan lalu. Coba lagi nanti.');
    }
  });

  // /sisa_hari — Rekomendasi belanja harian
  bot.command('sisa_hari', async (ctx) => {
    if (!isConnected()) {
      return ctx.reply('⚠️ Google Sheets belum terhubung.');
    }

    try {
      const now = new Date();
      const allTransactions = await getTransactions();
      const { month: currentMonth, year: currentYear } = getTzMonthAndYear(now);

      const monthTransactions = allTransactions.filter((t) => {
        if (!t.timestamp) return false;
        const tDate = new Date(t.timestamp);
        const { month: tMonth, year: tYear } = getTzMonthAndYear(tDate);
        return tMonth === currentMonth && tYear === currentYear;
      });

      let totalIncome = 0;
      let totalExpense = 0;
      let daysMap = new Set();
      for (const t of monthTransactions) {
        if (t.date) daysMap.add(t.date);
        if (t.type === 'pemasukan') totalIncome += t.amount;
        else totalExpense += t.amount;
      }

      // Hitung sisa hari
      const tz = process.env.APP_TZ || 'Asia/Jakarta';
      const tzDateString = now.toLocaleDateString('en-US', { timeZone: tz });
      const tzDate = new Date(tzDateString);
      const lastDayOfMonth = new Date(tzDate.getFullYear(), tzDate.getMonth() + 1, 0).getDate();
      const currentDay = tzDate.getDate();
      const daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);

      // Sisa anggaran = Pemasukan - Pengeluaran
      const remainingAmount = totalIncome - totalExpense;
      const numDays = daysMap.size || 1;
      const avgDailyExpense = totalExpense / numDays;

      const report = messages.dailyBudgetRecommendation(daysRemaining, remainingAmount, avgDailyExpense);

      ctx.reply(report, { parse_mode: 'MarkdownV2' })
        .catch(() => {
          ctx.reply(report.replace(/[\\*_`\[\]()~>#+\-=|{}.!]/g, ''));
        });
    } catch (error) {
      console.error('Error generating daily budget recommendation:', error.message);
      ctx.reply('❌ Gagal menghitung rekomendasi harian. Coba lagi nanti.');
    }
  });

  // /quotes /quote — Kata bijak finansial
  bot.command(['quotes', 'quote'], (ctx) => {
    ctx.reply(messages.randomQuote(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending quote:', err.message);
        ctx.reply('💡 Uang yang disimpan hari ini adalah kebebasan hari esok.');
      });
  });

  // /tentang /about — Informasi bot & pengembang
  bot.command(['tentang', 'about'], (ctx) => {
    ctx.reply(messages.aboutBot(), { parse_mode: 'MarkdownV2' })
      .catch((err) => {
        console.error('Error sending about info:', err.message);
        ctx.reply('🤖 MyCash Premium Edition. Dikembangkan oleh Nopal Ganteng.');
      });
  });

  // /batal — Alias untuk /hapus (hapus transaksi terakhir)
  bot.command('batal', async (ctx) => {
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
      console.error('Error deleting transaction via alias:', error.message);
      ctx.reply('❌ Gagal menghapus. Coba lagi nanti.');
    }
  });

  // ══════════════════════════════════════════
  // Message Handler — Proses transaksi dari pesan biasa
  // ══════════════════════════════════════════

  bot.on('text', async (ctx) => {
    const message = ctx.message.text;

    // Skip jika pesan dimulai dengan '/' (command yang tidak dikenali)
    if (message.startsWith('/')) {
      return ctx.reply(
        '❓ *Perintah tidak dikenali\\.*\n───────────────────\nKetik /menu untuk melihat daftar perintah yang tersedia Kak\\.',
        { parse_mode: 'MarkdownV2' }
      ).catch(() => ctx.reply('❓ Perintah tidak dikenali. Kirim /menu untuk melihat daftar perintah.'));
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
