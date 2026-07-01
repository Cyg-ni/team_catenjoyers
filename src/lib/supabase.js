// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

// Prevent Supabase from syncing auth events across tabs
if (typeof window !== 'undefined') {
  window.BroadcastChannel = class {
    constructor() {}
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
    close() {}
  }
}

// Tab-isolated storage — uses sessionStorage so auth doesn't bleed across tabs
const tabStorage = {
  getItem: (key) => {
    try { return sessionStorage.getItem(key) } catch { return null }
  },
  setItem: (key, value) => {
    try { sessionStorage.setItem(key, value) } catch {}
  },
  removeItem: (key) => {
    try { sessionStorage.removeItem(key) } catch {}
  },
}

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: tabStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})