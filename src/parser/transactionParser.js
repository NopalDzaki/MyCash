/**
 * Transaction Parser — Orchestrator utama untuk memproses pesan user
 *
 * Menggabungkan:
 * - amountParser: ekstrak nominal uang
 * - categoryClassifier: klasifikasi kategori
 * - Deteksi tipe transaksi (pemasukan/pengeluaran)
 * - Ekstrak catatan/deskripsi
 */

const { parseAmount } = require('./amountParser');
const { classifyCategory } = require('./categoryClassifier');

/**
 * Kata-kata yang mengindikasikan pemasukan (income)
 */
const INCOME_KEYWORDS = [
  'gaji', 'gajian', 'salary', 'terima', 'diterima', 'dapat', 'dapet', 'nerima',
  'bonus', 'refund', 'cashback', 'cash back', 'kembalian',
  'dividen', 'untung', 'profit', 'penghasilan', 'pendapatan', 'revenue',
  'thr', 'honor', 'honorarium', 'lembur', 'overtime',
  'hadiah', 'menang', 'jualan', 'jual', 'laku',
  'masuk', 'pemasukan', 'income', 'uang masuk',
  'freelance', 'side job', 'part time',
  'komisi', 'fee', 'bayaran', 'imbalan', 'upah',
  'uang saku', 'kiriman', 'dikirim', 'transferan',
  'cair', 'pencairan', 'nyampe', 'sampai',
  'balik modal', 'return',
];

/**
 * Kata-kata "noise" yang tidak perlu disertakan di catatan
 */
const NOISE_WORDS = [
  'buat', 'untuk', 'utk', 'bayar', 'abis', 'habis',
  'barusan', 'baru', 'aja', 'saja', 'tadi', 'kemarin',
  'di', 'ke', 'dari', 'yang', 'dan', 'sama', 'ama',
  'udah', 'sudah', 'lagi', 'juga', 'nih', 'dong', 'deh', 'sih',
  'rp', 'rupiah', 'idr',
];

/**
 * Deteksi apakah transaksi adalah pemasukan
 * @param {string} text
 * @returns {boolean}
 */
function isIncome(text) {
  const input = text.toLowerCase();
  return INCOME_KEYWORDS.some((keyword) => {
    if (keyword.includes(' ')) {
      return input.includes(keyword);
    }
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(input);
  });
}

/**
 * Bersihkan teks menjadi catatan yang rapi
 * Hapus noise words di awal, bersihkan spasi berlebih
 * @param {string} text
 * @returns {string}
 */
function cleanNote(text) {
  if (!text) return '';

  let note = text.trim().toLowerCase();

  // Hapus noise words di awal kalimat
  let changed = true;
  while (changed) {
    changed = false;
    for (const word of NOISE_WORDS) {
      const pattern = new RegExp(`^${word}\\s+`, 'i');
      if (pattern.test(note)) {
        note = note.replace(pattern, '');
        changed = true;
      }
    }
  }

  // Hapus tanda baca berlebih di awal/akhir
  note = note.replace(/^[\s,.\-:;]+|[\s,.\-:;]+$/g, '');

  // Capitalize first letter
  if (note.length > 0) {
    note = note.charAt(0).toUpperCase() + note.slice(1);
  }

  return note;
}

/**
 * Parse pesan user menjadi objek transaksi (single)
 * @param {string} message - Pesan mentah dari user
 * @param {string} [fullOriginalMessage] - Pesan asli lengkap (untuk multi-transaksi)
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
function parseTransaction(message, fullOriginalMessage) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      success: false,
      error: 'Pesan kosong. Kirim pesan seperti: "15000 makan di warteg"',
    };
  }

  const originalMessage = message.trim();

  // Step 1: Parse nominal
  const { amount, cleanedText } = parseAmount(originalMessage);

  if (!amount || amount <= 0) {
    return {
      success: false,
      error: 'Tidak bisa mendeteksi nominal. Pastikan ada angka di pesan kamu.\n\nContoh: "15000 makan di warteg" atau "2 juta gaji"',
    };
  }

  // Step 2: Deteksi tipe transaksi
  const type = isIncome(originalMessage) ? 'pemasukan' : 'pengeluaran';
  const typeEmoji = type === 'pemasukan' ? '📥' : '📤';

  // Step 3: Klasifikasi kategori (gunakan teks asli untuk keyword matching yang lebih akurat)
  const category = classifyCategory(originalMessage);

  // Step 4: Bersihkan catatan
  const note = cleanNote(cleanedText) || cleanNote(originalMessage);

  // Step 5: Timestamp
  const now = new Date();

  return {
    success: true,
    data: {
      amount,
      type,
      typeEmoji,
      category: category.name,
      categoryEmoji: category.emoji,
      note: note || '-',
      originalMessage: fullOriginalMessage || originalMessage,
      date: now.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: process.env.APP_TZ || 'Asia/Jakarta',
      }),
      time: now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: process.env.APP_TZ || 'Asia/Jakarta',
      }),
      timestamp: now.toISOString(),
    },
  };
}

/**
 * Cek apakah pesan mengandung multi-transaksi
 * Delimiter: "dan", "&", ","
 * Hanya dianggap multi jika setiap bagian punya angka
 * @param {string} message
 * @returns {string[]} array of parts, atau [message] jika single
 */
function splitMultiTransaction(message) {
  // Split by " dan ", " & ", ", " (dengan spasi di sekitar)
  // Gunakan regex yang menangkap delimiter
  const parts = message.split(/\s+dan\s+|(?:,\s*)|(?:\s*&\s*)/i);

  // Filter: hanya valid jika setiap bagian punya angka
  const validParts = parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Cek setiap bagian punya angka
  const allHaveNumbers = validParts.length > 1 &&
    validParts.every((p) => /\d/.test(p));

  if (allHaveNumbers) {
    return validParts;
  }

  return [message];
}

/**
 * Parse pesan user — mendukung single atau multi-transaksi
 * Contoh multi: "potong rambut 50000 dan makan 20000"
 * @param {string} message - Pesan mentah dari user
 * @returns {{ success: boolean, multiple: boolean, results: Array, error?: string }}
 */
function parseMultiTransaction(message) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      success: false,
      multiple: false,
      results: [],
      error: 'Pesan kosong. Kirim pesan seperti: "15000 makan di warteg"',
    };
  }

  const originalMessage = message.trim();
  const parts = splitMultiTransaction(originalMessage);

  if (parts.length === 1) {
    // Single transaction
    const result = parseTransaction(parts[0]);
    return {
      success: result.success,
      multiple: false,
      results: result.success ? [result] : [],
      error: result.error,
    };
  }

  // Multi transaction
  const results = [];
  const errors = [];

  for (const part of parts) {
    const result = parseTransaction(part, originalMessage);
    if (result.success) {
      results.push(result);
    } else {
      errors.push(`"${part}": ${result.error}`);
    }
  }

  if (results.length === 0) {
    return {
      success: false,
      multiple: true,
      results: [],
      error: 'Tidak bisa memproses transaksi:\n' + errors.join('\n'),
    };
  }

  return {
    success: true,
    multiple: true,
    results,
    error: errors.length > 0 ? errors.join('\n') : undefined,
  };
}

module.exports = { parseTransaction, parseMultiTransaction, isIncome, cleanNote };

