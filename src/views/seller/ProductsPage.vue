<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const searchQuery = ref('')
const selectedCategory = ref('')

const myProducts = computed(() =>
  store.state.products.filter((p) => p.sellerId === store.getters.userId)
)

const categories = computed(() => {
  const cats = [...new Set(myProducts.value.map((p) => p.category))]
  return cats.sort()
})

const filteredProducts = computed(() => {
  let result = myProducts.value
  if (selectedCategory.value) {
    result = result.filter((p) => p.category === selectedCategory.value)
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

function deleteProduct(id, name) {
  if (!confirm(`Hapus produk "${name}"?`)) return
  store.dispatch('deleteProduct', id)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-stone-900">Produk Saya</h1>
        <p class="text-stone-500 text-sm mt-1">{{ filteredProducts.length }} produk</p>
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
    </div>

    <div v-if="loading" class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div class="p-6 space-y-4">
        <div v-for="i in 5" :key="i" class="h-14 bg-stone-100 rounded-lg animate-pulse" />
      </div>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="font-medium">Belum ada produk</p>
      <p class="text-sm mt-1">Mulai tambahkan produk Anda untuk dijual.</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-left px-6 py-3 font-medium">Produk</th>
              <th class="text-left px-6 py-3 font-medium">Kategori</th>
              <th class="text-left px-6 py-3 font-medium">Harga</th>
              <th class="text-left px-6 py-3 font-medium">Stok</th>
              <th class="text-right px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr
              v-for="p in filteredProducts"
              :key="p.id"
              class="hover:bg-stone-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="p.image" :alt="p.name" class="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
                  <span class="font-medium text-stone-900 truncate max-w-[200px]">{{ p.name }}</span>
                </div>
              </td>
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
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="router.push({ name: 'seller-products-edit', params: { id: p.id } })"
                    class="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProduct(p.id, p.name)"
                    class="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
