# Vintage — E-Commerce App

Single-page vintage fashion e-commerce built with Vue 3, Firebase, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| State | Vuex 4 |
| Router | Vue Router 5 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend | Firebase Auth + Firestore + Hosting |
| Linting | oxlint + ESLint (flat config) |
| Formatting | Prettier |
| Testing | Vitest (unit), Playwright (e2e) |

## Features

### Public
- Product catalog with image previews, category filter, sort (price/name/newest), pagination (12/page)
- Search by keyword
- Product detail page with color/size selection, stock badge, quantity picker
- Product reviews & ratings (star rating + comments, average display)
- Related products (same category)

### Auth
- Email/password registration & login
- Google OAuth sign-in
- Firebase Auth persistence (session restored on refresh)
- Route guards (`requiresAuth`, `requiresAdmin`) with redirect back

### User
- Profile management (edit display name, photo URL, change password)
- Address book (CRUD, set default, used at checkout)
- Shopping cart (add/remove/update quantity, stock validation)
- Wishlist (add/remove from product card or detail page)
- Multi-step checkout flow:
  1. Select shipping address (from saved addresses)
  2. Choose payment method (Bank Transfer, GoPay, COD)
  3. Review order, apply promo code (`VINTAGE10` = 10% off), place order
- Order history with detail page and status timeline

### Admin (`yolo@gmail.com`)
- Dashboard with stats (products, categories, wishlists, transactions)
- Product CRUD (with stock field, image preview)
- Category CRUD
- Order management (list, filter by status, update status workflow: Processed → Shipped → Delivered / Cancelled)
- Seed tool (`/admin/seed`) to populate 16 sample products

### Orders
- Status workflow: `Processed` → `Shipped` → `Delivered` (or `Cancelled`)
- Status history timeline tracked per order
- Auto stock deduction on order placement
- Revenue tracking on admin orders page

## Project Setup

```sh
npm install
```

### Development

```sh
npm run dev        # Vite dev server on :5173
```

### Production

```sh
npm run build      # Build to dist/
npm run preview    # Preview build on :4173
```

### Testing

```sh
npm run test:unit                          # Vitest
npx vitest <path>                          # Single test file
npx playwright install                     # First-time e2e setup
npm run build && npm run test:e2e          # E2E (Playwright)
```

### Lint & Format

```sh
npm run lint                               # oxlint + eslint (sequential, auto-fix)
npm run format                             # Prettier on src/
```

## Requirements

- Node `^20.19.0 || >=22.12.0`
- Firebase project: `fe-vue-js-feyy`

## Project Structure

```
src/
├── assets/                # Global styles (Tailwind import in main.css)
├── components/            # Reusable components
│   ├── AppNavbar.vue      # Navigation (responsive, dropdown, mobile menu)
│   ├── ModalLogout.vue    # Logout confirmation modal
│   ├── ProductCard.vue    # Product card with wishlist toggle
│   ├── ProductCardSkeleton.vue
│   └── ToastContainer.vue # Toast notifications
├── composables/
│   └── useToast.js        # Toast notification composable
├── router/
│   └── index.js           # Routes with lazy loading + auth guards
├── store/
│   └── index.js           # Vuex store (auth, cart, products, categories, orders, addresses, reviews)
├── views/
│   ├── HomePage.vue       # Catalog with hero, categories, sort, pagination
│   ├── DetailProduct.vue  # Product detail with reviews & related products
│   ├── LoginPage.vue      # Email/password + Google sign-in
│   ├── RegisterPage.vue   # Register form
│   ├── CartPage.vue       # Shopping cart with promo code
│   ├── CheckoutPage.vue   # Multi-step checkout
│   ├── OrdersPage.vue     # User order history
│   ├── OrderDetailPage.vue # User order detail with timeline
│   ├── ProfilePage.vue    # Profile with quick links
│   ├── ProfileEditPage.vue# Edit name, photo, password
│   ├── AddressListPage.vue# Saved addresses
│   ├── AddressFormPage.vue# Add/edit address
│   ├── WishlistPage.vue   # Wishlist products
│   ├── AdminSeed.vue      # Seed 16 sample products
│   ├── NotFound.vue       # 404 page
│   └── admin/
│       ├── DashboardPage.vue      # Stats cards + recent products
│       ├── ProductsPage.vue       # Product table with stock
│       ├── ProductFormPage.vue    # Add/edit product form
│       ├── CategoriesPage.vue     # Category CRUD
│       ├── OrdersPage.vue         # All orders + revenue
│       └── OrderDetailPage.vue    # Order detail + status update
├── App.vue               # Root with page transitions
├── firebase.js           # Firebase init (config, auth, Firestore, Analytics)
└── main.js               # Entry point
```

## Firestore Collections

| Collection | Document ID | Purpose |
|---|---|---|
| `products` | auto | Catalog items with name, price, category, stock, color, size, image, description |
| `categories` | auto | Category names for admin management |
| `carts` | `${userId}_${productId}` | Per-user cart items with quantity |
| `wishlists` | auto | User wishlist items (userId + productId) |
| `addresses` | auto | User shipping addresses with label, city, phone, isDefault |
| `reviews` | auto | Product reviews with rating, comment, userId, timestamp |
| `transactions` | auto | Completed orders with items, address, payment method, status history |

## Routes

| Path | Name | Auth | Admin |
|---|---|---|---|
| `/` | home | — | — |
| `/login` | login | — | — |
| `/register` | register | — | — |
| `/product/:id` | product | — | — |
| `/cart` | cart | ✓ | — |
| `/checkout` | checkout | ✓ | — |
| `/orders` | orders | ✓ | — |
| `/order/:id` | order-detail | ✓ | — |
| `/profile` | profile | ✓ | — |
| `/profile/edit` | profile-edit | ✓ | — |
| `/profile/addresses` | addresses | ✓ | — |
| `/profile/addresses/create` | address-create | ✓ | — |
| `/profile/addresses/:id/edit` | address-edit | ✓ | — |
| `/wishlist` | wishlist | ✓ | — |
| `/admin` | admin-dashboard | ✓ | ✓ |
| `/admin/products` | admin-products | ✓ | ✓ |
| `/admin/products/create` | admin-products-create | ✓ | ✓ |
| `/admin/products/:id/edit` | admin-products-edit | ✓ | ✓ |
| `/admin/categories` | admin-categories | ✓ | ✓ |
| `/admin/orders` | admin-orders | ✓ | ✓ |
| `/admin/orders/:id` | admin-order-detail | ✓ | ✓ |
| `/admin/seed` | admin-seed | ✓ | ✓ |

## Conventions

- `<script setup>` + `<template>` + `<style scoped>` sort order
- English UI strings
- Color palette: `#009696` (primary), `#013243` (dark teal)
- Path alias `@/` → `./src/`
- SPA: Firebase Hosting rewrites all routes to `/index.html`

## Admin Access

Only `yolo@gmail.com` has admin privileges. Register via the app, then log in with that email to access `/admin/*` routes.
