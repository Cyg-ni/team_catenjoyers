import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, PawPrint, Heart, Zap, Shield, Clock, SlidersHorizontal } from 'lucide-react'

/* ── Constants ─────────────────────────────────────────── */
const CARE_OPTIONS = [
  { value: 'all',          label: 'All types',       Icon: PawPrint },
  { value: 'non-disabled', label: 'Healthy',          Icon: Heart   },
  { value: 'physical',     label: 'Physical needs',   Icon: Zap     },
  { value: 'mental',       label: 'Mental needs',     Icon: Heart   },
  { value: 'admin',        label: 'Admin post',       Icon: Shield  },
]

const DURATION_OPTIONS = [
  { value: 'all',      label: 'Any duration' },
  { value: 'weekend',  label: 'Weekend (2–3 days)' },
  { value: '1-2weeks', label: '1–2 weeks' },
  { value: '1month',   label: 'Up to 1 month' },
  { value: '4weeks+',  label: '4 weeks or more' },
]

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest first' },
  { value: 'newest',   label: 'Most recent' },
  { value: 'duration', label: 'Shortest stay' },
]

/* ── Dropdown primitive ────────────────────────────────── */
function Dropdown({ trigger, children, open, onToggle, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-semibold transition-colors whitespace-nowrap"
        style={open
          ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-primary)' }
          : { background: 'var(--color-surface-pure)', color: 'var(--color-text-body)', borderColor: 'var(--color-border)' }
        }
      >
        {trigger}
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-1.5 left-0 z-30 rounded-2xl border overflow-hidden min-w-[180px]"
            style={{
              background: 'var(--color-surface-pure)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-float)',
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropdownItem({ label, active, onClick, Icon }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors"
      style={active
        ? { background: 'var(--color-healthy-bg)', color: 'var(--color-primary)', fontWeight: 600 }
        : { color: 'var(--color-text-body)' }
      }
    >
      {Icon && <Icon size={13} strokeWidth={2} style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)', flexShrink: 0 }} />}
      {label}
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
      )}
    </button>
  )
}

/* ── GeoFilterBar ──────────────────────────────────────── */
export default function GeoFilterBar({ activeFilter, onChange, duration, onDurationChange, sort, onSortChange }) {
  const [search, setSearch]         = useState('')
  const [careOpen, setCareOpen]     = useState(false)
  const [durationOpen, setDurationOpen] = useState(false)
  const [sortOpen, setSortOpen]     = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)

  const activeCareName     = CARE_OPTIONS.find(o => o.value === activeFilter)?.label ?? 'All types'
  const activeDurationName = DURATION_OPTIONS.find(o => o.value === (duration ?? 'all'))?.label ?? 'Any duration'
  const activeSortName     = SORT_OPTIONS.find(o => o.value === (sort ?? 'distance'))?.label ?? 'Nearest first'

  const hasActiveFilters =
    activeFilter !== 'all' ||
    (duration && duration !== 'all') ||
    search.trim().length > 0

  function clearAll() {
    onChange('all')
    onDurationChange?.('all')
    onSortChange?.('distance')
    setSearch('')
  }

  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

  return (
    <div className="w-full mt-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        <Dropdown
          open={careOpen}
          onToggle={() => { setCareOpen(v => !v); setDurationOpen(false); setSortOpen(false) }}
          onClose={() => setCareOpen(false)}
          trigger={
            <>
              <PawPrint size={12} strokeWidth={2.2} />
              <span>{activeCareName}</span>
            </>
          }
        >
          {CARE_OPTIONS.map(opt => (
            <DropdownItem
              key={opt.value}
              label={opt.label}
              Icon={opt.Icon}
              active={activeFilter === opt.value}
              onClick={() => { onChange(opt.value); setCareOpen(false) }}
            />
          ))}
        </Dropdown>

        {/* Duration */}
        <Dropdown
          open={durationOpen}
          onToggle={() => { setDurationOpen(v => !v); setCareOpen(false); setSortOpen(false) }}
          onClose={() => setDurationOpen(false)}
          trigger={
            <>
              <Clock size={12} strokeWidth={2.2} />
              <span>{activeDurationName}</span>
            </>
          }
        >
          {DURATION_OPTIONS.map(opt => (
            <DropdownItem
              key={opt.value}
              label={opt.label}
              active={(duration ?? 'all') === opt.value}
              onClick={() => { onDurationChange?.(opt.value); setDurationOpen(false) }}
            />
          ))}
        </Dropdown>

        {/* Sort */}
        <Dropdown
          open={sortOpen}
          onToggle={() => { setSortOpen(v => !v); setCareOpen(false); setDurationOpen(false) }}
          onClose={() => setSortOpen(false)}
          trigger={
            <>
              <SlidersHorizontal size={12} strokeWidth={2.2} />
              <span>{activeSortName}</span>
            </>
          }
        >
          {SORT_OPTIONS.map(opt => (
            <DropdownItem
              key={opt.value}
              label={opt.label}
              active={(sort ?? 'distance') === opt.value}
              onClick={() => { onSortChange?.(opt.value); setSortOpen(false) }}
            />
          ))}
        </Dropdown>

        {/* Search toggle */}
        <button
          onClick={() => setShowSearch(v => !v)}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border transition-colors ml-auto"
          style={showSearch
            ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderColor: 'var(--color-primary)' }
            : { background: 'var(--color-surface-pure)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }
          }
          aria-label="Toggle search"
        >
          <Search size={14} strokeWidth={2.2} />
        </button>

      </div>

      {/* Row 2: search input */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-2 h-10 px-3 rounded-xl border"
              style={{ background: 'var(--color-surface-pure)', borderColor: 'var(--color-border)' }}
            >
              <Search size={13} strokeWidth={2} style={{ color: 'var(--color-text-faint)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description…"
                className="flex-1 text-[13px] bg-transparent outline-none"
                style={{ color: 'var(--color-text-heading)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ color: 'var(--color-text-faint)' }}>
                  <X size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilter !== 'all' && (
                <ActiveChip label={activeCareName} onRemove={() => onChange('all')} />
              )}
              {duration && duration !== 'all' && (
                <ActiveChip label={activeDurationName} onRemove={() => onDurationChange?.('all')} />
              )}
              {search.trim() && (
                <ActiveChip label={`"${search}"`} onRemove={() => setSearch('')} />
              )}
              <button
                onClick={clearAll}
                className="text-[11px] font-semibold underline underline-offset-2 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

function ActiveChip({ label, onRemove }) {
  return (
    <span
      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
      style={{ background: 'var(--color-healthy-bg)', color: 'var(--color-primary)', borderColor: 'var(--color-healthy-text)' }}
    >
      {label}
      <button onClick={onRemove} className="flex items-center" style={{ color: 'var(--color-primary)' }}>
        <X size={10} strokeWidth={2.5} />
      </button>
    </span>
  )
}