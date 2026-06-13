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
  {
    path: '/admin/seed',
    name: 'admin-seed',
    component: () => import('@/views/AdminSeed.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/DashboardPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/views/admin/ProductsPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/products/create',
    name: 'admin-products-create',
    component: () => import('@/views/admin/ProductFormPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/products/:id/edit',
    name: 'admin-products-edit',
    component: () => import('@/views/admin/ProductFormPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('@/views/admin/CategoriesPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/views/admin/OrdersPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/orders/:id',
    name: 'admin-order-detail',
    component: () => import('@/views/admin/OrderDetailPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
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

  if (to.meta.requiresAdmin && !store.getters.isAdmin) {
    return { name: 'home' }
  }
})

export default router
