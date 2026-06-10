/**
 * Test expanded NLP — pastikan kata-kata sehari-hari terdeteksi
 */

const { parseMultiTransaction } = require('./parser/transactionParser');
const { formatRupiah } = require('./utils/formatter');

const testCases = [
  // Perawatan Diri (BARU!)
  'potong rambut 50000',
  'cukur 30rb',
  'facial 150rb',
  'skincare 200rb',
  'salon 100rb',
  'pijat 80rb',

  // Makan expanded
  'nasgor 15rb',
  'ayam geprek 20rb',
  'seblak 12rb',
  'martabak 35rb',
  'boba 25rb',
  'steak 150rb',

  // Transportasi expanded
  'ganti oli 150rb',
  'servis motor 200rb',
  'gocar 45rb',
  'perpanjang stnk 500rb',

  // Belanja expanded
  'beli charger 100rb',
  'hoodie 250rb',
  'beli hp 3jt',

  // Hiburan expanded  
  'top up game 50rb',
  'nonton cgv 50rb',
  'gym 300rb',
  'hotel 500rb',

  // Gaji expanded
  'uang saku 500rb',
  'freelance 2jt',
  'komisi 1jt',

  // Sosial expanded
  'kondangan 200rb',
  'ultah 100rb',

  // Hewan (BARU!)
  'makanan kucing 50rb',
  'grooming 100rb',

  // Multi transaksi  
  'potong rambut 50rb dan makan 20rb',
  'parkir 5rb, bensin 50rb, makan 25rb',
  'gajian 5jt dan bayar kos 1.5jt dan makan 30rb',
];

console.log('═══════════════════════════════════════════════════════');
console.log('     🧪 Expanded NLP — Test Results');
console.log('═══════════════════════════════════════════════════════\n');

let passed = 0;
let lainnya = 0;

for (const msg of testCases) {
  const result = parseMultiTransaction(msg);

  if (result.success) {
    for (const r of result.results) {
      const d = r.data;
      const icon = d.type === 'pemasukan' ? '📥' : '📤';
      const status = d.category === 'Lainnya' ? '⚠️' : '✅';
      if (d.category === 'Lainnya') lainnya++;
      else passed++;
      console.log(`${status} "${msg.length > 40 ? msg.substring(0, 37) + '...' : msg}"`);
      console.log(`   ${icon} ${formatRupiah(d.amount)} | ${d.categoryEmoji} ${d.category} | 📌 ${d.note}`);
    }
  } else {
    console.log(`❌ "${msg}" → ${result.error}`);
  }
  console.log('');
}

console.log('═══════════════════════════════════════════════════════');
console.log(`✅ Terklasifikasi: ${passed} | ⚠️ Lainnya: ${lainnya}`);
console.log('═══════════════════════════════════════════════════════');
