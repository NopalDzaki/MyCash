/**
 * Amount Parser — Mengekstrak nominal uang dari teks Bahasa Indonesia
 *
 * Mendukung format:
 * - Angka murni: "2000", "15000", "15.000"
 * - Angka + satuan: "15 ribu", "2 juta", "18rb", "1.5jt"
 * - Prefix "se-": "sejuta", "seribu"
 * - "setengah": "setengah juta"
 */

/**
 * Mapping multiplier untuk satuan uang Indonesia
 */
const UNIT_MULTIPLIERS = {
  ribu: 1_000,
  rb: 1_000,
  rbu: 1_000,
  k: 1_000,
  juta: 1_000_000,
  jt: 1_000_000,
  miliar: 1_000_000_000,
  milyar: 1_000_000_000,
  m: 1_000_000_000,
};

/**
 * Normalisasi string angka Indonesia ke number
 * "1.500" → 1500, "1,5" → 1.5
 */
function normalizeNumberString(str) {
  if (!str) return NaN;

  str = str.trim();

  // Cek apakah ada pemisah ribuan Indonesia (titik): "15.000" → "15000"
  // vs desimal "1.5" → 1.5
  // Heuristik: jika setelah titik ada tepat 3 digit, itu pemisah ribuan
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    // Format pemisah ribuan: 1.500 → 1500, 15.000 → 15000
    return parseInt(str.replace(/\./g, ''), 10);
  }

  // Koma sebagai desimal: "1,5" → "1.5"
  str = str.replace(',', '.');

  return parseFloat(str);
}

/**
 * Mengekstrak nominal uang dari teks
 * @param {string} text - Teks input dari user
 * @returns {{ amount: number|null, cleanedText: string }}
 */
function parseAmount(text) {
  if (!text || typeof text !== 'string') {
    return { amount: null, cleanedText: '' };
  }

  let input = text.trim().toLowerCase();
  let amount = null;

  // --- Pattern 1: "setengah juta/ribu" ---
  const halfPattern = /setengah\s*(juta|jt|ribu|rb|rbu|miliar|milyar)/i;
  const halfMatch = input.match(halfPattern);
  if (halfMatch) {
    const unit = halfMatch[1].toLowerCase();
    const multiplier = UNIT_MULTIPLIERS[unit] || 1;
    amount = multiplier / 2;
    const cleanedText = input.replace(halfMatch[0], '').trim();
    return { amount, cleanedText };
  }

  // --- Pattern 2: "sejuta", "seribu" (prefix "se-") ---
  const sePattern = /\bse(juta|jt|ribu|rb|rbu|miliar|milyar)\b/i;
  const seMatch = input.match(sePattern);
  if (seMatch) {
    const unit = seMatch[1].toLowerCase();
    const multiplier = UNIT_MULTIPLIERS[unit] || 1;
    amount = multiplier;
    const cleanedText = input.replace(seMatch[0], '').trim();
    return { amount, cleanedText };
  }

  // --- Pattern 3: Angka + satuan → "15 ribu", "2jt", "1.5 juta", "18rb" ---
  const unitPattern = /(\d+(?:[.,]\d+)?)\s*(ribu|rb|rbu|juta|jt|k|miliar|milyar|m)\b/i;
  const unitMatch = input.match(unitPattern);
  if (unitMatch) {
    const numPart = normalizeNumberString(unitMatch[1]);
    const unit = unitMatch[2].toLowerCase();
    const multiplier = UNIT_MULTIPLIERS[unit] || 1;

    if (!isNaN(numPart)) {
      amount = numPart * multiplier;
      const cleanedText = input.replace(unitMatch[0], '').trim();
      return { amount, cleanedText };
    }
  }

  // --- Pattern 4: Angka murni dengan pemisah ribuan → "15.000", "1.500.000" ---
  const thousandSepPattern = /\b(\d{1,3}(?:\.\d{3})+)\b/;
  const thousandMatch = input.match(thousandSepPattern);
  if (thousandMatch) {
    amount = parseInt(thousandMatch[1].replace(/\./g, ''), 10);
    const cleanedText = input.replace(thousandMatch[0], '').trim();
    return { amount, cleanedText };
  }

  // --- Pattern 5: Angka murni → "2000", "15000", "500" ---
  const plainNumPattern = /\b(\d{3,})\b/;
  const plainMatch = input.match(plainNumPattern);
  if (plainMatch) {
    amount = parseInt(plainMatch[1], 10);
    const cleanedText = input.replace(plainMatch[0], '').trim();
    return { amount, cleanedText };
  }

  // --- Pattern 6: Angka kecil (1-2 digit) sebagai fallback → "50", "25" ---
  const smallNumPattern = /\b(\d{1,2})\b/;
  const smallMatch = input.match(smallNumPattern);
  if (smallMatch) {
    amount = parseInt(smallMatch[1], 10);
    const cleanedText = input.replace(smallMatch[0], '').trim();
    return { amount, cleanedText };
  }

  return { amount: null, cleanedText: input };
}

module.exports = { parseAmount, normalizeNumberString };
