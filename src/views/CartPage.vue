<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const promoCode = ref('')
const promoApplied = ref(false)

onMounted(() => {
  store.dispatch('fetchCart', store.getters.userId)
})

function increase(item) {
  store.dispatch('updateCartQuantity', { cartId: item.id, quantity: item.quantity + 1 })
}

function decrease(item) {
  if (item.quantity <= 1) {
    remove(item)
    return
  }
  store.dispatch('updateCartQuantity', { cartId: item.id, quantity: item.quantity - 1 })
}

function remove(item) {
  store.dispatch('removeCartItem', item.id)
}

function applyPromo() {
  if (promoCode.value.toUpperCase() === 'VINTAGE10') {
    promoApplied.value = true
  }
}

function goToCheckout() {
  if (store.state.cartItems.length === 0) {
    return
  }
  router.push({ name: 'checkout' })
}
</script>

<template>
  <div class="min-h-[70vh]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-stone-900">Shopping Cart</h1>
          <p v-if="store.state.cartItems.length" class="text-sm text-stone-500 mt-1">{{ store.getters.cartCount }} items</p>
        </div>
        <router-link to="/" class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
          &larr; Continue Shopping
        </router-link>
      </div>

      <div v-if="store.state.cartLoading" class="text-center py-20 text-stone-400">
        <div class="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading cart...</p>
      </div>

      <div v-else-if="store.state.cartItems.length === 0" class="text-center py-20 text-stone-400">
        <svg class="w-24 h-24 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <p class="text-lg font-medium mb-2">Your cart is empty</p>
        <p class="text-sm mb-6 text-stone-400">Start shopping for vintage items!</p>
        <router-link to="/" class="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm">
          Start Shopping
        </router-link>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in store.state.cartItems"
            :key="item.id"
            class="flex gap-4 bg-white rounded-xl p-4 border border-stone-200 hover:shadow-sm transition-shadow"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-24 h-24 object-cover rounded-lg bg-stone-100 flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-stone-900 truncate">{{ item.name }}</h3>
              <p class="text-sm text-stone-500">
                {{ item.color || '' }}{{ item.color && item.size ? ' / ' : '' }}{{ item.size || '' }}
              </p>
              <p class="text-brand-700 font-bold mt-1">
                Rp{{ Number(item.price).toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="flex flex-col items-end justify-between flex-shrink-0">
              <button
                @click="remove(item)"
                class="text-stone-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                title="Remove"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <div class="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                <button
                  @click="decrease(item)"
                  class="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-brand-600 hover:bg-stone-50 transition-colors"
                >
                  &minus;
                </button>
                <span class="w-8 h-8 flex items-center justify-center font-semibold text-sm border-x border-stone-200">{{ item.quantity }}</span>
                <button
                  @click="increase(item)"
                  class="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-brand-600 hover:bg-stone-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl p-6 border border-stone-200 sticky top-24 space-y-4">
            <h2 class="font-bold text-stone-900 text-lg">Order Summary</h2>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-stone-600">
                <span>Subtotal ({{ store.getters.cartCount }} items)</span>
                <span class="font-medium">Rp{{ store.getters.cartSubtotal.toLocaleString('id-ID') }}</span>
              </div>
              <div class="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span class="font-medium">Rp{{ store.getters.cartShipping.toLocaleString('id-ID') }}</span>
              </div>
              <div v-if="promoApplied" class="flex justify-between text-emerald-600">
                <span>Discount (VINTAGE10)</span>
                <span class="font-medium">-Rp{{ Math.round(store.getters.cartSubtotal * 0.1).toLocaleString('id-ID') }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              <input
                v-model="promoCode"
                placeholder="Promo code"
                :disabled="promoApplied"
                class="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-stone-50 transition-all"
              />
              <button
                @click="applyPromo"
                :disabled="promoApplied || !promoCode.trim()"
                class="px-4 py-2 border border-brand-600 text-brand-600 rounded-lg text-sm font-medium hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {{ promoApplied ? 'Applied' : 'Apply' }}
              </button>
            </div>

            <hr class="border-stone-200" />
            <div class="flex justify-between text-lg font-bold text-stone-900">
              <span>Total</span>
              <span class="text-brand-800">
                Rp{{ (promoApplied
                  ? Math.round(store.getters.cartTotal * 0.9)
                  : store.getters.cartTotal
                ).toLocaleString('id-ID') }}
              </span>
            </div>

            <button
              @click="goToCheckout"
              class="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
