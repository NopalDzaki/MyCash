---
title: MyCash Bot
emoji: 💰
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# 💰 MyCash — Telegram Finance Tracker


Bot Telegram untuk pencatatan keuangan pribadi dengan Natural Language Processing Bahasa Indonesia. Cukup kirim pesan seperti `"15000 makan di warteg"` dan bot akan otomatis mencatat transaksimu ke Google Sheets!

## ✨ Fitur

- 🧠 **NLP Bahasa Indonesia** — Parser cerdas yang memahami format uang Indonesia (ribu, juta, rb, jt, sejuta, dll)
- 📊 **Google Sheets** — Data tersimpan di spreadsheet yang mudah dilihat dan dikelola
- 🏷️ **Auto-kategorisasi** — 12 kategori otomatis terdeteksi dari pesan
- 📥📤 **Pemasukan & Pengeluaran** — Otomatis mendeteksi tipe transaksi
- 📈 **Laporan** — Ringkasan bulanan dan harian langsung di Telegram
- 🗑️ **Hapus transaksi** — Undo transaksi terakhir

## 📱 Contoh Penggunaan

```
User: 2000 buat parkir
Bot:  ✅ Tercatat!
      📤 Pengeluaran
      💰 Rp 2.000
      🏷️ 🚗 Transportasi
      📌 Parkir

User: gajian 2 juta
Bot:  ✅ Tercatat!
      📥 Pemasukan
      💰 Rp 2.000.000
      🏷️ 💰 Gaji
      📌 Gajian

User: beli kopi 18rb
Bot:  ✅ Tercatat!
      📤 Pengeluaran
      💰 Rp 18.000
      🏷️ 🍔 Makan & Minum
      📌 Kopi
```

## 🚀 Setup

### 1. Clone & Install

```bash
cd MyCash
npm install
```

### 2. Setup Google Sheets

#### a. Buat Google Cloud Project
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Cari dan aktifkan **Google Sheets API**

#### b. Buat Service Account
1. Buka **IAM & Admin → Service Accounts**
2. Klik **Create Service Account**
3. Beri nama (misal: `mycash-bot`)
4. Klik **Done**
5. Klik service account yang baru dibuat → tab **Keys**
6. **Add Key → Create new key → JSON**
7. Download file JSON (simpan dengan aman!)

#### c. Buat Spreadsheet
1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru (beri nama: "MyCash")
3. Rename sheet pertama menjadi **"Transaksi"**
4. Catat **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_DISINI/edit
   ```
5. Klik **Share** → masukkan email dari file JSON (`client_email`) → beri akses **Editor**

### 3. Konfigurasi Environment

Edit file `.env`:

```env
BOT_TOKEN=token_bot_telegram_kamu

GOOGLE_SPREADSHEET_ID=spreadsheet_id_dari_url
GOOGLE_SERVICE_ACCOUNT_EMAIL=email_dari_file_json
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nisi_dari_file_json\n-----END PRIVATE KEY-----\n"
```

> **Tips**: Untuk `GOOGLE_PRIVATE_KEY`, copy value `private_key` dari file JSON.
> Pastikan diapit tanda kutip ganda dan `\n` tetap sebagai text (jangan jadi newline).

### 4. Jalankan Bot

```bash
npm start
```

Atau mode development (auto-restart saat file berubah):
```bash
npm run dev
```

## 📋 Commands

| Command | Deskripsi |
|---------|-----------|
| `/start` | Pesan selamat datang & panduan |
| `/help` | Panduan penggunaan lengkap |
| `/laporan` | Ringkasan pengeluaran bulan ini |
| `/hari_ini` | Transaksi hari ini |
| `/hapus` | Hapus transaksi terakhir |
| `/kategori` | Daftar kategori |
| `/status` | Cek status koneksi |

## 🏷️ Kategori

| Kategori | Contoh Keyword |
|----------|---------------|
| 🍔 Makan & Minum | makan, kopi, warteg, mcd, gorengan |
| 🚗 Transportasi | parkir, bensin, grab, gojek, tol |
| 🛒 Belanja | beli, shopee, tokped, supermarket |
| 💊 Kesehatan | obat, dokter, apotek, vitamin |
| 🎮 Hiburan | nonton, netflix, spotify, game |
| 📱 Utilitas | pulsa, internet, listrik, air |
| 🏠 Rumah Tangga | kos, laundry, sabun, galon |
| 📚 Pendidikan | buku, kursus, print, fotocopy |
| 💰 Gaji | gaji, gajian, bonus, thr |
| 📈 Investasi | investasi, saham, crypto |
| 💳 Transfer & Cicilan | transfer, cicilan, bayar hutang |
| 🤝 Sosial | sedekah, donasi, traktir |

## 📁 Struktur Project

```
MyCash/
├── .env                          # Secrets
├── .env.example                  # Template
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── index.js                  # Entry point
    ├── bot/
    │   ├── bot.js                # Bot handlers
    │   └── messages.js           # Response templates
    ├── parser/
    │   ├── amountParser.js       # Parse nominal uang
    │   ├── categoryClassifier.js # Klasifikasi kategori
    │   └── transactionParser.js  # Orchestrator
    ├── sheets/
    │   └── sheetsClient.js       # Google Sheets API
    └── utils/
        └── formatter.js          # Format rupiah, tanggal
```

## 📄 License

MIT
