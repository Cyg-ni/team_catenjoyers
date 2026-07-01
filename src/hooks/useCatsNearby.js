// src/hooks/useCatsNearby.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Standalone fetch — used by FindCats.jsx directly
export async function fetchCatsNearby(lat, lng, radiusMiles) {
  const radiusMeters = radiusMiles * 1609.34
  const { data, error } = await supabase.rpc('cats_within_radius', {
    user_lat: lat,   // ← must match your SQL function param names
    user_lng: lng,
    radius_m: radiusMeters,
  })
  if (error) throw error
  return (data ?? []).map((c) => ({
    ...c,
    distance_km: c.distance_m / 1000,
  }))
}

// Hook — used anywhere you want reactive fetching
export default function useCatsNearby({ coords, radiusMiles, filter }) {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!coords) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCatsNearby(coords.lat, coords.lng, radiusMiles)
      .then((data) => {
        if (cancelled) return
        const filtered =
          filter === 'all' ? data : data.filter((c) => c.disability_type === filter)
        setCats(filtered)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load cats.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [coords, radiusMiles, filter])

  return { cats, loading, error }
}