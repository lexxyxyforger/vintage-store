<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

const router = useRouter()
const store = useStore()
const transactions = ref([])
const loadingTx = ref(true)

onMounted(async () => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', store.getters.userId),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    transactions.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    transactions.value = []
  } finally {
    loadingTx.value = false
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
    <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
      <div class="flex items-center gap-4">
        <img
          :src="store.getters.userPhoto || `https://ui-avatars.com/api/?name=${store.getters.userName}&background=0d9488&color=fff&font-size=0.33&bold=true`"
          :alt="store.getters.userName"
          class="w-16 h-16 rounded-full object-cover ring-2 ring-stone-200"
        />
        <div class="flex-1">
          <h1 class="text-xl font-bold text-stone-900">{{ store.getters.userName || 'Pengguna' }}</h1>
          <p class="text-stone-500">{{ store.getters.userEmail }}</p>
        </div>
        <router-link
          :to="{ name: 'profile-edit' }"
          class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          Edit Profil
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <router-link
        :to="{ name: 'orders' }"
        class="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow text-center group"
      >
        <svg class="w-7 h-7 mx-auto mb-2 text-brand-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-sm font-semibold text-stone-900">Pesanan Saya</p>
      </router-link>
      <router-link
        :to="{ name: 'addresses' }"
        class="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow text-center group"
      >
        <svg class="w-7 h-7 mx-auto mb-2 text-brand-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-sm font-semibold text-stone-900">Alamat Saya</p>
      </router-link>
      <router-link
        :to="{ name: 'wishlist' }"
        class="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow text-center group"
      >
        <svg class="w-7 h-7 mx-auto mb-2 text-brand-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-sm font-semibold text-stone-900">Favorit</p>
      </router-link>
    </div>

    <h2 class="text-xl font-bold text-stone-900 mb-4">Riwayat Transaksi</h2>

    <div v-if="loadingTx" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="transactions.length === 0" class="text-center py-12 text-stone-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-lg font-medium mb-1">Belum ada transaksi.</p>
      <p class="text-sm">Mulai berbelanja untuk melihat riwayat pesanan.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="tx in transactions"
        :key="tx.id"
        @click="router.push({ name: 'order-detail', params: { id: tx.id } })"
        class="bg-white rounded-xl p-4 shadow-sm border border-stone-200 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <p class="text-xs text-stone-400 font-mono">#{{ tx.id.slice(-8) }}</p>
            <p class="text-sm text-stone-500">{{ tx.createdAt?.toDate().toLocaleDateString('en-US') }}</p>
          </div>
          <span
            class="text-xs font-semibold px-3 py-1 rounded-full"
            :class="statusColors[tx.status] || 'bg-stone-100 text-stone-700'"
          >
            {{ tx.status || 'Processed' }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-stone-600">{{ tx.items?.length || 0 }} item</p>
          <p class="font-bold text-stone-900">Rp{{ (tx.total || 0).toLocaleString('id-ID') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
