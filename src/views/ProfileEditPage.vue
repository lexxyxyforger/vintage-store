<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { auth } from '@/firebase'
import { updatePassword } from 'firebase/auth'

const router = useRouter()
const store = useStore()
const displayName = ref(store.getters.userName)
const photoURL = ref(store.getters.userPhoto)
const saving = ref(false)

const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)
const passwordError = ref('')

async function saveProfile() {
  saving.value = true
  try {
    await store.dispatch('updateProfile', {
      displayName: displayName.value,
      photoURL: photoURL.value,
    })
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  passwordError.value = ''
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match'
    return
  }
  changingPassword.value = true
  try {
    await updatePassword(auth.currentUser, newPassword.value)
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    if (e.code === 'auth/requires-recent-login') {
      passwordError.value = 'Please log out and log in again before changing your password'
    } else {
      passwordError.value = e.message || 'Failed to change password'
    }
  } finally {
    changingPassword.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <button
      @click="router.push({ name: 'profile' })"
      class="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-600 text-sm font-medium mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      Kembali ke Profil
    </button>

    <h1 class="text-2xl font-bold text-stone-900 mb-8">Edit Profil</h1>

    <div class="bg-white rounded-xl border border-stone-200 p-6 mb-6">
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Nama Tampilan</label>
          <input
            v-model="displayName"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">URL Foto</label>
          <input
            v-model="photoURL"
            type="url"
            placeholder="https://example.com/photo.jpg"
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
          <img
            v-if="photoURL"
            :src="photoURL"
            class="mt-3 w-16 h-16 rounded-full object-cover border border-stone-200"
          />
        </div>
        <button
          type="submit"
          :disabled="saving"
          class="bg-brand-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </form>
    </div>

    <div class="bg-white rounded-xl border border-stone-200 p-6">
      <h2 class="text-lg font-bold text-stone-900 mb-4">Ubah Kata Sandi</h2>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Kata Sandi Baru</label>
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="6"
            placeholder="Min. 6 karakter"
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Konfirmasi Kata Sandi</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Masukkan ulang kata sandi"
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>
        <div v-if="passwordError" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ passwordError }}</span>
        </div>
        <button
          type="submit"
          :disabled="changingPassword"
          class="bg-brand-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {{ changingPassword ? 'Mengubah...' : 'Ubah Kata Sandi' }}
        </button>
      </form>
    </div>
  </div>
</template>
