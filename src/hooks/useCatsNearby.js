import { useState, useEffect } from 'react'
import { supabase } from '../../supabase' 

export function useCatsNearby({ coords, radiusMiles, filter }) {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!coords) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    const radiusMeters = radiusMiles * 1609.34
    supabase
      .rpc('cats_within_radius', {
        lat: coords.lat,
        lng: coords.lng,
        radius_m: radiusMeters,
      })
      .then(({ data, error }) => {
        if (error) { console.error(error); setLoading(false); return }
        const filtered = filter === 'all'
          ? data
          : data.filter(c => c.disability_type === filter)
        setCats(filtered)
        setLoading(false)
      })
  }, [coords, radiusMiles, filter])

  return { cats, loading }
}