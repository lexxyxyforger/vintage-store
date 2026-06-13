import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCXMtQQbIuMBttEDUrX0MTzbr4TwhhLYe4',
  authDomain: 'fe-vue-js-feyy.firebaseapp.com',
  projectId: 'fe-vue-js-feyy',
  storageBucket: 'fe-vue-js-feyy.firebasestorage.app',
  messagingSenderId: '825996452978',
  appId: '1:825996452978:web:10ad3788b28c801cf60eeb',
  measurementId: 'G-MBYK97HGVQ',
}

const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
