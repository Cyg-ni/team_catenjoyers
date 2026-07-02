import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export async function fetchCatsNearby(lat, lng, radiusMiles) {
  const radiusMeters = radiusMiles * 1609.34

  const { data, error } = await supabase.rpc('cats_within_radius', {
    user_lat: lat,
    user_lng: lng,
    radius_m: radiusMeters,
  })
  if (error) throw error

  return (data ?? []).map((c) => ({
    ...c,
    distance_km: c.distance_m / 1000,
  }))
}

export async function fetchCatsNearbyBbox(lat, lng, radiusMiles) {
  const delta = radiusMiles / 69
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .gte('lat', lat - delta).lte('lat', lat + delta)
    .gte('lng', lng - delta).lte('lng', lng + delta)
  if (error) throw error
  return (data ?? []).map((c) => ({ ...c, distance_km: null }))
}

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import GeoCatMarker from './CatMarker'
import GeoRadiusRing from './radiusRing'

const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }
const DEFAULT_ZOOM = 12
const LOCATED_ZOOM = 14

const DEV_FALLBACK_CATS = [
  {
    id: 'fake-1', name: 'Mochi', disability_type: 'non-disabled',
    duration: 'weekend', distance_km: 0.4,
    description: 'Orange tabby, very friendly. Found near the wet market.',
    photo_url: null, lat: 14.603, lng: 120.981, posted_by: 'user',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'fake-2', name: 'Shadow', disability_type: 'physical',
    duration: '1-2weeks', distance_km: 1.1,
    description: 'Missing left eye, needs vet attention soon.',
    photo_url: null, lat: 14.598, lng: 120.988, posted_by: 'user',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'fake-3', name: 'Nala', disability_type: 'mental',
    duration: '1month', distance_km: 2.3,
    description: 'Extremely shy, hides under vehicles. Very skittish.',
    photo_url: null, lat: 14.601, lng: 120.975, posted_by: 'user',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'fake-4', name: 'Kiko', disability_type: 'non-disabled',
    duration: 'weekend', distance_km: 0.7,
    description: 'Calico kitten, healthy and very playful.',
    photo_url: null, lat: 14.605, lng: 120.986, posted_by: 'user',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'fake-5', name: 'Brusko', disability_type: 'physical',
    duration: '4weeks+', distance_km: 3.0,
    description: 'Limping on hind leg, needs urgent care.',
    photo_url: null, lat: 14.594, lng: 120.979, posted_by: 'vet',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'fake-6', name: 'Luna', disability_type: 'admin',
    duration: '1-2weeks', distance_km: 1.8,
    description: 'Shelter post — volunteers needed for TNR drive this Saturday.',
    photo_url: null, lat: 14.607, lng: 120.992, posted_by: 'admin',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
]

function MapController({ coords }) {
  const map = useMap()
  const [hasLocated, setHasLocated] = useState(false)

  useEffect(() => {
    if (!coords) return
    const zoom = hasLocated ? map.getZoom() : LOCATED_ZOOM
    map.setView([coords.lat, coords.lng], zoom, { animate: true, duration: 1 })
    setHasLocated(true)
  }, [coords])

  return null
}

function LocationPicker({ active, onPick }) {
  useMapEvents({
    click(e) {
      if (!active) return
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

const pickedIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;transform:translate(-50%,-100%);">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z" fill="#c1440e" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12" cy="10" r="3" fill="#fff"/>
      </svg>
    </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

export default function CatMap({
  coords,
  cats: catsProp = [],
  radiusMiles = 10,
  onCatClick,
  selectedCatId,
  pickMode = false,
  pickedCoords = null,
  onLocationPick,
}) {
  const center = coords ?? DEFAULT_CENTER
  const cats = catsProp.length > 0 ? catsProp : DEV_FALLBACK_CATS

  return (
    <div
      className="relative w-full h-full"
      style={pickMode ? { cursor: 'crosshair' } : undefined}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController coords={coords} />
        <LocationPicker active={pickMode} onPick={onLocationPick} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoRadiusRing coords={coords} radiusMiles={radiusMiles} />

        {cats.map((cat) => (
          <GeoCatMarker
            key={cat.id}
            cat={cat}
            selected={cat.id === selectedCatId}
            onClick={onCatClick}
          />
        ))}

        {pickedCoords && (
          <Marker position={[pickedCoords.lat, pickedCoords.lng]} icon={pickedIcon} />
        )}
      </MapContainer>

      {pickMode && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full text-[12px] font-semibold shadow-lg pointer-events-none"
          style={{ background: 'var(--color-cta)', color: 'var(--color-on-cta)' }}
        >
          Tap the map to drop a pin for this cat
        </div>
      )}

      {catsProp.length === 0 && (
        <div
          className="absolute top-3 right-3 z-[1000] px-2.5 py-1 rounded-full text-[10px] font-bold pointer-events-none"
          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
        >
          DEV · fake markers
        </div>
      )}

      {!coords && (
        <div className="absolute inset-0 z-[1000] flex items-end justify-center pb-6 pointer-events-none">
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[12px] font-semibold shadow-lg pointer-events-auto"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-body)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--color-cta)' }}
            />
            Locating you on the map…
          </div>
        </div>
      )}
    </div>
  )
}