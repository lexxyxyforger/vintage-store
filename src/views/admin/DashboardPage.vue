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
  totalWishlists: 0,
  totalTransactions: 0,
})
const recentProducts = ref([])
const loading = ref(true)

const cards = computed(() => [
  {
    label: 'Total Products',
    value: stats.value.totalProducts,
    icon: 'package',
    color: 'teal',
    link: { name: 'admin-products' },
  },
  {
    label: 'Categories',
    value: stats.value.totalCategories,
    icon: 'grid',
    color: 'blue',
    link: { name: 'admin-categories' },
  },
  {
    label: 'Saved Wishlists',
    value: stats.value.totalWishlists,
    icon: 'heart',
    color: 'red',
    link: { name: 'admin-seed' },
  },
  {
    label: 'Transactions',
    value: stats.value.totalTransactions,
    icon: 'cart',
    color: 'green',
    link: { name: 'admin-orders' },
  },
])

onMounted(async () => {
  try {
    await store.dispatch('fetchProducts')
    stats.value.totalProducts = store.state.products.length
    stats.value.totalCategories = new Set(store.state.products.map((p) => p.category)).size
    recentProducts.value = store.state.products.slice(-5).reverse()

    const wishlistsSnap = await getDocs(collection(db, 'wishlists'))
    stats.value.totalWishlists = wishlistsSnap.size

    const txSnap = await getDocs(collection(db, 'transactions'))
    stats.value.totalTransactions = txSnap.size
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
        <h1 class="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p class="text-stone-500 text-sm mt-1">Welcome back, {{ store.getters.userName }}</p>
      </div>
      <button
        @click="router.push({ name: 'admin-products-create' })"
        class="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Product
      </button>
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
              'bg-red-100 text-red-700': card.color === 'red',
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
          <svg v-else-if="card.icon === 'heart'" class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <svg v-else class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <p class="text-3xl font-bold text-stone-900">{{ card.value }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-stone-200">
      <div class="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 class="font-semibold text-stone-900">Recent Products</h2>
        <router-link
          :to="{ name: 'admin-products' }"
          class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          View All
        </router-link>
      </div>
      <div v-if="loading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="h-12 bg-stone-100 rounded-lg animate-pulse" />
      </div>
      <div v-else-if="recentProducts.length === 0" class="p-6 text-center text-stone-400">
        No products yet.
      </div>
      <div v-else class="divide-y divide-stone-100">
        <router-link
          v-for="p in recentProducts"
          :key="p.id"
          :to="{ name: 'admin-products-edit', params: { id: p.id } }"
          class="flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 transition-colors"
        >
          <img :src="p.image" :alt="p.name" class="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-stone-900 truncate">{{ p.name }}</p>
            <p class="text-xs text-stone-500">{{ p.category }}</p>
          </div>
          <p class="text-sm font-semibold text-stone-900">Rp{{ Number(p.price).toLocaleString('id-ID') }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
