import { MapPin, User, Shield, Building2, Clock, PawPrint } from 'lucide-react'

const TYPE_CONFIG = {
  'non-disabled': {
    bg:    'var(--color-healthy-bg)',
    color: 'var(--color-healthy-text)',
    label: 'Healthy',
    dotColor: 'var(--color-dot-healthy)',
  },
  physical: {
    bg:    'var(--color-physical-bg)',
    color: 'var(--color-physical-text)',
    label: 'Physical needs',
    dotColor: 'var(--color-dot-physical)',
  },
  mental: {
    bg:    'var(--color-mental-bg)',
    color: 'var(--color-mental-text)',
    label: 'Mental needs',
    dotColor: 'var(--color-dot-mental)',
  },
  admin: {
    bg:    'var(--color-admin-bg)',
    color: 'var(--color-admin-text)',
    label: 'Admin post',
    dotColor: 'var(--color-dot-admin)',
  },
}

const POSTER_CONFIG = {
  user:  { Icon: User,      label: 'User',  color: 'var(--color-text-muted)' },
  admin: { Icon: Shield,    label: 'Admin', color: 'var(--color-admin-text)' },
  vet:   { Icon: Building2, label: 'Vet',   color: 'var(--color-physical-text)' },
}

const DURATION_MAP = {
  weekend:    'Weekend',
  '1-2weeks': '1–2 wks',
  '1month':   '~1 month',
  '4weeks+':  '4 weeks+',
}

function formatDistance(km) {
  if (km == null) return ''
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export default function CatGeoCard({ cat, onClick, selected }) {
  const type   = TYPE_CONFIG[cat.disability_type] ?? TYPE_CONFIG['non-disabled']
  const poster = POSTER_CONFIG[cat.posted_by]     ?? POSTER_CONFIG.user
  const { Icon: PosterIcon } = poster

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 text-left rounded-2xl border overflow-hidden transition-all duration-150"
      style={selected
        ? { borderColor: 'var(--color-primary)', background: 'var(--color-surface-pure)', boxShadow: '0 4px 16px rgba(74,92,42,0.14)' }
        : { borderColor: 'var(--color-border)',  background: 'var(--color-surface-pure)' }
      }
    >
      {/* Photo / placeholder */}
      {cat.photo_url ? (
        <img src={cat.photo_url} alt={cat.name} className="w-full h-28 object-cover block" />
      ) : (
        <div className="w-full h-28 flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--color-border)' }}>
            <PawPrint size={22} style={{ color: 'var(--color-text-faint)' }} strokeWidth={1.5} />
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="h-1 w-full" style={{ background: type.dotColor }} />

      <div className="p-3 flex flex-col gap-1.5">
        {/* Name */}
        <p className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--color-text-heading)' }}>
          {cat.name}
        </p>

        {/* Distance */}
        {cat.distance_km != null && (
          <div className="flex items-center gap-1">
            <MapPin size={10} style={{ color: 'var(--color-text-faint)' }} strokeWidth={2} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {formatDistance(cat.distance_km)} away
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: type.bg, color: type.color }}
          >
            {type.label}
          </span>
          {cat.duration && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"
              style={{ background: 'var(--color-page)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              <Clock size={8} strokeWidth={2} />
              {DURATION_MAP[cat.duration] ?? cat.duration}
            </span>
          )}
        </div>

        {/* Posted by */}
        <div className="flex items-center gap-1 mt-0.5">
          <PosterIcon size={10} strokeWidth={2} style={{ color: poster.color }} />
          <span className="text-[10px]" style={{ color: poster.color }}>{poster.label}</span>
        </div>

        {/* Description preview */}
        {cat.description && (
          <p className="text-[10px] leading-relaxed line-clamp-2 mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
            {cat.description}
          </p>
        )}
      </div>
    </button>
  )
}