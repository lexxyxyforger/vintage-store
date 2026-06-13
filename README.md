# 🛍️ Vintage — Thrift Fashion E-Commerce

**Single-page aplikasi e-commerce fashion vintage** yang dibangun dengan Vue 3, Firebase, dan Tailwind CSS. Cepat, real-time, dan siap produksi. Mendukung **3 level akses: Superadmin, Seller, dan User**.

---

## Visi & Misi

**Visi** — Menjembatani pecinta fashion vintage dengan platform belanja digital yang cepat, intuitif, dan bisa diakses siapa saja tanpa ribet.

**Misi**
- Menyediakan **pengalaman belanja mulus** dengan navigasi real-time tanpa reload halaman.
- Memberdayakan admin dengan **dashboard manajemen produk, kategori, dan pesanan** yang lengkap.
- Mendukung **skalabilitas pemula** dengan infrastruktur serverless Firebase — siap naik kelas kapan pun.
- Menjaga **kode tetap bersih dan terawat** dengan toolchain modern (oxlint, ESLint, Prettier, Playwright).

---

## Fitur Utama

### 👤 Publik
- **Katalog produk** dengan tampilan grid responsif (1–4 kolom), filter kategori, dan urutan (nama, harga termurah/termahal, terbaru).
- **Pencarian produk** via navbar atau query parameter `?search=`.
- **Halaman detail produk** — pemilihan warna/ukuran, quantity picker, badge stok, dan gambar preview dengan shimmer loading.
- **Rating & review** — bintang interaktif (1–5), komentar, avatar user, dan jumlah rating rata-rata.
- **Produk terkait** — up to 4 produk dari kategori yang sama.

### 🔐 Autentikasi
- **Email/password** — registrasi dan login.
- **Google OAuth** — login satu klik.
- **Session persistence** — status login tersimpan meskipun halaman di-refresh.
- **Route guards** — proteksi halaman user (`requiresAuth`) dan admin (`requiresAdmin`) dengan redirect otomatis.

### 👤 User Area (wajib login)
- **Manajemen profil** — edit nama, photo URL, dan ganti password (dengan validasi konfirmasi).
- **Buku alamat** — CRUD alamat pengiriman, set default, digunakan di checkout.
- **Shopping cart** — tambah/hapus/ubah quantity, validasi stok, dan quantity otomatis terhapus jika 0.
- **Wishlist** — tambah/hapus dari kartu produk atau halaman detail, redirect ke login jika belum login.
- **Multi-step checkout** (3 langkah):
  1. Pilih alamat pengiriman (dari buku alamat)
  2. Pilih metode pembayaran (Bank Transfer / GoPay / COD)
  3. Review pesanan + kode promo (`VINTAGE10` = diskon 10%) + Place Order
- **Riwayat pesanan** — daftar pesanan dengan status color-coded, klik untuk detail.
- **Detail pesanan** — timeline status, alamat, metode bayar, item, dan ringkasan harga.

### 👑 Superadmin (`/superadmin/*`)
Mengelola seluruh platform:
- **Dashboard** — statistik global (produk, kategori, seller, orders, revenue).
- **Manajemen Seller** — lihat semua user, ubah role (user/seller), pantau seller aktif.
- **Lihat Semua Produk** — filter by kategori, seller, nama.
- **CRUD Kategori** — kelola kategori produk.
- **Semua Pesanan** — lihat & update status semua transaksi.

### 🛠️ Seller (`/seller/*`)
Fokus pada produk sendiri:
- **Dashboard** — statistik produk & revenue sendiri.
- **CRUD produk** — tambah/edit/hapus produk (otomatis tercatat sebagai produk seller).
- **Pesanan masuk** — lihat pesanan yang berisi produknya, update status.

### 👤 User (`/profile/*`)
- Manajemen profil, buku alamat, cart, wishlist, riwayat pesanan.

### 🚚 Alur Pesanan
| Status | Deskripsi |
|---|---|
| `Processed` | Pesanan masuk, stok otomatis dikurangi |
| `Shipped` | Pesanan dikirim |
| `Delivered` | Pesanan sampai |
| `Cancelled` | Pesanan dibatalkan |

Setiap perubahan status tercatat di `statusHistory[]` dengan timestamp.

---

## Teknologi yang Digunakan

### Frontend
| Teknologi | Versi | Fungsi |
|---|---|---|
| **Vue 3** | `^3.5.32` | Framework SPA dengan Composition API & `<script setup>` |
| **Vue Router 5** | `^5.0.4` | Routing SPA dengan lazy loading + auth guards |
| **Vuex 4** | `^4.1.0` | State management (auth, cart, produk, kategori, orders, alamat, reviews) |
| **Tailwind CSS v4** | `^4.3.0` | Utility-first styling via `@tailwindcss/vite` plugin |
| **Vite 8** | `^8.0.8` | Build tool & dev server super cepat |

