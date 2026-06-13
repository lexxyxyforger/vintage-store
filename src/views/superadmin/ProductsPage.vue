<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedSeller = ref('')

const categories = computed(() => {
  const cats = [...new Set(store.state.products.map((p) => p.category))]
  return cats.sort()
})

const sellers = computed(() => {
  const names = [...new Set(store.state.products.filter((p) => p.sellerName).map((p) => p.sellerName))]
  return names.sort()
})

const filteredProducts = computed(() => {
  let result = store.state.products
  if (selectedCategory.value) {
    result = result.filter((p) => p.category === selectedCategory.value)
  }
  if (selectedSeller.value) {
    result = result.filter((p) => p.sellerName === selectedSeller.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p) => p.name.toLowerCase().includes(q))
  }
  return result
})

const loading = computed(() => store.state.productsLoading)

onMounted(() => {
  store.dispatch('fetchProducts')
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-stone-900 mb-6">Semua Produk</h1>

    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari produk..."
        class="flex-1 min-w-[200px] px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
      />
      <select
        v-model="selectedCategory"
        class="px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
      >
        <option value="">Semua Kategori</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <select
        v-model="selectedSeller"
        class="px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
      >
        <option value="">Semua Penjual</option>
        <option v-for="s in sellers" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <div v-if="loading" class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div class="p-6 space-y-4">
        <div v-for="i in 5" :key="i" class="h-14 bg-stone-100 rounded-lg animate-pulse" />
      </div>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400">
      <p class="font-medium">Tidak ada produk ditemukan</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-left px-6 py-3 font-medium">Produk</th>
              <th class="text-left px-6 py-3 font-medium">Penjual</th>
              <th class="text-left px-6 py-3 font-medium">Kategori</th>
              <th class="text-left px-6 py-3 font-medium">Harga</th>
              <th class="text-left px-6 py-3 font-medium">Stok</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-stone-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="p.image" :alt="p.name" class="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
                  <span class="font-medium text-stone-900 truncate max-w-[200px]">{{ p.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-stone-600">{{ p.sellerName || 'Tidak Diketahui' }}</td>
              <td class="px-6 py-4 text-stone-600">{{ p.category }}</td>
              <td class="px-6 py-4 font-semibold text-stone-900">Rp{{ Number(p.price).toLocaleString('id-ID') }}</td>
              <td class="px-6 py-4">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="p.stock > 10 ? 'bg-emerald-100 text-emerald-700' : p.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'"
                >
                  {{ p.stock !== undefined ? p.stock : '-' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
