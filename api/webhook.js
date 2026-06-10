require('dotenv').config();
const { createBot } = require('../src/bot/bot');
const { initSheets } = require('../src/sheets/sheetsClient');

// Inisialisasi bot
const bot = createBot(process.env.BOT_TOKEN);

// Flag inisialisasi Google Sheets
let isSheetsInitialized = false;

module.exports = async (req, res) => {
  // Hanya menerima request POST (webhook dari Telegram)
  if (req.method === 'POST') {
    try {
      if (!isSheetsInitialized) {
        await initSheets();
        isSheetsInitialized = true;
      }

      // Proses update dari Telegram
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Error di webhook handler:', error);
      res.status(500).send(`Error: ${error.message}`);
    }
  } else {
    // GET request (Health Check)
    res.status(200).json({
      status: 'ok',
      bot: 'MyCash Finance Tracker',
      message: 'Vercel Serverless Webhook aktif. Kirim POST untuk update Telegram.',
      uptime: process.uptime()
    });
  }
};
