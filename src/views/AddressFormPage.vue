<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '@/firebase'
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const store = useStore()
const isEdit = ref(false)
const saving = ref(false)
const loading = ref(false)

const form = ref({
  label: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  isDefault: false,
})

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    loading.value = true
    try {
      const d = await getDoc(doc(db, 'addresses', route.params.id))
      if (d.exists()) {
        const data = d.data()
        form.value = {
          label: data.label || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          phone: data.phone || '',
          isDefault: data.isDefault || false,
        }
      } else {
        router.push({ name: 'addresses' })
      }
    } catch {
      router.push({ name: 'addresses' })
    } finally {
      loading.value = false
    }
  }
})

async function save() {
  if (!form.value.label || !form.value.address || !form.value.city || !form.value.phone) {
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await setDoc(doc(db, 'addresses', route.params.id), form.value, { merge: true })
    } else {
      await addDoc(collection(db, 'addresses'), {
        ...form.value,
        userId: store.getters.userId,
        createdAt: serverTimestamp(),
      })
    }
    router.push({ name: 'addresses' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <button
      @click="router.push({ name: 'addresses' })"
      class="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-600 text-sm font-medium mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      Kembali ke Alamat
    </button>

    <h1 class="text-2xl font-bold text-stone-900 mb-8">
      {{ isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru' }}
    </h1>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="h-16 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <form v-else @submit.prevent="save" class="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1.5">Label *</label>
        <input
          v-model="form.label"
          type="text"
          required
          placeholder="Rumah, Kantor, dll."
          class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1.5">Alamat *</label>
        <textarea
          v-model="form.address"
          required
          rows="2"
          placeholder="Jalan, gedung, dll."
          class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all"
        />
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Kota *</label>
          <input
            v-model="form.city"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Kode Pos</label>
          <input
            v-model="form.postalCode"
            type="text"
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1.5">No. Telepon *</label>
        <input
          v-model="form.phone"
          type="tel"
          required
          placeholder="08xxxxxxxxxx"
          class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
        />
      </div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="form.isDefault"
          type="checkbox"
          class="w-4 h-4 text-brand-600 border-stone-300 rounded focus:ring-brand-500 accent-brand-600"
        />
        <span class="text-sm text-stone-700">Jadikan alamat utama</span>
      </label>
      <div class="flex items-center gap-3 pt-2">
        <button
          type="submit"
          :disabled="saving"
          class="bg-brand-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {{ saving ? 'Menyimpan...' : isEdit ? 'Perbarui Alamat' : 'Tambah Alamat' }}
        </button>
        <button
          type="button"
          @click="router.push({ name: 'addresses' })"
          class="px-8 py-2.5 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  </div>
</template>
