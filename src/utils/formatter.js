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

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format waktu ke HH:MM
 * @param {Date} date
 * @returns {string} e.g. "12:59"
 */
function formatTime(date) {
  if (!(date instanceof Date)) date = new Date();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
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

module.exports = { formatRupiah, formatDate, formatTime, getMonthName };
