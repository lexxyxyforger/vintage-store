<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

const router = useRouter()
const store = useStore()
const step = ref(1)
const addresses = ref([])
const loadingAddresses = ref(true)
const selectedAddress = ref(null)
const paymentMethod = ref('bank_transfer')
const saving = ref(false)

const promoCode = ref('')
const promoApplied = ref(false)

const cartItems = computed(() => store.state.cartItems)
const subtotal = computed(() => store.getters.cartSubtotal)
const shipping = computed(() => store.getters.cartShipping)
const discount = computed(() => promoApplied.value ? Math.round(subtotal.value * 0.1) : 0)
const total = computed(() => subtotal.value + shipping.value - discount.value)

onMounted(async () => {
  await store.dispatch('fetchCart', store.getters.userId)
  await loadAddresses()
})

async function loadAddresses() {
  loadingAddresses.value = true
  try {
    const q = query(
      collection(db, 'addresses'),
      where('userId', '==', store.getters.userId),
      orderBy('isDefault', 'desc'),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    addresses.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const def = addresses.value.find((a) => a.isDefault)
    if (def) selectedAddress.value = def
    else if (addresses.value.length) selectedAddress.value = addresses.value[0]
  } catch {
    addresses.value = []
  } finally {
    loadingAddresses.value = false
  }
}

function applyPromo() {
  if (promoCode.value.toUpperCase() === 'VINTAGE10') {
    promoApplied.value = true
  }
}

function selectAddress(addr) {
  selectedAddress.value = addr
}

async function placeOrder() {
  if (!selectedAddress.value) {
    return
  }
  if (cartItems.value.length === 0) {
    return
  }
  saving.value = true
  try {
    const items = cartItems.value.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      shipping: i.shipping,
      color: i.color,
      size: i.size,
      image: i.image,
    }))

    const orderId = await store.dispatch('createOrder', {
      items,
      address: {
        label: selectedAddress.value.label,
        address: selectedAddress.value.address,
        city: selectedAddress.value.city,
        postalCode: selectedAddress.value.postalCode,
        phone: selectedAddress.value.phone,
      },
      paymentMethod: paymentMethod.value,
      subtotal: subtotal.value,
      shipping: shipping.value,
      discount: discount.value,
      total: total.value,
    })

    router.push({ name: 'order-detail', params: { id: orderId } })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-stone-900 mb-8">Checkout</h1>

    <div class="flex items-center gap-3 mb-8 text-sm">
      <div class="flex items-center gap-2" :class="step >= 1 ? 'text-brand-600' : 'text-stone-400'">
        <span class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold" :class="step >= 1 ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-500'">1</span>
        <span class="font-semibold">Alamat</span>
      </div>
      <div class="w-8 h-px bg-stone-300" />
      <div class="flex items-center gap-2" :class="step >= 2 ? 'text-brand-600' : 'text-stone-400'">
        <span class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold" :class="step >= 2 ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-500'">2</span>
        <span class="font-semibold">Pembayaran</span>
      </div>
      <div class="w-8 h-px bg-stone-300" />
      <div class="flex items-center gap-2" :class="step >= 3 ? 'text-brand-600' : 'text-stone-400'">
        <span class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold" :class="step >= 3 ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-500'">3</span>
        <span class="font-semibold">Tinjau</span>
      </div>
    </div>

    <div v-if="step === 1" class="space-y-6">
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-stone-900">Alamat Pengiriman</h2>
          <router-link
            to="/profile/addresses/create"
            class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            + Tambah Baru
          </router-link>
        </div>

        <div v-if="loadingAddresses" class="text-center py-8 text-stone-400">Memuat alamat...</div>

        <div v-else-if="addresses.length === 0" class="text-center py-8 text-stone-400">
          <p class="mb-2">Belum ada alamat</p>
          <router-link to="/profile/addresses/create" class="text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Tambah alamat pertama
          </router-link>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            @click="selectAddress(addr)"
            class="p-4 rounded-xl border-2 cursor-pointer transition-all"
            :class="selectedAddress?.id === addr.id ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:border-stone-300'"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium text-stone-900">
                  {{ addr.label }}
                  <span v-if="addr.isDefault" class="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full ml-2 font-semibold">Utama</span>
                </p>
                <p class="text-sm text-stone-600 mt-1">{{ addr.address }}</p>
                <p class="text-sm text-stone-500">{{ addr.city }} {{ addr.postalCode }}</p>
                <p class="text-sm text-stone-500">{{ addr.phone }}</p>
              </div>
              <div v-if="selectedAddress?.id === addr.id" class="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="step = 2"
          :disabled="!selectedAddress"
          class="bg-brand-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>

    <div v-if="step === 2" class="space-y-6">
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="text-lg font-bold text-stone-900 mb-4">Metode Pembayaran</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="paymentMethod === 'bank_transfer' ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:border-stone-300'">
            <input type="radio" v-model="paymentMethod" value="bank_transfer" class="text-brand-600 accent-brand-600" />
            <div>
              <p class="font-medium text-stone-900">Transfer Bank</p>
              <p class="text-sm text-stone-500">BCA, Mandiri, BNI, BRI</p>
            </div>
          </label>
          <label class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="paymentMethod === 'gopay' ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:border-stone-300'">
            <input type="radio" v-model="paymentMethod" value="gopay" class="text-brand-600 accent-brand-600" />
            <div>
              <p class="font-medium text-stone-900">GoPay</p>
              <p class="text-sm text-stone-500">Dompet digital Gojek</p>
            </div>
          </label>
          <label class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all" :class="paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-stone-200 hover:border-stone-300'">
            <input type="radio" v-model="paymentMethod" value="cod" class="text-brand-600 accent-brand-600" />
            <div>
              <p class="font-medium text-stone-900">COD (Bayar di Tempat)</p>
              <p class="text-sm text-stone-500">Bayar saat terima</p>
            </div>
          </label>
        </div>
      </div>

      <div class="flex justify-between">
        <button @click="step = 1" class="px-8 py-3 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 transition-colors font-medium">
          Kembali
        </button>
        <button @click="step = 3" class="bg-brand-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm">
          Tinjau Pesanan
        </button>
      </div>
    </div>

    <div v-if="step === 3" class="space-y-6">
      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h2 class="text-lg font-bold text-stone-900 mb-4">Tinjau Pesanan</h2>

        <div class="mb-4 p-4 bg-stone-50 rounded-xl">
          <p class="text-sm font-medium text-stone-700 mb-1">Dikirim ke:</p>
          <p class="text-sm text-stone-600">{{ selectedAddress?.label }} - {{ selectedAddress?.address }}, {{ selectedAddress?.city }}</p>
        </div>

        <div class="mb-4 p-4 bg-stone-50 rounded-xl">
          <p class="text-sm font-medium text-stone-700 mb-1">Pembayaran:</p>
          <p class="text-sm text-stone-600 capitalize">{{ paymentMethod.replace('_', ' ') }}</p>
        </div>

        <div class="divide-y divide-stone-100">
          <div v-for="item in cartItems" :key="item.id" class="flex items-center gap-3 py-3">
            <img :src="item.image" :alt="item.name" class="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-900 truncate">{{ item.name }} x {{ item.quantity }}</p>
              <p class="text-xs text-stone-500">Rp{{ Number(item.price).toLocaleString('id-ID') }}</p>
            </div>
            <p class="text-sm font-semibold text-stone-900">Rp{{ (item.price * item.quantity).toLocaleString('id-ID') }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-stone-200 p-6">
        <h3 class="font-semibold text-stone-900 mb-3">Kode Promo</h3>
        <div class="flex gap-2">
          <input
            v-model="promoCode"
            placeholder="Masukkan kode promo"
            :disabled="promoApplied"
            class="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-stone-50 transition-all"
          />
          <button
            @click="applyPromo"
            :disabled="promoApplied || !promoCode.trim()"
            class="px-5 py-2.5 border border-brand-600 text-brand-600 rounded-xl text-sm font-medium hover:bg-brand-50 disabled:opacity-40 transition-colors"
          >
            {{ promoApplied ? 'Diterapkan' : 'Terapkan' }}
          </button>
        </div>

        <hr class="my-4 border-stone-200" />
        <div class="space-y-2 text-sm">
          <div class="flex justify-between text-stone-600"><span>Subtotal ({{ cartItems.length }} item)</span><span class="font-medium">Rp{{ subtotal.toLocaleString('id-ID') }}</span></div>
          <div class="flex justify-between text-stone-600"><span>Pengiriman</span><span class="font-medium">Rp{{ shipping.toLocaleString('id-ID') }}</span></div>
          <div v-if="discount" class="flex justify-between text-emerald-600"><span>Diskon</span><span class="font-medium">-Rp{{ discount.toLocaleString('id-ID') }}</span></div>
          <hr class="border-stone-200" />
          <div class="flex justify-between font-bold text-lg text-stone-900"><span>Total</span><span class="text-brand-800">Rp{{ total.toLocaleString('id-ID') }}</span></div>
        </div>
      </div>

      <div class="flex justify-between">
        <button @click="step = 2" class="px-8 py-3 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 transition-colors font-medium">
          Kembali
        </button>
        <button
          @click="placeOrder"
          :disabled="saving"
          class="bg-brand-600 text-white px-10 py-3 rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ saving ? 'Memproses...' : 'Buat Pesanan' }}
        </button>
      </div>
    </div>
  </div>
</template>
