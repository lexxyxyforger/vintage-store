<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

const router = useRouter()
const orders = ref([])
const loading = ref(true)
const statusFilter = ref('')

const statuses = ['Processed', 'Shipped', 'Delivered', 'Cancelled']

onMounted(loadOrders)

async function loadOrders() {
  loading.value = true
  try {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    orders.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter((o) => o.status === statusFilter.value)
})

const totalRevenue = computed(() => {
  return filteredOrders.value
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-stone-900 mb-6">All Orders</h1>

    <div class="flex flex-wrap items-center gap-4 mb-6">
      <select
        v-model="statusFilter"
        class="px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
      >
        <option value="">All Status</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
      <p class="text-sm text-stone-500">
        {{ filteredOrders.length }} orders
        <span v-if="!statusFilter" class="ml-2 text-brand-600 font-semibold">
          &middot; Revenue: Rp{{ totalRevenue.toLocaleString('id-ID') }}
        </span>
      </p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-20 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="filteredOrders.length === 0" class="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400">
      <p class="font-medium">No orders found</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        @click="router.push({ name: 'superadmin-order-detail', params: { id: order.id } })"
        class="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <p class="text-xs text-stone-400 font-mono">#{{ order.id.slice(-8) }}</p>
            <p class="font-semibold text-stone-900">{{ order.userName || 'User' }}</p>
          </div>
          <span
            class="text-xs font-semibold px-3 py-1.5 rounded-full"
            :class="{
              'bg-amber-100 text-amber-700': order.status === 'Processed',
              'bg-sky-100 text-sky-700': order.status === 'Shipped',
              'bg-emerald-100 text-emerald-700': order.status === 'Delivered',
              'bg-red-100 text-red-700': order.status === 'Cancelled',
            }"
          >
            {{ order.status }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-stone-500">{{ order.items?.length || 0 }} items</span>
          <span class="font-bold text-stone-900">Rp{{ (order.total || 0).toLocaleString('id-ID') }}</span>
        </div>
        <p class="text-xs text-stone-400 mt-1">
          {{ order.createdAt?.toDate().toLocaleDateString('en-US') }}
        </p>
      </div>
    </div>
  </div>
</template>
