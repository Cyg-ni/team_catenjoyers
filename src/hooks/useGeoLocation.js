import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [city, setCity] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Geolocation not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCoords({ lat, lng })

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const cityName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Your city'
          setCity(cityName)
        } catch {
          setCity('Your city')
        }

        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { coords, city, error, loading }
}