import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, MapPin, Crosshair, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const DISABILITY_OPTIONS = [
  { value: 'non-disabled', label: 'Non-disabled / Healthy',   activeBg: 'var(--color-healthy-bg)',  activeBorder: 'var(--color-healthy-text)' },
  { value: 'physical',     label: 'Physical disability',       activeBg: 'var(--color-physical-bg)', activeBorder: 'var(--color-physical-text)' },
  { value: 'mental',       label: 'Mental / behavioral needs', activeBg: 'var(--color-mental-bg)',   activeBorder: 'var(--color-mental-text)' },
]

const DURATION_OPTIONS = [
  { value: 'weekend',  label: 'Weekend (2–3 days)' },
  { value: '1-2weeks', label: '1–2 weeks' },
  { value: '1month',   label: 'Up to 1 month' },
  { value: '4weeks+',  label: '4 weeks or more' },
]

export default function PostCatModal({
  coords,
  usingPickedLocation = false,
  onRequestPickLocation,
  onUseCurrentLocation,
  onClose,
  onPosted,
})  {
  const [form, setForm] = useState({
    name: '',
    disability_type: 'non-disabled',
    duration: 'weekend',
    description: '',
  })
  const [photo, setPhoto]               = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [step, setStep]                 = useState(1)

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!coords) { setError('Location unavailable. Allow location access and try again.'); return }
    if (!form.name.trim()) { setError('Give the cat a name or nickname.'); return }

    setLoading(true)
    setError(null)
    let photo_url = null

    if (photo) {
      const ext  = photo.name.split('.').pop()
      const path = `cats/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('cat-photos')
        .upload(path, photo, { cacheControl: '3600', upsert: false })
      if (uploadError) { setError(`Photo upload failed: ${uploadError.message}`); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('cat-photos').getPublicUrl(path)
      photo_url = publicUrl
    }

    const { error: insertError } = await supabase.from('cats').insert({
      name:            form.name.trim(),
      disability_type: form.disability_type,
      duration:        form.duration,
      description:     form.description.trim() || null,
      lat:             coords.lat,
      lng:             coords.lng,
      photo_url,
      posted_by:       'user', // TODO: replace with auth user id once auth is set up
    })

    if (insertError) { setError(`Failed to post: ${insertError.message}`); setLoading(false); return }
    setLoading(false)
    setStep(2)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.38)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0.85 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="w-full max-w-lg rounded-t-3xl overflow-y-auto"
        style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-sheet)', maxHeight: '92svh' }}
      >
        <div className="w-9 h-1 rounded-full mx-auto mt-3 mb-0.5" style={{ background: 'var(--color-border)' }} />

        <AnimatePresence mode="wait">
          {step === 2 ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center px-6 py-10 pb-12 text-center gap-3"
            >
              <div className="rounded-full flex items-center justify-center mb-1" style={{ background: 'var(--color-healthy-bg)', width: 72, height: 72 }}>
                <CheckCircle size={34} style={{ color: 'var(--color-healthy-text)' }} strokeWidth={1.8} />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-heading)' }}>Cat posted!</h3>
              <p className="text-[13px] leading-relaxed max-w-[280px]" style={{ color: 'var(--color-text-muted)' }}>
                Your post is now visible to fosters nearby. Thank you for looking out for a stray.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onPosted(); onClose() }}
                className="mt-2 w-full rounded-xl py-3 text-[13px] font-bold transition-colors"
                style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              >
                See nearby cats
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <h2 className="text-[15px] font-bold" style={{ color: 'var(--color-text-heading)' }}>Post a stray cat</h2>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-faint)' }}>Your location is attached automatically</p>
                </div>
                <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: 'var(--color-text-faint)' }}>
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4 pb-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl px-4 py-3 text-[13px] border"
                    style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)', color: 'var(--color-error-text)' }}
                  >
                    {error}
                  </motion.div>
                )}

                <Field label="Cat name or nickname" required>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleField('name', e.target.value)}
                    placeholder="Orange tabby from Rizal St"
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none border transition-colors"
                    style={{ background: 'var(--color-surface-pure)', color: 'var(--color-text-heading)', borderColor: 'var(--forest-100)' }}
                  />
                </Field>

                <Field label="Care category">
                  <div className="flex flex-col gap-2">
                    {DISABILITY_OPTIONS.map((opt) => {
                      const active = form.disability_type === opt.value
                      return (
                        <label
                          key={opt.value}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-colors"
                          style={active
                            ? { background: opt.activeBg, borderColor: opt.activeBorder }
                            : { background: 'var(--color-surface-pure)', borderColor: 'var(--color-border)' }
                          }
                        >
                          <input
                            type="radio"
                            name="disability_type"
                            value={opt.value}
                            checked={active}
                            onChange={() => handleField('disability_type', opt.value)}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-[13px]" style={{ color: 'var(--color-text-heading)' }}>{opt.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </Field>

                <Field label="Foster duration needed">
                  <select
                    value={form.duration}
                    onChange={(e) => handleField('duration', e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none border appearance-none cursor-pointer"
                    style={{ background: 'var(--color-surface-pure)', color: 'var(--color-text-heading)', borderColor: 'var(--forest-100)' }}
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Description" optional>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleField('description', e.target.value)}
                    placeholder="Where you found them, their condition, behaviour, markings…"
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none border resize-none transition-colors"
                    style={{ background: 'var(--color-surface-pure)', color: 'var(--color-text-heading)', borderColor: 'var(--forest-100)' }}
                  />
                </Field>

                <Field label="Photo" optional>
                  {photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--forest-100)' }}>
                      <img src={photoPreview} alt="Preview" className="w-full h-36 object-cover block" />
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                        aria-label="Remove photo"
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-white"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label
                      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors"
                      style={{ borderColor: 'var(--forest-100)' }}
                    >
                      <Camera size={20} strokeWidth={1.6} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Add a photo</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </Field>

                <Field label="Cat's location">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onUseCurrentLocation}
                      className="flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 transition-colors"
                      style={!usingPickedLocation
                        ? { background: 'var(--color-healthy-bg)', borderColor: 'var(--color-primary)' }
                        : { background: 'var(--color-surface-pure)', borderColor: 'var(--color-border)' }
                      }
                    >
                      <MapPin
                        size={18}
                        strokeWidth={2}
                        style={{ color: !usingPickedLocation ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                      />
                      <span
                        className="text-[12px] font-bold"
                        style={{ color: !usingPickedLocation ? 'var(--color-text-heading)' : 'var(--color-text-muted)' }}
                      >
                        Current location
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={onRequestPickLocation}
                      className="flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 transition-colors"
                      style={usingPickedLocation
                        ? { background: 'var(--color-healthy-bg)', borderColor: 'var(--color-primary)' }
                        : { background: 'var(--color-surface-pure)', borderColor: 'var(--color-border)' }
                      }
                    >
                      <Crosshair
                        size={18}
                        strokeWidth={2}
                        style={{ color: usingPickedLocation ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                      />
                      <span
                        className="text-[12px] font-bold"
                        style={{ color: usingPickedLocation ? 'var(--color-text-heading)' : 'var(--color-text-muted)' }}
                      >
                        Choose on map
                      </span>
                    </button>
                  </div>
                </Field>

                <div
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                  style={{ background: 'var(--color-location-bg)' }}
                >
                  <MapPin size={13} strokeWidth={2} style={{ color: 'var(--color-location-text)', flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: 'var(--color-location-text)' }}>
                    {coords
                      ? usingPickedLocation
                        ? `Pin dropped (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
                        : `Using current location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
                      : 'Waiting for location…'}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !coords}
                  className="w-full rounded-xl py-3 text-[13px] font-bold transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={15} className="animate-spin" />
                      Posting…
                    </span>
                  ) : 'Post cat'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children, required, optional }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-body)' }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: 'var(--color-cta)' }}>*</span>}
        {optional && <span className="font-normal normal-case ml-1" style={{ color: 'var(--color-text-faint)' }}>(optional)</span>}
      </label>
      {children}
    </div>
  )
}