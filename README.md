# Travel Agent App

Proof of Concept fitur agent ai untuk travel planning.

## 🚀 Fitur Utama

- **Pencarian Terintegrasi**: Cari penerbangan, hotel, dan aktivitas di satu tempat.
- **Manajemen Perjalanan**: Buat dan kelola rencana perjalanan Anda dengan mudah.
- **Pemesanan**: Lakukan pemesanan untuk berbagai layanan perjalanan.
- **Profil Pengguna**: Kelola profil, preferensi, dan riwayat pemesanan Anda.
- **Asisten AI**: Dapatkan bantuan dan rekomendasi dari asisten chat cerdas.
- **Antarmuka Modern**: Desain yang bersih dan responsif dibangun dengan Next.js dan Tailwind CSS.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **AI & Chat**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)

## ⚙️ Alur Kerja Aplikasi

Berikut adalah alur penggunaan aplikasi dari sudut pandang pengguna, mulai dari perencanaan hingga selesai memesan:

1.  **Inspirasi dan Pencarian Awal**

    - Pengguna mengunjungi halaman utama, di mana mereka dapat melihat destinasi populer atau langsung menggunakan fitur pencarian.
    - Pengguna memasukkan tujuan, tanggal perjalanan, dan jumlah orang pada bar pencarian. Mereka bisa memilih untuk mencari penerbangan, hotel, atau aktivitas secara spesifik.
    - Sebagai alternatif, pengguna dapat berinteraksi dengan **Asisten AI** untuk memulai pencarian dengan bahasa natural, seperti _"Carikan penerbangan ke Bali untuk 2 orang akhir pekan ini"_.

2.  **Menjelajahi dan Memfilter Hasil**

    - Aplikasi menampilkan hasil pencarian dalam bentuk kartu yang mudah dibaca.
    - Pengguna dapat menggunakan berbagai filter (seperti rentang harga, rating, maskapai, atau fasilitas hotel) untuk menyaring dan menemukan pilihan yang paling sesuai dengan kebutuhan mereka.
    - Dengan mengklik salah satu kartu, pengguna akan diarahkan ke halaman detail untuk melihat informasi lebih lengkap, termasuk galeri foto, ulasan, dan lokasi di peta.

3.  **Membuat dan Mengelola Rencana Perjalanan**

    - Jika pengguna menemukan beberapa pilihan menarik, mereka dapat membuat sebuah **"Rencana Perjalanan"** baru (misalnya, "Liburan ke Lombok").
    - Dari setiap halaman detail, pengguna dapat menambahkan penerbangan, hotel, atau aktivitas yang mereka inginkan ke dalam rencana perjalanan tersebut. Ini berfungsi seperti keranjang belanja atau _itinerary_ sementara.

4.  **Finalisasi dan Checkout**

    - Pengguna menavigasi ke halaman **"Perjalanan Saya"** untuk meninjau semua item yang telah mereka kumpulkan.
    - Di sini, mereka dapat membandingkan pilihan, menghapus item yang tidak diinginkan, dan memastikan semuanya sudah sesuai.
    - Setelah yakin, pengguna melanjutkan ke proses **checkout** untuk melakukan pemesanan.

5.  **Proses Pemesanan**

    - Dalam alur checkout, pengguna akan diminta mengisi data diri penumpang atau tamu.
    - Selanjutnya, mereka memilih metode pembayaran yang diinginkan.
    - Setelah meninjau ringkasan pesanan untuk terakhir kalinya, pengguna menyelesaikan transaksi.

6.  **Manajemen Pasca-Pemesanan**
    - Setelah pembayaran berhasil, pengguna akan menerima konfirmasi melalui email beserta e-tiket atau voucher.
    - Semua perjalanan yang telah dipesan akan tersimpan dan dapat diakses kembali melalui halaman **Profil Pengguna**, memudahkan mereka untuk mengelola dan melihat detail pemesanan kapan saja.

## 📈 Progres Saat Ini

Proyek ini telah memiliki struktur dasar dan komponen UI untuk sebagian besar fitur utama. Berikut adalah rincian progresnya:

- **Struktur Halaman**: Sebagian besar rute dan halaman telah dibuat, termasuk untuk pencarian, detail item, perjalanan, checkout, dan profil.
- **Komponen UI**: Komponen inti seperti `Navbar`, `Card` untuk berbagai item (Penerbangan, Hotel, dll.), dan form pemesanan telah dikembangkan.
- **Backend & Database**: Skema database (`prisma/schema.prisma`) telah didefinisikan dengan model untuk `User`, `Trip`, `Booking`, `Flight`, `Hotel`, dan `Activity`. Koneksi database menggunakan Prisma.
- **Fitur AI**: Integrasi dasar untuk chat AI sudah ada (`app/api/chat/route.ts`), memanfaatkan Vercel AI SDK.
- **Fungsionalitas**:
  - ✅ Tampilan halaman utama dan pencarian.
  - ✅ Tampilan halaman detail untuk item perjalanan.
  - ✅ Struktur dasar untuk manajemen perjalanan dan profil pengguna.
  - 🟡 Logika bisnis untuk pemesanan dan checkout masih dalam pengembangan.
  - 🟡 Fungsionalitas penuh asisten AI masih dalam pengembangan.

## 📦 Instalasi & Menjalankan Proyek

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1.  **Clone repository:**

    ```bash
    git clone https://github.com/MuhammadRizki8/travel-agent-app.git
    cd travel-agent-app
    ```

2.  **Install dependensi:**

    ```bash
    npm install
    ```

3.  **Setup Database:**

    - Pastikan Anda memiliki PostgreSQL yang berjalan.
    - Buat file `.env` di root proyek dan tambahkan URL koneksi database Anda:

      ````
      DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
      # Travel Agent App

      Sebuah aplikasi demo untuk merencanakan dan memesan perjalanan (pencarian penerbangan, hotel, aktivitas, dan manajemen itinerary).

      Ringkas
      - Bahasa: TypeScript
      - Framework: Next.js (App Router)
      - UI: Tailwind CSS + shadcn/ui
      - Database: Prisma (PostgreSQL)

      Quick start

      1. Install dependencies

      ```powershell
      npm install
      ````

      2. Siapkan environment

      - Buat file `.env` di root dan atur `DATABASE_URL`.

      3. (Opsional) Migrasi & seed

      ```powershell
      npx prisma migrate dev
      npx prisma db seed
      ```

      4. Jalankan development server

      ```powershell
      npm run dev
      ```

      Kumpulan singkat file penting

      - `app/` — route dan halaman
      - `app/trips/[id]/page.tsx` — halaman detail trip & ringkasan
      - `components/trips/CheckoutFlowButton.tsx` — tombol checkout dan validasi konflik kalender

      Catatan

      - Checkout memvalidasi konflik jadwal (calendar) sebelum melanjutkan.
      - Fitur AI chat bersifat eksperimental.

      Contributing

      Silakan buka issue atau kirim pull request.
