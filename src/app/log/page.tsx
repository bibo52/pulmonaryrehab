'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
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
  tricepExtDone: boolean
  tricepExtWeight: string
  tricepExtReps: string
  shoulderPressDone: boolean
  shoulderPressWeight: string
  shoulderPressReps: string
  chestPressDone: boolean
  chestPressBand: string
  chestPressReps: string
  seatedRowsDone: boolean
  seatedRowsBand: string
  seatedRowsReps: string
  sitToStandsDone: boolean
  sitToStandsReps: string
  legLiftsDone: boolean
  legLiftsReps: string
  miniSquatsDone: boolean
  miniSquatsReps: string
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
  tricepExtDone: false,
  tricepExtWeight: '',
  tricepExtReps: '',
  shoulderPressDone: false,
  shoulderPressWeight: '',
  shoulderPressReps: '',
  chestPressDone: false,
  chestPressBand: '',
  chestPressReps: '',
  seatedRowsDone: false,
  seatedRowsBand: '',
  seatedRowsReps: '',
  sitToStandsDone: false,
  sitToStandsReps: '',
  legLiftsDone: false,
  legLiftsReps: '',
  miniSquatsDone: false,
  miniSquatsReps: '',
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
  min = 0,
  max = 200,
  unit = '',
}: {
  label: string
  value: number | null
  onChange: (val: number | null) => void
  min?: number
  max?: number
  unit?: string
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
            if (val === null || (val >= min && val <= max)) {
              onChange(val)
            }
          }}
          min={min}
          max={max}
          placeholder={`${min}-${max}`}
          className="w-20 text-center text-lg font-semibold"
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
}: {
  name: string
  done: boolean
  onDoneChange: (val: boolean) => void
  reps: string
  onRepsChange: (val: string) => void
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
        <div className="mt-4 ml-10">
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
  const dateParam = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
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

      // No log for today - fetch most recent log to pre-fill defaults
      const recentRes = await fetch('/api/logs?limit=1')
      if (recentRes.ok) {
        const recentLogs = await recentRes.json()
        if (recentLogs.length > 0) {
          const previousLog = recentLogs[0]
          // Pre-fill with previous values but reset checkboxes to false
          setLog({
            ...defaultLog,
            date: dateParam,
            // Keep equipment settings and weights from last time
            inogenSetting: previousLog.inogenSetting,
            bicepCurlsWeight: previousLog.bicepCurlsWeight || '',
            bicepCurlsReps: previousLog.bicepCurlsReps || '',
            tricepExtWeight: previousLog.tricepExtWeight || '',
            tricepExtReps: previousLog.tricepExtReps || '',
            shoulderPressWeight: previousLog.shoulderPressWeight || '',
            shoulderPressReps: previousLog.shoulderPressReps || '',
            chestPressBand: previousLog.chestPressBand || '',
            chestPressReps: previousLog.chestPressReps || '',
            seatedRowsBand: previousLog.seatedRowsBand || '',
            seatedRowsReps: previousLog.seatedRowsReps || '',
            sitToStandsReps: previousLog.sitToStandsReps || '',
            legLiftsReps: previousLog.legLiftsReps || '',
            miniSquatsReps: previousLog.miniSquatsReps || '',
            rowingInogen: previousLog.rowingInogen,
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
        {/* Pre-Exercise Section - Collapsible */}
        <CollapsibleSection
          icon="📊"
          title="Pre-Exercise Vitals"
          defaultOpen={false}
          badge="optional"
        >
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="O2 Saturation"
              value={log.restingO2Sat}
              onChange={(v) => updateLog('restingO2Sat', v)}
              min={70}
              max={100}
              unit="%"
            />
            <NumberInput
              label="Heart Rate"
              value={log.restingHr}
              onChange={(v) => updateLog('restingHr', v)}
              min={40}
              max={150}
              unit="bpm"
            />
            <NumberInput
              label="Inogen Setting"
              value={log.inogenSetting}
              onChange={(v) => updateLog('inogenSetting', v)}
              min={1}
              max={6}
            />
            <NumberInput
              label="Symptoms"
              value={log.symptomsScore}
              onChange={(v) => updateLog('symptomsScore', v)}
              min={0}
              max={10}
              unit="/ 10"
            />
          </div>
        </CollapsibleSection>

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
              weightOptions={['3 lb', '5 lb', '8 lb', '10 lb']}
            />
            <StrengthExercise
              name="Chest Press"
              done={log.chestPressDone}
              onDoneChange={(v) => updateLog('chestPressDone', v)}
              weight={log.chestPressBand}
              onWeightChange={(v) => updateLog('chestPressBand', v)}
              reps={log.chestPressReps}
              onRepsChange={(v) => updateLog('chestPressReps', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <StrengthExercise
              name="Seated Rows"
              done={log.seatedRowsDone}
              onDoneChange={(v) => updateLog('seatedRowsDone', v)}
              weight={log.seatedRowsBand}
              onWeightChange={(v) => updateLog('seatedRowsBand', v)}
              reps={log.seatedRowsReps}
              onRepsChange={(v) => updateLog('seatedRowsReps', v)}
              weightLabel="Band"
              weightOptions={['5 lb', '10 lb', '15 lb', '20 lb', '30 lb']}
            />
            <BodyweightExercise
              name="Sit-to-Stands"
              done={log.sitToStandsDone}
              onDoneChange={(v) => updateLog('sitToStandsDone', v)}
              reps={log.sitToStandsReps}
              onRepsChange={(v) => updateLog('sitToStandsReps', v)}
            />
            <BodyweightExercise
              name="Standing Leg Lifts"
              done={log.legLiftsDone}
              onDoneChange={(v) => updateLog('legLiftsDone', v)}
              reps={log.legLiftsReps}
              onRepsChange={(v) => updateLog('legLiftsReps', v)}
            />
            <BodyweightExercise
              name="Mini-Squats"
              done={log.miniSquatsDone}
              onDoneChange={(v) => updateLog('miniSquatsDone', v)}
              reps={log.miniSquatsReps}
              onRepsChange={(v) => updateLog('miniSquatsReps', v)}
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
              min={0}
              max={60}
              unit="min"
            />
            <NumberInput
              label="Avg O2 Sat"
              value={log.rowingAvgO2}
              onChange={(v) => updateLog('rowingAvgO2', v)}
              min={70}
              max={100}
              unit="%"
            />
            <NumberInput
              label="Lowest O2 Sat"
              value={log.rowingLowO2}
              onChange={(v) => updateLog('rowingLowO2', v)}
              min={70}
              max={100}
              unit="%"
            />
            <NumberInput
              label="Heart Rate"
              value={log.rowingHr}
              onChange={(v) => updateLog('rowingHr', v)}
              min={40}
              max={180}
              unit="bpm"
            />
            <NumberInput
              label="Inogen Setting"
              value={log.rowingInogen}
              onChange={(v) => updateLog('rowingInogen', v)}
              min={1}
              max={6}
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

        {/* Post-Exercise Section - Collapsible */}
        <CollapsibleSection
          icon="📈"
          title="Post-Exercise Vitals"
          defaultOpen={false}
          badge="optional"
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <NumberInput
              label="Recovery O2 Sat"
              value={log.recoveryO2}
              onChange={(v) => updateLog('recoveryO2', v)}
              min={70}
              max={100}
              unit="%"
            />
            <NumberInput
              label="Recovery HR"
              value={log.recoveryHr}
              onChange={(v) => updateLog('recoveryHr', v)}
              min={40}
              max={150}
              unit="bpm"
            />
          </div>
        </CollapsibleSection>

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
