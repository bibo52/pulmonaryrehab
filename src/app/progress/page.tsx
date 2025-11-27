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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  const today = new Date()
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
        const threeMonthsAgo = subMonths(new Date(), 3)
        const res = await fetch(
          `/api/logs?startDate=${format(threeMonthsAgo, 'yyyy-MM-dd')}&endDate=${format(new Date(), 'yyyy-MM-dd')}`
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
    .slice(-30)
    .map((log) => ({
      date: format(new Date(log.date), 'MMM d'),
      restingO2: log.restingO2Sat,
      recoveryO2: log.recoveryO2,
      restingHr: log.restingHr,
      recoveryHr: log.recoveryHr,
      rowing: log.rowingDuration,
      symptoms: log.symptomsScore,
    }))

  const streak = calculateStreak(logs)
  const totalCompleted = logs.filter(isLogComplete).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-[var(--muted)]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Progress</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] text-center">
          <div className="text-5xl mb-2">🔥</div>
          <div className="text-4xl font-bold text-[var(--primary)]">{streak}</div>
          <div className="text-[var(--muted)]">Day Streak</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] text-center">
          <div className="text-5xl mb-2">✅</div>
          <div className="text-4xl font-bold text-[var(--success)]">{totalCompleted}</div>
          <div className="text-[var(--muted)]">Workouts Completed</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] text-center">
          <div className="text-5xl mb-2">📊</div>
          <div className="text-4xl font-bold">{logs.length}</div>
          <div className="text-[var(--muted)]">Days Logged</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg text-xl"
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg text-xl"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-[var(--muted)] py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
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
                  aspect-square flex flex-col items-center justify-center rounded-lg transition-all p-2
                  ${!inMonth ? 'opacity-30' : ''}
                  ${isTodayDate ? 'ring-2 ring-[var(--primary)]' : ''}
                  ${completed ? 'bg-[var(--success-light)]' : dayLog ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
              >
                <span className={`text-lg ${isTodayDate ? 'font-bold text-[var(--primary)]' : ''}`}>
                  {format(day, 'd')}
                </span>
                {completed && <span className="text-sm">✅</span>}
                {dayLog && !completed && <span className="text-sm">🔄</span>}
              </Link>
            )
          })}
        </div>
      </div>

      {/* O2 Saturation Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-8">
          <h2 className="text-2xl font-semibold mb-6">O2 Saturation Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="restingO2"
                name="Resting O2%"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="recoveryO2"
                name="Recovery O2%"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Heart Rate Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-8">
          <h2 className="text-2xl font-semibold mb-6">Heart Rate Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[50, 120]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="restingHr"
                name="Resting HR"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="recoveryHr"
                name="Recovery HR"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rowing Duration Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[var(--border)] mb-8">
          <h2 className="text-2xl font-semibold mb-6">Rowing Duration Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 30]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rowing"
                name="Duration (min)"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[var(--border)] text-center">
          <p className="text-xl text-[var(--muted)]">
            Start logging your workouts to see progress charts!
          </p>
        </div>
      )}
    </div>
  )
}
