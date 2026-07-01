import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Loader2, PawPrint, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { useGeolocation } from '../hooks/useGeoLocation'
import { fetchCatsNearby } from '../hooks/useCatsNearby'
import CatDetailDrawer from '../components/geo/CatDetailedDrawer'
import PostCatModal from '../components/geo/PostCatModal'

const GeoMap = lazy(() => import('../components/geo/CatMap'))

const RADIUS_OPTIONS = [5, 10, 20, 50]

const LEGEND = [
  { token: '--color-dot-healthy',  label: 'Healthy' },
  { token: '--color-dot-physical', label: 'Physical' },
  { token: '--color-dot-mental',   label: 'Mental' },
  { token: '--color-dot-admin',    label: 'Admin' },
]

const FILTER_OPTIONS = [
  { value: 'all',          label: 'All' },
  { value: 'non-disabled', label: 'Healthy' },
  { value: 'physical',     label: 'Physical' },
  { value: 'mental',       label: 'Mental' },
  { value: 'admin',        label: 'Admin' },
]

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest' },
  { value: 'recent',   label: 'Recent' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const itemVariant = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

export default function FindCats() {
  const { coords, city, loading: geoLoading } = useGeolocation()
  const [radius, setRadius]           = useState(10)
  const [filter, setFilter]           = useState('all')
  const [sort, setSort]               = useState('distance')
  const [showPost, setShowPost]       = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const [refreshKey, setRefreshKey]   = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sheetSnap, setSheetSnap]     = useState('half')

  const [rawCats, setRawCats]         = useState([])
  const [catsLoading, setCatsLoading] = useState(false)
  const [catsError, setCatsError]     = useState(null)

  useEffect(() => {
    if (!coords) return
    let cancelled = false
    setCatsLoading(true)
    setCatsError(null)

    fetchCatsNearby(coords.lat, coords.lng, radius)
      .then((data) => { if (!cancelled) setRawCats(data) })
      .catch((err) => { if (!cancelled) setCatsError(err.message ?? 'Failed to load cats.') })
      .finally(() => { if (!cancelled) setCatsLoading(false) })

    return () => { cancelled = true }
  }, [coords, radius, refreshKey])

  const cats = rawCats
    .filter((c) => filter === 'all' || c.disability_type === filter)
    .sort((a, b) =>
      sort === 'distance'
        ? (a.distance_km ?? 0) - (b.distance_km ?? 0)
        : new Date(b.created_at) - new Date(a.created_at)
    )

  const handlePosted = useCallback(() => setRefreshKey((k) => k + 1), [])

  function handleCatSelect(cat) {
    setSelectedCat((prev) => (prev?.id === cat.id ? null : cat))
  }

  if (geoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--color-healthy-bg)' }}>
            <PawPrint size={32} style={{ color: 'var(--color-primary)' }} strokeWidth={1.6} />
          </div>
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-body)' }}>Detecting your location</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>Allow location access when prompted</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-page)', position: 'relative' }}>

      {/* Top nav */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-30 border-b px-3 md:px-4 py-0 flex items-center gap-2 md:gap-3 h-[52px]"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <motion.button
          onClick={() => setIsCollapsed((prev) => !prev)}
          whileTap={{ scale: 0.95 }}
          className="hidden md:flex items-center gap-2.5 flex-shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-healthy-bg)' }}
          >
            <PawPrint size={16} style={{ color: 'var(--color-primary)' }} strokeWidth={1.8} />
          </motion.div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-[9px] font-bold uppercase tracking-widest leading-none whitespace-nowrap" style={{ color: 'var(--color-text-faint)' }}>Geo feed</p>
                <h1 className="text-[14px] font-extrabold leading-tight tracking-tight whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>Strays near you</h1>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="flex md:hidden items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-healthy-bg)' }}>
            <PawPrint size={14} style={{ color: 'var(--color-primary)' }} strokeWidth={1.8} />
          </div>
          <h1 className="text-[13px] font-extrabold leading-tight tracking-tight whitespace-nowrap" style={{ color: 'var(--color-text-heading)' }}>Strays near you</h1>
        </div>

        <div className="hidden md:block h-6 w-px flex-shrink-0" style={{ background: 'var(--color-border)' }} />

        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 md:px-3 py-1.5 text-[11px] font-semibold flex-shrink-0"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          <MapPin size={10} strokeWidth={2.5} />
          <span className="max-w-[80px] md:max-w-none truncate">{city || 'Locating…'}</span>
        </div>

        <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
          <SlidersHorizontal size={11} className="hidden md:block" style={{ color: 'var(--color-text-muted)' }} />
          <span className="hidden md:block text-[10px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>Radius</span>
          <div className="flex gap-1">
            {RADIUS_OPTIONS.map((r) => (
              <motion.button
                key={r}
                onClick={() => setRadius(r)}
                whileTap={{ scale: 0.93 }}
                className="text-[10px] font-semibold px-2 md:px-2.5 py-1 rounded-full border transition-colors"
                style={radius === r
                  ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-primary)' }
                  : { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }
                }
              >
                {r}<span className="hidden md:inline"> mi</span><span className="md:hidden">m</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="hidden md:block h-6 w-px flex-shrink-0" style={{ background: 'var(--color-border)' }} />

        <div className="hidden md:flex items-center gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>Status</span>
          <div className="flex gap-1 flex-shrink-0">
            {FILTER_OPTIONS.map((f) => (
              <motion.button
                key={f.value}
                onClick={() => setFilter(f.value)}
                whileTap={{ scale: 0.93 }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap"
                style={filter === f.value
                  ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-primary)' }
                  : { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }
                }
              >
                {f.label}
              </motion.button>
            ))}
          </div>
          <div className="h-4 w-px flex-shrink-0 mx-1" style={{ background: 'var(--color-border)' }} />
          <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>Sort</span>
          <div className="flex gap-1 flex-shrink-0">
            {SORT_OPTIONS.map((s) => (
              <motion.button
                key={s.value}
                onClick={() => setSort(s.value)}
                whileTap={{ scale: 0.93 }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap"
                style={sort === s.value
                  ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-primary)' }
                  : { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }
                }
              >
                {s.label}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          onClick={() => setRefreshKey((k) => k + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border transition-colors flex-shrink-0"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          aria-label="Refresh"
        >
          <RefreshCw size={14} strokeWidth={2} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPost(true)}
          className="flex items-center gap-1 md:gap-1.5 rounded-xl px-2.5 md:px-3.5 py-2 text-[11px] md:text-[12px] font-bold shadow-sm transition-colors flex-shrink-0"
          style={{ background: 'var(--color-cta)', color: 'var(--color-on-cta)' }}
        >
          <Plus size={12} strokeWidth={2.5} />
          <span className="hidden sm:inline">Post a stray</span>
          <span className="sm:hidden">Post</span>
        </motion.button>
      </motion.header>

      {/* Desktop: sidebar + map */}
      <div className="hidden md:flex" style={{ height: 'calc(100vh - 52px)' }}>
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0, width: isCollapsed ? 0 : 320 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 flex flex-col border-r overflow-hidden"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', zIndex: 10 }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {catsLoading ? 'Searching…' : `${cats.length} cat${cats.length !== 1 ? 's' : ''} found`}
            </p>
            <div className="flex items-center gap-3">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: `var(${l.token})` }} />
                  <span className="text-[9px]" style={{ color: 'var(--color-text-faint)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {catsError && (
            <div className="mx-4 mt-3 rounded-xl px-4 py-3 text-[12px] border" style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)', color: 'var(--color-error-text)' }}>
              {catsError}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {catsLoading ? (
              [1,2,3,4,5].map((i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }} className="h-24 rounded-2xl" style={{ background: 'var(--color-border)' }} />
              ))
            ) : cats.length > 0 ? (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-2">
                {cats.map((cat) => (
                  <motion.div key={cat.id} variants={itemVariant}>
                    <CatListRow cat={cat} selected={selectedCat?.id === cat.id} onClick={() => handleCatSelect(cat)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState onPost={() => setShowPost(true)} radius={radius} />
            )}
          </div>
        </motion.aside>

        <div className="flex-1 relative" style={{ zIndex: 0 }}>
          <Suspense fallback={<MapLoading />}>
            <GeoMap coords={coords} cats={cats} radiusMiles={radius} onCatClick={handleCatSelect} selectedCatId={selectedCat?.id} />
          </Suspense>
        </div>
      </div>

      {/* Mobile: map + bottom sheet */}
      <div className="md:hidden relative" style={{ height: 'calc(100vh - 52px)' }}>
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Suspense fallback={<MapLoading />}>
            <GeoMap
              coords={coords} cats={cats} radiusMiles={radius}
              onCatClick={(cat) => { handleCatSelect(cat); setSheetSnap('half') }}
              selectedCatId={selectedCat?.id}
            />
          </Suspense>
        </div>

        <div
          className="absolute top-3 left-3 right-3 flex items-center gap-2 overflow-x-auto rounded-2xl px-3 py-2 border"
          style={{ zIndex: 10, background: 'var(--color-surface)', borderColor: 'var(--color-border)', scrollbarWidth: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
        >
          {FILTER_OPTIONS.map((f) => (
            <motion.button key={f.value} onClick={() => setFilter(f.value)} whileTap={{ scale: 0.93 }}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap flex-shrink-0"
              style={filter === f.value
                ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-primary)' }
                : { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }
              }
            >{f.label}</motion.button>
          ))}
          <div className="h-4 w-px flex-shrink-0 mx-0.5" style={{ background: 'var(--color-border)' }} />
          {SORT_OPTIONS.map((s) => (
            <motion.button key={s.value} onClick={() => setSort(s.value)} whileTap={{ scale: 0.93 }}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap flex-shrink-0"
              style={sort === s.value
                ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-primary)' }
                : { background: 'transparent', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }
              }
            >{s.label}</motion.button>
          ))}
        </div>

        <motion.div
          className="absolute left-0 right-0 bottom-0 flex flex-col rounded-t-3xl border-t overflow-hidden"
          animate={{ height: sheetSnap === 'peek' ? 108 : sheetSnap === 'half' ? '45vh' : '82vh' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          style={{ zIndex: 20, background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: '0 -4px 24px rgba(0,0,0,0.10)' }}
        >
          <button
            onClick={() => setSheetSnap((s) => s === 'peek' ? 'half' : s === 'half' ? 'full' : 'peek')}
            className="flex-shrink-0 flex flex-col items-center pt-2 pb-1 gap-1 w-full"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Toggle sheet"
          >
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
            <div className="w-full flex items-center justify-between px-4 py-1">
              <p className="text-[12px] font-bold" style={{ color: 'var(--color-text-heading)' }}>
                {catsLoading ? 'Searching…' : `${cats.length} stray${cats.length !== 1 ? 's' : ''} nearby`}
              </p>
              <div className="flex items-center gap-3">
                {LEGEND.map((l) => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: `var(${l.token})` }} />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-faint)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>

          <div className="flex-shrink-0 h-px" style={{ background: 'var(--color-border)' }} />

          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
            {catsLoading ? (
              [1,2,3,4,5].map((i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }} className="h-20 rounded-2xl" style={{ background: 'var(--color-border)' }} />
              ))
            ) : cats.length > 0 ? (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-2">
                {cats.map((cat) => (
                  <motion.div key={cat.id} variants={itemVariant}>
                    <CatListRow cat={cat} selected={selectedCat?.id === cat.id} onClick={() => handleCatSelect(cat)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState onPost={() => setShowPost(true)} radius={radius} />
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPost && (
          <PostCatModal key="post-modal" coords={coords} onClose={() => setShowPost(false)} onPosted={handlePosted} />
        )}
        {selectedCat && (
          <CatDetailDrawer key="detail-drawer" cat={selectedCat} onClose={() => setSelectedCat(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function CatListRow({ cat, onClick, selected }) {
  const TYPE_CONFIG = {
    'non-disabled': { bg: 'var(--color-healthy-bg)',  color: 'var(--color-healthy-text)',  label: 'Healthy',        dot: 'var(--color-dot-healthy)' },
    physical:       { bg: 'var(--color-physical-bg)', color: 'var(--color-physical-text)', label: 'Physical needs', dot: 'var(--color-dot-physical)' },
    mental:         { bg: 'var(--color-mental-bg)',   color: 'var(--color-mental-text)',   label: 'Mental needs',   dot: 'var(--color-dot-mental)' },
    admin:          { bg: 'var(--color-admin-bg)',    color: 'var(--color-admin-text)',    label: 'Admin post',     dot: 'var(--color-dot-admin)' },
  }
  const DURATION_MAP = { weekend: 'Weekend', '1-2weeks': '1–2 wks', '1month': '~1 month', '4weeks+': '4 wks+' }
  const type = TYPE_CONFIG[cat.disability_type] ?? TYPE_CONFIG['non-disabled']

  function formatDistance(km) {
    if (km == null) return ''
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border flex gap-3 overflow-hidden transition-all duration-150 hover:shadow-sm"
      style={selected
        ? { borderColor: 'var(--color-primary)', background: 'var(--color-surface-pure)', boxShadow: '0 2px 12px rgba(74,92,42,0.12)' }
        : { borderColor: 'var(--color-border)', background: 'var(--color-surface-pure)' }
      }
    >
      <div className="w-1 self-stretch flex-shrink-0 rounded-l-2xl" style={{ background: type.dot }} />
      {cat.photo_url ? (
        <img src={cat.photo_url} alt={cat.name} className="w-14 h-14 object-cover rounded-xl my-3 flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl my-3 flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--color-page)' }}>
          <PawPrint size={18} style={{ color: 'var(--color-text-faint)' }} strokeWidth={1.5} />
        </div>
      )}
      <div className="flex-1 py-3 pr-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-[13px] leading-tight truncate" style={{ color: 'var(--color-text-heading)' }}>{cat.name}</p>
          {cat.distance_km != null && (
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-text-faint)' }}>{formatDistance(cat.distance_km)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: type.bg, color: type.color }}>{type.label}</span>
          {cat.duration && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--color-page)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              {DURATION_MAP[cat.duration] ?? cat.duration}
            </span>
          )}
        </div>
        {cat.description && (
          <p className="text-[11px] mt-1.5 line-clamp-1 leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>{cat.description}</p>
        )}
      </div>
    </button>
  )
}

function MapLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'var(--color-border)' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Loading map…</p>
    </div>
  )
}

function EmptyState({ onPost, radius }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--color-healthy-bg)' }}>
        <PawPrint size={22} style={{ color: 'var(--color-primary)' }} strokeWidth={1.6} />
      </div>
      <p className="text-[14px] font-bold" style={{ color: 'var(--color-primary)' }}>No cats within {radius} miles</p>
      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
        Expand the radius or be the first to post a stray in your area.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPost}
        className="mt-1 rounded-xl px-5 py-2 text-[12px] font-bold transition-colors"
        style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
      >
        Post a stray cat
      </motion.button>
    </div>
  )
}