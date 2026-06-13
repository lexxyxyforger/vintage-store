<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import ProductCard from '@/components/ProductCard.vue'

const store = useStore()
const wishlistProducts = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const q = query(collection(db, 'wishlists'), where('userId', '==', store.getters.userId))
    const snap = await getDocs(q)
    const results = []
    for (const d of snap.docs) {
      const productId = d.data().productId
      const productSnap = await getDoc(doc(db, 'products', productId))
      if (productSnap.exists()) {
        results.push({ id: productSnap.id, wishlistId: d.id, ...productSnap.data() })
      }
    }
    wishlistProducts.value = results
  } catch {
    wishlistProducts.value = []
  } finally {
    loading.value = false
  }
})

async function removeWishlist(wishlistId) {
  try {
    await deleteDoc(doc(db, 'wishlists', wishlistId))
    wishlistProducts.value = wishlistProducts.value.filter((p) => p.wishlistId !== wishlistId)
  } catch {
    // silent
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-stone-900">Wishlist</h1>
        <p v-if="!loading" class="text-sm text-stone-500 mt-1">{{ wishlistProducts.length }} items</p>
      </div>
      <router-link to="/" class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
        &larr; Continue Shopping
      </router-link>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div class="animate-shimmer h-48" />
        <div class="p-4 space-y-2">
          <div class="h-3 bg-stone-200 rounded-full w-1/4 animate-pulse-soft" />
          <div class="h-4 bg-stone-200 rounded-full w-3/4 animate-pulse-soft" />
          <div class="h-5 bg-stone-200 rounded-full w-1/3 animate-pulse-soft" />
        </div>
      </div>
    </div>

    <div v-else-if="wishlistProducts.length === 0" class="text-center py-20 text-stone-400">
      <svg class="w-20 h-20 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <p class="text-lg font-medium mb-2">Your wishlist is empty.</p>
      <router-link to="/" class="text-brand-600 hover:text-brand-700 font-medium transition-colors">
        Browse products &rarr;
      </router-link>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div v-for="product in wishlistProducts" :key="product.id" class="relative">
        <ProductCard :product="product" />
        <button
          @click="removeWishlist(product.wishlistId)"
          class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow hover:bg-red-50 transition-colors z-10"
          title="Remove from wishlist"
        >
          <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
