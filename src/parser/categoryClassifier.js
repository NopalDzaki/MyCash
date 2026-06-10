/**
 * Category Classifier — Mengklasifikasikan transaksi berdasarkan keyword
 *
 * Mencocokan kata-kata dalam teks dengan daftar keyword per kategori.
 * Menggunakan sistem skor: kategori dengan keyword terbanyak yang cocok menang.
 */

const CATEGORIES = [
  {
    name: 'Makan & Minum',
    emoji: '🍔',
    keywords: [
      // Umum
      'makan', 'minum', 'jajan', 'ngemil', 'ngopi', 'sarapan', 'brunch',
      'makan siang', 'makan malam', 'snack', 'cemilan', 'camilan', 'kudapan',
      'nongkrong', 'hangout', 'bukber', 'buka puasa', 'sahur',

      // Tempat makan
      'warteg', 'warung', 'cafe', 'kafe', 'restoran', 'resto', 'rumah makan',
      'kantin', 'foodcourt', 'food court', 'kedai', 'depot', 'angkringan',
      'lesehan', 'pedagang kaki lima', 'pkl', 'abang', 'tukang',

      // Fast food & brand
      'mcd', 'mcdonalds', 'kfc', 'starbucks', 'sbux', 'chatime', 'mixue',
      'burger king', 'pizzahut', 'pizza hut', 'hokben', 'yoshinoya',
      'jco', 'dunkin', 'subway', 'wendys', 'dominos', 'aw', 'richeese',
      'solaria', 'bakmi gm', 'es teler', 'janji jiwa', 'kopi kenangan',
      'fore', 'tomoro', 'point coffee', 'excelso', 'anomali',
      'kopken', 'maxx coffee', 'lotteria', 'marugame',

      // Makanan
      'nasi', 'nasi goreng', 'nasgor', 'nasi padang', 'nasi uduk',
      'nasi kuning', 'nasi campur', 'lontong', 'ketoprak', 'gado-gado',
      'baso', 'bakso', 'mie', 'mie ayam', 'indomie', 'mie goreng',
      'soto', 'rawon', 'sop', 'sayur', 'pecel', 'rujak',
      'sate', 'sata', 'ayam', 'ayam goreng', 'ayam bakar', 'ayam geprek',
      'bebek', 'ikan', 'ikan bakar', 'seafood', 'udang', 'cumi', 'kepiting',
      'gorengan', 'tempe', 'tahu', 'pisang goreng', 'bakwan', 'risol',
      'siomay', 'batagor', 'empek-empek', 'pempek', 'cireng', 'cilok',
      'seblak', 'cimol', 'dimsum', 'lumpia', 'pastel', 'pangsit',
      'martabak', 'terang bulan', 'kebab', 'shawarma', 'gyoza',
      'pizza', 'burger', 'hotdog', 'sandwich', 'sushi', 'ramen',
      'bubur', 'bubur ayam', 'nasi tim', 'porridge',
      'rendang', 'gulai', 'opor', 'tongseng', 'tengkleng',
      'lalapan', 'sambal', 'pepes', 'rica-rica', 'bacem',
      'kwetiau', 'bihun', 'capcay', 'fuyunghai',
      'steak', 'wagyu', 'daging', 'beef', 'chicken',

      // Minuman
      'kopi', 'teh', 'es teh', 'es kopi', 'americano', 'latte', 'cappuccino',
      'espresso', 'matcha', 'thai tea', 'boba', 'bubble tea',
      'juice', 'jus', 'smoothie', 'milkshake', 'susu',
      'air mineral', 'aqua', 'cleo', 'pocari', 'yakult', 'teh botol',
      'pop ice', 'nutrisari', 'ale-ale', 'floridina',
      'soda', 'coca cola', 'sprite', 'fanta', 'pepsi',
      'es jeruk', 'es kelapa', 'es campur', 'es dawet', 'es cendol',
      'wedang', 'bajigur', 'bandrek', 'jahe', 'bir', 'beer',

      // Roti & kue
      'roti', 'roti bakar', 'kue', 'donat', 'croissant', 'pastry',
      'brownies', 'cookies', 'cake', 'tart', 'pancake', 'waffle',
      'crepes', 'churros', 'mochi', 'klepon', 'onde-onde', 'serabi',
      'cupcake', 'eclair', 'pudding', 'puding', 'agar', 'dessert',

      // Delivery
      'grabfood', 'gofood', 'shopeefood', 'pesan makan', 'delivery makanan',
      'pesan makanan', 'order makanan', 'delivery',
    ],
  },
  {
    name: 'Transportasi',
    emoji: '🚗',
    keywords: [
      // Kendaraan pribadi
      'parkir', 'bensin', 'bbm', 'pertamax', 'solar', 'pertalite', 'pertamina',
      'shell', 'vpower', 'spbu', 'pom bensin', 'isi bensin', 'ngisi bensin',
      'tanki', 'full tank',

      // Service kendaraan
      'servis', 'service', 'bengkel', 'ganti oli', 'oli', 'tune up',
      'spooring', 'balancing', 'ganti ban', 'ban', 'aki', 'accu',
      'cuci mobil', 'cuci motor', 'steam', 'salon mobil',
      'tambal ban', 'velg', 'knalpot', 'filter', 'kampas rem',
      'perpanjang stnk', 'stnk', 'pajak kendaraan', 'sim', 'perpanjang sim',

      // Ojol & ride-hailing
      'grab', 'gojek', 'ojol', 'ojek', 'gocar', 'grabcar',
      'grabike', 'gobike', 'maxim', 'indriver',
      'taxi', 'taksi', 'bluebird', 'uber',

      // Transportasi umum
      'toll', 'tol', 'e-toll', 'etoll',
      'bus', 'busway', 'kereta', 'kereta api', 'kai',
      'krl', 'commuter', 'commuterline', 'commuter line',
      'mrt', 'lrt', 'transjakarta', 'tj', 'kopaja', 'metromini',
      'angkot', 'angkutan', 'bajaj', 'becak', 'delman',
      'mikrolet', 'bemo', 'pete-pete',

      // Perjalanan jauh
      'kapal', 'ferry', 'feri', 'pesawat', 'tiket pesawat',
      'tiket kereta', 'tiket bus', 'travel', 'agen travel',
      'bandara', 'airport', 'stasiun', 'terminal', 'pelabuhan',
      'ongkir', 'ongkos', 'ongkos kirim', 'transport', 'perjalanan',
      'mudik', 'road trip',
    ],
  },
  {
    name: 'Belanja',
    emoji: '🛒',
    keywords: [
      // Umum
      'beli', 'belanja', 'shopping', 'borong', 'checkout',

      // Online shop
      'shopee', 'tokped', 'tokopedia', 'lazada', 'blibli', 'bukalapak',
      'zalora', 'jd id', 'tiktok shop', 'olshop', 'online shop',
      'cod', 'marketplace', 'flash sale',

      // Toko fisik
      'supermarket', 'minimarket', 'indomaret', 'alfamart', 'alfamidi',
      'giant', 'hypermart', 'carrefour', 'transmart', 'lotte mart',
      'sogo', 'metro', 'matahari', 'ramayana', 'yogya', 'griya',
      'ace hardware', 'ikea', 'courts', 'electronic city',
      'mall', 'toko', 'pasar', 'pasar tradisional',

      // Fashion
      'baju', 'celana', 'sepatu', 'sandal', 'sendal', 'tas', 'dompet',
      'jam', 'jam tangan', 'aksesoris', 'perhiasan', 'kalung', 'gelang', 'cincin',
      'jaket', 'hoodie', 'kaos', 'kemeja', 'rok', 'dress', 'blazer',
      'jilbab', 'hijab', 'kerudung', 'topi', 'kacamata',
      'underwear', 'cd', 'kaos kaki', 'dasi', 'ikat pinggang',
      'sneakers', 'boots', 'heels', 'flatshoes',

      // Elektronik & gadget
      'perabot', 'elektronik', 'gadget', 'hp', 'handphone', 'smartphone',
      'laptop', 'komputer', 'pc', 'tablet', 'ipad',
      'charger', 'kabel', 'earphone', 'headset', 'headphone', 'airpods',
      'mouse', 'keyboard', 'monitor', 'speaker', 'powerbank',
      'case', 'casing', 'screen guard', 'tempered glass',
      'flashdisk', 'ssd', 'hardisk', 'harddisk', 'memory card',
      'printer', 'tinta', 'cartridge', 'router',
      'tv', 'televisi', 'remote', 'kamera', 'gopro', 'drone',

      // Lainnya
      'mainan', 'action figure', 'funko', 'lego',
      'perlengkapan', 'alat', 'perkakas',
    ],
  },
  {
    name: 'Kesehatan',
    emoji: '💊',
    keywords: [
      'obat', 'dokter', 'rumah sakit', 'rs', 'apotek', 'farmasi', 'apotik',
      'vitamin', 'suplemen', 'supplement', 'klinik', 'puskesmas',
      'periksa', 'checkup', 'check up', 'medical check up', 'mcu',
      'rawat', 'rawat jalan', 'rawat inap', 'operasi', 'bedah',
      'gigi', 'dokter gigi', 'tambal gigi', 'cabut gigi', 'behel', 'kawat gigi',
      'mata', 'dokter mata', 'kacamata minus', 'softlens', 'contact lens',
      'lab', 'laboratorium', 'tes kesehatan', 'tes darah', 'rontgen', 'usg',
      'bpjs', 'asuransi kesehatan', 'klaim asuransi',
      'fisioterapi', 'terapi', 'rehabilitasi', 'psikolog', 'psikiater',
      'igd', 'ugd', 'ambulan', 'ambulans',
      'flu', 'batuk', 'demam', 'sakit', 'pilek', 'pusing', 'migrain',
      'antibiotik', 'paracetamol', 'antimo', 'betadine', 'hansaplast',
      'masker medis', 'sarung tangan', 'hand sanitizer', 'disinfektan',
      'vaksin', 'imunisasi', 'booster', 'pcr', 'antigen', 'swab',
    ],
  },
  {
    name: 'Perawatan Diri',
    emoji: '💇',
    keywords: [
      // Rambut
      'potong rambut', 'cukur', 'cukur rambut', 'pangkas', 'pangkas rambut',
      'barbershop', 'barber', 'salon', 'hair salon', 'creambath',
      'smoothing', 'rebonding', 'keratin', 'cat rambut', 'warna rambut',
      'blow', 'styling', 'hair dryer', 'gunting rambut',

      // Kecantikan & skincare
      'skincare', 'skin care', 'facial', 'facewash', 'face wash',
      'sunscreen', 'sunblock', 'moisturizer', 'serum', 'toner', 'cleanser',
      'masker wajah', 'sheet mask', 'lip balm', 'lipstick',
      'makeup', 'make up', 'foundation', 'concealer', 'bedak', 'blush on',
      'mascara', 'eyeliner', 'eyebrow', 'alis',
      'parfum', 'perfume', 'cologne', 'deodorant', 'deo',
      'body lotion', 'body butter', 'hand cream', 'body wash',
      'spa', 'massage', 'pijat', 'pijit', 'urut', 'refleksi',
      'manicure', 'pedicure', 'nail art', 'kuku',
      'waxing', 'laser', 'peeling', 'treatment',
      'lulur', 'scrub', 'body scrub',

      // Perlengkapan mandi
      'sikat gigi', 'pasta gigi', 'shampo', 'shampoo', 'conditioner',
      'sabun muka', 'sabun mandi',
    ],
  },
  {
    name: 'Hiburan',
    emoji: '🎮',
    keywords: [
      // Film & streaming
      'nonton', 'bioskop', 'cinema', 'xxi', 'cgv', 'cinepolis',
      'film', 'movie', 'series', 'drakor', 'anime', 'drama',
      'netflix', 'disney+', 'disney plus', 'hbo', 'prime video', 'amazon',
      'viu', 'vidio', 'wetv', 'iqiyi', 'crunchyroll',

      // Musik
      'spotify', 'apple music', 'joox', 'youtube music', 'deezer',
      'konser', 'concert', 'live music', 'festival', 'musik',
      'gitar', 'piano', 'drum', 'alat musik',

      // Gaming
      'game', 'gaming', 'ps5', 'ps4', 'playstation', 'xbox', 'nintendo', 'switch',
      'steam', 'epic games', 'topup game', 'top up game', 'top up',
      'diamond', 'skin', 'battlepass', 'battle pass',
      'mobile legend', 'ml', 'pubg', 'ff', 'free fire', 'genshin',
      'valorant', 'dota', 'csgo',

      // Langganan
      'langganan', 'subscribe', 'subscription', 'subs', 'membership', 'member',
      'premium', 'berlangganan',

      // Rekreasi
      'wisata', 'liburan', 'rekreasi', 'piknik', 'jalan-jalan', 'jalanjalan',
      'traveling', 'travelling', 'vacation', 'holiday',
      'hotel', 'resort', 'villa', 'airbnb', 'penginapan', 'hostel',
      'taman', 'kebun binatang', 'waterboom', 'waterpark', 'dufan',
      'ancol', 'taman mini', 'museum', 'gallery',
      'pantai', 'gunung', 'camping', 'glamping', 'hiking', 'snorkeling',
      'diving', 'rafting', 'outbound',

      // Hiburan lain
      'event', 'acara', 'karaoke', 'ktv', 'happy hour',
      'bowling', 'billiard', 'biliar', 'golf', 'futsal',
      'gym', 'fitness', 'renang', 'kolam renang', 'badminton', 'basket',
      'tenis', 'jogging', 'yoga', 'zumba', 'olahraga', 'sport',
    ],
  },
  {
    name: 'Utilitas',
    emoji: '📱',
    keywords: [
      // Komunikasi
      'pulsa', 'paket data', 'internet', 'wifi', 'data', 'kuota',
      'telepon', 'telpon', 'nelpon', 'nelp', 'sms',
      'telkom', 'indihome', 'biznet', 'firstmedia', 'first media',
      'xl', 'telkomsel', 'indosat', 'tri', 'smartfren', 'by.u', 'byu',

      // Listrik & air
      'listrik', 'pln', 'token listrik', 'bayar listrik',
      'air', 'pdam', 'bayar air', 'air pam',

      // Gas
      'gas pipa', 'pgn',

      // Tagihan
      'tagihan', 'bill', 'iuran', 'bayar tagihan',
      'tv kabel', 'tv berlangganan', 'indovision', 'transvision',
    ],
  },
  {
    name: 'Rumah Tangga',
    emoji: '🏠',
    keywords: [
      // Tempat tinggal
      'kos', 'kost', 'ngekos', 'kontrakan', 'ngontrak', 'kontrak',
      'sewa', 'sewa rumah', 'sewa apartemen', 'rent',
      'apartemen', 'apartment', 'rusun',
      'ipl', 'maintenance fee', 'biaya maintenance',

      // Laundry
      'laundry', 'cuci baju', 'cuci', 'setrika', 'dry clean',

      // Kebersihan rumah
      'sabun', 'sabun cuci', 'deterjen', 'detergent', 'pewangi',
      'softener', 'pelembut', 'pemutih', 'bayclin',
      'pembersih', 'karbol', 'wipol', 'super pell', 'mr muscle',
      'sapu', 'pel', 'ember', 'kain lap', 'sponge', 'spons',
      'tisu', 'tissue', 'tisu basah', 'tisu kering',
      'plastik', 'kantong sampah', 'kresek', 'aluminium foil',

      // Dapur
      'gas', 'galon', 'air galon', 'lpg', 'tabung gas', 'isi ulang gas',
      'aqua galon', 'isi ulang galon',
      'bumbu', 'minyak goreng', 'minyak', 'gula', 'garam', 'tepung',
      'telur', 'beras', 'sayur', 'buah', 'daging mentah',
      'kecap', 'saos', 'saus', 'sambal', 'vetsin', 'micin', 'penyedap',

      // Peralatan rumah
      'piring', 'gelas', 'sendok', 'garpu', 'pisau',
      'wajan', 'panci', 'kompor', 'kulkas', 'mesin cuci',
      'setrikaan', 'vacuum', 'dispenser', 'rice cooker', 'blender',
      'rak', 'lemari', 'meja', 'kursi', 'kasur', 'bantal', 'guling',
      'seprai', 'sprei', 'selimut', 'handuk',

      // Perlengkapan mandi (yang basic)
      'odol', 'pasta gigi',
    ],
  },
  {
    name: 'Pendidikan',
    emoji: '📚',
    keywords: [
      'buku', 'novel', 'komik', 'majalah', 'koran',
      'kursus', 'course', 'les', 'les privat', 'bimbel', 'bimbingan belajar',
      'pelatihan', 'training', 'bootcamp', 'mentoring',
      'seminar', 'webinar', 'workshop', 'konferensi', 'conference',
      'spp', 'ukt', 'kuliah', 'sekolah', 'tugas', 'ujian', 'uas', 'uts',
      'wisuda', 'graduation', 'toga', 'ijazah', 'transkrip',
      'print', 'ngeprint', 'fotocopy', 'fotokopi', 'jilid', 'binding',
      'atk', 'alat tulis', 'pensil', 'pulpen', 'penghapus', 'penggaris',
      'binder', 'map', 'amplop', 'kertas', 'hvs',
      'kalkulator', 'scientific calculator',
      'udemy', 'coursera', 'skillshare', 'duolingo', 'ruangguru', 'zenius',
      'perpustakaan', 'ebook', 'kindle',
      'skripsi', 'tesis', 'disertasi', 'jurnal', 'penelitian',
    ],
  },
  {
    name: 'Gaji',
    emoji: '💰',
    keywords: [
      'gaji', 'gajian', 'salary', 'upah', 'honor', 'honorarium',
      'thr', 'bonus kerja', 'lembur', 'overtime',
      'freelance', 'side job', 'part time', 'side hustle',
      'komisi', 'fee', 'bayaran', 'imbalan',
      'uang saku', 'allowance', 'tunjangan',
      'pesangon', 'severance',
    ],
  },
  {
    name: 'Investasi',
    emoji: '📈',
    keywords: [
      'investasi', 'invest', 'nabung saham',
      'saham', 'stock', 'idx', 'ihsg',
      'reksadana', 'reksa dana', 'mutual fund',
      'crypto', 'cryptocurrency', 'bitcoin', 'btc', 'eth', 'ethereum',
      'nft', 'defi', 'staking', 'mining',
      'dividen', 'dividend',
      'deposito', 'obligasi', 'sbn', 'ori', 'sukuk', 'surat utang',
      'emas', 'gold', 'logam mulia', 'antam',
      'trading', 'forex', 'valas',
      'p2p', 'peer to peer', 'p2p lending',
      'ajaib', 'bibit', 'bareksa', 'stockbit', 'pluang', 'pintu', 'indodax',
      'tabungan', 'menabung', 'nabung',
    ],
  },
  {
    name: 'Transfer & Cicilan',
    emoji: '💳',
    keywords: [
      'transfer', 'tf', 'kirim uang', 'kirim',
      'pinjam', 'pinjaman', 'pinjol', 'pinjaman online',
      'hutang', 'utang', 'ngutang', 'minjem', 'bayar hutang', 'bayar utang',
      'bayar', 'pembayaran', 'lunas', 'pelunasan',
      'cicilan', 'cicil', 'angsuran', 'kredit', 'tenor',
      'kartu kredit', 'cc', 'credit card',
      'kpr', 'kpa', 'kredit motor', 'kredit mobil',
      'paylater', 'pay later', 'shopee paylater', 'gopay paylater',
      'akulaku', 'kredivo', 'home credit',
      'tarik tunai', 'gestun', 'gesek tunai',
      'admin', 'biaya admin', 'biaya transfer',
    ],
  },
  {
    name: 'Sosial',
    emoji: '🤝',
    keywords: [
      'sedekah', 'infaq', 'infak', 'zakat', 'fitrah', 'zakat fitrah',
      'donasi', 'sumbangan', 'amal', 'charity',
      'traktir', 'treat', 'mentraktir', 'ditraktir',
      'patungan', 'urunan', 'iuran bersama',
      'arisan', 'kas', 'kas rt', 'iuran rt',
      'kado', 'hadiah', 'gift', 'souvenir', 'bunga', 'bucket',
      'oleh-oleh', 'oleh oleh', 'buah tangan',
      'kondangan', 'nikahan', 'wedding', 'amplop nikah',
      'melayat', 'duka', 'santunan',
      'ultah', 'ulang tahun', 'birthday',
      'salam tempel', 'angpao', 'ang pao',
    ],
  },
  {
    name: 'Hewan Peliharaan',
    emoji: '🐾',
    keywords: [
      'kucing', 'anjing', 'ikan', 'burung', 'hamster', 'kelinci',
      'peliharaan', 'pet', 'pet shop', 'petshop',
      'makanan kucing', 'makanan anjing', 'cat food', 'dog food',
      'whiskas', 'royal canin', 'meo', 'pedigree', 'proplan',
      'pasir kucing', 'litter', 'kandang', 'sangkar', 'akuarium',
      'vaksin hewan', 'dokter hewan', 'vet', 'veteriner', 'grooming',
    ],
  },
];

