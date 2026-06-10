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

// ANSI Colors for console formatting
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Logging Helpers with premium styling
const log = {
  info: (msg) => console.log(`💡 ${colors.cyan}${colors.bold}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`✨ ${colors.green}${colors.bold}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`⚠️ ${colors.yellow}${colors.bold}[WARN]${colors.reset} ${msg}`),
  error: (msg, detail) => console.error(`🚨 ${colors.red}${colors.bold}[ERROR]${colors.reset} ${colors.bold}${msg}${colors.reset}${detail ? `\n   ${colors.red}↳${colors.reset} ${colors.dim}${detail}${colors.reset}` : ''}`),
  system: (msg) => console.log(`⚙️  ${colors.magenta}${colors.bold}[SYSTEM]${colors.reset} ${colors.dim}${msg}${colors.reset}`),
};

async function main() {
  console.log('');
  console.log(`${colors.cyan}${colors.bold}  ╭──────────────────────────────────────────────────╮${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  │${colors.reset}   👑   ${colors.bold}${colors.green}MYCASH FINANCE TRACKER — PREMIUM v1.2.0    ${colors.cyan}${colors.bold}│${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  │${colors.reset}   ⚡   NLP Indonesian Engine Active              ${colors.cyan}${colors.bold}│${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  │${colors.reset}   📊   Synchronized to Google Sheets API          ${colors.cyan}${colors.bold}│${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  │${colors.reset}   😎   Developed with precision by NOPAL GANTENG  ${colors.cyan}${colors.bold}│${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  ╰──────────────────────────────────────────────────╯${colors.reset}`);
  console.log('');

  // Validasi token
  const token = process.env.BOT_TOKEN;
  if (!token) {
    log.error('BOT_TOKEN tidak ditemukan di .env');
    console.error(`   ${colors.yellow}Tambahkan: BOT_TOKEN=your_token_here${colors.reset}\n`);
    process.exit(1);
  }

  // Inisialisasi Google Sheets
  log.system('Menghubungkan ke Google Sheets...');
  await initSheets();

  // Buat bot
  const bot = createBot(token);

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n🛑 ${colors.red}${colors.bold}[SHUTDOWN]${colors.reset} Sinyal ${colors.bold}${signal}${colors.reset} diterima.`);
    log.system('Menghentikan koneksi bot Telegram...');
    bot.stop(signal);
    log.success('Bot berhasil dihentikan dengan aman. Sampai jumpa! 👋\n');
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
            log.error('Gagal menangani update webhook', err.message);
          }
          res.writeHead(200);
          res.end('ok');
        });
      } else if (req.method === 'GET' && req.url === '/') {
        // Health check endpoint
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
      log.info(`HTTP Server berjalan lancar di port: ${colors.bold}${PORT}${colors.reset}`);

      // Set webhook di Telegram
      try {
        log.system('Mengatur Webhook URL di Telegram...');
        await bot.telegram.setWebhook(fullWebhookUrl);
        log.success(`Webhook terdaftar: ${colors.blue}${webhookUrl}/webhook/***${colors.reset}`);
        log.success(`${colors.bold}MyCash Bot siap menerima transaksi! (Webhook Mode)${colors.reset}\n`);
      } catch (err) {
        log.error('Gagal mengatur webhook Telegram', err.message);
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
      log.info(`Health check HTTP server aktif di port: ${colors.bold}${PORT}${colors.reset}`);
    });

    log.system('Meluncurkan bot dalam mode Polling (Development)...');
    await bot.launch();

    log.success(`${colors.bold}MyCash Bot aktif dan siap mendengarkan pesan Telegram!${colors.reset}`);
    console.log(`   ${colors.dim}┌────────────────────────────────────────────────────────┐`);
    console.log(`   │ 👉 Buka Telegram dan kirim pesan transaksi ke bot kamu │`);
    console.log(`   │ 👉 Tekan Ctrl+C untuk mematikan bot secara aman        │`);
    console.log(`   └────────────────────────────────────────────────────────┘${colors.reset}\n`);
  }
}

main().catch((err) => {
  log.error('Fatal error saat menjalankan aplikasi', err);
  process.exit(1);
});
