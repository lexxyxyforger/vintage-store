# AGENTS.md

## Stack

Vue 3 (Composition API, `<script setup>`) + Vite 8 + Vuex 4 + Vue Router 5.
JavaScript (not TypeScript). Path alias `@/` → `./src/`.
Tailwind CSS v4 (via `@tailwindcss/vite`, `@import 'tailwindcss'` in `main.css` — no config file).
Firebase (Auth, Firestore, Hosting) — project `fe-vue-js-feyy`.
Firestore composite indexes defined in `firestore.indexes.json`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Vite production build |
| `npm run preview` | Vite preview on :4173 |
| `npm run test:unit` | Vitest (tests in `src/**/__tests__/*`) |
| `npm run test:e2e` | Playwright (tests in `e2e/`) |
| `npm run lint` | oxlint + eslint sequential (both `--fix`) |
| `npm run format` | Prettier (`--experimental-cli`) on `src/` only |

`npm run lint` chains `lint:oxlint` → `lint:eslint` via `npm-run-all2`. Always run the full command.

## Testing

- **No tests exist yet** — `src/**/__tests__/*` and `e2e/` are both empty.
- Unit (Vitest): jsdom + `@vue/test-utils`. Run single file: `npx vitest <path>`.
- E2E (Playwright): first run `npx playwright install`. `webServer` auto-starts dev/preview. CI: `npm run build && npm run test:e2e`. Default project: chromium (use `--project=chromium`, `--debug` for inspector).

## Linting & formatting

- oxlint (`.oxlintrc.json`): plugins eslint, unicorn, oxc, vue, vitest
- eslint (flat `eslint.config.js`): Playwright rules for `e2e/`, Vitest rules for `src/**/__tests__/*`
- Prettier: no semi, single quotes, printWidth 100
- `.vscode/settings.json`: `formatOnSave: true`, `codeActionsOnSave.source.fixAll`

## Architecture

- **Vuex store** at `src/store/index.js` (uses `createStore` from `vuex` — **not** Pinia). Firebase creds are hardcoded in `src/firebase.js` (no `.env`).
- **Firestore collections**: `products`, `categories`, `carts` (docId `${userId}_${productId}`), `wishlists`, `addresses`, `reviews`, `transactions`
- **Auth**: Firebase Auth (email/password + Google). Guarded routes use `meta: { requiresAuth: true }` in router `beforeEach`.
- **Admin**: only user `yolo@gmail.com` (checked via `store.getters.isAdmin`). Must register via the app first. Admin routes use `meta: { requiresAdmin: true }`.
- **Routes** all lazy-loaded. Admin at `/admin/*`. `/admin/seed` is a dev tool to seed 16 sample products.
- **SPA**: Firebase Hosting rewrites all routes to `/index.html`.
- **Promo code**: `VINTAGE10` = 10% off.
- **Order status workflow**: Processed → Shipped → Delivered (or Cancelled). Tracked in `statusHistory[]`.
- **Pagination**: 12 products per page on catalog.
- **Page transitions**: `App.vue` uses `<Transition>` with fade + translateY (`.page-enter-from`, `.page-leave-to`).
- **Toast composable**: `useToast.js` listed in README but `src/composables/` is currently empty.

## Conventions

- Multi-word component names (`AppNavbar`, `ModalLogout`, `ProductCard`)
- Sort order: `<script setup>` → `<template>` → `<style>`
- UI strings are English (despite `index.html` having `lang="id"`)
- Color palette: `#009696` (primary), `#013243` (dark teal) — custom theme vars in `main.css` under `--color-brand-*` and `--color-dark-*`
- Node `^20.19.0 || >=22.12.0`
