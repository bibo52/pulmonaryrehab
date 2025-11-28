'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function QuickLogButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleQuickLog() {
    setLoading(true)
    setError(null)

    try {
      // Fetch the most recent log to copy vitals from
      const recentRes = await fetch('/api/logs?limit=1')
      if (!recentRes.ok) {
        throw new Error('Failed to fetch recent log')
      }

      const recentLogs = await recentRes.json()
      if (recentLogs.length === 0) {
        setError('No previous workout to copy from')
        setLoading(false)
        return
      }

      const previousLog = recentLogs[0]
      const today = format(new Date(), 'yyyy-MM-dd')

      // Only copy pre-exercise vitals to today's log
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          restingO2Sat: previousLog.restingO2Sat,
          restingHr: previousLog.restingHr,
          inogenSetting: previousLog.inogenSetting,
          symptomsScore: previousLog.symptomsScore,
        }),
      })

      if (res.ok) {
        // Navigate to the log page to continue entering data
        router.push(`/log?date=${today}`)
      } else {
        throw new Error('Failed to save quick log')
      }
    } catch (err) {
      setError('Something went wrong')
      console.error('Quick log error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleQuickLog}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[var(--sage)] text-[var(--sage)] font-semibold hover:bg-[var(--sage-light)] hover:border-solid transition-all disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Pre-fill vitals from last time'}
      </button>
      {error && (
        <p className="text-sm text-[var(--terracotta)] text-center">{error}</p>
      )}
    </div>
  )
}
