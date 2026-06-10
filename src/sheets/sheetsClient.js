/**
 * Google Sheets Client — Integrasi penyimpanan data ke Google Sheets
 *
 * Menggunakan Google Sheets API v4 via googleapis.
 * Autentikasi menggunakan Service Account credentials.
 */

const { google } = require('googleapis');
const { formatRupiah } = require('../utils/formatter');

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
};

// Logging Helpers with premium styling
const log = {
  info: (msg) => console.log(`💡 ${colors.cyan}${colors.bold}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`✨ ${colors.green}${colors.bold}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`⚠️ ${colors.yellow}${colors.bold}[WARN]${colors.reset} ${msg}`),
  error: (msg, detail) => console.error(`🚨 ${colors.red}${colors.bold}[ERROR]${colors.reset} ${colors.bold}${msg}${colors.reset}${detail ? `\n   ${colors.red}↳${colors.reset} ${colors.dim}${detail}${colors.reset}` : ''}`),
  db: (msg) => console.log(`📂 ${colors.magenta}${colors.bold}[DATABASE]${colors.reset} ${msg}`),
};

const SHEET_NAME = 'Transaksi';
const HEADER_ROW = [
  'Tanggal',
  'Waktu',
  'Tipe',
  'Kategori',
  'Nominal',
  'Catatan',
  'Pesan Asli',
  'Timestamp',
];

let sheetsInstance = null;
let spreadsheetId = null;

/**
 * Inisialisasi Google Sheets client
 * @returns {Promise<void>}
 */
async function initSheets() {
  spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!spreadsheetId) {
    log.warn('GOOGLE_SPREADSHEET_ID tidak terdeteksi pada konfigurasi .env');
    console.warn(`   ${colors.yellow}⚠️  [PENTING] Bot tetap aktif tetapi transaksi TIDAK akan tersinkronisasi ke Google Sheets.${colors.reset}`);
    console.warn(`   ${colors.dim}👉 Ikuti panduan instalasi di README.md untuk menyambungkan Google Sheets.${colors.reset}\n`);
    return;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    log.warn('Kredensial Google Service Account tidak lengkap di .env');
    console.warn(`   ${colors.yellow}⚠️  [PENTING] Butuh variabel: GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY di .env${colors.reset}`);
    console.warn(`   ${colors.dim}👉 Jalankan bot lokal atau verifikasi konfigurasi serverless Anda.${colors.reset}\n`);
    return;
  }

  try {
    // Bersihkan tanda kutip pembungkus jika ada (sering terjadi saat diset via dashboard Vercel)
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1);
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    sheetsInstance = google.sheets({ version: 'v4', auth: authClient });

    // Cek dan buat header jika sheet kosong
    await ensureHeaders();

    log.success('Google Sheets Client berhasil tersambung secara real-time!');
  } catch (error) {
    log.error('Gagal menginisialisasi koneksi ke Google Sheets', error.message);
    if (error.stack) {
      console.error(`${colors.red}Stack trace:${colors.reset}\n${colors.dim}${error.stack}${colors.reset}`);
    }
    sheetsInstance = null;
  }
}

/**
 * Pastikan sheet punya header row
 */
async function ensureHeaders() {
  if (!sheetsInstance || !spreadsheetId) return;

  try {
    // Coba baca baris pertama
    const response = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:H1`,
    });

    const rows = response.data.values;

    // Jika kosong, tulis header
    if (!rows || rows.length === 0) {
      await sheetsInstance.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A1:H1`,
        valueInputOption: 'RAW',
        resource: {
          values: [HEADER_ROW],
        },
      });
      log.db(`Kolom header utama [A1:H1] berhasil didaftarkan di sheet "${SHEET_NAME}".`);
    }
  } catch (error) {
    // Sheet mungkin belum ada, coba buat
    if (error.message.includes('Unable to parse range')) {
      try {
        // Tambah sheet baru bernama 'Transaksi'
        await sheetsInstance.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: SHEET_NAME,
                  },
                },
              },
            ],
          },
        });

        // Tulis header
        await sheetsInstance.spreadsheets.values.update({
          spreadsheetId,
          range: `${SHEET_NAME}!A1:H1`,
          valueInputOption: 'RAW',
          resource: {
            values: [HEADER_ROW],
          },
        });
        log.db(`Sheet baru "${SHEET_NAME}" sukses di-generate lengkap dengan kolom header.`);
      } catch (createError) {
        log.error('Gagal membuat sheet baru', createError.message);
      }
    } else {
      log.error('Error saat memeriksa header sheet', error.message);
    }
  }
}

