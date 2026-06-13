<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
</script>

<template>
  <div class="min-h-screen bg-stone-50 text-stone-900">
    <AppNavbar />
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<style>
.page-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
