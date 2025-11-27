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
  const todayComplete = todayLog ? isLogComplete(todayLog) : false

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto pb-8 relative">
      {/* Decorative blobs */}
      <div className="decor-blob decor-blob-sage w-[300px] h-[300px] top-0 right-0 opacity-20" />

      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[var(--muted)] font-medium">
            {format(today, 'EEEE')}
          </p>
          <Link
            href="/progress"
            className="text-[var(--sage)] hover:text-[var(--forest)] font-semibold flex items-center gap-1"
          >
            Progress
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <h1 className="text-4xl">
          {format(today, 'MMMM d, yyyy')}
        </h1>
      </header>

      {/* Today's Status Card */}
      <div className="card p-8 mb-8 animate-fade-in delay-1 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[var(--sage-light)] opacity-20" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="icon-wrap bg-gradient-to-br from-[var(--sage-light)] to-[var(--sage)]">
                  <span className="text-2xl">🫁</span>
                </div>
                <div>
                  <h2 className="text-2xl">Today&apos;s Workout</h2>
                  <p className="text-[var(--muted)]">
                    {todayComplete ? 'Completed!' : todayLog ? 'In progress' : 'Ready to start'}
                  </p>
                </div>
              </div>
            </div>
            {todayComplete && (
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--success-light)]">
                <span className="text-3xl">✓</span>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          {todayLog && !todayComplete && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--muted)]">Progress</span>
                <span className="font-semibold text-[var(--forest)]">In Progress</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '40%' }} />
              </div>
            </div>
          )}

          <Link
            href={`/log?date=${format(today, 'yyyy-MM-dd')}`}
            className="block w-full btn-primary text-center"
          >
            {todayComplete ? 'View Today\'s Log' : todayLog ? 'Continue Workout' : 'Start Today\'s Workout'}
          </Link>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="card p-6 mb-8 animate-fade-in delay-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">This Week</h2>
          <div className="flex items-center gap-2 text-[var(--sage)]">
            <span className="font-bold text-2xl">{completedDays}</span>
            <span className="text-[var(--muted)]">/ 7</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayLog = logs.find((log) => isSameDay(new Date(log.date), day))
            const completed = dayLog ? isLogComplete(dayLog) : false
            const isTodayDate = isToday(day)

            return (
              <Link
                key={day.toISOString()}
                href={`/log?date=${format(day, 'yyyy-MM-dd')}`}
                className={`calendar-day ${isTodayDate ? 'today' : ''} ${completed ? 'completed' : ''}`}
              >
                <span className="text-xs font-medium text-[var(--muted)] uppercase">
                  {format(day, 'EEE')}
                </span>
                <span className={`text-xl font-bold mt-1 ${isTodayDate ? 'text-[var(--sage)]' : 'text-[var(--forest)]'}`}>
                  {format(day, 'd')}
                </span>
                {completed && (
                  <span className="text-lg mt-1 text-[var(--sage)]">✓</span>
                )}
                {dayLog && !completed && (
                  <span className="text-sm mt-1">•</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Motivational message */}
      <div className="text-center animate-fade-in delay-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--cream-dark)]">
          <span className="text-lg">🌿</span>
          <p className="text-[var(--muted)] text-sm font-medium">
            {completedDays === 7
              ? 'Perfect week! Amazing work!'
              : completedDays >= 5
                ? 'Great consistency this week!'
                : 'Keep building your streak!'}
          </p>
        </div>
      </div>
    </div>
  )
}
