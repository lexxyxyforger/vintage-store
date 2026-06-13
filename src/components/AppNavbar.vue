<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ModalLogout from './ModalLogout.vue'

const router = useRouter()
const store = useStore()

const menuOpen = ref(false)
const dropdownOpen = ref(false)
const searchQuery = ref('')
const showLogoutModal = ref(false)
const mobileSearchOpen = ref(false)
const dropdownRef = ref(null)
const mobileSearchRef = ref(null)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (store.getters.isLoggedIn) {
    store.dispatch('fetchCart')
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e) {
  if (dropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
  if (mobileSearchOpen.value && mobileSearchRef.value && !mobileSearchRef.value.contains(e.target)) {
    mobileSearchOpen.value = false
  }
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) dropdownOpen.value = false
}

function closeAll() {
  menuOpen.value = false
  dropdownOpen.value = false
  mobileSearchOpen.value = false
}

function goTo(routeName) {
  closeAll()
  router.push({ name: routeName })
}

function doSearch() {
  if (!searchQuery.value.trim()) return
  closeAll()
  router.push({ name: 'home', query: { search: searchQuery.value.trim() } })
  searchQuery.value = ''
}

function confirmLogout() {
  showLogoutModal.value = true
  menuOpen.value = false
  dropdownOpen.value = false
}

async function handleLogout() {
  await store.dispatch('logout')
  showLogoutModal.value = false
  router.push('/')
}
</script>

