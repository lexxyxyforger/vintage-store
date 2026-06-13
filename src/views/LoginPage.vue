<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const route = useRoute()
const store = useStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function parseFirebaseError(err) {
  const code = err.code || ''
  if (code === 'auth/configuration-not-found') {
    return 'Firebase Authentication is not enabled. Open Firebase Console > Authentication > Sign-in method and enable Email/Password and Google.'
  }
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Invalid email or password.'
  }
  if (code === 'auth/invalid-email') {
    return 'Invalid email format.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later.'
  }
  return err.message || 'Something went wrong. Please try again.'
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await store.dispatch('login', { email: email.value, password: password.value })
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = parseFirebaseError(e)
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  error.value = ''
  loading.value = true
  try {
    await store.dispatch('loginWithGoogle')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
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
        <p class="text-stone-500 mt-2 text-sm">Sign in to your account</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <form @submit.prevent="handleLogin" class="space-y-4">
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
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <span class="text-stone-500 text-sm">Don&apos;t have an account? </span>
          <router-link to="/register" class="text-brand-600 text-sm font-semibold hover:text-brand-700 transition-colors">
            Sign up
          </router-link>
        </div>

        <div class="mt-8 flex items-center gap-3">
          <hr class="flex-1 border-stone-200" />
          <span class="text-stone-400 text-xs uppercase tracking-wider font-medium">or</span>
          <hr class="flex-1 border-stone-200" />
        </div>

        <button
          @click="handleGoogle"
          :disabled="loading"
          class="mt-6 w-full border-2 border-stone-200 text-stone-700 py-2.5 rounded-xl font-medium hover:bg-stone-50 hover:border-stone-300 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  </div>
</template>
