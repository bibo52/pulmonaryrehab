'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
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
      <div className="number-stepper">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, (value ?? min) - 1))}
        >
          −
        </button>
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          min={min}
          max={max}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, (value ?? min) + 1))}
        >
          +
        </button>
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
        <div className="grid grid-cols-2 gap-3 mt-4 ml-10">
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{weightLabel}</label>
            <select
              value={weight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="mt-1"
            >
              <option value="">Select...</option>
              {weightOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Reps × Sets</label>
            <input
              type="text"
              value={reps}
              onChange={(e) => onRepsChange(e.target.value)}
              placeholder="e.g., 12×3"
              className="mt-1"
            />
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
          <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Reps × Sets</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => onRepsChange(e.target.value)}
            placeholder="e.g., 10×2"
            className="mt-1 max-w-[200px]"
          />
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

function LogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  const [log, setLog] = useState<LogData>({ ...defaultLog, date: dateParam })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchLog = useCallback(async () => {
    try {
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
        }
      }
    } catch (err) {
      console.error('Failed to fetch log:', err)
    }
  }, [dateParam])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

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
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Pre-Exercise Section */}
        <section className="card p-6 animate-fade-in">
          <SectionHeader icon="📊" title="Pre-Exercise" />
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

        {/* Post-Exercise Section */}
        <section className="card p-6 animate-fade-in">
          <SectionHeader icon="📈" title="Post-Exercise" />
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
          <div>
            <label className="block text-sm font-semibold text-[var(--forest)] mb-2">Notes</label>
            <textarea
              value={log.notes}
              onChange={(e) => updateLog('notes', e.target.value)}
              placeholder="How did you feel? Any symptoms..."
              rows={3}
              className="w-full"
            />
          </div>
        </section>
      </div>

      {/* Floating Save Bar */}
      <div className="floating-bar">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 ${saved ? 'bg-[var(--success)] text-white' : 'btn-primary'} disabled:opacity-50`}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Log'}
          </button>
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
