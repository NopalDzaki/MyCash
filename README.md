# 💰 MyCash — Telegram Finance Tracker

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-v4-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegraf.js.org/)
[![Google Sheets API](https://img.shields.io/badge/Google_Sheets-v4-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)](https://developers.google.com/sheets/api)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Catat keuangan gak pake ribet. Tinggal chat, sat-set langsung rekap di Google Sheets! 💸⚡**

</div>

---

## ✨ Kenapa MyCash Kece Parah?

*   🧠 **NLP Bahasa Indonesia (No Cap!)** — Bot pinter yang ngerti bahasa sehari-hari. Mulai dari `"15rb buat ngopi"`, `"gajian 2.5 juta"`, `"sejutabeli baju"`, sampai `"setengah juta gas bensin"`.
*   📊 **Google Sheets Integration** — Gak perlu buka app keuangan ribet. Semua data otomatis masuk spreadsheet secara real-time. Rapih & siap diekspor!
*   🏷️ **Smart Categorization** — Sistem auto-detect kategori berbasis keyword. Ada 12 kategori yang siap nge-track pengeluaran & pemasukan lo.
*   📥📤 **Auto Type Detection** — Otomatis misahin mana pengeluaran (expense) mana pemasukan (income) tanpa lo perlu set manual.
*   📈 **Instant Reports** — Pengen tahu pengeluaran bulan ini atau rekap hari ini? Tinggal panggil `/laporan` atau `/hari_ini`, beres!
*   🗑️ **Quick Undo** — Typo pas nulis transaksi? Santai, ketik `/hapus` buat ngebatalin transaksi terakhir secara instant.

---

## 📱 Contoh Penggunaan (Interactive Demo)

```text
🧑‍💻 User : 25rb makan bakso
🤖 Bot  : ✅ Tercatat!
          📤 Pengeluaran
          💰 Rp 25.000
          🏷️ 🍔 Makan & Minum
          📌 Makan bakso
          📅 10 Juni 2026, 15:00

🧑‍💻 User : gajian 3 juta
🤖 Bot  : ✅ Tercatat!
          📥 Pemasukan
          💰 Rp 3.000.000
          🏷️ 💰 Gaji
          📌 Gajian
          📅 10 Juni 2026, 15:01

🧑‍💻 User : 50rb bensin & beli kuota 100k
🤖 Bot  : ✅ 2 transaksi tercatat!
          📤 Rp 50.000 - 🚗 Bensin
          📤 Rp 100.000 - 📱 Beli kuota
          💰 Total: Rp 150.000
```

---

## 🚀 Setup & Deployment

### 1. Clone & Install Dependencies
Clone repository ini terus pasang module yang dibutuhin:
```bash
git clone https://github.com/username/MyCash.git
cd MyCash
npm install
```

### 2. Setup Google Sheets & Service Account
Biar bot bisa nulis ke Google Sheets lo, ikutin langkah simpel ini:
1.  **Google Cloud Project**: Buka [Google Cloud Console](https://console.cloud.google.com/), buat project, dan aktifkan **Google Sheets API**.
2.  **Service Account**: Masuk ke menu **IAM & Admin -> Service Accounts**, buat account baru, lalu buat key baru dengan format **JSON**. Simpan file tersebut.
3.  **Share Spreadsheet**: Buat Google Spreadsheet baru. Share spreadsheet tersebut ke email service account yang ada di file JSON tadi (`client_email`) dengan akses sebagai **Editor**.
4.  **Spreadsheet ID**: Ambil ID dari URL spreadsheet lo:
    ```text
    https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_ADA_DISINI/edit
    ```

### 3. Setup Environment Variables
Bikin file `.env` di root directory (bisa salin dari `.env.example`) terus isi key berikut:
```env
BOT_TOKEN=token_bot_telegram_lo

GOOGLE_SPREADSHEET_ID=spreadsheet_id_dari_url
GOOGLE_SERVICE_ACCOUNT_EMAIL=email_dari_file_json
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nisi_private_key_dari_file_json\n-----END PRIVATE KEY-----\n"
```
> 💡 **Pro Tip**: Pas copas `GOOGLE_PRIVATE_KEY`, pastiin diapit tanda kutip ganda dan karakter `\n` jangan diubah jadi baris baru (biarin tetep sebagai string `\n`).

### 4. Running Locally
Jalanin bot di mode development biar auto-restart pas ada perubahan kode:
```bash
npm run dev
```
Atau jalanin di mode production:
```bash
npm start
```

---

## ☁️ Deployment (Serverless via Vercel)

Aplikasi ini udah dikonfigurasi untuk siap dideploy secara serverless ke **Vercel**:
1. Deploy project ke Vercel via CLI atau dashboard github.
2. Tambahkan semua Environment Variables di atas ke dashboard Vercel.
3. Panggil endpoint setup untuk ngeset webhook Telegram secara otomatis:
   ```text
   https://domain-vercel-lo.vercel.app/api/setup
   ```
4. Selesai! Webhook aktif dan bot siap merespon instant.

---

## 📋 Command List (Cheat Sheet)

| Command | Shortcut Kece | Fungsi |
| :--- | :--- | :--- |
| `/start` | 🚀 Start | Pesan selamat datang & panduan dasar |
| `/help` | 📖 Help | Panduan lengkap cara nulis format transaksi |
| `/laporan` | 📊 Laporan | Ringkasan pengeluaran & pemasukan bulan ini |
| `/hari_ini` | 📅 Hari Ini | Rekap semua pengeluaran & pemasukan hari ini |
| `/hapus` | 🗑️ Hapus | Nge-delete / undo transaksi terakhir di sheet |
| `/kategori`| 🏷️ Kategori | Nampilin daftar kategori yang didukung bot |
| `/status`  | 📡 Status | Cek koneksi bot ke Google Sheets |

---

## 🏷️ Kategori & Kata Kunci Otomatis

MyCash bakal otomatis nge-grup transaksi lo ke kategori berikut pas nemu keyword terkait:

| Kategori | Emoji | Contoh Keyword Pemicu |
| :--- | :---: | :--- |
| **Makan & Minum** | 🍔 | makan, ngopi, jajan, warteg, mcd, bakso, jus, kopi |
| **Transportasi** | 🚗 | bensin, parkir, gojek, grab, tol, tiket kereta, ojol |
| **Belanja** | 🛒 | beli, shopee, tokped, baju, kaos, sepatu, supermarket |
| **Kesehatan** | 💊 | obat, dokter, apotek, vitamin, bpjs, sakit, periksa |
| **Perawatan Diri** | 💇 | potong rambut, salon, skincare, parfum, pijat |
| **Hiburan** | 🎮 | netflix, spotify, game, bioskop, konser, topup, liburan |
| **Utilitas** | 📱 | pulsa, kuota, internet, wifi, listrik, token, pdam |
| **Rumah Tangga** | 🏠 | kos, laundry, sabun, galon, beras, kompor, sprei |
| **Pendidikan** | 📚 | buku, kursus, spp, print, fotocopy, alat tulis, skripsi |
| **Gaji** | 💰 | gaji, gajian, bonus, thr, freelance, upah |
| **Investasi** | 📈 | investasi, saham, crypto, emas, bibit, reksadana |
| **Sosial** | 🤝 | sedekah, donasi, traktir, kondangan, kado, patungan |

---

## 📂 Struktur Project

```text
MyCash/
├── api/
│   ├── setup.js                  # Setup webhook Telegram di Vercel
│   └── webhook.js                # Serverless webhook handler
├── src/
│   ├── index.js                  # Local/Render entry point
│   ├── bot/
│   │   ├── bot.js                # Bot routing & command handlers
│   │   └── messages.js           # Rich emoji response templates
│   ├── parser/
│   │   ├── amountParser.js       # Parser nominal (NLP)
│   │   ├── categoryClassifier.js # Klasifikasi kategori otomatis
│   │   └── transactionParser.js  # Main transaction parser orchestrator
│   ├── sheets/
│   │   └── sheetsClient.js       # Google Sheets API client
│   └── utils/
│       └── formatter.js          # Helper format rupiah & tanggal
├── .env.example
├── vercel.json                   # Vercel routing configuration
├── package.json
└── README.md
```

---

## 📄 License

Project ini berlisensi **MIT**. Feel free to fork, customize, and share! 🚀
