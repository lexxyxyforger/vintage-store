<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const stats = ref({
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
})
const recentProducts = ref([])
const loading = ref(true)

const myProducts = computed(() =>
  store.state.products.filter((p) => p.sellerId === store.getters.userId)
)

const cards = computed(() => [
  {
    label: 'Produk Saya',
    value: stats.value.totalProducts,
    icon: 'package',
    color: 'teal',
    link: { name: 'seller-products' },
  },
  {
    label: 'Pesanan',
    value: stats.value.totalOrders,
    icon: 'cart',
    color: 'green',
    link: { name: 'seller-orders' },
  },
  {
    label: 'Pendapatan',
    value: 'Rp' + stats.value.totalRevenue.toLocaleString('id-ID'),
    icon: 'currency',
    color: 'blue',
    link: { name: 'seller-orders' },
  },
])

onMounted(async () => {
  try {
    await store.dispatch('fetchProducts')
    const mine = myProducts.value
    stats.value.totalProducts = mine.length
    recentProducts.value = mine.slice(-5).reverse()
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
        <h1 class="text-2xl font-bold text-stone-900">Dashboard Penjual</h1>
        <p class="text-stone-500 text-sm mt-1">Selamat datang kembali, {{ store.getters.userName }}</p>
      </div>
      <button
        @click="router.push({ name: 'seller-products-create' })"
        class="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Produk
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
        <div class="h-4 bg-stone-200 rounded w-1/2 mb-3" />
        <div class="h-8 bg-stone-200 rounded w-1/3" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
              'bg-emerald-100 text-emerald-700': card.color === 'green',
            }"
          >
            {{ card.label }}
          </span>
          <svg v-if="card.icon === 'package'" class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <svg v-else-if="card.icon === 'cart'" class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <svg v-else class="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-3xl font-bold text-stone-900">{{ card.value }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-stone-200">
      <div class="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 class="font-semibold text-stone-900">Produk Terbaru Saya</h2>
        <router-link
          :to="{ name: 'seller-products' }"
          class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          Lihat Semua
        </router-link>
      </div>
      <div v-if="loading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="h-12 bg-stone-100 rounded-lg animate-pulse" />
      </div>
      <div v-else-if="recentProducts.length === 0" class="p-6 text-center text-stone-400">
        Belum ada produk. Mulai tambahkan produk Anda!
      </div>
      <div v-else class="divide-y divide-stone-100">
        <router-link
          v-for="p in recentProducts"
          :key="p.id"
          :to="{ name: 'seller-products-edit', params: { id: p.id } }"
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
