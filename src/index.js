/**
 * MyCash — Entry Point
 *
 * Pencatatan keuangan pribadi via Telegram Bot
 * dengan NLP Bahasa Indonesia & Google Sheets
 *
 * Mendukung 2 mode:
 * - Polling (lokal / development) — default
 * - Webhook (production / Render.com) — set WEBHOOK_URL di env
 */

require('dotenv').config();

const http = require('http');
const { createBot } = require('./bot/bot');
const { initSheets } = require('./sheets/sheetsClient');

const PORT = process.env.PORT || 3000;

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║      💰 MyCash - Finance Tracker      ║');
  console.log('║    Telegram Bot × Google Sheets       ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');

  // Validasi token
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error('❌ BOT_TOKEN tidak ditemukan di .env');
    console.error('   Tambahkan: BOT_TOKEN=your_token_here');
    process.exit(1);
  }

  // Inisialisasi Google Sheets
  console.log('📊 Menghubungkan ke Google Sheets...');
  await initSheets();
  console.log('');

  // Buat bot
  const bot = createBot(token);

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} diterima. Mematikan bot...`);
    bot.stop(signal);
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  // Pilih mode: Webhook atau Polling
  const webhookUrl = process.env.WEBHOOK_URL;

  if (webhookUrl) {
    // ══════════════════════════════════════
    // Mode WEBHOOK (untuk Render / production)
    // ══════════════════════════════════════
    const webhookPath = `/webhook/${token}`;
    const fullWebhookUrl = `${webhookUrl}${webhookPath}`;

    // Buat HTTP server sederhana untuk menerima webhook
    const server = http.createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === webhookPath) {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const update = JSON.parse(body);
            await bot.handleUpdate(update);
          } catch (err) {
            console.error('Error handling update:', err.message);
          }
          res.writeHead(200);
          res.end('ok');
        });
      } else if (req.method === 'GET' && req.url === '/') {
        // Health check endpoint (Render butuh ini)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          bot: 'MyCash Finance Tracker',
          uptime: process.uptime(),
        }));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, async () => {
      console.log(`🌐 Server berjalan di port ${PORT}`);

      // Set webhook di Telegram
      try {
        await bot.telegram.setWebhook(fullWebhookUrl);
        console.log(`🔗 Webhook diset ke: ${webhookUrl}/webhook/***`);
        console.log('✅ MyCash bot aktif (Webhook mode)!\n');
      } catch (err) {
        console.error('❌ Gagal set webhook:', err.message);
      }
    });

  } else {
    // ══════════════════════════════════════
    // Mode POLLING (untuk lokal / development)
    // ══════════════════════════════════════

    // Tetap buat HTTP server sederhana supaya bisa health check
    const server = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          bot: 'MyCash Finance Tracker',
          mode: 'polling',
          uptime: process.uptime(),
        }));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, () => {
      console.log(`🌐 Health check server di port ${PORT}`);
    });

    console.log('🤖 Menjalankan bot (Polling mode)...');
    await bot.launch();

    console.log('✅ MyCash bot aktif dan siap menerima pesan!');
    console.log('   Buka Telegram dan kirim pesan ke bot kamu.');
    console.log('   Tekan Ctrl+C untuk berhenti.\n');
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
