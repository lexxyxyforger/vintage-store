<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

const router = useRouter()
const store = useStore()

const stats = ref({
  totalProducts: 0,
  totalCategories: 0,
  totalUsers: 0,
  totalSellers: 0,
  totalOrders: 0,
  totalRevenue: 0,
})
const recentProducts = ref([])
const loading = ref(true)

const cards = computed(() => [
  {
    label: 'Total Produk',
    value: stats.value.totalProducts,
    icon: 'package',
    color: 'teal',
    link: { name: 'superadmin-products' },
  },
  {
    label: 'Kategori',
    value: stats.value.totalCategories,
    icon: 'grid',
    color: 'blue',
    link: { name: 'superadmin-categories' },
  },
  {
    label: 'Penjual',
    value: stats.value.totalSellers,
    icon: 'users',
    color: 'purple',
    link: { name: 'superadmin-sellers' },
  },
  {
    label: 'Pesanan',
    value: stats.value.totalOrders,
    icon: 'cart',
    color: 'green',
    link: { name: 'superadmin-orders' },
  },
])

onMounted(async () => {
  try {
    await store.dispatch('fetchProducts')
    stats.value.totalProducts = store.state.products.length
    stats.value.totalCategories = new Set(store.state.products.map((p) => p.category)).size
    recentProducts.value = store.state.products.slice(-5).reverse()

    const txSnap = await getDocs(collection(db, 'transactions'))
    const orders = txSnap.docs.map((d) => d.data())
    stats.value.totalOrders = orders.length
    stats.value.totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
  } catch {
    // silent
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-stone-900">Dashboard Superadmin</h1>
        <p class="text-stone-500 text-sm mt-1">Selamat datang kembali, {{ store.getters.userName }}</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="router.push({ name: 'superadmin-sellers' })"
          class="px-5 py-2.5 border border-stone-200 rounded-xl text-stone-700 font-medium hover:bg-stone-50 transition-colors text-sm"
        >
          Kelola Penjual
        </button>
        <button
          @click="router.push({ name: 'superadmin-seed' })"
          class="px-5 py-2.5 border border-stone-200 rounded-xl text-stone-700 font-medium hover:bg-stone-50 transition-colors text-sm"
        >
          Seeding Data
        </button>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
        <div class="h-4 bg-stone-200 rounded w-1/2 mb-3" />
        <div class="h-8 bg-stone-200 rounded w-1/3" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div
        v-for="card in cards"
        :key="card.label"
        @click="router.push(card.link)"
        class="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between mb-3">
          <span
            class="text-xs font-semibold px-2.5 py-1 rounded-full"
            :class="{
              'bg-brand-50 text-brand-700': card.color === 'teal',
              'bg-sky-100 text-sky-700': card.color === 'blue',
              'bg-purple-100 text-purple-700': card.color === 'purple',
              'bg-emerald-100 text-emerald-700': card.color === 'green',
            }"
          >
            {{ card.label }}
          </span>
          <svg v-if="card.icon === 'package'" class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <svg v-else-if="card.icon === 'grid'" class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <svg v-else-if="card.icon === 'users'" class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <p class="text-3xl font-bold text-stone-900">{{ card.value }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="font-semibold text-stone-900 mb-3">Pendapatan</h2>
        <p class="text-3xl font-bold text-brand-700">Rp{{ stats.totalRevenue.toLocaleString('id-ID') }}</p>
        <p class="text-sm text-stone-500 mt-1">Total pendapatan dari semua pesanan</p>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="font-semibold text-stone-900 mb-3">Statistik Platform</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-stone-600">Total Produk</span><span class="font-medium">{{ stats.totalProducts }}</span></div>
          <div class="flex justify-between"><span class="text-stone-600">Total Pesanan</span><span class="font-medium">{{ stats.totalOrders }}</span></div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-stone-200">
      <div class="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 class="font-semibold text-stone-900">Produk Terbaru</h2>
        <router-link
          :to="{ name: 'superadmin-products' }"
          class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          Lihat Semua
        </router-link>
      </div>
      <div v-if="loading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="h-12 bg-stone-100 rounded-lg animate-pulse" />
      </div>
      <div v-else-if="recentProducts.length === 0" class="p-6 text-center text-stone-400">
        Belum ada produk.
      </div>
      <div v-else class="divide-y divide-stone-100">
        <router-link
          v-for="p in recentProducts"
          :key="p.id"
          :to="{ name: 'superadmin-products' }"
          class="flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 transition-colors"
        >
          <img :src="p.image" :alt="p.name" class="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-stone-900 truncate">{{ p.name }}</p>
            <p class="text-xs text-stone-500">{{ p.category }} &middot; oleh {{ p.sellerName || 'Tidak Diketahui' }}</p>
          </div>
          <p class="text-sm font-semibold text-stone-900">Rp{{ Number(p.price).toLocaleString('id-ID') }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
