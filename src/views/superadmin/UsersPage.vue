<script setup>
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-stone-900 mb-2">Pengguna</h1>
    <p class="text-stone-500 text-sm mb-8">
      Manajemen user dilakukan via Firebase Console atau CLI script.
    </p>

    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 class="font-semibold text-amber-800 mb-3">Cek & Kelola User</h3>
      <p class="text-sm text-amber-700 mb-4">
        Role disimpan sebagai custom claims di Firebase Auth. Untuk melihat daftar user,
        buka Firebase Console → Authentication.
      </p>
      <a
        href="https://console.firebase.google.com/project/fe-vue-js-feyy/authentication/users"
        target="_blank"
        class="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm text-sm"
      >
        Buka Firebase Auth
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      <hr class="border-amber-200 my-4" />
      <h4 class="font-medium text-amber-800 mb-2">Ubah Role via CLI</h4>
      <code class="block bg-stone-900 text-stone-100 rounded-xl p-4 text-sm font-mono">npm run bootstrap:superadmin email@example.com seller</code>
    </div>
  </div>
</template>
