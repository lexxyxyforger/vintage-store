<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function parseFirebaseError(err) {
  const code = err.code || ''
  if (code === 'auth/configuration-not-found') {
    return 'Firebase Authentication is not enabled. Open Firebase Console > Authentication > Sign-in method and enable Email/Password and Google.'
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email is already registered. Please sign in.'
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Use at least 6 characters.'
  }
  if (code === 'auth/invalid-email') {
    return 'Invalid email format.'
  }
  return err.message || 'Something went wrong. Please try again.'
}

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await store.dispatch('register', { email: email.value, password: password.value, name: name.value })
    router.push('/')
  } catch (e) {
    error.value = parseFirebaseError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <router-link to="/" class="text-3xl font-bold text-brand-900 tracking-tight">Vintage</router-link>
        <p class="text-stone-500 mt-2 text-sm">Create a new account</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="Your name"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@email.com"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="Min. 6 characters"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="flex-1">{{ error }}</span>
            <button @click="error = ''" class="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-brand-600 text-white py-2.5 rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            {{ loading ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <span class="text-stone-500 text-sm">Already have an account? </span>
          <router-link to="/login" class="text-brand-600 text-sm font-semibold hover:text-brand-700 transition-colors">
            Sign in
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
