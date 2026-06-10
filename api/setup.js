require('dotenv').config();
const { createBot } = require('../src/bot/bot');

const bot = createBot(process.env.BOT_TOKEN);

module.exports = async (req, res) => {
  // Dapatkan URL domain saat ini
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const webhookUrl = `${protocol}://${host}/api/webhook`;

  try {
    await bot.telegram.setWebhook(webhookUrl);
    res.status(200).json({
      success: true,
      message: `Webhook Telegram berhasil diset ke: ${webhookUrl}`,
    });
  } catch (error) {
    console.error('❌ Gagal set webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
