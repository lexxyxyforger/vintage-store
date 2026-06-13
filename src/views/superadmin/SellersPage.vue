<script setup>
import { ref } from 'vue'

const formEmail = ref('')
const formRole = ref('seller')
const resultCommand = ref('')

function generateCommand() {
  if (!formEmail.value.trim()) return
  resultCommand.value = `npm run bootstrap:superadmin ${formEmail.value.trim()} ${formRole.value}`
}

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(resultCommand.value)
  } catch {
    // silent
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-stone-900 mb-2">Manage Roles</h1>
    <p class="text-stone-500 text-sm mb-8">
      Role disimpan sebagai <strong>custom claims</strong> di Firebase Auth (tidak pakai Firestore).
      Untuk mengubah role, superadmin perlu menjalankan CLI script.
    </p>

    <div class="bg-white rounded-xl border border-stone-200 p-6 mb-8">
      <h2 class="font-semibold text-stone-900 mb-4">Set Role Pengguna</h2>
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          v-model="formEmail"
          type="email"
          placeholder="Email pengguna"
          class="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
        />
        <select
          v-model="formRole"
          class="px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
        >
          <option value="user">User</option>
          <option value="seller">Seller</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <button
          @click="generateCommand"
          class="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          Generate
        </button>
      </div>

      <div v-if="resultCommand" class="bg-stone-900 text-stone-100 rounded-xl p-4 font-mono text-sm">
        <div class="flex items-start justify-between gap-3">
          <code class="break-all">{{ resultCommand }}</code>
          <button
            @click="copyCommand"
            class="text-brand-400 hover:text-brand-300 flex-shrink-0 text-xs font-sans"
          >
            Copy
          </button>
        </div>
      </div>
    </div>

    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 class="font-semibold text-amber-800 mb-2">Cara Penggunaan</h3>
      <ol class="text-sm text-amber-700 space-y-2 list-decimal list-inside">
        <li>Masukkan email pengguna dan pilih role</li>
        <li>Klik <strong>Generate</strong> untuk mendapatkan perintah CLI</li>
        <li>Jalankan perintah tersebut di terminal project ini</li>
        <li>Pengguna harus <strong>logout lalu login ulang</strong> agar role baru aktif</li>
      </ol>
      <p class="text-xs text-amber-600 mt-3">
        Catatan: Custom claims hanya bisa diubah via Admin SDK. Tidak bisa dari browser.
        Script menggunakan service account key yang ada di project ini.
      </p>
    </div>
  </div>
</template>
