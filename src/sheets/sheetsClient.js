/**
 * Google Sheets Client — Integrasi penyimpanan data ke Google Sheets
 *
 * Menggunakan Google Sheets API v4 via googleapis.
 * Autentikasi menggunakan Service Account credentials.
 */

const { google } = require('googleapis');

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
    console.warn('⚠️  GOOGLE_SPREADSHEET_ID belum diset di .env');
    console.warn('   Bot akan berjalan tapi data TIDAK akan disimpan ke Google Sheets.');
    console.warn('   Ikuti instruksi di README.md untuk setup Google Sheets.');
    return;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.warn('⚠️  Google Service Account credentials belum lengkap di .env');
    console.warn('   Butuh: GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_PRIVATE_KEY');
    return;
  }

  try {
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

    console.log('✅ Google Sheets terhubung');
  } catch (error) {
    console.error('❌ Gagal menghubungkan Google Sheets:', error.message);
    console.error('   Detail error:', error.stack || error);
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
      console.log('📝 Header row dibuat di Google Sheets');
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
        console.log(`📝 Sheet "${SHEET_NAME}" dibuat dengan header`);
      } catch (createError) {
        console.error('❌ Gagal membuat sheet:', createError.message);
      }
    } else {
      console.error('❌ Error saat cek header:', error.message);
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
    console.warn('⚠️  Google Sheets tidak terhubung, data tidak disimpan');
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

    return true;
  } catch (error) {
    console.error('❌ Gagal menyimpan ke Google Sheets:', error.message);
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
    console.error('❌ Gagal membaca Google Sheets:', error.message);
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

    return {
      date: lastRow[0] || '',
      time: lastRow[1] || '',
      type: (lastRow[2] || '').includes('Pemasukan') ? 'pemasukan' : 'pengeluaran',
      category: lastRow[3] || '',
      amount: parseFloat(lastRow[4]) || 0,
      note: lastRow[5] || '',
    };
  } catch (error) {
    console.error('❌ Gagal menghapus transaksi:', error.message);
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
