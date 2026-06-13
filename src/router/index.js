import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterPage.vue'),
  },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('@/views/DetailProduct.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/order/:id',
    name: 'order-detail',
    component: () => import('@/views/OrderDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/edit',
    name: 'profile-edit',
    component: () => import('@/views/ProfileEditPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/addresses',
    name: 'addresses',
    component: () => import('@/views/AddressListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/addresses/create',
    name: 'address-create',
    component: () => import('@/views/AddressFormPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/addresses/:id/edit',
    name: 'address-edit',
    component: () => import('@/views/AddressFormPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: () => import('@/views/WishlistPage.vue'),
    meta: { requiresAuth: true },
  },

  // --- Seller routes ---
  {
    path: '/seller/seed',
    name: 'seller-seed',
    component: () => import('@/views/AdminSeed.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
  },
  {
    path: '/seller',
    name: 'seller-dashboard',
    component: () => import('@/views/seller/DashboardPage.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
  },
  {
    path: '/seller/products',
    name: 'seller-products',
    component: () => import('@/views/seller/ProductsPage.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
  },
  {
    path: '/seller/products/create',
    name: 'seller-products-create',
    component: () => import('@/views/seller/ProductFormPage.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
  },
  {
    path: '/seller/products/:id/edit',
    name: 'seller-products-edit',
    component: () => import('@/views/seller/ProductFormPage.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
  },
  {
    path: '/seller/orders',
    name: 'seller-orders',
    component: () => import('@/views/seller/OrdersPage.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
  },
  {
    path: '/seller/orders/:id',
    name: 'seller-order-detail',
    component: () => import('@/views/seller/OrderDetailPage.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
  },

  // --- Superadmin routes ---
  {
    path: '/superadmin/seed',
    name: 'superadmin-seed',
    component: () => import('@/views/AdminSeed.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },
  {
    path: '/superadmin',
    name: 'superadmin-dashboard',
    component: () => import('@/views/superadmin/DashboardPage.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },
  {
    path: '/superadmin/sellers',
    name: 'superadmin-sellers',
    component: () => import('@/views/superadmin/SellersPage.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },
  {
    path: '/superadmin/users',
    name: 'superadmin-users',
    component: () => import('@/views/superadmin/UsersPage.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },
  {
    path: '/superadmin/products',
    name: 'superadmin-products',
    component: () => import('@/views/superadmin/ProductsPage.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },
  {
    path: '/superadmin/categories',
    name: 'superadmin-categories',
    component: () => import('@/views/superadmin/CategoriesPage.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },
  {
    path: '/superadmin/orders',
    name: 'superadmin-orders',
    component: () => import('@/views/superadmin/OrdersPage.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },
  {
    path: '/superadmin/orders/:id',
    name: 'superadmin-order-detail',
    component: () => import('@/views/superadmin/OrderDetailPage.vue'),
    meta: { requiresAuth: true, requiresSuperadmin: true },
  },

  // --- Legacy admin redirects (kept for backward compat) ---
  {
    path: '/admin',
    redirect: { name: 'superadmin-dashboard' },
  },
  {
    path: '/admin/products',
    redirect: { name: 'superadmin-products' },
  },
  {
    path: '/admin/orders',
    redirect: { name: 'superadmin-orders' },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && store.state.authLoading) {
    await new Promise((resolve) => {
      const unwatch = store.watch(
        (state) => state.authLoading,
        (val) => {
          if (!val) {
            unwatch()
            resolve()
          }
        },
      )
    })
  }

  if (to.meta.requiresAuth && !store.getters.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresSuperadmin && !store.getters.isSuperadmin) {
    return { name: 'home' }
  }

  if (to.meta.requiresSeller && !store.getters.isSeller) {
    return { name: 'home' }
  }
})

export default router
