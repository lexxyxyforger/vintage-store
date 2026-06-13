<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const product = ref(null)
const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)
const adding = ref(false)
const imgLoaded = ref(false)
const imgError = ref(false)

const reviews = ref([])
const reviewsLoading = ref(true)
const relatedProducts = ref([])

const reviewForm = ref({ rating: 5, comment: '' })
const submittingReview = ref(false)

const colors = computed(() => {
  if (!product.value?.color) return []
  return product.value.color.split(',').map((c) => c.trim()).filter(Boolean)
})

const sizes = computed(() => {
  if (!product.value?.size) return []
  return product.value.size.split(',').map((s) => s.trim()).filter(Boolean)
})

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((s, r) => s + (r.rating || 0), 0)
  return (sum / reviews.value.length).toFixed(1)
})

onMounted(async () => {
  const p = await store.dispatch('fetchProductById', route.params.id)
  product.value = p
  if (p) {
    if (colors.value.length) selectedColor.value = colors.value[0]
    if (sizes.value.length) selectedSize.value = sizes.value[0]
    await Promise.all([loadReviews(), loadRelatedProducts(p)])
  }
})

async function loadReviews() {
  reviewsLoading.value = true
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', route.params.id),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    reviews.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

async function loadRelatedProducts(p) {
  if (!p.category) return
  const all = store.state.products
  relatedProducts.value = all
    .filter((pr) => pr.category === p.category && pr.id !== p.id)
    .slice(0, 4)
}

async function submitReview() {
  if (!store.getters.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (!reviewForm.value.comment.trim()) {
    return
  }
  submittingReview.value = true
  try {
    await addDoc(collection(db, 'reviews'), {
      productId: route.params.id,
      userId: store.getters.userId,
      userName: store.getters.userName,
      userPhoto: store.getters.userPhoto,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment.trim(),
      createdAt: serverTimestamp(),
    })
    reviewForm.value = { rating: 5, comment: '' }
    await loadReviews()
  } finally {
    submittingReview.value = false
  }
}

async function addToCart() {
  if (!store.getters.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (!product.value) return
  adding.value = true
  try {
    for (let i = 0; i < quantity.value; i++) {
      await store.dispatch('addToCart', {
        ...product.value,
        color: selectedColor.value,
        size: selectedSize.value,
      })
    }
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div v-if="!product" class="text-center py-20 text-stone-500">
    <div v-if="store.state.productsLoading" class="space-y-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-4 bg-stone-200 rounded animate-pulse w-32 mb-8" />
        <div class="grid md:grid-cols-2 gap-10">
          <div class="bg-stone-200 rounded-2xl h-96 animate-pulse" />
          <div class="space-y-4">
            <div class="h-6 bg-stone-200 rounded w-1/4 animate-pulse-soft" />
            <div class="h-8 bg-stone-200 rounded w-3/4 animate-pulse-soft" />
            <div class="h-6 bg-stone-200 rounded w-1/3 animate-pulse-soft" />
            <div class="h-20 bg-stone-200 rounded animate-pulse-soft" />
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-stone-400">Product not found</p>
  </div>

  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <router-link to="/" class="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-medium mb-6 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      Back to Shop
    </router-link>

    <div class="grid md:grid-cols-2 gap-10 lg:gap-14">
      <div class="bg-stone-100 rounded-2xl overflow-hidden sticky top-24 self-start relative">
        <div v-if="!imgLoaded && !imgError" class="absolute inset-0 animate-shimmer rounded-2xl" />
        <img
          v-if="!imgError"
          :src="product.image"
          :alt="product.name"
          @load="imgLoaded = true; imgError = false"
          @error="imgError = true; imgLoaded = true"
          class="w-full h-96 md:h-[550px] object-cover transition-opacity duration-300"
          :class="imgLoaded ? 'opacity-100' : 'opacity-0'"
        />
        <div v-if="imgError" class="w-full h-96 md:h-[550px] flex items-center justify-center bg-stone-100 text-stone-300">
          <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div class="pb-8">
        <span class="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          {{ product.category }}
        </span>
        <h1 class="text-2xl md:text-3xl font-bold text-stone-900 mb-2">{{ product.name }}</h1>

        <div class="flex items-center gap-3 mb-2">
          <div class="flex items-center gap-0.5">
            <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.round(Number(averageRating)) ? 'text-amber-400' : 'text-stone-200'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="text-sm text-stone-500">({{ reviews.length }} reviews)</span>
        </div>

        <div class="flex items-baseline gap-3 mb-6">
          <p class="text-3xl font-bold text-brand-800">
            Rp{{ Number(product.price).toLocaleString('id-ID') }}
          </p>
          <span class="text-sm text-stone-400">+ Shipping Rp{{ Number(product.shipping || 0).toLocaleString('id-ID') }}</span>
        </div>

        <div v-if="product.stock !== undefined" class="mb-4">
          <span
            class="text-xs font-semibold px-3 py-1.5 rounded-full"
            :class="product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'"
          >
            {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
          </span>
        </div>

        <div class="prose prose-stone mb-8">
          <p class="text-stone-600 leading-relaxed">{{ product.description }}</p>
        </div>

        <div v-if="colors.length" class="mb-6">
          <label class="block text-sm font-semibold text-stone-700 mb-3">Color</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in colors"
              :key="c"
              @click="selectedColor = c"
              class="px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
              :class="selectedColor === c ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-stone-200 text-stone-600 hover:border-stone-300'"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <div v-if="sizes.length" class="mb-6">
          <label class="block text-sm font-semibold text-stone-700 mb-3">Size</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="s in sizes"
              :key="s"
              @click="selectedSize = s"
              class="px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all min-w-[56px]"
              :class="selectedSize === s ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-stone-200 text-stone-600 hover:border-stone-300'"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <div class="mb-8">
          <label class="block text-sm font-semibold text-stone-700 mb-3">Quantity</label>
          <div class="flex items-center gap-3">
            <button
              @click="quantity = Math.max(1, quantity - 1)"
              class="w-10 h-10 rounded-xl border-2 border-stone-200 text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center font-medium text-lg"
            >
              &minus;
            </button>
            <span class="w-12 text-center font-semibold text-lg tabular-nums">{{ quantity }}</span>
            <button
              @click="quantity = Math.min(99, quantity + 1)"
              class="w-10 h-10 rounded-xl border-2 border-stone-200 text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center font-medium text-lg"
            >
              +
            </button>
          </div>
        </div>

        <button
          @click="addToCart"
          :disabled="adding || product.stock === 0"
          class="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 transition-all text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20"
        >
          <svg v-if="!adding && product.stock !== 0" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <svg v-if="adding" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart' }}
        </button>
      </div>
    </div>

    <section class="mt-16">
      <h2 class="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
        Reviews
        <span class="text-sm font-normal text-stone-500">({{ reviews.length }})</span>
        <span v-if="averageRating > 0" class="text-base font-normal text-stone-500 ml-1">
          &middot; {{ averageRating }} / 5
        </span>
      </h2>

      <div v-if="store.getters.isLoggedIn" class="bg-white rounded-xl border border-stone-200 p-6 mb-8">
        <h3 class="font-semibold text-stone-900 mb-4">Write a Review</h3>
        <form @submit.prevent="submitReview" class="space-y-4">
          <div class="flex items-center gap-1">
            <span class="text-sm text-stone-600 mr-2">Rating:</span>
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              @click="reviewForm.rating = i"
              class="focus:outline-none"
            >
              <svg class="w-6 h-6 transition-colors" :class="i <= reviewForm.rating ? 'text-amber-400' : 'text-stone-200'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>
          <textarea
            v-model="reviewForm.comment"
            rows="3"
            required
            placeholder="Share your thoughts about this product..."
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all"
          />
          <button
            type="submit"
            :disabled="submittingReview"
            class="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
          </button>
        </form>
      </div>

      <div v-if="reviewsLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-20 bg-stone-100 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="reviews.length === 0" class="text-center py-10 text-stone-400">
        <p>No reviews yet. Be the first to review!</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-white rounded-xl border border-stone-200 p-5"
        >
          <div class="flex items-start gap-3 mb-2">
            <img
              :src="review.userPhoto || `https://ui-avatars.com/api/?name=${review.userName}&background=0d9488&color=fff&font-size=0.33&bold=true`"
              :alt="review.userName"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-stone-900 text-sm">{{ review.userName || 'Anonymous' }}</p>
                <span class="text-xs text-stone-400">{{ review.createdAt?.toDate().toLocaleDateString('en-US') }}</span>
              </div>
              <div class="flex items-center gap-0.5 mt-0.5">
                <svg v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= review.rating ? 'text-amber-400' : 'text-stone-200'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p class="text-sm text-stone-600 mt-1.5">{{ review.comment }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="relatedProducts.length" class="mt-16 mb-10">
      <h2 class="text-xl font-bold text-stone-900 mb-6">Related Products</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="rp in relatedProducts" :key="rp.id">
          <ProductCard :product="rp" />
        </div>
      </div>
    </section>
  </div>
</template>
