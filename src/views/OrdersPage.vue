<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    orders.value = await store.dispatch('fetchUserOrders')
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})

const statusColors = {
  Processed: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-sky-100 text-sky-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-2xl font-bold text-stone-900 mb-6">Pesanan Saya</h1>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-24 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-20 text-stone-400">
      <svg class="w-20 h-20 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-lg font-medium mb-2">Belum ada pesanan</p>
      <p class="text-sm mb-6">Mulai berbelanja untuk melihat pesanan Anda.</p>
      <router-link to="/" class="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm">
        Mulai Berbelanja
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        @click="router.push({ name: 'order-detail', params: { id: order.id } })"
        class="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-xs text-stone-400 font-mono">#{{ order.id.slice(-8) }}</p>
            <p class="text-xs text-stone-500">{{ order.createdAt?.toDate().toLocaleDateString('en-US') }}</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1.5 rounded-full" :class="statusColors[order.status] || 'bg-stone-100 text-stone-700'">
            {{ order.status }}
          </span>
        </div>
        <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <img
            v-for="item in order.items?.slice(0, 4)"
            :key="item.productId"
            :src="item.image"
            :alt="item.name"
            class="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
          />
          <span v-if="order.items?.length > 4" class="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full flex-shrink-0">+{{ order.items.length - 4 }}</span>
        </div>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-stone-100">
          <span class="text-sm text-stone-500">{{ order.items?.length || 0 }} item</span>
          <span class="font-bold text-stone-900">Rp{{ (order.total || 0).toLocaleString('id-ID') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
