<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, doc, getDocs, addDoc, setDoc, deleteDoc, orderBy, query } from 'firebase/firestore'

const categories = ref([])
const loading = ref(true)
const showForm = ref(false)
const editing = ref(null)
const formName = ref('')

onMounted(async () => {
  await loadCategories()
})

async function loadCategories() {
  loading.value = true
  try {
    const q = query(collection(db, 'categories'), orderBy('name'))
    const snap = await getDocs(q)
    categories.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    categories.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editing.value = null
  formName.value = ''
  showForm.value = true
}

function openEdit(cat) {
  editing.value = cat.id
  formName.value = cat.name
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  formName.value = ''
  editing.value = null
}

async function saveCategory() {
  if (!formName.value.trim()) {
    return
  }
  if (editing.value) {
    await setDoc(doc(db, 'categories', editing.value), { name: formName.value.trim() }, { merge: true })
  } else {
    await addDoc(collection(db, 'categories'), { name: formName.value.trim() })
  }
  cancelForm()
  await loadCategories()
}

async function removeCategory(id, name) {
  if (!confirm(`Delete category "${name}"?`)) return
  await deleteDoc(doc(db, 'categories', id))
  await loadCategories()
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-stone-900">Categories</h1>
      <button
        @click="openAdd"
        class="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Add Category
      </button>
    </div>

    <div v-if="showForm" class="bg-white rounded-xl border border-stone-200 p-6 mb-6 animate-fade-in">
      <h2 class="font-semibold text-stone-900 mb-4">{{ editing ? 'Edit Category' : 'New Category' }}</h2>
      <form @submit.prevent="saveCategory" class="flex gap-3">
        <input
          v-model="formName"
          type="text"
          required
          placeholder="Category name"
          class="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
        />
        <button type="submit" class="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm">
          {{ editing ? 'Save' : 'Add' }}
        </button>
        <button type="button" @click="cancelForm" class="px-6 py-2.5 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 transition-colors">
          Cancel
        </button>
      </form>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-14 bg-stone-100 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="categories.length === 0" class="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400">
      <p class="font-medium">No categories yet</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
          <tr>
            <th class="text-left px-6 py-3 font-medium">Name</th>
            <th class="text-right px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr v-for="cat in categories" :key="cat.id" class="hover:bg-stone-50 transition-colors">
            <td class="px-6 py-4 font-medium text-stone-900">{{ cat.name }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="openEdit(cat)" class="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button @click="removeCategory(cat.id, cat.name)" class="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
