// components/geo/map/CatMap.jsx
// requires: npm i leaflet react-leaflet

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const TYPE_COLORS = {
  'non-disabled': '#3b6d11',
  physical:       '#d85a30',
  mental:         '#8a6ab5',
  admin:          '#185fa5',
}

const MILES_TO_KM = 1.60934

// Default center while waiting for geolocation (Manila)
const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }
const DEFAULT_ZOOM   = 12
const LOCATED_ZOOM   = 14

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

export default function CatMap({ coords, cats = [], radiusMiles, onCatClick, selectedCatId }) {
  const center       = coords ?? DEFAULT_CENTER
  const radiusMeters = (radiusMiles ?? 10) * MILES_TO_KM * 1000
  const isLocated    = !!coords

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController coords={coords} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Radius ring — only once located */}
        {isLocated && (
          <Circle
            center={[coords.lat, coords.lng]}
            radius={radiusMeters}
            pathOptions={{
              color: '#4a5c2a',
              fillColor: '#4a5c2a',
              fillOpacity: 0.05,
              weight: 1.5,
              dashArray: '6 4',
            }}
          />
        )}

        {/* User dot — only once located */}
        {isLocated && (
          <CircleMarker
            center={[coords.lat, coords.lng]}
            radius={8}
            pathOptions={{
              color: '#fff',
              fillColor: '#4a5c2a',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <span style={{ fontSize: 12, color: '#2c3a14', fontWeight: 600 }}>You are here</span>
            </Popup>
          </CircleMarker>
        )}

        {/* Cat dots */}
        {cats.map((cat) => {
          const color      = TYPE_COLORS[cat.disability_type] ?? TYPE_COLORS['non-disabled']
          const isSelected = cat.id === selectedCatId
          return (
            <CircleMarker
              key={cat.id}
              center={[cat.lat, cat.lng]}
              radius={isSelected ? 11 : 8}
              pathOptions={{
                color: '#fff',
                fillColor: color,
                fillOpacity: 1,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{ click: () => onCatClick?.(cat) }}
            >
              <Popup>
                <div style={{ fontSize: 12, minWidth: 130 }}>
                  <p style={{ fontWeight: 700, color: '#2c3a14', margin: '0 0 2px' }}>{cat.name}</p>
                  {cat.description && (
                    <p style={{ color: '#6b7c45', margin: 0, fontSize: 11 }}>{cat.description}</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Locating overlay — sits on top of the live map */}
      {!isLocated && (
        <div
          className="absolute inset-0 z-[1000] flex items-end justify-center pb-6 pointer-events-none"
        >
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[12px] font-semibold shadow-lg pointer-events-auto"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-body)', border: '1px solid var(--color-border)' }}
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