<script setup>
defineProps({
  count: { type: Number, default: 1 },
})
</script>

<template>
  <template v-for="i in count" :key="i">
    <div class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div class="animate-shimmer h-48" />
      <div class="p-4 space-y-2.5">
        <div class="h-3 bg-stone-200 rounded-full w-1/4 animate-pulse-soft" />
        <div class="h-4 bg-stone-200 rounded-full w-3/4 animate-pulse-soft" />
        <div class="h-5 bg-stone-200 rounded-full w-1/3 animate-pulse-soft" />
      </div>
    </div>
  </template>
</template>
