# RuangTenang — pembaruan booking

Buka `index.html` di browser. Letakkan `index.html`, `style.css`, dan `script.js` di folder yang sama. Ketiganya menggantikan file situs lama dengan nama yang sesuai. Bagian halaman lain dipertahankan.

## Yang berubah

- Form dua langkah: pilih paket, tanggal, dan jam; lalu isi nama dan topik.
- Kalender mini dengan navigasi bulan, penanda hari ini, tanggal terpilih, dan tanggal yang tidak tersedia.
- Jam sesi mengikuti tanggal dan paket: 60 menit untuk sesi tunggal / sesi pertama paket 4 sesi, 90 menit untuk konseling pasangan.
- Tanggal dan jam yang sudah lewat tidak dapat dipilih, menggunakan waktu Asia/Jakarta (WIB), termasuk bila perangkat memakai zona waktu lain.
- Ringkasan jadwal dan pesan WhatsApp mencantumkan tanggal, jam mulai–selesai, paket, dan topik.
- Tampilan mengikuti warna teal, putih, dan aksen kuning pada situs; mendukung layar ponsel dan penggunaan keyboard.

## Pengaturan jadwal

Pengaturan ada pada `bookingConfig` di `script.js`:

- `maxAdvanceDays`: jangkauan kalender, bawaan 60 hari dari hari ini.
- `weeklyHours`: jam operasional per hari; 0 = Minggu, 1 = Senin, sampai 6 = Sabtu. Nilai bawaan mengikuti footer situs: setiap hari 08.00–21.00 WIB. Gunakan array kosong untuk hari tutup.
- `closedDates`: daftar tanggal libur dengan format YYYY-MM-DD.
- `dateOverrides`: objek tanggal YYYY-MM-DD dengan daftar jam mulai HH:mm yang diberikan admin. Array kosong menutup tanggal tersebut. Slot yang melebihi jam operasional atau durasi sesi otomatis diabaikan.
- `WA_NUMBER`: nomor WhatsApp admin yang sudah ada pada situs.

Jangan memasukkan data klien ke konfigurasi publik. Data ketersediaan sebaiknya berupa tanggal dan jam saja.

## Batas fungsi

Sumber asli tidak memiliki API, database jadwal, atau data okupansi psikolog. Karena itu kalender menampilkan waktu yang **bisa diajukan berdasarkan jam layanan**, bukan klaim ketersediaan psikolog secara langsung. Tidak ada status penuh atau jumlah sisa slot yang dibuat-buat. Admin perlu mengonfirmasi permintaan WhatsApp. Fitur ini belum mengunci slot, menyimpan booking, atau mencegah dua orang meminta waktu yang sama; fungsi tersebut memerlukan layanan backend dan data jadwal aktual.

Pilihan tanggal untuk paket 4 sesi berlaku untuk sesi pertama; sesi berikutnya diatur dengan admin.
