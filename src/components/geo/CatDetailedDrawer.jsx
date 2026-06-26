import { motion } from 'framer-motion'
import { X, MapPin, Calendar, User, Shield, Building2, Heart, PawPrint } from 'lucide-react'

const TYPE_CONFIG = {
  'non-disabled': { bg: 'var(--color-healthy-bg)',  color: 'var(--color-healthy-text)',  label: 'Healthy' },
  physical:       { bg: 'var(--color-physical-bg)', color: 'var(--color-physical-text)', label: 'Physical needs' },
  mental:         { bg: 'var(--color-mental-bg)',   color: 'var(--color-mental-text)',   label: 'Mental needs' },
  admin:          { bg: 'var(--color-admin-bg)',    color: 'var(--color-admin-text)',    label: 'Admin post' },
}

const DURATION_MAP = {
  weekend:    'Weekend (2–3 days)',
  '1-2weeks': '1–2 weeks',
  '1month':   'Up to 1 month',
  '4weeks+':  '4 weeks or more',
}

const POSTER_MAP = {
  user:  { Icon: User,      label: 'Community member' },
  admin: { Icon: Shield,    label: 'Admin' },
  vet:   { Icon: Building2, label: 'Vet / Shelter' },
}

function formatDistance(km) {
  if (km == null) return ''
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`
}

export default function CatDetailDrawer({ 
  cat, 
  onClose 
}) {

  if (!cat) return null

  const typeConfig = TYPE_CONFIG[cat.disability_type] ?? TYPE_CONFIG['non-disabled']
  const { Icon: PosterIcon, label: posterLabel } = POSTER_MAP[cat.posted_by] ?? POSTER_MAP.user

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.30)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >


      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-lg rounded-t-3xl overflow-y-auto"
        style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-sheet)', maxHeight: '84svh' }}
      >
        {/* Drag handle */}
        <div className="w-9 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'var(--color-border)' }} />

        {/* Photo */}
        {cat.photo_url ? (
          <div className="relative w-full h-48 overflow-hidden">
            <img src={cat.photo_url} alt={cat.name} className="w-full h-full object-cover block" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(44,58,20,0.20) 0%, transparent 55%)' }} />
          </div>
        ) : (
          <div className="w-full h-36 flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--color-border)' }}>
              <PawPrint size={28} style={{ color: 'var(--color-text-faint)' }} strokeWidth={1.5} />
            </div>
          </div>
        )}

        <div className="px-5 pt-4 pb-8 flex flex-col gap-2.5">

          {/* Name + close */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[22px] font-extrabold leading-tight tracking-tight" style={{ color: 'var(--color-text-heading)' }}>
              {cat.name}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'var(--color-text-faint)' }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Distance */}
          {cat.distance_km != null && (
            <div className="flex items-center gap-1.5 -mt-1">
              <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDistance(cat.distance_km)}</span>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide"
              style={{ background: typeConfig.bg, color: typeConfig.color }}
            >
              {typeConfig.label}
            </span>
            {cat.duration && (
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border flex items-center gap-1"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
              >
                <Calendar size={10} />
                {DURATION_MAP[cat.duration] || cat.duration}
              </span>
            )}
          </div>

          {/* Description */}
          {cat.description && (
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
              {cat.description}
            </p>
          )}

          <div className="h-px my-0.5" style={{ background: 'var(--color-border)' }} />

          {/* Meta */}
          <div className="flex items-center gap-1.5">
            <PosterIcon size={12} style={{ color: 'var(--color-text-faint)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>Posted by {posterLabel}</span>
            {cat.created_at && (
              <>
                <span className="text-[11px]" style={{ color: 'var(--color-border)' }}>·</span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>
                  {new Date(cat.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </span>
              </>
            )}
          </div>

          {/* CTAs */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-1 rounded-xl py-3.5 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <Heart size={14} strokeWidth={2} />
            I can foster this cat
          </motion.button>

          <button
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-[13px] font-medium transition-colors"
            style={{ color: 'var(--color-text-muted)', background: 'transparent' }}
          >
            Back to map
          </button>

        </div>
      </motion.div>
    </motion.div>
  )
}