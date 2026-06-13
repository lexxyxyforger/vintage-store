<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <p class="text-8xl font-black text-brand-200 mb-4">404</p>
      <h1 class="text-2xl font-bold text-stone-900 mb-2">Page Not Found</h1>
      <p class="text-stone-500 mb-8">The page you were looking for doesn't exist or has been moved.</p>
      <button
        @click="router.push('/')"
        class="bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
      >
        Back to Home
      </button>
    </div>
  </div>
</template>
