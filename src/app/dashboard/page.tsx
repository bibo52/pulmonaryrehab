import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns'
import Link from 'next/link'
import type { DailyLog } from '@/generated/prisma/client'

async function getWeekLogs(): Promise<DailyLog[]> {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })

  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  })

  return logs
}

function isLogComplete(log: DailyLog): boolean {
  return !!(
    log.restingO2Sat &&
    log.seatedMarching &&
    log.bicepCurlsDone &&
    log.rowingDuration
  )
}

export default async function DashboardPage() {
  if (!(await isAuthenticated())) {
    redirect('/')
  }

  const logs = await getWeekLogs()
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const todayLog = logs.find((log) => isSameDay(new Date(log.date), today))
  const completedDays = logs.filter((log) => isLogComplete(log)).length

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pulmonary Rehab</h1>
          <p className="text-[var(--muted)] text-xl mt-1">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Link
          href="/progress"
          className="text-[var(--primary)] hover:underline text-lg font-medium"
        >
          View Progress →
        </Link>
      </div>

      {/* Today's Status Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[var(--border)] mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Today&apos;s Workout</h2>
            <p className="text-[var(--muted)] mt-1">
              {todayLog ? 'In progress' : 'Not started yet'}
            </p>
          </div>
          {todayLog && isLogComplete(todayLog) && (
            <div className="text-4xl">✅</div>
          )}
        </div>

        <Link
          href={`/log?date=${format(today, 'yyyy-MM-dd')}`}
          className="block w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-center py-5 rounded-xl text-xl font-semibold transition-colors"
        >
          {todayLog ? "Continue Today's Log" : "Start Today's Log"}
        </Link>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[var(--border)]">
        <h2 className="text-2xl font-semibold mb-6">This Week</h2>
        <p className="text-[var(--muted)] mb-6 text-lg">
          {completedDays} of 7 days completed
        </p>

        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayLog = logs.find((log) => isSameDay(new Date(log.date), day))
            const completed = dayLog ? isLogComplete(dayLog) : false
            const isTodayDate = isToday(day)

            return (
              <Link
                key={day.toISOString()}
                href={`/log?date=${format(day, 'yyyy-MM-dd')}`}
                className={`
                  flex flex-col items-center p-4 rounded-xl transition-all
                  ${isTodayDate ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''}
                  ${completed ? 'bg-[var(--success-light)]' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                <span className="text-sm font-medium text-[var(--muted)]">
                  {format(day, 'EEE')}
                </span>
                <span className={`text-2xl font-bold mt-1 ${isTodayDate ? 'text-[var(--primary)]' : ''}`}>
                  {format(day, 'd')}
                </span>
                <span className="text-2xl mt-2">
                  {completed ? '✅' : dayLog ? '🔄' : '○'}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 text-center">
        <p className="text-[var(--muted)]">
          Keep up the great work! Consistency is key to progress.
        </p>
      </div>
    </div>
  )
}