/**
 * Simpan transaksi ke Google Sheets
 * @param {object} data - Data transaksi dari parser
 * @returns {Promise<boolean>} success
 */
async function appendTransaction(data) {
  if (!sheetsInstance || !spreadsheetId) {
    log.warn('Google Sheets tidak terhubung, melewati penyimpanan data');
    return false;
  }

  try {
    const row = [
      data.date,
      data.time,
      data.type === 'pemasukan' ? '📥 Pemasukan' : '📤 Pengeluaran',
      `${data.categoryEmoji} ${data.category}`,
      data.amount,
      data.note,
      data.originalMessage,
      data.timestamp,
    ];

    await sheetsInstance.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [row],
      },
    });

    const changeColor = data.type === 'pemasukan' ? colors.green : colors.red;
    const sign = data.type === 'pemasukan' ? '+' : '-';
    log.db(`Transaksi dicatat: ${changeColor}${colors.bold}${sign}${formatRupiah(data.amount)}${colors.reset} | Kategori: ${colors.bold}${data.categoryEmoji} ${data.category}${colors.reset} | Deskripsi: "${data.note}"`);
    return true;
  } catch (error) {
    log.error('Gagal menyimpan transaksi ke Google Sheets', error.message);
    return false;
  }
}

/**
 * Ambil semua transaksi dari Google Sheets
 * @returns {Promise<Array>} array of transaction objects
 */
async function getTransactions() {
  if (!sheetsInstance || !spreadsheetId) {
    return [];
  }

  try {
    const response = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:H`,
    });

    const rows = response.data.values || [];

    return rows.map((row) => ({
      date: row[0] || '',
      time: row[1] || '',
      type: (row[2] || '').includes('Pemasukan') ? 'pemasukan' : 'pengeluaran',
      category: row[3] || '',
      amount: parseFloat(row[4]) || 0,
      note: row[5] || '',
      originalMessage: row[6] || '',
      timestamp: row[7] || '',
    }));
  } catch (error) {
    log.error('Gagal membaca data dari Google Sheets', error.message);
    return [];
  }
}

/**
 * Hapus baris terakhir (transaksi terakhir)
 * @returns {Promise<object|null>} data transaksi yang dihapus, atau null
 */
async function deleteLastTransaction() {
  if (!sheetsInstance || !spreadsheetId) {
    return null;
  }

  try {
    // Ambil semua data untuk tahu baris terakhir
    const response = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:H`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return null; // Hanya header, tidak ada data
    }

    const lastRow = rows[rows.length - 1];
    const lastRowIndex = rows.length; // 1-indexed

    // Dapatkan sheet ID
    const sheetMeta = await sheetsInstance.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    });

    const sheet = sheetMeta.data.sheets.find(
      (s) => s.properties.title === SHEET_NAME
    );

    if (!sheet) return null;

    const sheetId = sheet.properties.sheetId;

    // Hapus baris terakhir
    await sheetsInstance.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: lastRowIndex - 1, // 0-indexed
                endIndex: lastRowIndex,
              },
            },
          },
        ],
      },
    });

    log.db(`Transaksi terakhir di baris #${lastRowIndex} sukses dibatalkan & dihapus dari Google Sheets.`);
    return {
      date: lastRow[0] || '',
      time: lastRow[1] || '',
      type: (lastRow[2] || '').includes('Pemasukan') ? 'pemasukan' : 'pengeluaran',
      category: lastRow[3] || '',
      amount: parseFloat(lastRow[4]) || 0,
      note: lastRow[5] || '',
    };
  } catch (error) {
    log.error('Gagal menghapus baris transaksi terakhir', error.message);
    return null;
  }
}

/**
 * Cek apakah Google Sheets terhubung
 * @returns {boolean}
 */
function isConnected() {
  return sheetsInstance !== null && spreadsheetId !== null;
}

module.exports = {
  initSheets,
  appendTransaction,
  getTransactions,
  deleteLastTransaction,
  isConnected,
};
