<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const saving = ref(false)
const previewLoaded = ref(false)

const form = ref({
  name: '',
  category: '',
  color: '',
  size: '',
  price: '',
  stock: '',
  shipping: '',
  image: '',
  description: '',
})

onMounted(async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    await store.dispatch('fetchProducts')
    const data = store.state.products.find((p) => p.id === route.params.id)
    if (!data) {
      router.push({ name: 'admin-products' })
      return
    }
    form.value = {
      name: data.name || '',
      category: data.category || '',
      color: data.color || '',
      size: data.size || '',
      price: String(data.price || ''),
      stock: data.stock !== undefined ? String(data.stock) : '',
      shipping: String(data.shipping || ''),
      image: data.image || '',
      description: data.description || '',
    }
  } catch {
    router.push({ name: 'admin-products' })
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!form.value.name || !form.value.price || !form.value.image) {
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      category: form.value.category || 'General',
      color: form.value.color || '',
      size: form.value.size || '',
      price: Number(form.value.price),
      stock: form.value.stock !== '' ? Number(form.value.stock) : undefined,
      shipping: Number(form.value.shipping) || 0,
      image: form.value.image,
      description: form.value.description || '',
    }

    if (isEdit.value) {
      store.dispatch('updateProduct', { id: route.params.id, payload })
    } else {
      store.dispatch('addProduct', payload)
    }
    router.push({ name: 'admin-products' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <button
      @click="router.push({ name: 'admin-products' })"
      class="inline-flex items-center gap-1.5 text-stone-500 hover:text-brand-600 text-sm font-medium mb-6 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>

    <div v-if="loading" class="space-y-6">
      <div v-for="i in 5" :key="i" class="h-16 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold text-stone-900 mb-8">
        {{ isEdit ? 'Edit Product' : 'Add New Product' }}
      </h1>

      <form @submit.prevent="save" class="space-y-6">
        <div class="grid sm:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Product Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
            <select
              v-model="form.category"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white transition-all"
            >
              <option value="">Select Category</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Aksesoris">Aksesoris</option>
              <option value="Tas">Tas</option>
              <option value="Sepatu">Sepatu</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Kecantikan">Kecantikan</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Price *</label>
            <input
              v-model="form.price"
              type="number"
              min="0"
              required
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Stock</label>
            <input
              v-model="form.stock"
              type="number"
              min="0"
              placeholder="Available quantity"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Shipping Cost</label>
            <input
              v-model="form.shipping"
              type="number"
              min="0"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Color (comma separated)</label>
            <input
              v-model="form.color"
              type="text"
              placeholder="Red,Blue,Green"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1.5">Size (comma separated)</label>
            <input
              v-model="form.size"
              type="text"
              placeholder="S,M,L,XL"
              class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Image URL *</label>
          <input
            v-model="form.image"
            type="url"
            required
            placeholder="https://picsum.photos/seed/.../400/500"
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
          <img
            v-if="form.image"
            :src="form.image"
            @load="previewLoaded = true"
            @error="previewLoaded = false"
            :class="previewLoaded ? 'opacity-100' : 'opacity-0'"
            class="mt-3 w-24 h-24 object-cover rounded-lg border border-stone-200 transition-opacity"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all"
          />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="bg-brand-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {{ saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product' }}
          </button>
          <button
            type="button"
            @click="router.push({ name: 'admin-products' })"
            class="px-8 py-2.5 border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