/**
 * Klasifikasikan teks ke kategori yang paling sesuai
 * @param {string} text - Teks yang sudah dibersihkan
 * @returns {{ name: string, emoji: string }}
 */
function classifyCategory(text) {
  if (!text || typeof text !== 'string') {
    return { name: 'Lainnya', emoji: '❓' };
  }

  const input = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const category of CATEGORIES) {
    let score = 0;

    for (const keyword of category.keywords) {
      // Cek apakah keyword ada di input
      // Gunakan word boundary untuk keyword satu kata,
      // dan simple includes untuk keyword multi-kata
      if (keyword.includes(' ')) {
        if (input.includes(keyword)) {
          score += 2; // Bonus untuk multi-word match (lebih spesifik)
        }
      } else {
        // Word boundary check — pastikan "makan" cocok tapi tidak cocok sebagian dari kata lain
        const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i');
        if (regex.test(input)) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  if (bestMatch) {
    return { name: bestMatch.name, emoji: bestMatch.emoji };
  }

  return { name: 'Lainnya', emoji: '❓' };
}

/**
 * Dapatkan semua kategori yang tersedia
 * @returns {Array<{ name: string, emoji: string }>}
 */
function getAllCategories() {
  return CATEGORIES.map((c) => ({ name: c.name, emoji: c.emoji }));
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { classifyCategory, getAllCategories, CATEGORIES };
