<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'

const store = useStore()
const status = ref('')
const loading = ref(false)
const seeded = ref(false)

const products = [
  { name: 'Vintage Denim Jacket', category: 'Pakaian', color: 'Blue', size: 'M,L,XL', price: 250000, shipping: 15000, image: 'https://picsum.photos/seed/jacket/400/500', description: 'Jaket denim klasik dengan potongan oversized. Cocok untuk gaya kasual sehari-hari dengan sentuhan vintage.' },
  { name: 'Retro Sunglasses', category: 'Aksesoris', color: 'Gold,Black', size: 'One Size', price: 85000, shipping: 10000, image: 'https://picsum.photos/seed/sunglasses/400/500', description: 'Kacamata retro dengan bingkai tebal yang stylish. Melindungi mata dengan gaya klasik tahun 70-an.' },
  { name: 'Classic Leather Bag', category: 'Tas', color: 'Brown,Black', size: '', price: 350000, shipping: 20000, image: 'https://picsum.photos/seed/leatherbag/400/500', description: 'Tas kulit asli buatan tangan dengan detail jahitan rapi. Elegan dan tahan lama untuk menemani aktivitasmu.' },
  { name: 'Vintage Band T-Shirt', category: 'Pakaian', color: 'Black,White', size: 'S,M,L', price: 120000, shipping: 12000, image: 'https://picsum.photos/seed/bandtee/400/500', description: 'Kaun distro dengan grafis vintage terinspirasi dari band-band legendaris. Bahan katun 100% nyaman dipakai.' },
  { name: 'Bohemian Skirt', category: 'Pakaian', color: 'Red,Green', size: 'S,M,L', price: 180000, shipping: 15000, image: 'https://picsum.photos/seed/skirt/400/500', description: 'Rok panjang boho dengan motif etnik yang indah. Pas untuk gaya bohemian yang santai dan anggun.' },
  { name: 'Throwback Sneakers', category: 'Sepatu', color: 'White,Blue', size: '39,40,41,42', price: 320000, shipping: 20000, image: 'https://picsum.photos/seed/sneakers/400/500', description: 'Sepatu sneakers gaya retro dengan sol tebal nyaman. Paduan sempurna antara gaya vintage dan kenyamanan modern.' },
  { name: 'Wool Fedora Hat', category: 'Aksesoris', color: 'Grey,Brown', size: 'M,L', price: 95000, shipping: 10000, image: 'https://picsum.photos/seed/fedora/400/500', description: 'Topi fedora bahan wool berkualitas. Menambah kesan elegan dan misterius pada penampilanmu.' },
  { name: 'Vintage Flannel Shirt', category: 'Pakaian', color: 'Red,Plaid', size: 'M,L,XL', price: 135000, shipping: 12000, image: 'https://picsum.photos/seed/flannel/400/500', description: 'Kemeja flanel kotak-kotak klasik yang timeless. Hangat dan nyaman untuk gaya kasual musim hujan.' },
  { name: 'Retro Camera Bag', category: 'Tas', color: 'Brown,Green', size: '', price: 210000, shipping: 15000, image: 'https://picsum.photos/seed/camerabag/400/500', description: 'Tas kamera bergaya vintage dengan sekat penyimpanan empuk. Praktis membawa kamera kesayanganmu.' },
  { name: 'Classic Aviator Jacket', category: 'Pakaian', color: 'Brown,Black', size: 'M,L,XL', price: 450000, shipping: 20000, image: 'https://picsum.photos/seed/aviator/400/500', description: 'Jaket aviator kulit klasik dengan bulu collar yang hangat. Inspirasi dari pilot militer era 1940-an.' },
  { name: 'Pearl Earrings', category: 'Aksesoris', color: 'Gold,Silver', size: 'One Size', price: 65000, shipping: 8000, image: 'https://picsum.photos/seed/earrings/400/500', description: 'Anting mutiara sintetis dengan lapisan emas/silver. Aksesoris elegan untuk acara formal sehari-hari.' },
  { name: 'Canvas Backpack', category: 'Tas', color: 'Green,Grey', size: '', price: 280000, shipping: 18000, image: 'https://picsum.photos/seed/backpack/400/500', description: 'Ransel kanvas tebal dengan banyak kompartemen. Cocok untuk traveling maupun aktivitas kampus.' },
  { name: 'Retro Polo Shirt', category: 'Pakaian', color: 'Navy,White,Burgundy', size: 'S,M,L,XL', price: 145000, shipping: 12000, image: 'https://picsum.photos/seed/polo/400/500', description: 'Kaos polo retro dengan kerah klasik dan bahan katun pique premium. Cocok untuk gaya smart casual.' },
  { name: 'Vintage Bucket Hat', category: 'Aksesoris', color: 'Cream,Olive,Black', size: 'M,L', price: 75000, shipping: 10000, image: 'https://picsum.photos/seed/buckethat/400/500', description: 'Topi bucket vintage dengan motif army dan warna earthy. Tren fashion yang kembali populer.' },
  { name: 'Leather Chelsea Boots', category: 'Sepatu', color: 'Brown,Black', size: '39,40,41,42,43', price: 420000, shipping: 22000, image: 'https://picsum.photos/seed/chelsea/400/500', description: 'Sepatu boot chelsea kulit asli dengan elastic side panel. Elegan untuk gaya formal maupun kasual.' },
  { name: 'Rattan Woven Bag', category: 'Tas', color: 'Natural,Black', size: '', price: 195000, shipping: 15000, image: 'https://picsum.photos/seed/rattan/400/500', description: 'Tas anyaman rotan alami yang cantik. Cocok untuk liburan pantai atau hangout santai.' },
]

async function seed() {
  loading.value = true
  status.value = 'Menambahkan produk...'
  try {
    const batch = products.map((p) =>
      addDoc(collection(db, 'products'), {
        ...p,
        sellerId: store.getters.userId,
        sellerName: store.getters.userName,
      })
    )
    await Promise.all(batch)
    store.commit('SET_PRODUCTS_LOADED', false)
    seeded.value = true
    status.value = `Berhasil menambahkan ${products.length} produk!`
  } catch (e) {
    status.value = 'Gagal: ' + e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl font-bold text-stone-900 mb-4">Seeder Produk</h1>

    <div v-if="!store.getters.isLoggedIn" class="text-stone-500">
      Anda harus <router-link to="/login" class="text-brand-600 underline hover:text-brand-700">masuk</router-link> terlebih dahulu untuk menambahkan produk.
    </div>

    <div v-else-if="!seeded" class="space-y-4">
      <p class="text-stone-600">
        Klik tombol di bawah untuk menambahkan {{ products.length }} produk vintage ke Firestore.
      </p>
      <button
        @click="seed"
        :disabled="loading"
        class="bg-brand-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {{ loading ? 'Memproses...' : 'Tambah Produk' }}
      </button>
      <p v-if="status" class="text-sm text-stone-500">{{ status }}</p>
    </div>

    <div v-else class="text-emerald-600">
      <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p class="text-lg font-semibold mb-2">{{ status }}</p>
      <router-link to="/" class="text-brand-600 underline hover:text-brand-700 transition-colors">Lihat di Beranda &rarr;</router-link>
    </div>
  </div>
</template>