<template>
  <div>
    <nav class="bg-white border-b border-stone-200/80 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <div class="flex items-center gap-3 flex-shrink-0">
            <button @click="toggleMenu" class="md:hidden text-stone-600 hover:text-brand-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <router-link to="/" class="text-xl font-bold text-brand-900 tracking-tight flex-shrink-0">
              Vintage
            </router-link>
          </div>

          <div class="hidden md:flex items-center gap-6 lg:gap-8">
            <router-link to="/" class="text-stone-600 hover:text-brand-600 transition-colors text-sm font-medium">
              Home
            </router-link>
            <router-link to="/#products" class="text-stone-600 hover:text-brand-600 transition-colors text-sm font-medium">
              Products
            </router-link>
            <template v-if="store.getters.isAdmin">
              <router-link to="/admin" class="text-stone-600 hover:text-brand-600 transition-colors text-sm font-medium">
                Dashboard
              </router-link>
              <router-link to="/admin/products" class="text-stone-600 hover:text-brand-600 transition-colors text-sm font-medium">
                Products
              </router-link>
              <router-link to="/admin/orders" class="text-stone-600 hover:text-brand-600 transition-colors text-sm font-medium">
                Orders
              </router-link>
            </template>
          </div>

          <div class="hidden md:flex flex-1 max-w-md mx-auto">
            <div class="relative w-full">
              <input
                v-model="searchQuery"
                @keydown.enter="doSearch"
                type="text"
                placeholder="Search products..."
                class="w-full pl-10 pr-4 py-2 text-sm border border-stone-200 rounded-full bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition-all"
              />
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <button @click="mobileSearchOpen = !mobileSearchOpen" class="md:hidden text-stone-600 hover:text-brand-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <template v-if="store.getters.isLoggedIn">
              <router-link to="/wishlist" class="relative text-stone-600 hover:text-brand-600 transition-colors p-1.5 rounded-lg hover:bg-stone-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </router-link>

              <router-link to="/cart" class="relative text-stone-600 hover:text-brand-600 transition-colors p-1.5 rounded-lg hover:bg-stone-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span
                  v-if="store.getters.cartCount > 0"
                  class="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center min-w-[18px] min-h-[18px] rounded-full ring-2 ring-white"
                >
                  {{ store.getters.cartCount > 99 ? '99+' : store.getters.cartCount }}
                </span>
              </router-link>

              <div ref="dropdownRef" class="relative">
                <button
                  @click.stop="dropdownOpen = !dropdownOpen"
                  class="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full"
                >
                  <img
                    :src="store.getters.userPhoto || `https://ui-avatars.com/api/?name=${store.getters.userName}&background=0d9488&color=fff&font-size=0.33&bold=true`"
                    :alt="store.getters.userName"
                    class="w-8 h-8 rounded-full object-cover ring-2 ring-stone-200 hover:ring-brand-300 transition-all"
                  />
                </button>
                <Transition name="fade">
                  <div
                    v-if="dropdownOpen"
                    class="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border border-stone-200 py-2 z-50 animate-scale-in origin-top-right"
                  >
                    <div class="px-4 py-2.5 border-b border-stone-100">
                      <p class="text-sm font-medium text-stone-900 truncate">{{ store.getters.userName }}</p>
                      <p class="text-xs text-stone-500 truncate">{{ store.getters.userEmail }}</p>
                    </div>
                    <div class="py-1">
                      <button @click="goTo('profile')" class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2.5 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profile
                      </button>
                      <button @click="goTo('orders')" class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2.5 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        Orders
                      </button>
                    </div>
                    <div v-if="store.getters.isAdmin" class="border-t border-stone-100 pt-1">
                      <div class="px-4 py-1">
                        <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Admin</p>
                      </div>
                      <button @click="goTo('admin-dashboard')" class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2.5 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Dashboard
                      </button>
                      <button @click="goTo('admin-products')" class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2.5 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Products
                      </button>
                      <button @click="goTo('admin-orders')" class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700 flex items-center gap-2.5 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Orders
                      </button>
                    </div>
                    <div class="border-t border-stone-100 pt-1">
                      <button @click="confirmLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </template>

            <template v-else>
              <router-link
                to="/register"
                class="text-brand-600 border-2 border-brand-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-600 hover:text-white transition-all"
              >
                Sign up
              </router-link>
              <router-link
                to="/login"
                class="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm"
              >
                Login
              </router-link>
            </template>
          </div>
        </div>
      </div>

      <Transition name="fade">
        <div v-if="mobileSearchOpen" ref="mobileSearchRef" class="md:hidden border-t border-stone-200 px-4 py-3 bg-white">
          <div class="flex gap-2">
            <input
              v-model="searchQuery"
              @keydown.enter="doSearch"
              type="text"
              placeholder="Search products..."
              class="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
            <button @click="doSearch" class="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors flex-shrink-0">Search</button>
          </div>
        </div>
      </Transition>

      <Transition name="slide-down">
        <div v-if="menuOpen" class="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-1 shadow-lg">
          <router-link @click="closeAll" to="/" class="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-brand-50 font-medium">Home</router-link>
          <router-link @click="closeAll" to="/#products" class="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-brand-50">Products</router-link>
          <template v-if="store.getters.isLoggedIn">
            <router-link @click="closeAll" to="/wishlist" class="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-brand-50">Wishlist</router-link>
            <router-link @click="closeAll" to="/cart" class="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-brand-50">Cart <span v-if="store.getters.cartCount">({{ store.getters.cartCount }})</span></router-link>
          </template>
          <hr class="my-2 border-stone-100" />
          <template v-if="store.getters.isAdmin">
            <div class="px-3 py-1">
              <p class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Admin</p>
              <router-link @click="closeAll" to="/admin" class="block px-3 py-2 rounded-lg text-stone-700 hover:bg-brand-50 text-sm">Dashboard</router-link>
              <router-link @click="closeAll" to="/admin/products" class="block px-3 py-2 rounded-lg text-stone-700 hover:bg-brand-50 text-sm">Products</router-link>
              <router-link @click="closeAll" to="/admin/orders" class="block px-3 py-2 rounded-lg text-stone-700 hover:bg-brand-50 text-sm">Orders</router-link>
            </div>
            <hr class="my-2 border-stone-100" />
          </template>
          <template v-if="store.getters.isLoggedIn">
            <router-link @click="closeAll" to="/profile" class="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-brand-50">Profile</router-link>
            <router-link @click="closeAll" to="/orders" class="block px-3 py-2.5 rounded-lg text-stone-700 hover:bg-brand-50">My Orders</router-link>
            <button @click="confirmLogout" class="block w-full text-left px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 font-medium">Logout</button>
          </template>
          <template v-else>
            <router-link @click="closeAll" to="/login" class="block px-3 py-2.5 rounded-lg bg-brand-600 text-white text-center font-medium">Login</router-link>
            <router-link @click="closeAll" to="/register" class="block px-3 py-2.5 rounded-lg border-2 border-brand-600 text-brand-600 text-center font-medium">Sign up</router-link>
          </template>
        </div>
      </Transition>
    </nav>

    <ModalLogout
      :show="showLogoutModal"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
