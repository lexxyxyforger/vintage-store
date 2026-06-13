<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)

const statusColors = {
  Processed: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-sky-100 text-sky-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
}

onMounted(async () => {
  try {
    const d = await getDoc(doc(db, 'transactions', route.params.id))
    if (!d.exists()) {
      router.push({ name: 'orders' })
      return
    }
    order.value = { id: d.id, ...d.data() }
  } catch {
    router.push({ name: 'orders' })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <button
      @click="router.push({ name: 'orders' })"
      class="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-600 text-sm font-medium mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      Back to Orders
    </button>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 6" :key="i" class="h-12 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <template v-else-if="order">
      <div class="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-xl font-bold text-stone-900">Order #{{ order.id.slice(-8) }}</h1>
            <p class="text-sm text-stone-500">{{ order.createdAt?.toDate().toLocaleString('en-US') }}</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1.5 rounded-full" :class="statusColors[order.status] || 'bg-stone-100 text-stone-700'">
            {{ order.status }}
          </span>
        </div>

        <div v-if="order.statusHistory?.length" class="mb-6">
          <h3 class="text-sm font-semibold text-stone-700 mb-3">Status Timeline</h3>
          <div class="space-y-3">
            <div v-for="(h, i) in order.statusHistory" :key="i" class="flex items-start gap-3">
              <div class="flex flex-col items-center">
                <div class="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white" :class="i === order.statusHistory.length - 1 ? 'bg-brand-600' : 'bg-stone-300'" />
                <div v-if="i !== order.statusHistory.length - 1" class="w-0.5 h-8 bg-stone-200" />
              </div>
              <div>
                <p class="text-sm font-medium text-stone-900">{{ h.status }}</p>
                <p class="text-xs text-stone-400">{{ new Date(h.timestamp).toLocaleString('en-US') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div class="p-4 bg-stone-50 rounded-xl">
            <h3 class="text-sm font-semibold text-stone-700 mb-2">Shipping Address</h3>
            <p class="text-sm text-stone-600">{{ order.shippingAddress?.label || 'N/A' }}</p>
            <p class="text-sm text-stone-600">{{ order.shippingAddress?.address || '' }}</p>
            <p class="text-sm text-stone-600">{{ order.shippingAddress?.city || '' }}, {{ order.shippingAddress?.postalCode || '' }}</p>
            <p class="text-sm text-stone-600">{{ order.shippingAddress?.phone || '' }}</p>
          </div>
          <div class="p-4 bg-stone-50 rounded-xl">
            <h3 class="text-sm font-semibold text-stone-700 mb-2">Payment</h3>
            <p class="text-sm text-stone-600 capitalize">{{ (order.paymentMethod || 'N/A').replace('_', ' ') }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-stone-100 font-semibold text-stone-900">Items</div>
        <div class="divide-y divide-stone-100">
          <div v-for="item in order.items" :key="item.productId" class="flex items-center gap-4 px-6 py-4">
            <img :src="item.image" :alt="item.name" class="w-14 h-14 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-900 truncate">{{ item.name }}</p>
              <p class="text-xs text-stone-500">{{ item.color || '' }}{{ item.color && item.size ? ' / ' : '' }}{{ item.size || '' }}</p>
              <p class="text-sm font-semibold text-stone-900 mt-0.5">Rp{{ Number(item.price).toLocaleString('id-ID') }} x {{ item.quantity }}</p>
            </div>
            <p class="text-sm font-bold text-stone-900">Rp{{ (item.price * item.quantity).toLocaleString('id-ID') }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between text-stone-600"><span>Subtotal</span><span class="font-medium">Rp{{ (order.subtotal || 0).toLocaleString('id-ID') }}</span></div>
          <div class="flex justify-between text-stone-600"><span>Shipping</span><span class="font-medium">Rp{{ (order.shipping || 0).toLocaleString('id-ID') }}</span></div>
          <div v-if="order.discount" class="flex justify-between text-emerald-600"><span>Discount</span><span class="font-medium">-Rp{{ order.discount.toLocaleString('id-ID') }}</span></div>
          <hr class="border-stone-200" />
          <div class="flex justify-between font-bold text-lg text-stone-900"><span>Total</span><span class="text-brand-800">Rp{{ (order.total || 0).toLocaleString('id-ID') }}</span></div>
        </div>
      </div>
    </template>
  </div>
</template>
