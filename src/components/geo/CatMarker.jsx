import { useEffect, useMemo, useRef, useState } from 'react'
import { Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

const TYPE_COLORS = {
  'non-disabled': { fill: '#3b6d11', ring: '#c0dd97', label: 'Healthy'        },
  physical:       { fill: '#d85a30', ring: '#f5c4b3', label: 'Physical needs' },
  mental:         { fill: '#8a6ab5', ring: '#d8ccf0', label: 'Mental needs'   },
  admin:          { fill: '#185fa5', ring: '#b5d4f4', label: 'Admin post'     },
}
const DEFAULT_COLOR = TYPE_COLORS['non-disabled']

if (typeof document !== 'undefined' && !document.getElementById('cat-marker-styles')) {
  const style = document.createElement('style')
  style.id = 'cat-marker-styles'
  style.textContent = `
    @keyframes cat-pulse {
      0%   { transform: scale(1);   opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0;   }
    }
    .cat-pulse-ring {
      transform-origin: center;
      animation: cat-pulse 1.4s ease-out infinite;
    }
    /* Ensure Leaflet markers are always on top and clickable */
    .leaflet-marker-pane {
      z-index: 600 !important;
    }
    .leaflet-tooltip-pane {
      z-index: 650 !important;
    }
    /* Bigger touch/click target without making the visual larger */
    .cat-marker-wrapper {
      cursor: pointer !important;
      /* expand hit area via padding */
      padding: 8px !important;
      margin: -8px !important;
      /* keep leaflet's own pointer-events layer working */
      pointer-events: auto !important;
    }
  `
  document.head.appendChild(style)
}

const ZOOM_SIZE = {
  10: 20, 11: 22, 12: 26, 13: 30, 14: 34, 15: 38, 16: 42, 17: 46, 18: 50,
}
function badgeSize(zoom, selected) {
  const base = ZOOM_SIZE[Math.min(Math.max(zoom, 10), 18)] ?? 30
  return selected ? Math.round(base * 1.45) : base
}

function buildIcon(color, zoom, selected) {
  const size  = badgeSize(zoom, selected)
  const half  = size / 2
  const pad   = selected ? 16 : 14
  const total = size + pad * 2
  const cx    = total / 2
  const cy    = total / 2

  const pawScale = size / 38
  const paw = `
    <g transform="translate(${cx},${cy}) scale(${pawScale}) translate(-19,-19)">
      <ellipse cx="19"   cy="23"   rx="6.5" ry="5.5" fill="white" opacity="0.93"/>
      <ellipse cx="10.5" cy="16"   rx="3.2" ry="3.8" fill="white" opacity="0.93"/>
      <ellipse cx="15.5" cy="12.5" rx="3"   ry="3.5" fill="white" opacity="0.93"/>
      <ellipse cx="22.5" cy="12.5" rx="3"   ry="3.5" fill="white" opacity="0.93"/>
      <ellipse cx="27.5" cy="16"   rx="3.2" ry="3.8" fill="white" opacity="0.93"/>
    </g>`

  const pulse = selected ? `
    <circle
      class="cat-pulse-ring"
      cx="${cx}" cy="${cy}" r="${half + 4}"
      fill="none"
      stroke="${color.ring}"
      stroke-width="3"
      opacity="0.8"
    />` : ''

  const hitRect = `<rect x="0" y="0" width="${total}" height="${total}" fill="transparent"/>`

  const shadow = `
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
    </filter>`

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${total}" height="${total}"
      viewBox="0 0 ${total} ${total}"
      overflow="visible"
      class="cat-marker-wrapper"
    >
      <defs>${shadow}</defs>
      ${hitRect}
      ${pulse}
      <circle cx="${cx}" cy="${cy}" r="${half}" fill="${color.fill}" filter="url(#ds)"/>
      <circle cx="${cx}" cy="${cy}" r="${half}" fill="none"
              stroke="white" stroke-width="${selected ? 3 : 2.2}"/>
      ${paw}
    </svg>`

  return L.divIcon({
    html:       svg,
    className:  '',
    iconSize:   [total, total],
    iconAnchor: [cx, cy],
    popupAnchor:[0, -(half + pad + 4)],
  })
}

// ── Name label icon (zoom ≥ 14) ───────────────────────────────────────────────
function buildLabelIcon(name, color, zoom, selected) {
  const size     = badgeSize(zoom, selected)
  const fontSize = Math.max(10, Math.round(size * 0.34))
  // Extra shadow makes names readable over any tile colour
  const html = `
    <div style="
      font-family: system-ui, -apple-system, sans-serif;
      font-size: ${fontSize}px;
      font-weight: 800;
      color: ${color.fill};
      white-space: nowrap;
      text-shadow: 0 0 3px white, 0 0 6px white, 0 1px 0 white;
      -webkit-text-stroke: 2px white;
      paint-order: stroke;
      text-align: center;
      pointer-events: none;
      user-select: none;
      line-height: 1;
      letter-spacing: -0.01em;
    ">${name}</div>`

  return L.divIcon({
    html,
    className:  '',
    iconSize:   [0, 0],
    iconAnchor: [0, -(size / 2 + 6)],
  })
}

export default function GeoCatMarker({ cat, onClick, selected = false }) {
  const map             = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  const markerRef       = useRef(null)

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom())
    map.on('zoomend', onZoom)
    return () => map.off('zoomend', onZoom)
  }, [map])

  const color = TYPE_COLORS[cat.disability_type] ?? DEFAULT_COLOR

  const icon = useMemo(
    () => buildIcon(color, zoom, selected),
    [color, zoom, selected],
  )

  const showLabel = zoom >= 14
  const labelIcon = useMemo(
    () => (showLabel ? buildLabelIcon(cat.name, color, zoom, selected) : null),
    [cat.name, color, zoom, selected, showLabel],
  )

  function handleClick(e) {
    e.originalEvent?.stopPropagation?.()
    e.originalEvent?.preventDefault?.()
    onClick?.(cat)
  }

  const pos = [cat.lat, cat.lng]

  return (
    <>
      <Marker
        ref={markerRef}
        position={pos}
        icon={icon}
        zIndexOffset={selected ? 2000 : 500}
        eventHandlers={{
          click:      handleClick,
          touchstart: handleClick,
          touchend:   (e) => e.originalEvent?.stopPropagation?.(),
        }}
      />

      {showLabel && labelIcon && (
        <Marker
          position={pos}
          icon={labelIcon}
          interactive={false}
          zIndexOffset={selected ? 1999 : 499}
        />
      )}
    </>
  )
}