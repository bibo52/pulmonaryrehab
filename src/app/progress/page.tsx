'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface LogData {
  id: number
  date: string
  restingO2Sat: number | null
  restingHr: number | null
  symptomsScore: number | null
  rowingDuration: number | null
  recoveryO2: number | null
  recoveryHr: number | null
  seatedMarching: boolean
  bicepCurlsDone: boolean
}

function isLogComplete(log: LogData): boolean {
  return !!(
    log.restingO2Sat &&
    log.seatedMarching &&
    log.bicepCurlsDone &&
    log.rowingDuration
  )
}

function calculateStreak(logs: LogData[]): number {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  const today = toZonedTime(new Date(), 'America/Los_Angeles')
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date)
    logDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (isSameDay(logDate, expectedDate) && isLogComplete(sortedLogs[i])) {
      streak++
    } else if (i === 0 && !isSameDay(logDate, today)) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (isSameDay(logDate, yesterday) && isLogComplete(sortedLogs[i])) {
        streak++
      } else {
        break
      }
    } else {
      break
    }
  }

  return streak
}

export default function ProgressPage() {
  const [logs, setLogs] = useState<LogData[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const now = toZonedTime(new Date(), 'America/Los_Angeles')
        const threeMonthsAgo = subMonths(now, 3)
        const res = await fetch(
          `/api/logs?startDate=${format(threeMonthsAgo, 'yyyy-MM-dd')}&endDate=${format(now, 'yyyy-MM-dd')}`
        )
        if (res.ok) {
          const data = await res.json()
          setLogs(data)
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const chartData = logs
    .filter((log) => log.restingO2Sat || log.recoveryO2)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14)
    .map((log) => ({
      date: format(new Date(log.date), 'M/d'),
      restingO2: log.restingO2Sat,
      recoveryO2: log.recoveryO2,
      restingHr: log.restingHr,
      recoveryHr: log.recoveryHr,
      rowing: log.rowingDuration,
    }))

  const streak = calculateStreak(logs)
  const totalCompleted = logs.filter(isLogComplete).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-breathe text-5xl mb-4">🫁</div>
          <p className="text-[var(--muted)]">Loading progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 bg-[var(--background)] border-b border-[var(--border)] p-4 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--cream-dark)] hover:bg-[var(--mist)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl">Your Progress</h1>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <div className="stat-value" style={{ color: 'var(--terracotta)' }}>{streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✓</span>
            <div className="stat-value" style={{ color: 'var(--sage)' }}>{totalCompleted}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Days Logged</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card p-6 animate-fade-in delay-1">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-xl bg-[var(--cream-dark)] hover:bg-[var(--mist)] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-10 h-10 rounded-xl bg-[var(--cream-dark)] hover:bg-[var(--mist)] flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-[var(--muted)] py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayLog = logs.find((log) => isSameDay(new Date(log.date), day))
              const completed = dayLog ? isLogComplete(dayLog) : false
              const inMonth = isSameMonth(day, currentMonth)
              const isTodayDate = isToday(day)

              return (
                <Link
                  key={day.toISOString()}
                  href={`/log?date=${format(day, 'yyyy-MM-dd')}`}
                  className={`
                    calendar-day
                    ${!inMonth ? 'opacity-30' : ''}
                    ${isTodayDate ? 'today' : ''}
                    ${completed ? 'completed' : ''}
                  `}
                >
                  <span className={`text-sm font-medium ${isTodayDate ? 'text-[var(--sage)]' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {completed && <span className="text-xs text-[var(--sage)]">✓</span>}
                </Link>
              )
            })}
          </div>
        </div>

        {/* O2 Saturation Chart */}
        {chartData.length > 0 && (
          <div className="card p-6 animate-fade-in delay-2">
            <h2 className="text-xl mb-6">O2 Saturation</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  domain={[85, 100]}
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="restingO2"
                  name="Resting"
                  stroke="var(--sage)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--sage)' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="recoveryO2"
                  name="Recovery"
                  stroke="var(--terracotta)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--terracotta)' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--sage)]" />
                <span className="text-sm text-[var(--muted)]">Resting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--terracotta)]" />
                <span className="text-sm text-[var(--muted)]">Recovery</span>
              </div>
            </div>
          </div>
        )}

        {/* Heart Rate Chart */}
        {chartData.length > 0 && (
          <div className="card p-6 animate-fade-in delay-3">
            <h2 className="text-xl mb-6">Heart Rate</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  domain={[50, 120]}
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="restingHr"
                  name="Resting"
                  stroke="var(--sage)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--sage)' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="recoveryHr"
                  name="Recovery"
                  stroke="var(--terracotta)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--terracotta)' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Rowing Progress */}
        {chartData.length > 0 && (
          <div className="card p-6 animate-fade-in delay-4">
            <h2 className="text-xl mb-6">Rowing Duration</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  domain={[0, 30]}
                  tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rowing"
                  name="Minutes"
                  stroke="var(--forest)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--forest)' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartData.length === 0 && (
          <div className="card p-8 text-center animate-fade-in">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg text-[var(--muted)]">
              Start logging workouts to see your progress charts!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
