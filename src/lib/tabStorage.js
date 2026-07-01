// src/lib/tabStorage.js
// Isolates Supabase auth to a single tab — prevents cross-tab session sharing.

export const tabStorage = {
  getItem: (key) => {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value)
    } catch {}
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key)
    } catch { /* empty */ }
  },
}