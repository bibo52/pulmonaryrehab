'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import Link from 'next/link'

interface LogData {
  date: string
  restingO2Sat: number | null
  restingHr: number | null
  inogenSetting: number | null
  symptomsScore: number | null
  seatedMarching: boolean
  shoulderRolls: boolean
  diaphragmaticBreathing: boolean
  pursedLipBreathingWarmup: boolean
  bicepCurlsDone: boolean
  bicepCurlsWeight: string
  bicepCurlsReps: string
  bicepCurlsO2: number | null
  bicepCurlsPR: number | null
  bicepCurlsInogen: number | null
  tricepExtDone: boolean
  tricepExtWeight: string
  tricepExtReps: string
  tricepExtO2: number | null
  tricepExtPR: number | null
  tricepExtInogen: number | null
  shoulderPressDone: boolean
  shoulderPressWeight: string
  shoulderPressReps: string
  shoulderPressO2: number | null
  shoulderPressPR: number | null
  shoulderPressInogen: number | null
  chestPressDone: boolean
  chestPressBand: string
  chestPressReps: string
  chestPressO2: number | null
  chestPressPR: number | null
  chestPressInogen: number | null
  seatedRowsDone: boolean
  seatedRowsBand: string
  seatedRowsReps: string
  seatedRowsO2: number | null
  seatedRowsPR: number | null
  seatedRowsInogen: number | null
  sitToStandsDone: boolean
  sitToStandsReps: string
  sitToStandsO2: number | null
  sitToStandsPR: number | null
  sitToStandsInogen: number | null
  legLiftsDone: boolean
  legLiftsReps: string
  legLiftsO2: number | null
  legLiftsPR: number | null
  legLiftsInogen: number | null
  miniSquatsDone: boolean
  miniSquatsReps: string
  miniSquatsO2: number | null
  miniSquatsPR: number | null
  miniSquatsInogen: number | null
  bandBicepsDone: boolean
  bandBicepsWeight: string
  bandBicepsReps: string
  bandBicepsO2: number | null
  bandBicepsPR: number | null
  bandBicepsInogen: number | null
  bandBackDone: boolean
  bandBackWeight: string
  bandBackReps: string
  bandBackO2: number | null
  bandBackPR: number | null
  bandBackInogen: number | null
  bandGlutesDone: boolean
  bandGlutesWeight: string
  bandGlutesReps: string
  bandGlutesO2: number | null
  bandGlutesPR: number | null
  bandGlutesInogen: number | null
  bandLegsDone: boolean
  bandLegsWeight: string
  bandLegsReps: string
  bandLegsO2: number | null
  bandLegsPR: number | null
  bandLegsInogen: number | null
  bandShouldersDone: boolean
  bandShouldersWeight: string
  bandShouldersReps: string
  bandShouldersO2: number | null
  bandShouldersPR: number | null
  bandShouldersInogen: number | null
  rowingDuration: number | null
  rowingAvgO2: number | null
  rowingLowO2: number | null
  rowingHr: number | null
  rowingInogen: number | null
  lightRowing: boolean
  stretching: boolean
  pursedLipBreathingCooldown: boolean
  recoveryO2: number | null
  recoveryHr: number | null
  notes: string
}

