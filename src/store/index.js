import { createStore } from 'vuex'
import { auth, googleProvider, db } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

async function fetchRoleFromToken(user) {
  if (!user) return null
  try {
    const result = await user.getIdTokenResult()
    return result.claims.role || 'user'
  } catch {
    return 'user'
  }
}

const store = createStore({
  state: {
    user: null,
    userRole: null,
    authLoading: true,
    cartItems: [],
    cartLoading: false,
    products: [],
    productsLoading: true,
    productsError: null,
    productsLoaded: false,
    categories: [],
    categoriesLoading: false,
  },

  getters: {
    isLoggedIn: (state) => !!state.user,
    userId: (state) => state.user?.uid || null,
    userName: (state) => state.user?.displayName || '',
    userEmail: (state) => state.user?.email || '',
    userPhoto: (state) => state.user?.photoURL || '',
    userRole: (state) => state.userRole || 'user',
    isAdmin: (state) => state.userRole === 'superadmin',
    isSeller: (state) => state.userRole === 'seller',
    isSuperadmin: (state) => state.userRole === 'superadmin',

    cartCount: (state) => state.cartItems.reduce((sum, i) => sum + i.quantity, 0),
    cartSubtotal: (state) => state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    cartShipping: (state) => state.cartItems.reduce((sum, i) => sum + (i.shipping || 0) * i.quantity, 0),
    cartTotal: (state, getters) => getters.cartSubtotal + getters.cartShipping,

    productCategories: (state) => [...new Set(state.products.map((p) => p.category))].sort(),
  },

  mutations: {
    SET_USER(state, user) { state.user = user },
    SET_USER_ROLE(state, role) { state.userRole = role },
    SET_AUTH_LOADING(state, val) { state.authLoading = val },
    SET_CART_ITEMS(state, items) { state.cartItems = items },
    SET_CART_LOADING(state, val) { state.cartLoading = val },
    SET_PRODUCTS(state, products) { state.products = products },
    SET_PRODUCTS_LOADING(state, val) { state.productsLoading = val },
    SET_PRODUCTS_ERROR(state, err) { state.productsError = err },
    SET_PRODUCTS_LOADED(state, val) { state.productsLoaded = val },
    SET_PRODUCT(state, product) {
      const idx = state.products.findIndex((p) => p.id === product.id)
      if (idx >= 0) {
        Object.assign(state.products[idx], product)
      } else {
        state.products.push(product)
      }
    },
    REMOVE_PRODUCT(state, id) {
      state.products = state.products.filter((p) => p.id !== id)
    },
    SET_CATEGORIES(state, cats) { state.categories = cats },
    SET_CATEGORIES_LOADING(state, val) { state.categoriesLoading = val },
  },

  actions: {
    async fetchUserRole({ commit }) {
      const role = await fetchRoleFromToken(auth.currentUser)
      commit('SET_USER_ROLE', role)
    },

    async register({ dispatch, commit }, { email, password, name }) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      commit('SET_USER', cred.user)
      await dispatch('fetchUserRole')
      return cred.user
    },

    async login({ dispatch, commit }, { email, password }) {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      commit('SET_USER', cred.user)
      await dispatch('fetchUserRole')
      return cred.user
    },

    async loginWithGoogle({ dispatch, commit }) {
      const cred = await signInWithPopup(auth, googleProvider)
      commit('SET_USER', cred.user)
      await dispatch('fetchUserRole')
      return cred.user
    },

    async logout({ commit }) {
      await signOut(auth)
      commit('SET_USER', null)
      commit('SET_USER_ROLE', null)
    },

    async updateProfile({ commit }, { displayName, photoURL }) {
      const user = auth.currentUser
      if (!user) throw new Error('Not authenticated')
      await updateProfile(user, { displayName, photoURL })
      commit('SET_USER', { ...user, displayName, photoURL })
    },

    async changePassword(_, newPassword) {
      const user = auth.currentUser
      if (!user) throw new Error('Not authenticated')
      await updatePassword(user, newPassword)
    },

    async fetchCart({ commit, getters }) {
      const uid = getters.userId
      if (!uid) {
        commit('SET_CART_ITEMS', [])
        return
      }
      commit('SET_CART_LOADING', true)
      try {
        const q = query(collection(db, 'carts'), where('userId', '==', uid))
        const snap = await getDocs(q)
        commit('SET_CART_ITEMS', snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        commit('SET_CART_ITEMS', [])
      } finally {
        commit('SET_CART_LOADING', false)
      }
    },

    async addToCart({ dispatch, getters }, product) {
      const uid = getters.userId
      if (!uid) return

      const prodSnap = await getDoc(doc(db, 'products', product.id))
      if (!prodSnap.exists()) throw new Error('Product not found')
      const prodData = prodSnap.data()
      if (prodData.stock !== undefined && prodData.stock <= 0) {
        throw new Error('Out of stock')
      }

      const cartRef = doc(db, 'carts', `${uid}_${product.id}`)
      const existing = await getDoc(cartRef)
      if (existing.exists()) {
        const data = existing.data()
        const newQty = data.quantity + 1
        if (prodData.stock !== undefined && newQty > prodData.stock) {
          throw new Error('Not enough stock')
        }
        await setDoc(cartRef, { ...data, quantity: newQty })
      } else {
        await setDoc(cartRef, {
          userId: uid,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          shipping: product.shipping || 0,
          color: product.color || '',
          size: product.size || '',
          quantity: 1,
        })
      }
      await dispatch('fetchCart', uid)
    },

    async updateCartQuantity({ dispatch, getters }, { cartId, quantity }) {
      if (quantity <= 0) {
        await deleteDoc(doc(db, 'carts', cartId))
      } else {
        await setDoc(doc(db, 'carts', cartId), { quantity }, { merge: true })
      }
      await dispatch('fetchCart', getters.userId)
    },

    async removeCartItem({ dispatch, getters }, cartId) {
      await deleteDoc(doc(db, 'carts', cartId))
      await dispatch('fetchCart', getters.userId)
    },

    async clearCart({ getters }) {
      const uid = getters.userId
      if (!uid) return
      const q = query(collection(db, 'carts'), where('userId', '==', uid))
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
    },

    async fetchProducts({ commit, state }) {
      if (state.productsLoaded) return
      commit('SET_PRODUCTS_LOADING', true)
      commit('SET_PRODUCTS_ERROR', null)
      try {
        const q = query(collection(db, 'products'), orderBy('name'))
        const snap = await getDocs(q)
        commit('SET_PRODUCTS', snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        commit('SET_PRODUCTS_LOADED', true)
      } catch (e) {
        commit('SET_PRODUCTS_ERROR', e.message)
      } finally {
        commit('SET_PRODUCTS_LOADING', false)
      }
    },

    async addProduct({ getters, commit }, payload) {
      const ref = doc(collection(db, 'products'))
      const data = { ...payload, sellerId: getters.userId, sellerName: getters.userName }
      commit('SET_PRODUCT', { id: ref.id, ...data })
      commit('SET_PRODUCTS_LOADED', true)
      try {
        await setDoc(ref, data)
      } catch (e) {
        commit('REMOVE_PRODUCT', ref.id)
        console.error('Failed to save product:', e)
      }
      return ref.id
    },

    async updateProduct({ commit, state }, { id, payload }) {
      const existing = state.products.find((p) => p.id === id)
      commit('SET_PRODUCT', { ...existing, ...payload, id })
      commit('SET_PRODUCTS_LOADED', true)
      try {
        await setDoc(doc(db, 'products', id), payload, { merge: true })
      } catch (e) {
        console.error('Failed to update product:', e)
      }
    },

    async deleteProduct({ commit }, id) {
      commit('REMOVE_PRODUCT', id)
      commit('SET_PRODUCTS_LOADED', true)
      try {
        await deleteDoc(doc(db, 'products', id))
      } catch (e) {
        console.error('Failed to delete product:', e)
      }
    },

    async refreshProducts({ commit }) {
      commit('SET_PRODUCTS_LOADING', true)
      commit('SET_PRODUCTS_ERROR', null)
      try {
        const q = query(collection(db, 'products'), orderBy('name'))
        const snap = await getDocs(q)
        commit('SET_PRODUCTS', snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        commit('SET_PRODUCTS_LOADED', true)
      } catch (e) {
        commit('SET_PRODUCTS_ERROR', e.message)
      } finally {
        commit('SET_PRODUCTS_LOADING', false)
      }
    },

    async fetchProductById({ commit }, id) {
      commit('SET_PRODUCTS_LOADING', true)
      commit('SET_PRODUCTS_ERROR', null)
      try {
        const d = await getDoc(doc(db, 'products', id))
        if (!d.exists()) throw new Error('Product not found')
        return { id: d.id, ...d.data() }
      } catch (e) {
        commit('SET_PRODUCTS_ERROR', e.message)
        return null
      } finally {
        commit('SET_PRODUCTS_LOADING', false)
      }
    },

    // --- Categories ---
    async fetchCategories({ commit }) {
      commit('SET_CATEGORIES_LOADING', true)
      try {
        const q = query(collection(db, 'categories'), orderBy('name'))
        const snap = await getDocs(q)
        commit('SET_CATEGORIES', snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        commit('SET_CATEGORIES', [])
      } finally {
        commit('SET_CATEGORIES_LOADING', false)
      }
    },

    async addCategory({ dispatch }, { name }) {
      await addDoc(collection(db, 'categories'), { name, createdAt: serverTimestamp() })
      await dispatch('fetchCategories')
    },

    async updateCategory({ dispatch }, { id, name }) {
      await setDoc(doc(db, 'categories', id), { name }, { merge: true })
      await dispatch('fetchCategories')
    },

    async deleteCategory({ dispatch }, id) {
      await deleteDoc(doc(db, 'categories', id))
      await dispatch('fetchCategories')
    },

    // --- Reviews ---
    async fetchReviews(_, productId) {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc'),
        )
        const snap = await getDocs(q)
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch {
        return []
      }
    },

    async addReview({ getters }, { productId, rating, comment }) {
      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: getters.userId,
        userName: getters.userName,
        userPhoto: getters.userPhoto,
        rating,
        comment,
        createdAt: serverTimestamp(),
      })
    },

    // --- Addresses ---
    async fetchAddresses({ getters }) {
      const uid = getters.userId
      if (!uid) return []
      try {
        const q = query(
          collection(db, 'addresses'),
          where('userId', '==', uid),
          orderBy('isDefault', 'desc'),
          orderBy('createdAt', 'desc'),
        )
        const snap = await getDocs(q)
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch {
        return []
      }
    },

    async addAddress({ getters }, address) {
      const uid = getters.userId
      if (!uid) throw new Error('Not authenticated')
      const ref = await addDoc(collection(db, 'addresses'), {
        ...address,
        userId: uid,
        createdAt: serverTimestamp(),
      })
      return ref.id
    },

    async updateAddress(_, { id, data }) {
      await setDoc(doc(db, 'addresses', id), data, { merge: true })
    },

    async deleteAddress(_, id) {
      await deleteDoc(doc(db, 'addresses', id))
    },

    // --- Orders ---
    async createOrder({ getters, dispatch }, { items, address, paymentMethod, subtotal, shipping, discount, total }) {
      const uid = getters.userId
      if (!uid) throw new Error('Not authenticated')

      const orderRef = await addDoc(collection(db, 'transactions'), {
        userId: uid,
        userName: getters.userName,
        userEmail: getters.userEmail,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          shipping: i.shipping,
          color: i.color,
          size: i.size,
          image: i.image,
        })),
        shippingAddress: address,
        paymentMethod,
        subtotal,
        shipping,
        discount,
        total,
        status: 'Processed',
        statusHistory: [{ status: 'Processed', timestamp: new Date().toISOString() }],
        createdAt: serverTimestamp(),
      })

      for (const item of items) {
        const prodRef = doc(db, 'products', item.productId)
        const prodSnap = await getDoc(prodRef)
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stock
          if (currentStock !== undefined) {
            await setDoc(prodRef, { stock: Math.max(0, currentStock - item.quantity) }, { merge: true })
          }
        }
      }

      await dispatch('clearCart')
      return orderRef.id
    },

    async fetchUserOrders({ getters }) {
      const uid = getters.userId
      if (!uid) return []
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', uid),
          orderBy('createdAt', 'desc'),
        )
        const snap = await getDocs(q)
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch {
        return []
      }
    },

    async fetchOrderById(_, id) {
      try {
        const d = await getDoc(doc(db, 'transactions', id))
        if (!d.exists()) return null
        return { id: d.id, ...d.data() }
      } catch {
        return null
      }
    },

    async updateOrderStatus(_, { id, status }) {
      const snap = await getDoc(doc(db, 'transactions', id))
      if (!snap.exists()) throw new Error('Order not found')
      const data = snap.data()
      const history = data.statusHistory || []
      history.push({ status, timestamp: new Date().toISOString() })
      await setDoc(doc(db, 'transactions', id), { status, statusHistory: history }, { merge: true })
    },

    async fetchAllOrders() {
      try {
        const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch {
        return []
      }
    },
  },
})

onAuthStateChanged(auth, async (firebaseUser) => {
  store.commit('SET_USER', firebaseUser)
  if (firebaseUser) {
    await store.dispatch('fetchUserRole')
  } else {
    store.commit('SET_USER_ROLE', null)
  }
  store.commit('SET_AUTH_LOADING', false)
})

export default store
