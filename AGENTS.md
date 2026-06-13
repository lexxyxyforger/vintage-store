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
Role: `npm run bootstrap:superadmin <email> [role]` — needs service account key at project root.

## Testing

- No tests exist yet — `src/**/__tests__/*` and `e2e/` are both empty.
- Unit: Vitest + jsdom + `@vue/test-utils`. Single file: `npx vitest <path>`.
- E2E: Playwright auto-starts dev/preview via `webServer`. CI: `npm run build && npm run test:e2e`. Default project chromium. Use `--project=chromium --debug` for inspector.

## Linting & formatting

- oxlint (`.oxlintrc.json`): plugins eslint, unicorn, oxc, vue, vitest
- eslint (flat `eslint.config.js`): Playwright rules for `e2e/`, Vitest rules for `src/**/__tests__/*`
- Prettier: no semi, single quotes, printWidth 100
- `.vscode/settings.json`: `formatOnSave: true`, `codeActionsOnSave.source.fixAll`

## Architecture

- **Vuex store** at `src/store/index.js` — `createStore` from `vuex`, not Pinia.
- **Firebase creds** hardcoded in `src/firebase.js` — no `.env` files.
- **`fetchProducts` is cached** — reads Firestore once per session; call `refreshProducts` to force re-fetch.
- **Auth**: Firebase Auth (email/password + Google). Router `beforeEach` waits for `authLoading` to resolve before enforcing `requiresAuth`.
- **Roles**: `superadmin`, `seller`, `user` — Firebase Auth custom claims, not Firestore. Default `user`. Set via `npm run bootstrap:superadmin` (Admin SDK, needs service account key at project root — gitignored).
- **Route guards**: `meta: { requiresAuth: true }`, `requiresSuperadmin`, `requiresSeller` in router `beforeEach`.
- **Routes** all lazy-loaded. Superadmin at `/superadmin/*`, Seller at `/seller/*`, User at `/profile/*`.
- **SPA**: Firebase Hosting rewrites all routes to `/index.html`.
- **Promo code**: `VINTAGE10` = 10% off (logic in `CartPage.vue`).
- **Order status**: Processed → Shipped → Delivered (or Cancelled). Tracked in `statusHistory[]`.
- **Pagination**: 12 products per page on catalog.

## Conventions

- Multi-word component names (`AppNavbar`, `ModalLogout`, `ProductCard`)
- Sort order: `<script setup>` → `<template>` → `<style>`
- UI strings are English (despite `index.html` having `lang="id"`)
- Color palette: `#009696` (primary), `#013243` (dark teal) — custom theme vars in `main.css` (`--color-brand-*`, `--color-dark-*`)
- Node `^20.19.0 || >=22.12.0`
- Service account key (`*-firebase-adminsdk-*.json`) gitignored — must be copied to project root for `bootstrap:superadmin`
