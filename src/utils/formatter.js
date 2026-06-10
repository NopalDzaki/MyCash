/**
 * Formatter Utilities — Format angka, tanggal, dan waktu untuk tampilan
 */

/**
 * Format angka menjadi format Rupiah Indonesia
 * @param {number} amount
 * @returns {string} e.g. "Rp 15.000"
 */
function formatRupiah(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';

  const formatted = Math.abs(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `Rp ${formatted}`;
}

/**
 * Format tanggal ke format Indonesia yang readable
 * @param {Date} date
 * @returns {string} e.g. "10 Juni 2026"
 */
function formatDate(date) {
  if (!(date instanceof Date)) date = new Date();

  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: process.env.APP_TZ || 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return formatter.format(date);
}

/**
 * Format waktu ke HH:MM
 * @param {Date} date
 * @returns {string} e.g. "12:59"
 */
function formatTime(date) {
  if (!(date instanceof Date)) date = new Date();

  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: process.env.APP_TZ || 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hour = parts.find((p) => p.type === 'hour').value;
  const minute = parts.find((p) => p.type === 'minute').value;

  return `${hour}:${minute}`;
}

/**
 * Nama bulan Indonesia
 * @param {number} monthIndex - 0-11
 * @returns {string}
 */
function getMonthName(monthIndex) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return months[monthIndex] || '';
}

/**
 * Dapatkan index bulan (0-11) dan tahun dalam timezone tertentu
 * @param {Date} date
 * @returns {{ month: number, year: number }}
 */
function getTzMonthAndYear(date) {
  if (!(date instanceof Date)) date = new Date();
  const tz = process.env.APP_TZ || 'Asia/Jakarta';

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10) - 1;
  const year = parseInt(parts.find((p) => p.type === 'year').value, 10);

  return { month, year };
}

module.exports = { formatRupiah, formatDate, formatTime, getMonthName, getTzMonthAndYear };
