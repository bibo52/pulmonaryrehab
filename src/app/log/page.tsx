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
    <div className="flex flex-col gap-2">
      <label className="font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, (value ?? min) - 1))}
          className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-bold"
        >
          −
        </button>
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-24 text-center"
          min={min}
          max={max}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, (value ?? min) + 1))}
          className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-bold"
        >
          +
        </button>
        {unit && <span className="text-[var(--muted)]">{unit}</span>}
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
    <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={checked ? 'line-through text-[var(--muted)]' : ''}>{label}</span>
      {checked && <span className="ml-auto text-2xl">✓</span>}
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
    <div className={`p-4 rounded-xl ${done ? 'bg-[var(--success-light)]' : 'bg-gray-50'}`}>
      <label className="flex items-center gap-4 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => onDoneChange(e.target.checked)}
        />
        <span className={`font-medium ${done ? 'line-through text-[var(--muted)]' : ''}`}>
          {name}
        </span>
        {done && <span className="ml-auto text-xl">✓</span>}
      </label>
      {done && (
        <div className="grid grid-cols-2 gap-3 mt-3 pl-10">
          <div>
            <label className="text-sm text-[var(--muted)]">{weightLabel}</label>
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
            <label className="text-sm text-[var(--muted)]">Reps × Sets</label>
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
    <div className={`p-4 rounded-xl ${done ? 'bg-[var(--success-light)]' : 'bg-gray-50'}`}>
      <label className="flex items-center gap-4 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={done}
          onChange={(e) => onDoneChange(e.target.checked)}
        />
        <span className={`font-medium ${done ? 'line-through text-[var(--muted)]' : ''}`}>
          {name}
        </span>
        {done && <span className="ml-auto text-xl">✓</span>}
      </label>
      {done && (
        <div className="pl-10">
          <label className="text-sm text-[var(--muted)]">Reps × Sets</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => onRepsChange(e.target.value)}
            placeholder="e.g., 10×2"
            className="mt-1 max-w-xs"
          />
        </div>
      )}
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
    <div className="min-h-screen p-6 max-w-3xl mx-auto pb-32">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Daily Log</h1>
          <p className="text-[var(--muted)] text-xl mt-1">
            {format(displayDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Pre-Exercise Section */}
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <span className="text-3xl">📊</span> Pre-Exercise
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <NumberInput
            label="Resting O2 Saturation"
            value={log.restingO2Sat}
            onChange={(v) => updateLog('restingO2Sat', v)}
            min={70}
            max={100}
            unit="%"
          />
          <NumberInput
            label="Resting Heart Rate"
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
            label="Symptoms Score"
            value={log.symptomsScore}
            onChange={(v) => updateLog('symptomsScore', v)}
            min={0}
            max={10}
            unit="/ 10"
          />
        </div>
      </section>

      {/* Warm-Up Section */}
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <span className="text-3xl">🔥</span> Warm-Up (5-7 min)
        </h2>
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
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <span className="text-3xl">💪</span> Strength Training
        </h2>
        <div className="space-y-4">
          <StrengthExercise
            name="Biceps Curls (12-15 reps × 2-3 sets)"
            done={log.bicepCurlsDone}
            onDoneChange={(v) => updateLog('bicepCurlsDone', v)}
            weight={log.bicepCurlsWeight}
            onWeightChange={(v) => updateLog('bicepCurlsWeight', v)}
            reps={log.bicepCurlsReps}
            onRepsChange={(v) => updateLog('bicepCurlsReps', v)}
            weightOptions={['3 lb', '5 lb', '8 lb', '10 lb']}
          />
          <StrengthExercise
            name="Triceps Extensions (12-15 reps × 2-3 sets)"
            done={log.tricepExtDone}
            onDoneChange={(v) => updateLog('tricepExtDone', v)}
            weight={log.tricepExtWeight}
            onWeightChange={(v) => updateLog('tricepExtWeight', v)}
            reps={log.tricepExtReps}
            onRepsChange={(v) => updateLog('tricepExtReps', v)}
            weightOptions={['3 lb', '5 lb', '8 lb', '10 lb']}
          />
          <StrengthExercise
            name="Shoulder Press (10-12 reps × 2 sets)"
            done={log.shoulderPressDone}
            onDoneChange={(v) => updateLog('shoulderPressDone', v)}
            weight={log.shoulderPressWeight}
            onWeightChange={(v) => updateLog('shoulderPressWeight', v)}
            reps={log.shoulderPressReps}
            onRepsChange={(v) => updateLog('shoulderPressReps', v)}
            weightOptions={['3 lb', '5 lb', '8 lb', '10 lb']}
          />
          <StrengthExercise
            name="Chest Press (12-15 reps × 2 sets)"
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
            name="Seated Rows (12-15 reps × 2 sets)"
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
            name="Sit-to-Stands (10-15 reps × 2 sets)"
            done={log.sitToStandsDone}
            onDoneChange={(v) => updateLog('sitToStandsDone', v)}
            reps={log.sitToStandsReps}
            onRepsChange={(v) => updateLog('sitToStandsReps', v)}
          />
          <BodyweightExercise
            name="Standing Leg Lifts (10 reps each leg × 2)"
            done={log.legLiftsDone}
            onDoneChange={(v) => updateLog('legLiftsDone', v)}
            reps={log.legLiftsReps}
            onRepsChange={(v) => updateLog('legLiftsReps', v)}
          />
          <BodyweightExercise
            name="Mini-Squats (10-12 reps × 2)"
            done={log.miniSquatsDone}
            onDoneChange={(v) => updateLog('miniSquatsDone', v)}
            reps={log.miniSquatsReps}
            onRepsChange={(v) => updateLog('miniSquatsReps', v)}
          />
        </div>
      </section>

      {/* Aerobic - Rowing Section */}
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <span className="text-3xl">🚣</span> Aerobic: Rowing Machine
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <NumberInput
            label="Duration"
            value={log.rowingDuration}
            onChange={(v) => updateLog('rowingDuration', v)}
            min={0}
            max={60}
            unit="min"
          />
          <NumberInput
            label="Average O2 Sat"
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
            label="Heart Rate (avg)"
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
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <span className="text-3xl">❄️</span> Cool Down
        </h2>
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
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <span className="text-3xl">📈</span> Post-Exercise
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <NumberInput
            label="Recovery O2 Sat (after 3 min)"
            value={log.recoveryO2}
            onChange={(v) => updateLog('recoveryO2', v)}
            min={70}
            max={100}
            unit="%"
          />
          <NumberInput
            label="Recovery Heart Rate"
            value={log.recoveryHr}
            onChange={(v) => updateLog('recoveryHr', v)}
            min={40}
            max={150}
            unit="bpm"
          />
        </div>
        <div>
          <label className="font-medium block mb-2">Notes / Symptoms</label>
          <textarea
            value={log.notes}
            onChange={(e) => updateLog('notes', e.target.value)}
            placeholder="How did you feel? Any symptoms or observations..."
            rows={4}
            className="w-full"
          />
        </div>
      </section>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-[var(--foreground)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 text-white font-semibold ${
              saved
                ? 'bg-[var(--success)]'
                : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
            } disabled:opacity-50`}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-xl">Loading...</p></div>}>
      <LogPageContent />
    </Suspense>
  )
}