### Backend & Infrastructure
| Teknologi | Fungsi |
|---|---|
| **Firebase Auth** | Autentikasi email/password + Google OAuth |
| **Firestore** | Database NoSQL real-time dengan 7 collections |
| **Firebase Hosting** | Deploy SPA dengan rewrite semua route ke `/index.html` |

### Toolchain
| Tool | Fungsi |
|---|---|
| **oxlint** | Linter Rust-based (plugins: eslint, unicorn, oxc, vue, vitest) |
| **ESLint** | Linter JavaScript (flat config, Playwright & Vitest rules) |
| **Prettier** | Formatter (no semi, single quotes, printWidth 100) |
| **Vitest** | Unit testing dengan jsdom + `@vue/test-utils` |
| **Playwright** | E2E testing (Chromium, Firefox, WebKit) |
| **npm-run-all2** | Menjalankan oxlint + ESLint secara sequential |

---

## Struktur Folder

```
tugas-akhir-ta/
├── src/
│   ├── assets/
│   │   └── main.css              # Tailwind import + custom theme (brand/dark) + animations
│   ├── components/
│   │   ├── AppNavbar.vue         # Navigasi sticky, search, cart badge, wishlist, user dropdown
│   │   ├── ModalLogout.vue       # Modal konfirmasi logout
│   │   ├── ProductCard.vue       # Kartu produk dengan wishlist, shimmer, stock badge
│   │   ├── ProductCardSkeleton.vue # Skeleton loading untuk grid produk
│   │   └── ToastContainer.vue    # (placeholder) Notifikasi toast
│   ├── composables/              # (kosong) useToast.js terdaftar tapi belum dibuat
│   ├── router/
│   │   └── index.js              # 22 routes, lazy-loaded, auth + admin guards
│   ├── store/
│   │   └── index.js              # Vuex store — 11 state, 11 getters, 14 mutations, 26 actions
│   ├── views/
│   │   ├── HomePage.vue          # Hero + kategori tabs + grid produk + pagination (12/page)
│   │   ├── DetailProduct.vue     # Detail produk + reviews + related products
│   │   ├── LoginPage.vue         # Login email/password + Google
│   │   ├── RegisterPage.vue      # Register form
│   │   ├── CartPage.vue          # Cart dengan promo code VINTAGE10
│   │   ├── CheckoutPage.vue      # 3-step checkout wizard
│   │   ├── OrdersPage.vue        # Riwayat pesanan user
│   │   ├── OrderDetailPage.vue   # Timeline status pesanan user
│   │   ├── ProfilePage.vue       # Profil + quick links + transaksi terakhir
│   │   ├── ProfileEditPage.vue   # Edit profil + ganti password
│   │   ├── AddressListPage.vue   # Daftar alamat user
│   │   ├── AddressFormPage.vue   # Tambah/edit alamat
│   │   ├── WishlistPage.vue      # Grid wishlist
│   │   ├── AdminSeed.vue         # Seed 16 produk sample
│   │   ├── NotFound.vue          # 404 page
│   │   └── admin/
│   │       ├── DashboardPage.vue     # Statistik + recent products
│   │       ├── ProductsPage.vue      # Table produk + search + filter
│   │       ├── ProductFormPage.vue   # Form tambah/edit produk
│   │       ├── CategoriesPage.vue    # CRUD kategori
│   │       ├── OrdersPage.vue        # Semua pesanan + revenue
│   │       └── OrderDetailPage.vue   # Detail + update status
│   ├── App.vue                  # Root dengan page transitions (fade + translateY)
│   ├── firebase.js              # Inisialisasi Firebase (config hardcoded)
│   └── main.js                  # Entry point
├── e2e/                         # (kosong) Folder untuk E2E tests
├── dist/                        # Hasil build production
├── public/                      # Favicon
├── .vscode/
│   ├── settings.json            # formatOnSave + codeActionsOnSave
│   └── extensions.json          # Rekomendasi ekstensi VS Code
├── firebase.json                # Firebase Hosting config + Firestore rules/indexes
├── firestore.rules              # Security rules Firestore
├── firestore.indexes.json       # Composite indexes (products, carts, wishlists, transactions)
├── vite.config.js               # Vite + Vue + JSX + DevTools + Tailwind
├── vitest.config.js             # Vitest (jsdom, exclude e2e/)
├── playwright.config.js         # Playwright (3 browser projects, auto webServer)
├── eslint.config.js             # ESLint flat config
├── .oxlintrc.json               # oxlint config
├── .prettierrc.json             # Prettier: no semi, single quotes, 100 printWidth
├── .editorconfig                # EditorConfig (2 spaces, UTF-8, LF)
├── jsconfig.json                # Path alias @/ → ./src/
├── package.json                 # Dependencies & scripts
├── AGENTS.md                    # Instruksi untuk OpenCode AI
└── README.md                    # File ini
```

