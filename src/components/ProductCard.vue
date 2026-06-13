<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore'

const props = defineProps({
  product: { type: Object, required: true },
})

const router = useRouter()
const store = useStore()
const wishlisted = ref(false)
const imgLoaded = ref(false)
const imgError = ref(false)
const imageTimeout = ref(null)

onMounted(async () => {
  if (!props.product.image) {
    imgLoaded.value = true
    return
  }
  imageTimeout.value = setTimeout(() => { imgLoaded.value = true }, 5000)

  if (!store.getters.isLoggedIn) return
  const q = query(
    collection(db, 'wishlists'),
    where('userId', '==', store.getters.userId),
    where('productId', '==', props.product.id),
  )
  const snap = await getDocs(q)
  wishlisted.value = !snap.empty
})

onUnmounted(() => {
  if (imageTimeout.value) clearTimeout(imageTimeout.value)
})

function onImgLoad() {
  imgLoaded.value = true
  imgError.value = false
  if (imageTimeout.value) clearTimeout(imageTimeout.value)
}
function onImgError() {
  imgLoaded.value = true
  imgError.value = true
  if (imageTimeout.value) clearTimeout(imageTimeout.value)
}

async function toggleWishlist(e) {
  e.stopPropagation()
  if (!store.getters.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  const q = query(
    collection(db, 'wishlists'),
    where('userId', '==', store.getters.userId),
    where('productId', '==', props.product.id),
  )
  const snap = await getDocs(q)
  if (snap.empty) {
    await setDoc(doc(collection(db, 'wishlists')), {
      userId: store.getters.userId,
      productId: props.product.id,
      createdAt: new Date(),
    })
    wishlisted.value = true
  } else {
    await deleteDoc(snap.docs[0].ref)
    wishlisted.value = false
  }
}

function goToDetail() {
  router.push({ name: 'product', params: { id: props.product.id } })
}
</script>

<template>
  <div
    @click="goToDetail"
    class="group bg-white rounded-xl border border-stone-200 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
  >
    <div class="relative bg-stone-100 h-52 overflow-hidden">
      <img
        v-if="!imgError"
        :src="product.image"
        :alt="product.name"
        @load="onImgLoad"
        @error="onImgError"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        :class="imgLoaded ? 'opacity-100' : 'opacity-0'"
      />
      <div v-if="!imgLoaded && !imgError" class="absolute inset-0 animate-shimmer" />
      <div v-if="imgError" class="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-300">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      <button
        @click="toggleWishlist"
        class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white transition-all z-10"
        :class="{ 'scale-110': wishlisted }"
      >
        <svg
          class="w-5 h-5 transition-colors"
          :class="wishlisted ? 'text-red-500' : 'text-stone-400'"
          :fill="wishlisted ? 'currentColor' : 'none'"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      <div v-if="product.stock !== undefined && product.stock <= 0" class="absolute bottom-3 left-3 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
        Out of Stock
      </div>
      <div v-else-if="product.stock !== undefined && product.stock <= 5" class="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
        Low Stock
      </div>
    </div>
    <div class="p-4">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-[10px] font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
          {{ product.category }}
        </span>
      </div>
      <h3 class="font-semibold text-stone-900 leading-snug mb-1 line-clamp-1">{{ product.name }}</h3>
      <p class="text-brand-700 font-bold text-lg">
        Rp{{ Number(product.price).toLocaleString('id-ID') }}
      </p>
    </div>
  </div>
</template>
