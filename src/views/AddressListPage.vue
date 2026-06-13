<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore'

const router = useRouter()
const store = useStore()
const addresses = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const q = query(
      collection(db, 'addresses'),
      where('userId', '==', store.getters.userId),
      orderBy('isDefault', 'desc'),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    addresses.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    addresses.value = []
  } finally {
    loading.value = false
  }
})

async function removeAddress(id, label) {
  if (!confirm(`Delete address "${label}"?`)) return
  try {
    await deleteDoc(doc(db, 'addresses', id))
    addresses.value = addresses.value.filter((a) => a.id !== id)
  } catch {
    // silent
  }
}

async function setDefault(id) {
  try {
    for (const addr of addresses.value) {
      if (addr.isDefault) {
        await setDoc(doc(db, 'addresses', addr.id), { isDefault: false }, { merge: true })
      }
    }
    await setDoc(doc(db, 'addresses', id), { isDefault: true }, { merge: true })
    addresses.value = addresses.value.map((a) => ({ ...a, isDefault: a.id === id }))
  } catch {
    // silent
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-6">
      <button
        @click="router.push({ name: 'profile' })"
        class="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-600 text-sm font-medium transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Kembali
      </button>
      <router-link
        :to="{ name: 'address-create' }"
        class="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Tambah Alamat
      </router-link>
    </div>

    <h1 class="text-2xl font-bold text-stone-900 mb-6">Alamat Tersimpan</h1>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-24 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="addresses.length === 0" class="text-center py-16 text-stone-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p class="text-lg font-medium mb-2">Belum ada alamat</p>
      <router-link :to="{ name: 'address-create' }" class="text-brand-600 hover:text-brand-700 font-medium transition-colors">
        Tambah alamat pertama
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="bg-white rounded-xl border border-stone-200 p-5"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-semibold text-stone-900">{{ addr.label }}</p>
              <span v-if="addr.isDefault" class="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">Utama</span>
            </div>
            <p class="text-sm text-stone-600">{{ addr.address }}</p>
            <p class="text-sm text-stone-500">{{ addr.city }} {{ addr.postalCode }}</p>
            <p class="text-sm text-stone-500">{{ addr.phone }}</p>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0 ml-4">
            <button
              v-if="!addr.isDefault"
              @click="setDefault(addr.id)"
              class="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="Jadikan Utama"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </button>
            <button
              @click="router.push({ name: 'address-edit', params: { id: addr.id } })"
              class="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button
              @click="removeAddress(addr.id, addr.label)"
              class="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
