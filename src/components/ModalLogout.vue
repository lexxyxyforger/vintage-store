<script setup>
defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click="emit('cancel')"
      >
        <div
          class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 animate-scale-in"
          @click.stop
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-stone-900">Sign Out</h2>
              <p class="text-sm text-stone-500">Are you sure you want to sign out?</p>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button
              @click="emit('cancel')"
              class="px-5 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              @click="emit('confirm')"
              class="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