const defaultLog: LogData = {
  date: '',
  restingO2Sat: null,
  restingHr: null,
  inogenSetting: null,
  symptomsScore: null,
  seatedMarching: false,
  shoulderRolls: false,
  diaphragmaticBreathing: false,
  pursedLipBreathingWarmup: false,
  bicepCurlsDone: false,
  bicepCurlsWeight: '',
  bicepCurlsReps: '',
  bicepCurlsO2: null,
  bicepCurlsPR: null,
  bicepCurlsInogen: null,
  tricepExtDone: false,
  tricepExtWeight: '',
  tricepExtReps: '',
  tricepExtO2: null,
  tricepExtPR: null,
  tricepExtInogen: null,
  shoulderPressDone: false,
  shoulderPressWeight: '',
  shoulderPressReps: '',
  shoulderPressO2: null,
  shoulderPressPR: null,
  shoulderPressInogen: null,
  chestPressDone: false,
  chestPressBand: '',
  chestPressReps: '',
  chestPressO2: null,
  chestPressPR: null,
  chestPressInogen: null,
  seatedRowsDone: false,
  seatedRowsBand: '',
  seatedRowsReps: '',
  seatedRowsO2: null,
  seatedRowsPR: null,
  seatedRowsInogen: null,
  sitToStandsDone: false,
  sitToStandsReps: '',
  sitToStandsO2: null,
  sitToStandsPR: null,
  sitToStandsInogen: null,
  legLiftsDone: false,
  legLiftsReps: '',
  legLiftsO2: null,
  legLiftsPR: null,
  legLiftsInogen: null,
  miniSquatsDone: false,
  miniSquatsReps: '',
  miniSquatsO2: null,
  miniSquatsPR: null,
  miniSquatsInogen: null,
  bandBicepsDone: false,
  bandBicepsWeight: '',
  bandBicepsReps: '',
  bandBicepsO2: null,
  bandBicepsPR: null,
  bandBicepsInogen: null,
  bandBackDone: false,
  bandBackWeight: '',
  bandBackReps: '',
  bandBackO2: null,
  bandBackPR: null,
  bandBackInogen: null,
  bandGlutesDone: false,
  bandGlutesWeight: '',
  bandGlutesReps: '',
  bandGlutesO2: null,
  bandGlutesPR: null,
  bandGlutesInogen: null,
  bandLegsDone: false,
  bandLegsWeight: '',
  bandLegsReps: '',
  bandLegsO2: null,
  bandLegsPR: null,
  bandLegsInogen: null,
  bandShouldersDone: false,
  bandShouldersWeight: '',
  bandShouldersReps: '',
  bandShouldersO2: null,
  bandShouldersPR: null,
  bandShouldersInogen: null,
  rowingDuration: null,
  rowingAvgO2: null,
  rowingLowO2: null,
  rowingHr: null,
  rowingInogen: null,
  lightRowing: false,
  stretching: false,
  pursedLipBreathingCooldown: false,
  recoveryO2: null,
  recoveryHr: null,
  notes: '',
}

