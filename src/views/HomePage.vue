<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const store = useStore()
const selectedCategory = ref('')
const searchQuery = ref('')
const activeTab = ref('all')
const sortBy = ref('name')
const currentPage = ref(1)
const perPage = ref(12)

const categories = computed(() => store.getters.productCategories)

const filteredProducts = computed(() => {
  let result = store.state.products

  if (activeTab.value !== 'all') {
    result = result.filter((p) => p.category === activeTab.value)
  }
  if (selectedCategory.value) {
    result = result.filter((p) => p.category === selectedCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    )
  }
  return result
})

const sortedProducts = computed(() => {
  const result = [...filteredProducts.value]
  if (sortBy.value === 'price-asc') {
    result.sort((a, b) => (a.price || 0) - (b.price || 0))
  } else if (sortBy.value === 'price-desc') {
    result.sort((a, b) => (b.price || 0) - (a.price || 0))
  } else if (sortBy.value === 'newest') {
    result.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
  } else {
    result.sort((a, b) => a.name?.localeCompare(b.name || '') || 0)
  }
  return result
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedProducts.value.slice(start, start + perPage.value)
})

const totalPages = computed(() => Math.ceil(sortedProducts.value.length / perPage.value))

watch(
  () => route.query.search,
  (val) => {
    if (val) {
      searchQuery.value = val
      activeTab.value = 'all'
      currentPage.value = 1
    }
  },
  { immediate: true },
)

watch([activeTab, sortBy, searchQuery], () => {
  currentPage.value = 1
})

onMounted(() => {
  store.dispatch('fetchProducts')
})
</script>

<template>
  <div>
    <section class="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-900 rounded-full blur-3xl" />
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="max-w-2xl">
          <span class="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            Koleksi Vintage Terbaru
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Temukan Gaya <span class="text-amber-300">Vintage</span> Anda
          </h1>
          <p class="text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
            Fashion dan aksesoris vintage autentik dengan kualitas terbaik. Dari jaket denim klasik hingga aksesoris retro.
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              @click="document.getElementById('products').scrollIntoView({ behavior: 'smooth' })"
              class="bg-white text-brand-700 px-8 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-colors shadow-lg shadow-black/20"
            >
              Mulai Berbelanja
            </button>
            <button
              @click="activeTab = 'Aksesoris'"
              class="bg-white/10 text-white border-2 border-white/20 px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Lihat Aksesoris
            </button>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="store.state.products.length > 0"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-stone-900">Kategori</h2>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          @click="activeTab = 'all'"
          class="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="
            activeTab === 'all'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          "
        >
          Semua
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeTab = cat"
          class="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="
            activeTab === cat
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          "
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <section id="products" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-bold text-stone-900">
            {{ activeTab === 'all' ? 'Semua Produk' : activeTab }}
          </h2>
          <p v-if="store.state.productsLoaded" class="text-sm text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
            {{ sortedProducts.length }} produk
          </p>
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="sortBy"
            class="px-3 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          >
            <option value="name">Nama</option>
            <option value="price-asc">Harga: Rendah ke Tinggi</option>
            <option value="price-desc">Harga: Tinggi ke Rendah</option>
            <option value="newest">Terbaru</option>
          </select>
        </div>
      </div>

      <div
        v-if="sortedProducts.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div v-for="product in paginatedProducts" :key="product.id" class="animate-fade-in-up">
          <ProductCard :product="product" />
        </div>
      </div>

      <div v-else-if="store.state.productsLoaded" class="text-center py-20 text-stone-400">
        <svg class="w-20 h-20 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-lg font-medium mb-1">Tidak ada produk ditemukan</p>
        <p class="text-sm">Coba ubah filter atau kata kunci pencarian.</p>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-10">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4 inline-block -ml-1 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Sebelumnya
        </button>
        <div class="flex items-center gap-1.5">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="w-9 h-9 rounded-xl text-sm font-medium transition-colors"
            :class="currentPage === page ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Selanjutnya
          <svg class="w-4 h-4 inline-block -mr-1 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  </div>
</template>