### Firestore Collections

| Collection | Document ID | Isi |
|---|---|---|
| `users` | `${uid}` | email, displayName, photoURL, role (legacy — custom claims lebih diprioritaskan) |
| `products` | auto | name, category, price, stock, color, size, shipping, image, description, sellerId, sellerName |
| `carts` | `${userId}_${productId}` | userId, productId, name, price, quantity, image, shipping, color, size |
| `wishlists` | auto | userId, productId, createdAt |
| `addresses` | auto | userId, label, address, city, postalCode, phone, isDefault, createdAt |
| `reviews` | auto | productId, userId, userName, userPhoto, rating, comment, createdAt |
| `transactions` | auto | userId, items[], shippingAddress, paymentMethod, subtotal, shipping, discount, total, status, statusHistory[], createdAt |

---

## Cara Instalasi & Menjalankan Project

### Prerequisites

- **Node.js** `^20.19.0` atau `^22.12.0`
- **npm** (bundled dengan Node.js)
- **Firebase project** dengan nama `fe-vue-js-feyy` (sudah terkonfigurasi)

### 1. Clone & Install

```sh
npm install
```

### 2. Jalankan Development Server

```sh
npm run dev
```

Aplikasi akan berjalan di **`http://localhost:5173`** dengan hot-reload.

### 3. Build Production

```sh
npm run build       # Output ke dist/
npm run preview     # Preview hasil build di :4173
```

### 4. Testing

```sh
# Unit tests (Vitest)
npm run test:unit
npx vitest src/path/to/test  # Single test file

# E2E tests (Playwright)
npx playwright install              # Pertama kali
npm run test:e2e                    # Dev mode
npm run build && npm run test:e2e   # CI mode (headless)
npx playwright test --project=chromium --debug  # Debug mode
```

### 5. Linting & Formatting

```sh
npm run lint     # oxlint --fix → ESLint --fix (sequential)
npm run format   # Prettier pada folder src/
```

### 6. Deploy ke Firebase Hosting

```sh
npm run build
firebase deploy --only hosting
```

### 7. Role-Based Access

Aplikasi memiliki **3 level akses** berdasarkan **Firebase Auth custom claims** (field `role` di token):

| Role | Akses |
|---|---|
| `user` (default) | Halaman publik + `/profile/*`, `/orders/*`, `/cart`, `/wishlist` |
| `seller` | Halaman user + `/seller/*` (kelola produk & pesanan sendiri) |
| `superadmin` | Segala akses + `/superadmin/*` (kelola seluruh platform) |

**Setup awal:**
1. Role disimpan sebagai custom claims di Firebase Auth — **tidak pakai Firestore**.
2. Setelah login, role dibaca dari `user.getIdTokenResult().claims.role`.
3. Ubah role via CLI (butuh service account key):
   ```sh
   npm run bootstrap:superadmin email@example.com seller
   npm run bootstrap:superadmin email@example.com superadmin
   ```
4. Superadmin juga bisa generate perintah CLI dari halaman `/superadmin/sellers`.

---

## Catatan Pengembangan

| Topik | Detail |
|---|---|
| **Bahasa UI** | English (meskipun `<html lang="id">`) |
| **Konvensi komponen** | Multi-word names (`AppNavbar`, `ProductCard`) |
| **Urutan file** | `<script setup>` → `<template>` → `<style>` |
| **Color palette** | `#009696` (primary teal), `#013243` (dark slate) — custom CSS vars `--color-brand-*` dan `--color-dark-*` |
| **Path alias** | `@/` → `./src/` |
| **Kode promo** | `VINTAGE10` = 10% off subtotal |
| **Pagination** | 12 produk per halaman (client-side) |
| **Page transitions** | Fade + translateY di `App.vue` |
| **Firebase creds** | Hardcoded di `src/firebase.js` (tanpa `.env`) |
| **Role check** | Client-side via `store.getters.isSuperadmin` / `store.getters.isSeller` (dari Auth custom claims) |
| **Role default** | Semua user baru mendapat role `user` (custom claims di-set via Admin SDK) |
| **Bootstrap role** | `npm run bootstrap:superadmin <email> <role>` — pakai Admin SDK service account |
