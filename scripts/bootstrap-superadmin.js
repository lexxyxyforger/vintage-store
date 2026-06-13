/**
 * Firebase Role Manager CLI
 *
 * Usage:
 *   node scripts/bootstrap-superadmin.js <email>              # → superadmin
 *   node scripts/bootstrap-superadmin.js <email> seller        # → seller
 *   node scripts/bootstrap-superadmin.js <email> user          # → user
 *
 * Sets custom claims (role) on the Firebase Auth user.
 * No Firestore needed.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const email = process.argv[2]
const role = process.argv[3] || 'superadmin'

if (!email) {
  console.error('Usage: node scripts/bootstrap-superadmin.js <email> [role]')
  console.error('  role defaults to "superadmin", can be: user, seller, superadmin')
  process.exit(1)
}

const validRoles = ['user', 'seller', 'superadmin']
if (!validRoles.includes(role)) {
  console.error(`Invalid role "${role}". Must be one of: ${validRoles.join(', ')}`)
  process.exit(1)
}

const serviceAccountPath = resolve(
  __dirname,
  '..',
  'fe-vue-js-feyy-firebase-adminsdk-fbsvc-d4504d2458.json',
)

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const auth_ = getAuth()

try {
  const user = await auth_.getUserByEmail(email)
  await auth_.setCustomUserClaims(user.uid, { role })
  console.log(`✅ ${email} (${user.uid}) → role "${role}"`)
  console.log('Logout and login again for changes to take effect.')
} catch (e) {
  if (e.code === 'auth/user-not-found') {
    console.error(`User "${email}" not found in Firebase Auth.`)
    console.error('Make sure they have registered first.')
  } else {
    console.error('Error:', e.message)
  }
  process.exit(1)
}