function NumberInput({
  label,
  value,
  onChange,
  unit = '',
  placeholder = '',
}: {
  label: string
  value: number | null
  onChange: (val: number | null) => void
  unit?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--forest)] mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : null
            onChange(val)
          }}
          placeholder={placeholder}
          className="w-24 text-center text-lg font-semibold"
        />
        {unit && <span className="text-[var(--muted)] font-medium">{unit}</span>}
      </div>
    </div>
  )
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <label className={`exercise-item flex items-center gap-4 cursor-pointer ${checked ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`flex-1 ${checked ? 'line-through text-[var(--muted)]' : 'text-[var(--forest)]'}`}>
        {label}
      </span>
      {checked && <span className="text-xl text-[var(--sage)]">✓</span>}
    </label>
  )
}

function StrengthExercise({
  name,
  done,
  onDoneChange,
  weight,
  onWeightChange,
  reps,
  onRepsChange,
  o2,
  onO2Change,
  pr,
  onPRChange,
  inogen,
  onInogenChange,
  weightLabel = 'Weight',
  weightOptions,
}: {
  name: string
  done: boolean
  onDoneChange: (val: boolean) => void
  weight: string
  onWeightChange: (val: string) => void
  reps: string
  onRepsChange: (val: string) => void
  o2?: number | null
  onO2Change?: (val: number | null) => void
  pr?: number | null
  onPRChange?: (val: number | null) => void
  inogen?: number | null
  onInogenChange?: (val: number | null) => void
  weightLabel?: string
  weightOptions: string[]
}) {
  const repPresets = ['10×2', '12×3', '15×3']

  return (
    <div className={`exercise-item ${done ? 'completed' : ''}`}>
      <label className="flex items-center gap-4 cursor-pointer">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => onDoneChange(e.target.checked)}
        />
        <span className={`flex-1 font-medium ${done ? 'line-through text-[var(--muted)]' : 'text-[var(--forest)]'}`}>
          {name}
        </span>
        {done && <span className="text-xl text-[var(--sage)]">✓</span>}
      </label>
      {done && (
        <div className="mt-4 ml-10 space-y-3">
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">{weightLabel}</label>
            <div className="flex flex-wrap gap-2">
              {weightOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onWeightChange(opt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    weight === opt
                      ? 'bg-[var(--sage)] text-white'
                      : 'bg-[var(--cream-dark)] text-[var(--forest)] hover:bg-[var(--mist)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">Reps × Sets</label>
            <div className="flex flex-wrap gap-2">
              {repPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onRepsChange(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    reps === preset
                      ? 'bg-[var(--sage)] text-white'
                      : 'bg-[var(--cream-dark)] text-[var(--forest)] hover:bg-[var(--mist)]'
                  }`}
                >
                  {preset}
                </button>
              ))}
              <input
                type="text"
                value={repPresets.includes(reps) ? '' : reps}
                onChange={(e) => onRepsChange(e.target.value)}
                placeholder="other"
                className="w-16 px-2 py-1.5 text-sm rounded-lg"
              />
            </div>
          </div>
          {onO2Change && onPRChange && onInogenChange && (
            <div className="pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">Post-Exercise Vitals</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={o2 ?? ''}
                    onChange={(e) => onO2Change(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="O2"
                    className="w-full px-2 py-1.5 text-sm text-center rounded-lg"
                  />
                  <span className="text-xs text-[var(--muted)] block text-center mt-1">O2 %</span>
                </div>
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pr ?? ''}
                    onChange={(e) => onPRChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="PR"
                    className="w-full px-2 py-1.5 text-sm text-center rounded-lg"
                  />
                  <span className="text-xs text-[var(--muted)] block text-center mt-1">Pulse</span>
                </div>
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inogen ?? ''}
                    onChange={(e) => onInogenChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="1-6"
                    className="w-full px-2 py-1.5 text-sm text-center rounded-lg"
                  />
                  <span className="text-xs text-[var(--muted)] block text-center mt-1">Inogen</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BodyweightExercise({
  name,
  done,
  onDoneChange,
  reps,
  onRepsChange,
  o2,
  onO2Change,
  pr,
  onPRChange,
  inogen,
  onInogenChange,
}: {
  name: string
  done: boolean
  onDoneChange: (val: boolean) => void
  reps: string
  onRepsChange: (val: string) => void
  o2?: number | null
  onO2Change?: (val: number | null) => void
  pr?: number | null
  onPRChange?: (val: number | null) => void
  inogen?: number | null
  onInogenChange?: (val: number | null) => void
}) {
  const repPresets = ['10×2', '12×3', '15×3']

  return (
    <div className={`exercise-item ${done ? 'completed' : ''}`}>
      <label className="flex items-center gap-4 cursor-pointer">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => onDoneChange(e.target.checked)}
        />
        <span className={`flex-1 font-medium ${done ? 'line-through text-[var(--muted)]' : 'text-[var(--forest)]'}`}>
          {name}
        </span>
        {done && <span className="text-xl text-[var(--sage)]">✓</span>}
      </label>
      {done && (
        <div className="mt-4 ml-10 space-y-3">
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">Reps × Sets</label>
            <div className="flex flex-wrap gap-2">
              {repPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onRepsChange(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    reps === preset
                      ? 'bg-[var(--sage)] text-white'
                      : 'bg-[var(--cream-dark)] text-[var(--forest)] hover:bg-[var(--mist)]'
                  }`}
                >
                  {preset}
                </button>
              ))}
              <input
                type="text"
                value={repPresets.includes(reps) ? '' : reps}
                onChange={(e) => onRepsChange(e.target.value)}
                placeholder="other"
                className="w-16 px-2 py-1.5 text-sm rounded-lg"
              />
            </div>
          </div>
          {onO2Change && onPRChange && onInogenChange && (
            <div className="pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">Post-Exercise Vitals</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={o2 ?? ''}
                    onChange={(e) => onO2Change(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="O2"
                    className="w-full px-2 py-1.5 text-sm text-center rounded-lg"
                  />
                  <span className="text-xs text-[var(--muted)] block text-center mt-1">O2 %</span>
                </div>
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pr ?? ''}
                    onChange={(e) => onPRChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="PR"
                    className="w-full px-2 py-1.5 text-sm text-center rounded-lg"
                  />
                  <span className="text-xs text-[var(--muted)] block text-center mt-1">Pulse</span>
                </div>
                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inogen ?? ''}
                    onChange={(e) => onInogenChange(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="1-6"
                    className="w-full px-2 py-1.5 text-sm text-center rounded-lg"
                  />
                  <span className="text-xs text-[var(--muted)] block text-center mt-1">Inogen</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="section-header">
      <div className="icon-wrap">
        <span>{icon}</span>
      </div>
      <h2 className="text-xl">{title}</h2>
    </div>
  )
}

function CollapsibleSection({
  icon,
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  icon: string
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="card p-6 animate-fade-in">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="section-header mb-0">
          <div className="icon-wrap">
            <span>{icon}</span>
          </div>
          <h2 className="text-xl">{title}</h2>
          {badge && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-[var(--sage-light)] text-[var(--forest)] rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-[var(--muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-6">{children}</div>}
    </div>
  )
}

function LogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date') || formatInTimeZone(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd')
  const [log, setLog] = useState<LogData>({ ...defaultLog, date: dateParam })
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasExistingLog, setHasExistingLog] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)

  // Fetch existing log for this date, or pre-fill from most recent log
  const fetchLog = useCallback(async () => {
    try {
      // First, try to get log for this specific date
      const res = await fetch(`/api/logs?startDate=${dateParam}&endDate=${dateParam}`)
      if (res.ok) {
        const logs = await res.json()
        if (logs.length > 0) {
          const existingLog = logs[0]
          setLog({
            ...defaultLog,
            ...existingLog,
            date: dateParam,
          })
          setHasExistingLog(true)
          initialLoadRef.current = false
          return
        }
      }

      // No log for today - fetch most recent log to pre-fill pre-exercise vitals only
      const recentRes = await fetch('/api/logs?limit=1')
      if (recentRes.ok) {
        const recentLogs = await recentRes.json()
        if (recentLogs.length > 0) {
          const previousLog = recentLogs[0]
          // Only pre-fill pre-exercise vitals from last time
          setLog({
            ...defaultLog,
            date: dateParam,
            restingO2Sat: previousLog.restingO2Sat,
            restingHr: previousLog.restingHr,
            inogenSetting: previousLog.inogenSetting,
            symptomsScore: previousLog.symptomsScore,
          })
        }
      }
      initialLoadRef.current = false
    } catch (err) {
      console.error('Failed to fetch log:', err)
      initialLoadRef.current = false
    }
  }, [dateParam])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  // Auto-save with debouncing
  const autoSave = useCallback(async (logData: LogData) => {
    setSaving(true)
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      })
      if (res.ok) {
        setSaveStatus('saved')
        setHasExistingLog(true)
        setTimeout(() => setSaveStatus('idle'), 1500)
      }
    } catch (err) {
      console.error('Failed to save:', err)
      setSaveStatus('idle')
    } finally {
      setSaving(false)
    }
  }, [])

  // Trigger auto-save when log changes (with debounce)
  useEffect(() => {
    // Skip auto-save during initial load
    if (initialLoadRef.current) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(log)
    }, 1000) // 1 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [log, autoSave])

  function updateLog<K extends keyof LogData>(key: K, value: LogData[K]) {
    setLog((prev) => ({ ...prev, [key]: value }))
  }

  const displayDate = parseISO(dateParam)

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-[var(--background)] border-b border-[var(--border)] p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--cream-dark)] hover:bg-[var(--mist)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl">{format(displayDate, 'EEEE')}</h1>
            <p className="text-sm text-[var(--muted)]">{format(displayDate, 'MMMM d, yyyy')}</p>
          </div>
          {/* Auto-save status indicator */}
          <div className="text-sm text-[var(--muted)] flex items-center gap-1.5">
            {saveStatus === 'saving' && (
              <>
                <span className="w-2 h-2 bg-[var(--terracotta)] rounded-full animate-pulse" />
                Saving...
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <span className="text-[var(--sage)]">✓</span>
                Saved
              </>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Pre-Exercise Section */}
        <section className="card p-6 animate-fade-in">
          <SectionHeader icon="📊" title="Pre-Exercise Vitals" />
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="O2 Saturation"
              value={log.restingO2Sat}
              onChange={(v) => updateLog('restingO2Sat', v)}
              unit="%"
            />
            <NumberInput
              label="Heart Rate"
              value={log.restingHr}
              onChange={(v) => updateLog('restingHr', v)}
              unit="bpm"
            />
            <NumberInput
              label="Inogen Setting"
              value={log.inogenSetting}
              onChange={(v) => updateLog('inogenSetting', v)}
              placeholder="1-6"
            />
            <NumberInput
              label="Symptoms"
              value={log.symptomsScore}
              onChange={(v) => updateLog('symptomsScore', v)}
              unit="/ 10"
              placeholder="0-10"
            />
          </div>
        </section>

        {/* Warm-Up Section */}
        <section className="card p-6 animate-fade-in delay-1">
          <SectionHeader icon="🔥" title="Warm-Up" />
          <div className="space-y-3">
            <CheckboxItem
              label="Seated Marching (2 min)"
              checked={log.seatedMarching}
              onChange={(v) => updateLog('seatedMarching', v)}
            />
            <CheckboxItem
              label="Shoulder Rolls (20 reps)"
              checked={log.shoulderRolls}
              onChange={(v) => updateLog('shoulderRolls', v)}
            />
            <CheckboxItem
              label="Diaphragmatic Breathing (2 min)"
              checked={log.diaphragmaticBreathing}
              onChange={(v) => updateLog('diaphragmaticBreathing', v)}
            />
            <CheckboxItem
              label="Pursed-Lip Breathing (2 min)"
              checked={log.pursedLipBreathingWarmup}
              onChange={(v) => updateLog('pursedLipBreathingWarmup', v)}
            />
          </div>
        </section>

        {/* Strength Training Section */}
        <section className="card p-6 animate-fade-in delay-2">
          <SectionHeader icon="💪" title="Strength Training" />
          <div className="space-y-4">
            <StrengthExercise
              name="Biceps Curls"
              done={log.bicepCurlsDone}
              onDoneChange={(v) => updateLog('bicepCurlsDone', v)}
              weight={log.bicepCurlsWeight}
              onWeightChange={(v) => updateLog('bicepCurlsWeight', v)}
              reps={log.bicepCurlsReps}
              onRepsChange={(v) => updateLog('bicepCurlsReps', v)}
              o2={log.bicepCurlsO2}
              onO2Change={(v) => updateLog('bicepCurlsO2', v)}
              pr={log.bicepCurlsPR}
              onPRChange={(v) => updateLog('bicepCurlsPR', v)}
              inogen={log.bicepCurlsInogen}
              onInogenChange={(v) => updateLog('bicepCurlsInogen', v)}
              weightOptions={['3 lb', '5 lb', '8 lb', '10 lb']}
            />
            <StrengthExercise
              name="Triceps Extensions"
              done={log.tricepExtDone}
              onDoneChange={(v) => updateLog('tricepExtDone', v)}
              weight={log.tricepExtWeight}
              onWeightChange={(v) => updateLog('tricepExtWeight', v)}
              reps={log.tricepExtReps}
              onRepsChange={(v) => updateLog('tricepExtReps', v)}
              o2={log.tricepExtO2}
              onO2Change={(v) => updateLog('tricepExtO2', v)}
              pr={log.tricepExtPR}
              onPRChange={(v) => updateLog('tricepExtPR', v)}
              inogen={log.tricepExtInogen}
              onInogenChange={(v) => updateLog('tricepExtInogen', v)}
              weightOptions={['3 lb', '5 lb', '8 lb', '10 lb']}
            />
            <StrengthExercise
              name="Shoulder Press"
              done={log.shoulderPressDone}
              onDoneChange={(v) => updateLog('shoulderPressDone', v)}
              weight={log.shoulderPressWeight}
              onWeightChange={(v) => updateLog('shoulderPressWeight', v)}
              reps={log.shoulderPressReps}
              onRepsChange={(v) => updateLog('shoulderPressReps', v)}
              o2={log.shoulderPressO2}
              onO2Change={(v) => updateLog('shoulderPressO2', v)}
              pr={log.shoulderPressPR}
              onPRChange={(v) => updateLog('shoulderPressPR', v)}
              inogen={log.shoulderPressInogen}
              onInogenChange={(v) => updateLog('shoulderPressInogen', v)}
              weightOptions={['3 lb', '5 lb', '8 lb', '10 lb']}
            />
            <StrengthExercise
              name="Chest Press (Band)"
              done={log.chestPressDone}
              onDoneChange={(v) => updateLog('chestPressDone', v)}
              weight={log.chestPressBand}
              onWeightChange={(v) => updateLog('chestPressBand', v)}
              reps={log.chestPressReps}
              onRepsChange={(v) => updateLog('chestPressReps', v)}
              o2={log.chestPressO2}
              onO2Change={(v) => updateLog('chestPressO2', v)}
              pr={log.chestPressPR}
              onPRChange={(v) => updateLog('chestPressPR', v)}
              inogen={log.chestPressInogen}
              onInogenChange={(v) => updateLog('chestPressInogen', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <StrengthExercise
              name="Seated Rows (Band)"
              done={log.seatedRowsDone}
              onDoneChange={(v) => updateLog('seatedRowsDone', v)}
              weight={log.seatedRowsBand}
              onWeightChange={(v) => updateLog('seatedRowsBand', v)}
              reps={log.seatedRowsReps}
              onRepsChange={(v) => updateLog('seatedRowsReps', v)}
              o2={log.seatedRowsO2}
              onO2Change={(v) => updateLog('seatedRowsO2', v)}
              pr={log.seatedRowsPR}
              onPRChange={(v) => updateLog('seatedRowsPR', v)}
              inogen={log.seatedRowsInogen}
              onInogenChange={(v) => updateLog('seatedRowsInogen', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <StrengthExercise
              name="Band - Biceps"
              done={log.bandBicepsDone}
              onDoneChange={(v) => updateLog('bandBicepsDone', v)}
              weight={log.bandBicepsWeight}
              onWeightChange={(v) => updateLog('bandBicepsWeight', v)}
              reps={log.bandBicepsReps}
              onRepsChange={(v) => updateLog('bandBicepsReps', v)}
              o2={log.bandBicepsO2}
              onO2Change={(v) => updateLog('bandBicepsO2', v)}
              pr={log.bandBicepsPR}
              onPRChange={(v) => updateLog('bandBicepsPR', v)}
              inogen={log.bandBicepsInogen}
              onInogenChange={(v) => updateLog('bandBicepsInogen', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <StrengthExercise
              name="Band - Back"
              done={log.bandBackDone}
              onDoneChange={(v) => updateLog('bandBackDone', v)}
              weight={log.bandBackWeight}
              onWeightChange={(v) => updateLog('bandBackWeight', v)}
              reps={log.bandBackReps}
              onRepsChange={(v) => updateLog('bandBackReps', v)}
              o2={log.bandBackO2}
              onO2Change={(v) => updateLog('bandBackO2', v)}
              pr={log.bandBackPR}
              onPRChange={(v) => updateLog('bandBackPR', v)}
              inogen={log.bandBackInogen}
              onInogenChange={(v) => updateLog('bandBackInogen', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <StrengthExercise
              name="Band - Glutes"
              done={log.bandGlutesDone}
              onDoneChange={(v) => updateLog('bandGlutesDone', v)}
              weight={log.bandGlutesWeight}
              onWeightChange={(v) => updateLog('bandGlutesWeight', v)}
              reps={log.bandGlutesReps}
              onRepsChange={(v) => updateLog('bandGlutesReps', v)}
              o2={log.bandGlutesO2}
              onO2Change={(v) => updateLog('bandGlutesO2', v)}
              pr={log.bandGlutesPR}
              onPRChange={(v) => updateLog('bandGlutesPR', v)}
              inogen={log.bandGlutesInogen}
              onInogenChange={(v) => updateLog('bandGlutesInogen', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <StrengthExercise
              name="Band - Legs"
              done={log.bandLegsDone}
              onDoneChange={(v) => updateLog('bandLegsDone', v)}
              weight={log.bandLegsWeight}
              onWeightChange={(v) => updateLog('bandLegsWeight', v)}
              reps={log.bandLegsReps}
              onRepsChange={(v) => updateLog('bandLegsReps', v)}
              o2={log.bandLegsO2}
              onO2Change={(v) => updateLog('bandLegsO2', v)}
              pr={log.bandLegsPR}
              onPRChange={(v) => updateLog('bandLegsPR', v)}
              inogen={log.bandLegsInogen}
              onInogenChange={(v) => updateLog('bandLegsInogen', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <StrengthExercise
              name="Band - Shoulders"
              done={log.bandShouldersDone}
              onDoneChange={(v) => updateLog('bandShouldersDone', v)}
              weight={log.bandShouldersWeight}
              onWeightChange={(v) => updateLog('bandShouldersWeight', v)}
              reps={log.bandShouldersReps}
              onRepsChange={(v) => updateLog('bandShouldersReps', v)}
              o2={log.bandShouldersO2}
              onO2Change={(v) => updateLog('bandShouldersO2', v)}
              pr={log.bandShouldersPR}
              onPRChange={(v) => updateLog('bandShouldersPR', v)}
              inogen={log.bandShouldersInogen}
              onInogenChange={(v) => updateLog('bandShouldersInogen', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <BodyweightExercise
              name="Sit-to-Stands"
              done={log.sitToStandsDone}
              onDoneChange={(v) => updateLog('sitToStandsDone', v)}
              reps={log.sitToStandsReps}
              onRepsChange={(v) => updateLog('sitToStandsReps', v)}
              o2={log.sitToStandsO2}
              onO2Change={(v) => updateLog('sitToStandsO2', v)}
              pr={log.sitToStandsPR}
              onPRChange={(v) => updateLog('sitToStandsPR', v)}
              inogen={log.sitToStandsInogen}
              onInogenChange={(v) => updateLog('sitToStandsInogen', v)}
            />
            <BodyweightExercise
              name="Standing Leg Lifts"
              done={log.legLiftsDone}
              onDoneChange={(v) => updateLog('legLiftsDone', v)}
              reps={log.legLiftsReps}
              onRepsChange={(v) => updateLog('legLiftsReps', v)}
              o2={log.legLiftsO2}
              onO2Change={(v) => updateLog('legLiftsO2', v)}
              pr={log.legLiftsPR}
              onPRChange={(v) => updateLog('legLiftsPR', v)}
              inogen={log.legLiftsInogen}
              onInogenChange={(v) => updateLog('legLiftsInogen', v)}
            />
            <BodyweightExercise
              name="Mini-Squats"
              done={log.miniSquatsDone}
              onDoneChange={(v) => updateLog('miniSquatsDone', v)}
              reps={log.miniSquatsReps}
              onRepsChange={(v) => updateLog('miniSquatsReps', v)}
              o2={log.miniSquatsO2}
              onO2Change={(v) => updateLog('miniSquatsO2', v)}
              pr={log.miniSquatsPR}
              onPRChange={(v) => updateLog('miniSquatsPR', v)}
              inogen={log.miniSquatsInogen}
              onInogenChange={(v) => updateLog('miniSquatsInogen', v)}
            />
          </div>
        </section>

        {/* Aerobic Section */}
        <section className="card p-6 animate-fade-in delay-3">
          <SectionHeader icon="🚣" title="Rowing Machine" />
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Duration"
              value={log.rowingDuration}
              onChange={(v) => updateLog('rowingDuration', v)}
              unit="min"
            />
            <NumberInput
              label="Avg O2 Sat"
              value={log.rowingAvgO2}
              onChange={(v) => updateLog('rowingAvgO2', v)}
              unit="%"
            />
            <NumberInput
              label="Lowest O2 Sat"
              value={log.rowingLowO2}
              onChange={(v) => updateLog('rowingLowO2', v)}
              unit="%"
            />
            <NumberInput
              label="Heart Rate"
              value={log.rowingHr}
              onChange={(v) => updateLog('rowingHr', v)}
              unit="bpm"
            />
            <NumberInput
              label="Inogen Setting"
              value={log.rowingInogen}
              onChange={(v) => updateLog('rowingInogen', v)}
              placeholder="1-6"
            />
          </div>
        </section>

        {/* Cool Down Section */}
        <section className="card p-6 animate-fade-in delay-4">
          <SectionHeader icon="❄️" title="Cool Down" />
          <div className="space-y-3">
            <CheckboxItem
              label="Light Rowing (1-2 min)"
              checked={log.lightRowing}
              onChange={(v) => updateLog('lightRowing', v)}
            />
            <CheckboxItem
              label="Stretching (3 min)"
              checked={log.stretching}
              onChange={(v) => updateLog('stretching', v)}
            />
            <CheckboxItem
              label="Pursed-Lip Breathing (2 min)"
              checked={log.pursedLipBreathingCooldown}
              onChange={(v) => updateLog('pursedLipBreathingCooldown', v)}
            />
          </div>
        </section>

        {/* Post-Exercise Section */}
        <section className="card p-6 animate-fade-in">
          <SectionHeader icon="📈" title="Post-Exercise Vitals" />
          <p className="text-sm text-[var(--muted)] mb-4">Measure after 3 minutes of rest</p>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Recovery O2 Sat"
              value={log.recoveryO2}
              onChange={(v) => updateLog('recoveryO2', v)}
              unit="%"
            />
            <NumberInput
              label="Recovery HR"
              value={log.recoveryHr}
              onChange={(v) => updateLog('recoveryHr', v)}
              unit="bpm"
            />
          </div>
        </section>

        {/* Notes section - always visible */}
        <section className="card p-6 animate-fade-in">
          <SectionHeader icon="📝" title="Notes" />
          <textarea
            value={log.notes}
            onChange={(e) => updateLog('notes', e.target.value)}
            placeholder="How did you feel? Any symptoms..."
            rows={3}
            className="w-full"
          />
        </section>
      </div>

      {/* Floating Done Bar */}
      <div className="floating-bar">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="block w-full btn-primary text-center"
          >
            {saving ? 'Saving...' : 'Done'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-breathe text-5xl mb-4">🫁</div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    }>
      <LogPageContent />
    </Suspense>
  )
}
