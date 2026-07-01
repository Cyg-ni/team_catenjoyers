import { useEffect, useRef } from 'react'
import { Circle, CircleMarker, Popup, useMap } from 'react-leaflet'

const MILES_TO_M = 1609.34

const RING_STYLE = {
  color:       '#3b6d11',
  fillColor:   '#3b6d11',
  fillOpacity: 0.10,
  weight:      3,
  opacity:     0.9,
  dashArray:   '8 6',
}

const USER_DOT_OPTS = {
  color:       '#fff',
  fillColor:   '#3b6d11',
  fillOpacity: 1,
  weight:      3,
}

function RingController({ coords }) {
  const map        = useMap()
  const prevCoords = useRef(null)

  useEffect(() => {
    if (!coords) return
    const same =
      prevCoords.current &&
      prevCoords.current.lat === coords.lat &&
      prevCoords.current.lng === coords.lng
    if (!same) {
      map.setView([coords.lat, coords.lng], map.getZoom(), { animate: true })
      prevCoords.current = coords
    }
  }, [coords, map])

  return null
}

export default function GeoRadiusRing({ coords, radiusMiles = 10 }) {
  if (!coords) return null

  const radiusM = radiusMiles * MILES_TO_M

  return (
    <>
      <RingController coords={coords} />
      <Circle
        center={[coords.lat, coords.lng]}
        radius={radiusM}
        pathOptions={RING_STYLE}
      />

      <Circle
        center={[coords.lat, coords.lng]}
        radius={radiusM}
        pathOptions={{
          color:       RING_STYLE.color,
          fillColor:   'transparent',
          fillOpacity: 0,
          weight:      1,
          opacity:     0.5,
        }}
      />

      <CircleMarker
        center={[coords.lat, coords.lng]}
        radius={9}
        pathOptions={USER_DOT_OPTS}
      >
        <Popup>
          <div style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize:   12,
            fontWeight: 700,
            color:      '#2c3a14',
            padding:    '2px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{
                display:      'inline-block',
                width:        8,
                height:       8,
                borderRadius: '50%',
                background:   '#3b6d11',
                flexShrink:   0,
              }} />
              You are here
            </div>
            <span style={{ fontWeight: 400, fontSize: 10, color: '#6b7c45' }}>
              Searching within {radiusMiles} mi
            </span>
          </div>
        </Popup>
      </CircleMarker>
    </>
  )
}